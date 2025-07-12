const { getUser } = require("../service/auth");
const User = require("../models/user");

async function restrictToLoggedinUserOnly(req, res, next) {
    try {
        const userUid = req.cookies?.uid;

        if (!userUid) return res.redirect("/login");

        const tokenData = getUser(userUid);
        if (!tokenData) return res.redirect("/login");

        // Fetch full user data from database
        const user = await User.findById(tokenData._id).select('-password');
        if (!user || !user.isActive) return res.redirect("/login");

        req.user = user;
        next();
    } catch (error) {
        console.error("Auth middleware error:", error);
        return res.redirect("/login");
    }
}

async function checkAuth(req, res, next) {
    try {
        const userUid = req.cookies?.uid;

        if (userUid) {
            const tokenData = getUser(userUid);
            if (tokenData) {
                // Fetch full user data from database
                const user = await User.findById(tokenData._id).select('-password');
                if (user && user.isActive) {
                    req.user = user;
                }
            }
        }

        next();
    } catch (error) {
        console.error("Check auth error:", error);
        next();
    }
}

module.exports = {
    restrictToLoggedinUserOnly,
    checkAuth
};