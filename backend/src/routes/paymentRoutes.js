const express = require("express");
const router = express.Router();
const {
  createOrder,
  verifyPayment,
  cancelSubscription,
  getSubscriptionPrice,
  updateSubscriptionPrice,
  unlockWithCoin,
  getCoinBundles,
  updateCoinBundles,
} = require("../controllers/paymentController");
const { protect, adminOnly } = require("../middleware/authMiddleware");

router.get("/price", getSubscriptionPrice);

router.put("/price", protect, adminOnly, updateSubscriptionPrice);
router.get("/coin-bundles", getCoinBundles);
router.put("/coin-bundles", protect, adminOnly, updateCoinBundles);

router.post("/order", protect, createOrder);
router.post("/verify", protect, verifyPayment);
router.post("/cancel-subscription", protect, cancelSubscription);
router.post("/unlock-with-coin", protect, unlockWithCoin);

module.exports = router;
