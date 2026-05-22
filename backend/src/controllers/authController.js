const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const { resend } = require("../config/clients");
const {
  getOtpTemplate,
  getPasswordResetTemplate,
} = require("../utils/emailTemplates");

// Helper to generate Access Token (Short Lived: 15 mins)
const generateAccessToken = (user) => {
  return jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_ACCESS_SECRET,
    {
      expiresIn: "15m",
    }
  );
};

// Helper to generate Refresh Token (Long Lived: 7 days)
const generateRefreshToken = (user) => {
  return jwt.sign({ id: user.id }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: "7d",
  });
};

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(400).json({ msg: "User already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      otpCode,
      otpExpires,
    });

    try {
      await resend.emails.send({
        from: `${process.env.HOSTNAME_EMAIL}`, // Ensure this is valid in your Resend dashboard
        to: email,
        subject: "StoryHaven - Verify Your Email",
        html: getOtpTemplate(otpCode, name),
      });
    } catch (emailError) {
      console.error("Email failed:", emailError);
    }

    res.status(201).json({ msg: "Signup successful. Please verify OTP." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) return res.status(400).json({ msg: "User not found" });

    if (user.otpCode !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    const token = jwt.sign({ id: user.id }, process.env.JWT_ACCESS_SECRET, {
      expiresIn: "7d",
    });
    res.json({ token, user: { id: user.id, name: user.name } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email: email.toLowerCase() } });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ msg: "Invalid Credentials" });
    }
    if (!user.isVerified)
      return res.status(403).json({ msg: "User not verified" });

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await user.save();

    res.cookie("jwt", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
      maxAge: 15 * 60 * 1000, // 15 Minutes
    });

    res.json({
      accessToken,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        isPremium: user.isPremium,
        profilePic: user.profilePic
          ? `${req.protocol}://${req.get("host")}/${user.profilePic}`
          : null,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.refresh = async (req, res) => {
  try {
    const cookies = req.cookies;
    if (!cookies?.jwt) return res.sendStatus(401); // No Refresh Token cookie

    const incomingRefreshToken = cookies.jwt;

    const user = await User.findOne({
      where: { refreshToken: incomingRefreshToken },
    });

    if (!user) return res.sendStatus(403);

    jwt.verify(
      incomingRefreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err || user.id !== decoded.id) return res.sendStatus(403);

        // 2. Generate NEW Access Token
        const newAccessToken = generateAccessToken(user);

        const newRefreshToken = generateRefreshToken(user);
        user.refreshToken = newRefreshToken;
        await user.save();

        res.cookie("accessToken", newAccessToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 15 * 60 * 1000, // 15 Mins (Match your token expiry)
        });

        res.cookie("jwt", newRefreshToken, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 Days
        });

        res.json({ accessToken: newAccessToken });
      }
    );
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

exports.logout = async (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204); // No content

  const refreshToken = cookies.jwt;
  const user = await User.findOne({ where: { refreshToken } });

  if (user) {
    user.refreshToken = null;
    await user.save();
  }

  res.clearCookie("jwt", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    secure: process.env.NODE_ENV === "production",
  });
  res.sendStatus(204);
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(200)
        .json({ msg: "If account exists, reset code sent." });
    }

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user.otpCode = otpCode;
    user.otpExpires = otpExpires;
    await user.save();

    try {
      await resend.emails.send({
        from: process.env.HOSTNAME_EMAIL,
        to: email,
        subject: "Reset Your Password",
        html: getPasswordResetTemplate(otpCode, user.name),
      });
    } catch (emailError) {
      console.error("Email failed:", emailError);
      return res.status(500).json({ error: "Failed to send email." });
    }

    res.status(200).json({ msg: "Reset code sent to your email." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(400).json({ msg: "User not found" });

    if (user.otpCode !== otp || new Date() > user.otpExpires) {
      return res.status(400).json({ msg: "Invalid or expired OTP" });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ msg: "Password must be at least 6 characters" });
    }
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;
    user.otpCode = null;
    user.otpExpires = null;
    await user.save();

    res
      .status(200)
      .json({ msg: "Password updated successfully! Please login." });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
