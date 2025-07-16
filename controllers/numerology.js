const Numerology = require("../models/numerology");
const axios = require('axios');

async function indexChart(req, res) {
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const skip = (page - 1) * limit;

    const charts = await Numerology.find({ createdBy: req.user._id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

    const total = await Numerology.countDocuments({ createdBy: req.user._id });

    console.log('Query success message:', req.query);

    // ✅ Show success or error message from query
    let successMessage = null;
    if (req.query.created === "1") successMessage = "Chart created successfully";
    else if (req.query.updated === "1") successMessage = "Chart updated successfully";
    else if (req.query.deleted === "1") successMessage = "Chart deleted successfully";

    let errorMessage = null;
    if (req.query.error === "1") errorMessage = "Something went wrong. Please try again.";

    return res.render("numerology/index", {
        charts,
        successMessage,
        errorMessage,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
    });
}

async function storeChart(req, res) {
    try {
        if (!req.user || !req.user._id) {
            return res.status(401).json({ success: false, message: "User not authenticated. Please login again." });
        }
        let { name, date, time, lat, lon, tz, lang, style, place, company_name, company_address, company_email, company_phone, company_website, pdf_type } = req.body;
        // Validate all fields
        if (!name || !date || !time || !lat || !lon || !tz || !lang || !style || !place || !company_name || !company_address || !company_email || !company_phone || !company_website || !pdf_type) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }
        // Convert date to DD/MM/YYYY if needed
        if (/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            const [y, m, d] = date.split('-');
            date = `${d}/${m}/${y}`;
        }
        // Convert time to HH:mm (24hr)
        if (/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(time)) {
            let [h, m] = time.split(':');
            let pm = /PM$/i.test(time);
            h = parseInt(h, 10);
            if (pm && h < 12) h += 12;
            if (!pm && h === 12) h = 0;
            time = `${h.toString().padStart(2, '0')}:${m.substr(0,2)}`;
        }
        // Ensure lat/lon/tz are numbers
        lat = Number(lat);
        lon = Number(lon);
        tz = Number(tz);
        // Prepare params for PDF API in the exact pattern required
        const params = {
            company_address: String(company_address).trim(),
            company_email: String(company_email).trim(),
            company_name: String(company_name).trim(),
            company_phone: String(company_phone).trim(),
            company_website: String(company_website).trim(),
            date: String(date).trim(),
            lang: String(lang).trim(),
            lat,
            lon,
            name: String(name).trim(),
            pdf_type: String(pdf_type).trim(),
            place: String(place).trim(),
            style: String(style).trim(),
            time: String(time).trim(),
            tz
        };
        console.log('PDF API params:', params);
        // PDF API call
        const pdfApiUrl = 'https://api.jyotishamastroapi.com/api/pdf/generate';
        let pdfResponseData = null;
        let pdfUrl = null;
        try {
            const pdfResponse = await axios.get(pdfApiUrl, {
                params,
                headers: {
                    key: '2a10httTVHmUvXBp0Ea20SgStu80DF'
                }
            });
            pdfResponseData = pdfResponse.data;
            pdfUrl = pdfResponseData.downloadUrl || pdfResponseData.pdf_url || pdfResponseData.url || null;
        } catch (pdfError) {
            return res.status(500).json({ success: false, message: 'PDF API error: ' + pdfError.message });
        }
        if (!pdfUrl) {
            return res.status(500).json({ success: false, message: 'PDF URL not received from API.' });
        }
        // Save chart
        const newChart = await Numerology.create({
            name, date, time, lat, lon, tz, lang, style, place, company_name, company_address, company_email, company_phone, company_website, pdf_type,
            pdfUrl,
            createdBy: req.user._id,
        });
        return res.json({
            success: true,
            message: "Chart created successfully",
            redirectUrl: "/numerology?created=1",
            pdf: pdfResponseData
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message || "Server error. Please try again." });
    }
}

async function showChart(req, res) {
    const id = req.params.id;
    const chart = await Numerology.findById(id);
    if (!chart) return res.status(404).send("Chart not found");
    return res.render("numerology/show", { chart });
}

async function editChart(req, res) {
    const id = req.params.id;
    const chart = await Numerology.findById(id);
    if (!chart) return res.status(404).send("Chart not found");
    return res.render("numerology/edit", { chart });
}

async function updateChart(req, res) {
    const id = req.params.id;
    const { name, date, phone, vehicle, gender } = req.body;

    try {
        const chart = await Numerology.findByIdAndUpdate(
            id,
            { name, date, phone, vehicle, gender },
            { new: true }
        );

        if (!chart) return res.status(404).json({ success: false, message: "Chart not found" });

        // ✅ Respond with success and redirect URL
        return res.json({ success: true, redirectUrl: "/numerology?updated=1" });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error updating chart" });
    }
}

// async function deleteChart(req, res) {
//     const id = req.params.id;
//     const chart = await Numerology.findByIdAndDelete(id);
//     if (!chart) return res.status(404).json({ success: false, message: "Chart not found" });

//     // If AJAX (SPA)
//     if (req.xhr || req.headers.accept.indexOf('json') > -1) {
//         return res.json({ success: true });
//     }
//     // Else fallback
//     return res.redirect("/numerology?deleted=1");
// }
async function deleteChart(req, res) {
  try {
    const id = req.params.id;
    const chart = await Numerology.findByIdAndDelete(id);

    if (!chart) {
      return res.status(404).json({ success: false, message: "Chart not found" });
    }

    // ✅ Return JSON with redirect
    return res.json({
      success: true,
      message: "Chart deleted successfully",
      redirectUrl: "/numerology?deleted=1"
    });

  } catch (error) {
    console.error("Delete chart error:", error);
    return res.status(500).json({ success: false, message: "Error deleting chart" });
  }
}

module.exports = {
    indexChart,
    storeChart,
    showChart,
    editChart,
    updateChart,
    deleteChart,
};
