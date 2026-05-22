const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  cancelSubscription,
  getSubscriptionPrice,
  updateSubscriptionPrice,
} = require("../controllers/paymentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");


router.get("/price", getSubscriptionPrice); 

router.put("/price", protect, adminOnly, updateSubscriptionPrice);

router.post("/order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/cancel-subscription", protect, cancelSubscription);

module.exports = router;
