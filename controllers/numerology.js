const Numerology = require("../models/numerology");

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
        const { name, birthDate, phone, vehicle, gender } = req.body;

        if (!name || !birthDate || !phone || !vehicle || !gender) {
            return res.status(400).json({ success: false, message: "All fields are required" });
        }

        const newChart = await Numerology.create({
            name,
            birthDate,
            phone,
            vehicle,
            gender,
            createdBy: req.user._id,
        });

        // ✅ Always return JSON
        return res.json({
            success: true,
            message: "Chart created successfully",
            redirectUrl: "/numerology?created=1",
        });

    } catch (error) {
        console.error("Store chart error:", error);
        return res.status(500).json({ success: false, message: "Server error. Please try again." });
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
    const { name, birthDate, phone, vehicle, gender } = req.body;

    try {
        const chart = await Numerology.findByIdAndUpdate(
            id,
            { name, birthDate, phone, vehicle, gender },
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
