const express = require("express");

const {
    handleUserSignup,
    handleUserLogin,
    handleUserLogout,
    handleUserProfile,
} = require("../controllers/user");

const router = express.Router();

router.post("/", handleUserSignup);

router.post("/login", handleUserLogin);

router.get("/logout", handleUserLogout);

router.get("/profile", handleUserProfile);

module.exports = router;