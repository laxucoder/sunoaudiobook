const { Audio, Purchase, Playlist } = require("../models");
const fs = require("fs");
const path = require("path");
const mm = require("music-metadata");
const { Op, literal } = require("sequelize");
exports.uploadAudio = async (req, res) => {
  try {
    const { title, artist, isFree, price, category, description } = req.body;
    if (!req.files || !req.files["audioFiles"]) {
      return res
        .status(400)
        .json({ error: "At least one audio file is required" });
    }

    const audioFiles = req.files["audioFiles"];
    const thumbnailFile = req.files["thumbnail"]
      ? req.files["thumbnail"][0]
      : null;
    const playlist = await Playlist.create({
      title,
      artist,
      description,
      category: category || "New & Hot",
      isFree: isFree === "true",
      price: parseInt(price) || 0,
      thumbnailUrl: thumbnailFile ? thumbnailFile.path : null,
    });

    const createdEpisodes = [];
    for (let i = 0; i < audioFiles.length; i++) {
      const file = audioFiles[i];
      let duration = 0;
      let bitrate = 128;
      try {
        const metadata = await mm.parseFile(file.path);
        duration = metadata.format.duration || 0;
        bitrate = Math.round(metadata.format.bitrate / 1000) || 128;
      } catch (e) {
        console.error("Meta error", e);
      }
      const episode = await Audio.create({
        title: audioFiles.length > 1 ? `${title} - Episode ${i + 1}` : title,
        artist,
        category: category || "New & Hot",
        isFree: isFree === "true",
        price: parseInt(price) || 0,
        bitrate,
        duration,
        storagePath: file.path,
        size: file.size,
        thumbnailUrl: thumbnailFile ? thumbnailFile.path : null,
        playlistId: playlist.id,
        episodeNumber: i + 1,
      });
      createdEpisodes.push(episode);
    }

    res.status(201).json({
      msg: "Series uploaded successfully",
      playlist,
      episodesCount: createdEpisodes.length,
    });
  } catch (error) {
    console.error(error);
    if (req.files?.["audioFiles"]) {
      req.files["audioFiles"].forEach((f) => fs.unlink(f.path, () => {}));
    }
    res.status(500).json({ error: error.message });
  }
};

exports.getAllSongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const { count, rows } = await Playlist.findAndCountAll({
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      distinct: true,
      include: [
        {
          model: Audio,
          as: "episodes",
          attributes: ["id", "title", "duration", "episodeNumber", "isFree"],
        },
      ],
    });

    const formattedData = rows.map((p) => {
      const sortedEpisodes = p.episodes.sort(
        (a, b) => a.episodeNumber - b.episodeNumber,
      );

      return {
        id: p.id,
        title: p.title,
        artist: p.artist,
        description: p.description,
        isFree: p.isFree,
        price: p.price,
        category: p.category,
        thumbnail: p.thumbnailUrl
          ? `${req.protocol}://${req.get("host")}/${p.thumbnailUrl}`
          : null,

        isSeries: sortedEpisodes.length > 0,
        episodes: sortedEpisodes,
        episodesCount: sortedEpisodes.length,

        audioUrl:
          sortedEpisodes.length > 0
            ? `${req.protocol}://${req.get("host")}/api/audio/stream/${
                sortedEpisodes[0].id
              }`
            : null,
      };
    });

    res.json({
      success: true,
      data: formattedData,
      pagination: { totalItems: count, totalPages: Math.ceil(count / limit) },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch content" });
  }
};
exports.updateAudio = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFree } = req.body;
    const audio = await Audio.findByPk(id);
    if (!audio) return res.status(404).json({ error: "Audio not found" });
    audio.isFree = isFree == true;
    await audio.save();

    res.json({ success: true, msg: "audio updated", audio });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.updatePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, artist, category, description, isFree, price } = req.body;

    const playlist = await Playlist.findByPk(id);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    if (title) playlist.title = title;
    if (artist) playlist.artist = artist;
    if (category) playlist.category = category;
    if (description) playlist.description = description;

    if (isFree !== undefined)
      playlist.isFree = isFree === "true" || isFree === true;
    if (price !== undefined) playlist.price = parseInt(price);

    if (req.files && req.files["thumbnail"]) {
      if (playlist.thumbnailUrl && fs.existsSync(playlist.thumbnailUrl)) {
        fs.unlink(playlist.thumbnailUrl, () => {});
      }
      playlist.thumbnailUrl = req.files["thumbnail"][0].path;
    }

    await playlist.save();

    res.json({ success: true, msg: "Playlist updated", playlist });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
