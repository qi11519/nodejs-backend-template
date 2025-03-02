const UserModel = require("../models/userModel.js")
const DocumentModel = require("../models/documentModel.js");

/**
 * Get all documents
 * @param {*} req 
 * @param {*} res 
 */
const getAllDocuments = async (req, res) => {
  try {
    const { data, error } = await DocumentModel.getAllDocuments();
    if (error) throw error;
    res.json({ code: 200, message: "Success", data });
  } catch (error) {
    console.error("Error fetching documents:", error);
    res.status(500).json({ code: 500, message: "Failed to retrieve documents", error: error.message });
  }
};

/**
 * Get a document by ID
 * @param {*} req 
 * @param {*} res 
 */
const getDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await DocumentModel.getDocumentById(id);
    if (error || !data) {
      return res.status(404).json({ code: 404, message: "Document not found" });
    }
    res.json({ code: 200, message: "Success", data });
  } catch (error) {
    console.error("Error fetching document:", error);
    res.status(500).json({ code: 500, message: "Failed to retrieve document", error: error.message });
  }
};

/**
 * Create a new document
 * @param {*} req 
 * @param {*} res 
 */
const createDocument = async (req, res) => {
  try {
    const { creator_id, name, status, content, company_id, signer_id, is_private } = req.body;
    const { data, error } = await DocumentModel.createDocument({
      creator_id,
      name,
      status,
      content,
      company_id,
      signer_id,
      is_private,
    });
    if (error) throw error;
    res.status(201).json({ code: 201, message: "Document created successfully", data });
  } catch (error) {
    console.error("Error creating document:", error);
    res.status(400).json({ code: 400, message: "Failed to create document", error: error.message });
  }
};

/**
 * Update an existing document
 * @param {*} req 
 * @param {*} res 
 */
const updateDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, status, content, signer_id, is_private } = req.body;
    const { data, error } = await DocumentModel.updateDocumentById(id, {
      name,
      status,
      content,
      signer_id,
      is_private,
    });
    if (error || !data) {
      return res.status(404).json({ code: 404, message: "Document not found or update failed" });
    }
    res.json({ code: 200, message: "Document updated successfully" });
  } catch (error) {
    console.error("Error updating document:", error);
    res.status(400).json({ code: 400, message: "Failed to update document", error: error.message });
  }
};

/**
 * Delete a document by ID
 * @param {*} req 
 * @param {*} res 
 */
const deleteDocument = async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await DocumentModel.deleteDocumentById(id);
    if (error) {
      return res.status(404).json({ code: 404, message: "Document not found or delete failed" });
    }
    res.json({ code: 200, message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    res.status(500).json({ code: 500, message: "Failed to delete document", error: error.message });
  }
};

/**
 * Upload a new document
 */
const uploadDocument = async (req, res) => {
  try {    
    const { originalname, buffer, mimetype } = req.file; // File from request
    const { name, is_private, signer_id } = req.body;   
    const { userId } = req.auth;

    // Query current user who uploads the document
    const { data: userData, error: userError } = await UserModel.getUserById(userId);
    if (userError) throw userError;
    if (!userData) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }
    const { user_id: creator_id, company_id } = userData;

    // Check upload file status
    if (!originalname || !buffer) {
      return res.status(400).json({ code: 400, message: "No file uploaded" });
    }

    // Upload to Supabase Storage then get file url in Supabase
    const filePath = `${Date.now()}_${originalname}`;
    const file_url = await DocumentModel.uploadDocument(filePath, buffer, mimetype);
    
    // Save document details in Supabase Database
    const { data:documentData, error:documentError } = await DocumentModel.createDocument({
      creator_id,
      // company_id,
      name,
      status: "draft",
      signer_id,
      is_private: is_private,
      file_url: file_url,
    });
    if (documentError) throw documentError;
    if (!documentData) {
      return res.status(400).json({ code: 400, message: "Failed to upload document", error: error.message });
    }

    res.json({ code: 200, message: "Document uploaded successfully", data: documentData });
  } catch (error) {
    console.error("Error uploading document:", error);
    res.status(500).json({ code: 500, message: "Failed to upload document", error: error.message });
  }
};

module.exports = { getAllDocuments, getDocument, createDocument, updateDocument, deleteDocument, uploadDocument };
