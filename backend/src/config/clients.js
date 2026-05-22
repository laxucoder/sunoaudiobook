const { Resend } = require("resend");
const Razorpay = require("razorpay");

// Email
const resend = new Resend(process.env.RESEND_API_KEY);

// Payment
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

module.exports = { resend, razorpay };
