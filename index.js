const express = require("express");
const app = express();
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const ExpressError = require("./utils/ExpressError");
const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const dbURL = process.env.mongo;
const bodyParser = require("body-parser");
const port = process.env.PORT || 4000;
const logger = require("morgan");
mongoose.connect(dbURL);

const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.log("Connected to database"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(logger());
app.use(
    cors({
        origin: [
            "http://172.20.10.3",
            "http://172.20.10.4",
            "http://localhost:5173",
            "http://localhost:5174",
            "http://localhost:4000",
            "https://temp-jscop-backend-74c1d15b652d.herokuapp.com",
            "https://jscop.jiitopticachapter.com",
            "http://143.244.136.203",
            "https://jscop-6-0-frontend-bc8z.onrender.com",
            "https://main--jscop6frontend.netlify.app",
        ],
        credentials: true,
    })
);
app.use(cookieParser(process.env.SECRET));
app.use(bodyParser.json({ limit: "2mb" }));

app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    next();
});

const admin = require("./routes/adminRoutes");
app.use("/admin", admin);

const volunteer = require("./routes/volunteerRoutes");
app.use("/volunteer", volunteer);

const mailRoute = require("./routes/mailRoutes");
app.use("/sendMail", mailRoute);


const registerRoute = require("./routes/userRoutes");
const { log } = require("console");
app.use("/api", registerRoute);

app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

app.use((err, req, res, next) => {
    const { statusCode = 500, message = "Something went wrong" } = err;
    res.status(statusCode).json({ message });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
