const bcrypt = require("bcryptjs");
const fs = require("fs");
const { User, Purchase, Audio, Playlist } = require("../models");
const { Op } = require("sequelize");

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: {
        exclude: ["password", "otpCode", "otpExpires", "refreshToken"],
      },
    });

    if (!user) return res.status(404).json({ msg: "User not found" });

    const purchases = await Purchase.findAll({
      where: {
        userId: user.id,
        [Op.or]: [{ expiresAt: { [Op.gt]: new Date() } }, { expiresAt: null }],
      },
      attributes: ["audioId", "playlistId"],
    });
    const purchasedIds = purchases
      .map((p) => p.playlistId || p.audioId)
      .filter((id) => id !== null)
      .map((id) => String(id));
    const userData = user.toJSON();
    if (userData.profilePic && !userData.profilePic.startsWith("http")) {
      user.profilePic = `${req.protocol}://${req.get("host")}/${
        userData.profilePic
      }`;
    }

    const isSubscriptionActive =
      user.isPremium && user.subscriptionEndDate > new Date();

    res.json({
      ...user.toJSON(),
      coins: user.coins || 0,
      purchasedAudioIds: purchasedIds,
      subscriptionStatus: isSubscriptionActive ? "Active" : "Expired",
      daysLeft: isSubscriptionActive
        ? Math.ceil(
            (user.subscriptionEndDate - new Date()) / (1000 * 60 * 60 * 24),
          )
        : 0,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, email, oldPassword, newPassword } = req.body;
    const user = await User.findByPk(req.user.id);

    if (!user) return res.status(404).json({ error: "User not found" });

    if (name) user.name = name;
    if (email) user.email = email;

    if (req.file) {
      if (user.profilePic && !user.profilePic.startsWith("http")) {
        try {
          if (fs.existsSync(user.profilePic)) fs.unlinkSync(user.profilePic);
        } catch (e) {
          console.error("Failed to delete old avatar", e);
        }
      }
      user.profilePic = req.file.path;
    }

    if (newPassword) {
      if (!oldPassword) {
        return res.status(400).json({
          error: "Please enter your current password to confirm changes.",
        });
      }
      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: "Incorrect current password." });
      }
      if (newPassword.length < 6) {
        return res
          .status(400)
          .json({ error: "New password must be at least 6 characters." });
      }
      user.password = await bcrypt.hash(newPassword, 10);
    }

    await user.save();

    res.json({
      msg: "Profile updated successfully",
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
  } catch (error) {
    console.error("Update Error:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMyLibrary = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Purchase.findAndCountAll({
      where: {
        userId: req.user.id,
        [Op.or]: [{ expiresAt: { [Op.gt]: new Date() } }, { expiresAt: null }],
      },
      include: [
        {
          model: Audio,
          required: false,
        },
        {
          model: Playlist,
          required: false,
          include: [
            {
              model: Audio,
              as: "episodes",
              attributes: [
                "id",
                "title",
                "artist",
                "duration",
                "thumbnailUrl",
                "episodeNumber",
              ],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
      limit,
      offset,
      distinct: true,
    });

    const library = rows
      .map((p) => {
        if (p.Playlist) {
          const episodes =
            p.Playlist.episodes?.sort(
              (a, b) => a.episodeNumber - b.episodeNumber,
            ) || [];
          const firstEp = episodes[0];

          return {
            id: p.Playlist.id,
            purchaseDate: p.createdAt,
            type: "playlist",
            audio: {
              id: p.Playlist.id,
              title: p.Playlist.title,
              artist: p.Playlist.artist,
              thumbnail: p.Playlist.thumbnailUrl
                ? `${req.protocol}://${req.get("host")}/${
                    p.Playlist.thumbnailUrl
                  }`
                : null,
              isSeries: true,
              episodesCount: episodes.length,

              episodes: episodes.map((ep) => ({
                id: ep.id,
                title: ep.title,
                artist: ep.artist,
                duration: ep.duration,
                thumbnail: ep.thumbnailUrl
                  ? `${req.protocol}://${req.get("host")}/${ep.thumbnailUrl}`
                  : null,
                streamUrl: `${req.protocol}://${req.get(
                  "host",
                )}/api/audio/stream/${ep.id}`,
              })),
              streamUrl: firstEp
                ? `${req.protocol}://${req.get("host")}/api/audio/stream/${
                    firstEp.id
                  }`
                : null,
            },
          };
        } else if (p.Audio) {
          return {
            id: p.Audio.id,
            purchaseDate: p.createdAt,
            type: "single",
            audio: {
              id: p.Audio.id,
              title: p.Audio.title,
              artist: p.Audio.artist,
              isSeries: false,
              thumbnail: p.Audio.thumbnailUrl
                ? `${req.protocol}://${req.get("host")}/${p.Audio.thumbnailUrl}`
                : null,
              streamUrl: `${req.protocol}://${req.get(
                "host",
              )}/api/audio/stream/${p.Audio.id}`,
            },
          };
        }
        return null;
      })
      .filter((item) => item !== null);

    res.json({
      items: library,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
