require('dotenv').config();
const express = require("express");
const {
    indexChart,
    storeChart,
    showChart,
    editChart,
    updateChart,
    deleteChart,
} = require("../controllers/numerology");

const router = express.Router();

// Root route for numerology dashboard
router.get("/", indexChart);

// Keep the index route for backward compatibility
router.get("/index", indexChart);

router.get("/create", (req, res) => {
    return res.render("numerology/create", { googleMapApiKey: process.env.GOOGLE_MAP_API_KEY });
});

router.post("/store", storeChart);
router.get("/:id", showChart);
router.get("/:id/edit", editChart);
router.post("/update/:id", updateChart); // PATCH → POST for HTML form
router.post("/delete/:id", deleteChart); // DELETE → POST for HTML form

module.exports = router;
