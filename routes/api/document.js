const express = require("express");
const multer = require("multer");
const { getAllDocuments, getDocument, createDocument, updateDocument, deleteDocument, uploadDocument } = require("../../controllers/documentController");
const { authMiddleware, checkRole } = require("../../middleware/authMiddleware");

const router = express.Router();
// Store file in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

// These routes require auth
router.get("/document", authMiddleware, getAllDocuments);
router.get("/document/:id", authMiddleware, getDocument);
router.post("/create/:id", authMiddleware, createDocument);
router.put("/update", authMiddleware, updateDocument);
router.delete("/delete/:id", authMiddleware, deleteDocument);
router.post("/upload", authMiddleware, checkRole("sender"), upload.single("file"), uploadDocument);

module.exports = router;