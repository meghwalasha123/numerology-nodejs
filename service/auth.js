const jwt = require("jsonwebtoken");

// Use environment variable for JWT secret, fallback to a default for development
const secret = process.env.JWT_SECRET || "Asha$123@$"; // In production, always use environment variable

function setUser(user) {
    try {
        return jwt.sign({
            _id: user._id,
            email: user.email,
            name: user.name
        }, secret, { 
            expiresIn: "7d",
            issuer: "numerology-app",
            audience: "numerology-users"
        });
    } catch (error) {
        console.error("Error creating JWT token:", error);
        throw new Error("Failed to create authentication token");
    }
}

function getUser(token) {
    if (!token) return null;
    
    try {
        const decoded = jwt.verify(token, secret);
        return decoded;
    } catch (error) {
        console.error("JWT verification error:", error.message);
        return null;
    }
}

module.exports = {
    setUser,
    getUser,
};