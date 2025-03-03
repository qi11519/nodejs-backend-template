const express = require("express");
const multer = require("multer");
const { getAllDocuments, getDocument, createDocument, updateDocument, deleteDocument, uploadDocument } = require("../../controllers/documentController");
const { authMiddleware, checkRole } = require("../../middleware/authMiddleware");

const router = express.Router();
// Store file in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

// User, Sender, Admin
router.get("/documents", authMiddleware, getAllDocuments);
router.get("/document/:id", authMiddleware, getDocument);
// User

// Sender
router.post("/create/:id", authMiddleware, createDocument);
router.post("/upload", authMiddleware, checkRole("sender"), upload.single("file"), uploadDocument);
// Sender, Admin
router.put("/update/:id", authMiddleware, updateDocument);
router.delete("/delete/:id", authMiddleware, deleteDocument);

module.exports = router;