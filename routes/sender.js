const express = require("express");
const { getProfile, updateProfile } = require("../controllers/userController");
const { authMiddleware, checkRole } = require("../middleware/authMiddleware");

const router = express.Router();

// These routes require auth
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;