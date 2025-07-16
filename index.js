const express = require("express");

const path = require("path");

const cookieParser = require("cookie-parser");

const { connectToMongoDB } = require("./connect");

const { restrictToLoggedinUserOnly, checkAuth } = require("./middlewares/auth");

const staticRoute = require("./routes/staticRouter");

const userRouter = require("./routes/user");
const numerologyRouter = require("./routes/numerology");

const app = express();

connectToMongoDB("mongodb://localhost:27017/numerology-nodejs")
.then(() => console.log("Mongodb connected"));

// set the view engine to ejs
app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(cookieParser());

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));

app.use("/", checkAuth, staticRoute);
app.use("/user", userRouter);
app.use("/numerology", restrictToLoggedinUserOnly, numerologyRouter);

const PORT = 8001;
app.listen(PORT, () => console.log(`Server Started at PORT:${PORT}`));