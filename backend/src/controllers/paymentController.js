const { razorpay } = require("../config/clients");
const { User, Purchase, SystemSetting, Playlist, Audio } = require("../models"); // Use Sequelize models
const crypto = require("crypto");

const fetchSubscriptionPrice = async () => {
  const setting = await SystemSetting.findByPk("SUBSCRIPTION_PRICE");
  return setting ? parseInt(setting.value) : 499; // Default fallback
};

exports.getSubscriptionPrice = async (req, res) => {
  try {
    const price = await fetchSubscriptionPrice();
    res.json({ price });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateSubscriptionPrice = async (req, res) => {
  try {
    const { price } = req.body;
    if (!price || price < 1)
      return res.status(400).json({ error: "Invalid price" });
    await SystemSetting.upsert({
      key: "SUBSCRIPTION_PRICE",
      value: price.toString(),
    });

    res.json({ msg: "Price updated successfully", price });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createOrder = async (req, res) => {
  try {
    const { type, itemId } = req.body;

    const user = await User.findByPk(req.user.id);
    let amount = 0;

    // Notes for Razorpay Dashboard
    let notes = {
      userId: user.id,
      userName: user.name,
      type: type,
    };

    // RECURRING SUBSCRIPTION ---
    if (type === "SUBSCRIPTION_RECURRING") {
      const subPrice = await fetchSubscriptionPrice();

      const plan = await razorpay.plans.create({
        period: "monthly",
        interval: 1,
        item: {
          name: "StoryHaven Premium (Monthly)",
          amount: subPrice * 100, // paise
          currency: "INR",
          description: "Auto-debit monthly subscription",
        },
      });

      const subscription = await razorpay.subscriptions.create({
        plan_id: plan.id,
        customer_notify: 1,
        total_count: 120, // 10 years
        notes: notes,
      });

      return res.json({
        order_id: subscription.id,
        amount: subPrice,
        currency: "INR",
        isRecurring: true,
      });
    }

    // ONE-TIME SUBSCRIPTION (1 Month) ---
    if (type === "SUBSCRIPTION_ONE_TIME") {
      amount = await fetchSubscriptionPrice();
      notes.description = "1 Month Premium Access";
    }

    // CONTENT PURCHASE  ---
    if (type === "CONTENT_PURCHASE") {
      if (!itemId) return res.status(400).json({ error: "Item ID required" });

      let playlist = await Playlist.findByPk(itemId);

      if (!playlist) {
        const audio = await Audio.findByPk(itemId);
        if (audio && audio.playlistId) {
          playlist = await Playlist.findByPk(audio.playlistId);
        }
      }

      if (!playlist)
        return res.status(404).json({ error: "Playlist/Content not found" });
      if (playlist.isFree)
        return res.status(400).json({ error: "Content is free" });

      amount = playlist.price;
      notes.itemId = itemId;
      notes.itemTitle = playlist.title;
      notes.description = `Lifetime Purchase: ${playlist.title}`;
    }

    // BUY COINS ---
    if (type === "BUY_COINS") {
      amount = 99; // Price for 10 Coins
      notes.description = "Buy 10 Premium Coins";
    }

    if (!amount || amount <= 0)
      return res.status(400).json({ error: "Invalid amount" });

    const options = {
      amount: Math.round(amount * 100), // paise
      currency: "INR",
      receipt: `order_${Date.now()}`,
      notes: notes,
    };

    const order = await razorpay.orders.create(options);
    res.json({ ...order, isRecurring: false });
  } catch (error) {
    console.error("Order Creation Failed:", error);
    res.status(500).json({ error: error.message });
  }
};
// 2. VERIFY PAYMENT (Handles All 3 Types)
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      razorpay_subscription_id, // Present only for recurring
      type,
      itemId,
    } = req.body;

    let generated_signature;

    // --- VERIFICATION LOGIC ---
    if (razorpay_subscription_id) {
      // Recurring Subscription Verification
      const data = razorpay_payment_id + "|" + razorpay_subscription_id;
      generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(data)
        .digest("hex");
    } else {
      // One-Time Payment Verification
      const data = razorpay_order_id + "|" + razorpay_payment_id;
      generated_signature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(data)
        .digest("hex");
    }

    if (generated_signature !== razorpay_signature) {
      return res.status(400).json({ msg: "Invalid Signature" });
    }

    // --- FULFILLMENT LOGIC ---
    const user = await User.findByPk(req.user.id);

    if (type === "SUBSCRIPTION_RECURRING") {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      user.isPremium = true;
      user.subscriptionEndDate = nextMonth;
      user.isAutoRenewal = true;
      user.razorpaySubscriptionId = razorpay_subscription_id;
      await user.save();
    } else if (type === "SUBSCRIPTION_ONE_TIME") {
      const nextMonth = new Date();
      nextMonth.setMonth(nextMonth.getMonth() + 1);

      if (user.subscriptionEndDate > new Date()) {
        user.subscriptionEndDate = new Date(
          user.subscriptionEndDate.getTime() + 30 * 24 * 60 * 60 * 1000,
        );
      } else {
        user.subscriptionEndDate = nextMonth;
      }
      user.isPremium = true;
      // Do NOT enable auto-renewal for one-time payments
      if (!user.isAutoRenewal) user.isAutoRenewal = false;
      await user.save();
    } else if (type === "CONTENT_PURCHASE") {
      let amount = 0;
      let item = await Playlist.findByPk(itemId);
      if (!item) item = await Audio.findByPk(itemId);
      if (item) amount = item.price;

      // --- CALCULATE EXPIRY (6 Months) ---
      const expiryDate = new Date();
      expiryDate.setMonth(expiryDate.getMonth() + 6);

      await Purchase.create({
        userId: user.id,
        playlistId: itemId,
        audioId: null, //Set for single Audio
        amount: amount,
        paymentId: razorpay_payment_id,
        type: "RENTAL",
        expiresAt: expiryDate, // <--- SAVE EXPIRY
      });
    } else if (type === "BUY_COINS") {
      user.coins = (user.coins || 0) + 10;
      await user.save();
    }

    res.json({ success: true, msg: "Payment Verified & Access Granted" });
  } catch (error) {
    console.error(error);
    res.status(500).json(error);
  }
};

exports.unlockWithCoin = async (req, res) => {
  try {
    const { itemId } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user.coins || user.coins < 1) {
      return res.status(400).json({ error: "Not enough coins" });
    }

    let audio = await Audio.findByPk(itemId);

    if (!audio) {
      const playlist = await Playlist.findByPk(itemId, {
        include: [{ model: Audio, as: "episodes" }],
      });
      if (playlist && playlist.episodes && playlist.episodes.length > 0) {
        const sortedEpisodes = playlist.episodes.sort(
          (a, b) => a.episodeNumber - b.episodeNumber,
        );

        const userPurchases = await Purchase.findAll({
          where: { userId: user.id },
        });
        const ownedAudioIds = userPurchases
          .map((p) => p.audioId)
          .filter((id) => id !== null);

        // Find the first locked episode that the user doesn't already own
        const firstLocked = sortedEpisodes.find(
          (ep) =>
            !ep.isFree &&
            !ownedAudioIds.some((id) => String(id) === String(ep.id)),
        );
        audio = firstLocked || sortedEpisodes[0];
      }
    }

    if (!audio) return res.status(404).json({ error: "Item not found" });

    user.coins -= 1;
    await user.save();

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + 6); // 6 Months access

    await Purchase.create({
      userId: user.id,
      playlistId: null,
      audioId: audio.id,
      amount: 0,
      paymentId: "COIN_UNLOCK_" + Date.now(),
      type: "RENTAL",
      expiresAt: expiryDate,
    });

    res.json({ success: true, coins: user.coins });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.cancelSubscription = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id);

    if (!user.isAutoRenewal || !user.razorpaySubscriptionId) {
      return res
        .status(400)
        .json({ msg: "No active auto-debit subscription found." });
    }

    // Cancel at Razorpay
    await razorpay.subscriptions.cancel(user.razorpaySubscriptionId);

    // Update DB
    user.isAutoRenewal = false;
    user.razorpaySubscriptionId = null;
    await user.save();

    res.json({
      success: true,
      msg: "Subscription cancelled. Access remains until expiry.",
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
