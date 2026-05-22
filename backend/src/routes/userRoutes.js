const express = require("express");
const router = express.Router();
const {
  getProfile,
  updateProfile,
  getMyLibrary,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");


router.get("/profile", protect, getProfile);
router.put("/profile", protect, upload.single('avatar'), updateProfile); // <--- Updated
router.get("/library", protect, getMyLibrary);

module.exports = router;
