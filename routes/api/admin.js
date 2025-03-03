const express = require("express");
const { getAllUser, getUser, updateUser, deleteUser } = require("../../controllers/adminController");
const { authMiddleware, checkRole } = require("../../middleware/authMiddleware");

const router = express.Router();

// These routes require auth
router.get("/users", authMiddleware, checkRole("admin"), getAllUser);
router.get("/user/:id", authMiddleware, checkRole("admin"), getUser);
router.put("/user/:id", authMiddleware, checkRole("admin"), updateUser);
router.delete("/user/:id", authMiddleware, checkRole("admin"), deleteUser);

module.exports = router;