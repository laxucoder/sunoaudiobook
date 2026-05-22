require("dotenv").config();
const express = require("express");
const cors = require("cors");
const passport = require("passport");
const { connectDB } = require("./src/config/database"); // Import DB
const setupDirectories = require("./src/utils/dirSetup");
const cookieParser = require("cookie-parser");
const app = express();

connectDB();

setupDirectories();

app.use(
  cors({
    origin: [process.env.FRONTEND_URL, "https://checkout.stripe.com"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "Range"],
    exposedHeaders: ["Content-Range", "Content-Length", "Accept-Ranges"],
  })
);
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(passport.initialize());
app.use(cookieParser());
require("./src/config/passport")(passport);
app.use("/api/auth", require("./src/routes/authRoutes"));
app.use("/api/audio", require("./src/routes/audioRoutes"));
app.use("/api/payment", require("./src/routes/paymentRoutes"));

app.use("/uploads/images", express.static("uploads/images"));
app.use("/api/user", require("./src/routes/userRoutes"));
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
