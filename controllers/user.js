const User = require("../models/user");
const { setUser } = require("../service/auth");

async function handleUserSignup(req, res) {
    try {
        const { name, email, password, confirmPassword } = req.body;

        // Validation
        if (!name || !email || !password || !confirmPassword) {
            return res.render("signup", {
                error: "All fields are required",
                name: name || "",
                email: email || ""
            });
        }

        if (password !== confirmPassword) {
            return res.render("signup", {
                error: "Passwords do not match",
                name,
                email
            });
        }

        if (password.length < 6) {
            return res.render("signup", {
                error: "Password must be at least 6 characters long",
                name,
                email
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email: email.toLowerCase() });
        if (existingUser) {
            return res.render("signup", {
                error: "User with this email already exists",
                name,
                email: ""
            });
        }

        // Create new user
        const user = await User.create({
            name: name.trim(),
            email: email.toLowerCase().trim(),
            password
        });

        // Set session
        const token = setUser(user);
        res.cookie("uid", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        return res.redirect("/");
    } catch (error) {
        console.error("Signup error:", error);
        return res.render("signup", {
            error: "An error occurred during signup. Please try again.",
            name: req.body.name || "",
            email: req.body.email || ""
        });
    }
}

async function handleUserLogin(req, res) {
    try {
        const { email, password, rememberMe } = req.body;

        // Validation
        if (!email || !password) {
            return res.render("login", {
                error: "Email and password are required",
                email: email || ""
            });
        }

        // Find user by email
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.render("login", {
                error: "Invalid email or password",
                email: ""
            });
        }

        // Check if user is active
        if (!user.isActive) {
            return res.render("login", {
                error: "Account is deactivated. Please contact support.",
                email: ""
            });
        }

        // Compare password
        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.render("login", {
                error: "Invalid email or password",
                email: ""
            });
        }

        // Update last login
        user.lastLogin = new Date();
        await user.save();

        // Set session
        const token = setUser(user);
        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        };

        if (rememberMe) {
            cookieOptions.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
        } else {
            cookieOptions.maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
        }

        res.cookie("uid", token, cookieOptions);

        return res.redirect("/");
    } catch (error) {
        console.error("Login error:", error);
        return res.render("login", {
            error: "An error occurred during login. Please try again.",
            email: req.body.email || ""
        });
    }
}

async function handleUserLogout(req, res) {
    try {
        res.clearCookie("uid", {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production'
        });
        return res.redirect("/login");
    } catch (error) {
        console.error("Logout error:", error);
        return res.redirect("/");
    }
}

async function handleUserProfile(req, res) {
    try {
        // User is already available from middleware
        const user = req.user;
        
        if (!user) {
            return res.redirect("/login");
        }

        return res.render("profile", {
            user: user,
            success: req.query.success,
            error: req.query.error
        });
    } catch (error) {
        console.error("Profile error:", error);
        return res.redirect("/");
    }
}

module.exports = {
    handleUserSignup,
    handleUserLogin,
    handleUserLogout,
    handleUserProfile,
};