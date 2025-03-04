const express = require("express");
const multer = require("multer");
const { authMiddleware, checkRole } = require("../../middleware/authMiddleware");
const { 
    getAllDocuments, 
    getDocument, 
    createDocument, 
    updateDocument, 
    deleteDocument, 
    uploadDocumentForCreate, 
    uploadDocumentForUpdate, 
    getDocumentUrl,
    getAllDocumentVersions
} = require("../../controllers/documentController");

const router = express.Router();
// Store file in memory temporarily
const upload = multer({ storage: multer.memoryStorage() });

// User, Sender, Admin
router.get("/documents", authMiddleware, getAllDocuments);
router.get("/document/:id", authMiddleware, getDocument);
router.get("/url/:id", authMiddleware, getDocumentUrl);
router.get("/versions/:id", authMiddleware, getAllDocumentVersions);
// User

// Sender
router.post("/create", authMiddleware, createDocument);
router.post("/upload", authMiddleware, checkRole("sender"), upload.single("file"), uploadDocumentForCreate);
router.post("/upload/:id", authMiddleware, checkRole("sender"), upload.single("file"), uploadDocumentForUpdate);
// Sender, Admin
router.put("/document/:id", authMiddleware, updateDocument);
router.delete("/document/:id", authMiddleware, deleteDocument);

module.exports = router;