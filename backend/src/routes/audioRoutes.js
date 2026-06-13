const express = require("express");
const router = express.Router();
const {
  uploadAudio,
  streamAudio,
  getAllSongs,
  addEpisodes,
  updatePlaylist,
  deleteEpisode,
  deletePlaylist,
  updateAudio,
} = require("../controllers/audioController");
const {
  protect,
  adminOnly,
  optionalAuth,
} = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

router.get("/", getAllSongs);

router.get("/stream/:audioId", optionalAuth, streamAudio);
router.put("/episode/:id", protect, adminOnly, updateAudio);

router.post(
  "/upload",
  protect,
  adminOnly,
  upload.fields([
    { name: "audioFiles", maxCount: 10 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadAudio,
);

router.post(
  "/playlist/:playlistId/add",
  protect,
  adminOnly,
  upload.fields([{ name: "audioFiles", maxCount: 20 }]),
  addEpisodes,
);

router.put(
  "/playlist/:id",
  protect,
  adminOnly,
  upload.fields([{ name: "thumbnail", maxCount: 1 }]),
  updatePlaylist,
);

router.delete("/playlist/:id", protect, adminOnly, deletePlaylist);
router.delete("/episode/:id", protect, adminOnly, deleteEpisode);

module.exports = router;
