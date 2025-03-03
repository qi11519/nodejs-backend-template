const express = require("express");
const { getProfile, updateProfile, updateEmail, changePassword } = require("../../controllers/userController");
const { authMiddleware } = require("../../middleware/authMiddleware");

const router = express.Router();

// These routes require auth
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
router.put("/email", authMiddleware, updateEmail);
router.put("/password", authMiddleware, changePassword);

module.exports = router;