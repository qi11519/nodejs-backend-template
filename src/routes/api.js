const express = require("express");
// Import all routes
const authRoutes = require("./auth");
const userRoutes = require("./user");

const router = express.Router();

// Auth Route
router.use("/auth", authRoutes);

// User Route
router.use("/user", userRoutes);

module.exports = router;
