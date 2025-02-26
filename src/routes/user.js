const express = require("express");
const { getProfile, updateProfile } = require("../controllers/userController");
const authMiddleware = require("../middleware/authMiddleware");
const { requireAuth } = require("@clerk/express");

const router = express.Router();

// These routes require auth
router.get("/profile", requireAuth(), getProfile);
router.put("/profile", authMiddleware, updateProfile);

module.exports = router;