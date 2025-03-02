const express = require("express");
// Import all routes
const authRoutes = require("./api/auth");
const adminRoutes = require("./api/admin");
const userRoutes = require("./api/user");
const documentRoutes = require("./api/document");

const router = express.Router();

// Auth Route
router.use("/auth", authRoutes);

// Admin Route
router.use("/admin", adminRoutes);

// User Route
router.use("/user", userRoutes);

// Document Route
router.use("/document", documentRoutes);

module.exports = router;
