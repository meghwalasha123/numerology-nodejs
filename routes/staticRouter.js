const express = require("express");

const router = express.Router();

router.get("/", async (req, res) => {
    if (!req.user) return res.redirect("/login");
    
    // Redirect to numerology dashboard for better UX
    return res.redirect("/numerology");
});

router.get("/signup", (req, res) => {
    return res.render("signup");
});

router.get("/login", (req, res) => {
    return res.render("login");
});

router.get("/invoice", (req, res) => {
    if (!req.user) return res.redirect("/login");
    return res.render("invoice", { user: req.user });
});

router.get("/subscription", (req, res) => {
    if (!req.user) return res.redirect("/login");
    return res.render("subscription", { user: req.user });
});

module.exports = router;