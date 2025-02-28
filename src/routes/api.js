const express = require("express");
// Import all routes
const authRoutes = require("./auth");
const adminRoutes = require("./admin");
const userRoutes = require("./user");

const router = express.Router();

// Auth Route
router.use("/auth", authRoutes);

// Admin Route
router.use("/admin", adminRoutes);

// User Route
router.use("/user", userRoutes);

module.exports = router;