exports.streamAudio = async (req, res) => {
  try {
    const { audioId } = req.params;

    const audio = await Audio.findByPk(audioId);

    if (!audio) return res.status(404).send("Audio not found");
    if (audio.playlistId) {
      await Playlist.increment("playCount", {
        where: { id: audio.playlistId },
      });
    }

    const absolutePath = path.resolve(audio.storagePath);
    if (!fs.existsSync(absolutePath))
      return res.status(404).send("File missing");

    let allowFull = false;
    if (audio.isFree) allowFull = true;

    if (req.user) {
      if (req.user.role === "ADMIN") allowFull = true;
      if (req.user.isPremium && req.user.subscriptionEndDate > new Date())
        allowFull = true;
      const audioPurchase = await Purchase.findOne({
        where: { userId: req.user.id, audioId: audio.id },
      });
      let playlistPurchase = null;
      if (audio.playlistId) {
        playlistPurchase = await Purchase.findOne({
          where: { userId: req.user.id, playlistId: audio.playlistId },
        });
      }

      const checkAccess = (purchase) => {
        if (!purchase) return false;
        if (purchase.expiresAt) {
          return new Date() < new Date(purchase.expiresAt);
        }
        return true;
      };

      if (checkAccess(audioPurchase) || checkAccess(playlistPurchase))
        allowFull = true;
    }
    const fileSize = audio.size;
    const BYTES_PER_SEC = (audio.bitrate * 1000) / 8;
    const PREVIEW_LIMIT = Math.floor(BYTES_PER_SEC * 15);

    const effectiveSize = allowFull
      ? fileSize
      : Math.min(fileSize, PREVIEW_LIMIT);

    const range = req.headers.range;
    if (!range) {
      res.writeHead(200, {
        "Content-Length": effectiveSize,
        "Content-Type": "audio/mpeg",
      });
      return fs
        .createReadStream(absolutePath, { end: effectiveSize - 1 })
        .pipe(res);
    }

    const parts = range.replace(/bytes=/, "").split("-");
    const start = parseInt(parts[0], 10);

    if (start >= effectiveSize)
      return res.status(416).send("Range Not Satisfiable");

    const CHUNK_SIZE = 10 ** 6;
    let end = parts[1] ? parseInt(parts[1], 10) : start + CHUNK_SIZE;
    if (end >= effectiveSize) end = effectiveSize - 1;

    const stream = fs.createReadStream(absolutePath, { start, end });

    res.writeHead(206, {
      "Content-Range": `bytes ${start}-${end}/${effectiveSize}`,
      "Accept-Ranges": "bytes",
      "Content-Length": end - start + 1,
      "Content-Type": "audio/mpeg",
    });

    stream.pipe(res);
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.getAllSongs = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const search = req.query.search || "";
    const filter = req.query.filter || "all"; // 'free', 'premium', 'trending'

    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { title: { [Op.iLike]: `%${search}%` } },
        { artist: { [Op.iLike]: `%${search}%` } },
        { category: { [Op.iLike]: `%${search}%` } },
      ];
    }

    if (filter === "free") {
      whereClause.isFree = true;
    } else if (filter === "premium") {
      whereClause.isFree = false;
    } else if (filter === "trending") {
      // Complex: Hacker News Gravity Formula
      // Score = playCount / (AgeInHours + 2)^1.5
      // This makes old files "decay" in ranking even if they have many plays
      orderQuery = [
        [
          literal(
            '"playCount" / POWER((EXTRACT(EPOCH FROM age(NOW(), "createdAt")) / 3600) + 2, 1.5)',
          ),
          "DESC",
        ],
      ];
    }
    const { count, rows } = await Playlist.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]], // Newest first
      distinct: true,
      include: [
        {
          model: Audio,
          as: "episodes",
          attributes: ["id", "title", "duration", "episodeNumber", "isFree"],
        },
      ],
    });

    const formattedData = rows.map((p) => ({
      id: p.id,
      title: p.title,
      artist: p.artist,
      description: p.description,
      isFree: p.isFree,
      price: p.price,
      category: p.category,
      playCount: p.playCount,
      createdAt: p.createdAt,
      thumbnail: p.thumbnailUrl
        ? `${req.protocol}://${req.get("host")}/${p.thumbnailUrl}`
        : null,
      isSeries: p.episodes.length > 0,
      episodes: p.episodes.sort((a, b) => a.episodeNumber - b.episodeNumber),
      episodesCount: p.episodes.length,
    }));

    res.json({
      success: true,
      data: formattedData,
      pagination: {
        totalItems: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch content" });
  }
};

exports.addEpisodes = async (req, res) => {
  try {
    const { playlistId } = req.params;
    const { isFree } = req.body;

    if (!req.files || !req.files["audioFiles"]) {
      return res.status(400).json({ error: "No audio files provided" });
    }

    const playlist = await Playlist.findByPk(playlistId);
    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    const lastEpisode = await Audio.findOne({
      where: { playlistId },
      order: [["episodeNumber", "DESC"]],
    });
    let nextEpisodeNum = lastEpisode ? lastEpisode.episodeNumber + 1 : 1;

    const audioFiles = req.files["audioFiles"];
    const createdEpisodes = [];

    for (const file of audioFiles) {
      let duration = 0;
      let bitrate = 128;
      try {
        const metadata = await mm.parseFile(file.path);
        duration = metadata.format.duration || 0;
        bitrate = Math.round(metadata.format.bitrate / 1000) || 128;
      } catch (e) {
        console.error("Meta error", e);
      }

      const episode = await Audio.create({
        title: `${playlist.title} - Episode ${nextEpisodeNum}`,
        artist: playlist.artist,
        category: playlist.category,
        isFree:
          isFree !== undefined
            ? isFree === "true" || isFree === true
            : playlist.isFree,
        price: 0,
        bitrate,
        duration,
        storagePath: file.path,
        size: file.size,
        thumbnailUrl: playlist.thumbnailUrl,
        playlistId: playlist.id,
        episodeNumber: nextEpisodeNum,
      });
      createdEpisodes.push(episode);
      nextEpisodeNum++;
    }

    res.json({
      success: true,
      msg: `Added ${createdEpisodes.length} new episodes`,
      episodes: createdEpisodes,
    });
  } catch (error) {
    console.error(error);
    if (req.files?.["audioFiles"]) {
      req.files["audioFiles"].forEach((f) => fs.unlink(f.path, () => {}));
    }
    res.status(500).json({ error: error.message });
  }
};

exports.deleteEpisode = async (req, res) => {
  try {
    const { id } = req.params;
    const episode = await Audio.findByPk(id);

    if (!episode) return res.status(404).json({ error: "Episode not found" });

    if (episode.storagePath) {
      const fullPath = path.resolve(episode.storagePath);
      if (fs.existsSync(fullPath)) {
        await fs.promises
          .unlink(fullPath)
          .catch((err) => console.error("Delete error", err));
      }
    }

    await episode.destroy();

    res.json({ success: true, msg: "Episode deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Delete failed" });
  }
};

exports.updateEpisode = async (req, res) => {
  try {
    const { id } = req.params;
    const { isFree, title } = req.body;
    const episode = await Audio.findByPk(id);

    if (!episode) return res.status(404).json({ error: "Episode not found" });

    if (title !== undefined) episode.title = title;
    if (isFree !== undefined)
      episode.isFree = isFree === "true" || isFree === true;

    await episode.save();

    res.json({ success: true, msg: "Episode updated successfully", episode });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Update failed" });
  }
};

exports.deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;

    const playlist = await Playlist.findByPk(id, {
      include: [{ model: Audio, as: "episodes" }],
    });

    if (!playlist) return res.status(404).json({ error: "Playlist not found" });

    if (playlist.episodes && playlist.episodes.length > 0) {
      playlist.episodes.forEach((ep) => {
        if (ep.storagePath) {
          const epPath = path.resolve(ep.storagePath);
          if (fs.existsSync(epPath)) {
            try {
              fs.unlinkSync(epPath);
            } catch (e) {
              console.error("File delete error", e);
            }
          }
        }
      });
    }
    if (playlist.thumbnailUrl) {
      const thumbPath = path.resolve(playlist.thumbnailUrl);
      if (fs.existsSync(thumbPath)) {
        try {
          fs.unlinkSync(thumbPath);
        } catch (e) {
          console.error("Thumb delete error", e);
        }
      }
    }

    await Audio.destroy({ where: { playlistId: id } });
    await playlist.destroy();

    res.json({ success: true, msg: "Playlist and all files deleted." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Delete failed" });
  }
};
