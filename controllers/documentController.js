const { v4: uuidv4 } = require('uuid');
const UserModel = require("../models/userModel.js")
const DocumentModel = require("../models/documentModel.js");

/**
 * Get all documents
 * @param {*} req 
 * @param {*} res 
 */
const getAllDocuments = async (req, res) => {
  try {
    // Query current user from Supabase
    const { userId } = req.auth;
    const { data:userData, error:userError } = await UserModel.getUserById(userId);
    if (userError) throw userError;
    if (!userData) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    // Get all documents
    const { data, error } = await DocumentModel.getAllDocuments(userData?.user_id, userData?.role);
    if (error) throw error;
    return res.status(200).json({ code: 200, message: "Success", data });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return res.status(500).json({ code: 500, message: "Failed to retrieve documents", error: error.message });
  }
};

/**
 * Get a document by ID
 * @param {*} req 
 * @param {*} res 
 */
const getDocument = async (req, res) => {
  try {
    // Query current user from Supabase
    const { userId } = req.auth;
    const { data:userData, error:userError } = await UserModel.getUserById(userId);
    if (userError) throw userError;
    if (!userData) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    // Get document
    const { id } = req.params;
    const { data, error } = await DocumentModel.getDocumentById(id, userData?.user_id, userData?.role);
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ code: 404, message: "Document not found" });
    }
    return res.status(200).json({ code: 200, message: "Success", data });
  } catch (error) {
    console.error("Error fetching document:", error);
    return res.status(500).json({ code: 500, message: "Failed to retrieve document", error: error.message });
  }
};

/**
 * Create a new document
 * @param {*} req 
 * @param {*} res 
 */
const createDocument = async (req, res) => {
  try {
    // Query current user who uploads the document
    const { userId } = req.auth;
    const { data: userData, error: userError } = await UserModel.getUserById(userId);
    if (userError) throw userError;
    if (!userData) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    const { user_id: creator_id, company_id, role } = userData;
    const { document_id, name, status, content, signer_id, is_private, file_name } = req.body;

    // Check if this document id exist already
    const { data, error } = await DocumentModel.getDocumentById(document_id, creator_id, role);
    if (error) throw error;
    if (data) {
      return res.status(400).json({ code: 400, message: "Document id already exist" });
    }

    // Create document record in Supabase
    const { data:documentData, error:documentError } = await DocumentModel.createDocument({
      id: document_id,
      creator_id,
      name,
      status,
      content,
      company_id,
      signer_id,
      is_private,
      file_name,
    });
    if (documentError) throw documentError;

    const { error: versionError } = await DocumentModel.createDocumentVersion(documentData);
    if (versionError) throw versionError;

    return res.status(200).json({ code: 200, message: "Document created successfully", data: documentData });
  } catch (error) {
    console.error("Error creating document:", error);
    return res.status(500).json({ code: 500, message: "Failed to create document", error: error.message });
  }
};

/**
 * Update an existing document
 * @param {*} req 
 * @param {*} res 
 */
const updateDocument = async (req, res) => {
  try {
    // Query current user from Supabase
    const { userId } = req.auth;
    const { data:userData, error:userError } = await UserModel.getUserById(userId);
    if (userError) throw userError;
    if (!userData) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    const { id:document_id } = req.params;
    const { role } = userData;
    const { name, status, content, signer_id, is_private, file_name } = req.body;

    // Check if this file name exist in the Supabase Storage
    const { data:findData, error:findError } = await DocumentModel.findDocument(document_id, file_name);
    if (findError) throw findError;

    const params = { name, status, content, signer_id, is_private }
    if (findData && Array.isArray(findData) && findData.length < 1){
      params.file_name = file_name;
    }

    // Update Document Info
    const { data:updateData, error:updateError } = await DocumentModel.updateDocumentById(document_id, userId, role, params);
    if (updateError) throw updateError;
    
    // Create now version
    if(params.file_name){
      const { error: versionError } = await DocumentModel.createDocumentVersion(updateData[0]);
      if (versionError) throw versionError;
    }

    if (!updateData) {
      return res.status(404).json({ code: 404, message: "Document not found or update failed" });
    }

    return res.status(200).json({ code: 200, message: "Document updated successfully" });
  } catch (error) {
    console.error("Error updating document:", error);
    return res.status(500).json({ code: 500, message: "Failed to update document", error: error.message });
  }
};

/**
 * Delete a document by ID
 * @param {*} req 
 * @param {*} res 
 */
const deleteDocument = async (req, res) => {
  try {
    // Query current user from Supabase
    const { userId } = req.auth;
    const { data:userData, error:userError } = await UserModel.getUserById(userId);
    if (userError) throw userError;
    if (!userData) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    // Get document
    const { id } = req.params;
    const { data, error } = await DocumentModel.getDocumentById(id, userData?.user_id, userData?.role);
    if (error) throw error;
    if (!data) {
      return res.status(404).json({ code: 404, message: "Document not found" });
    }

    // Delete row from "DocumentHistory" table
    const { error:historyError } = await DocumentModel.deleteDocumentHistory(id);
    if(historyError) throw historyError;

    // Delete row from "Document" table
    const { error:documentError } = await DocumentModel.deleteDocumentById(id, userData?.user_id, userData.role);
    if(documentError) throw documentError;

    // Delete files folder from storage
    const { error:folderError } = await DocumentModel.deleteDocumentFolder(id);
    if(folderError) throw folderError;

    return res.status(200).json({ code: 200, message: "Document deleted successfully" });
  } catch (error) {
    console.error("Error deleting document:", error);
    return res.status(500).json({ code: 500, message: "Failed to delete document", error: error.message });
  }
};

/**
 * Upload a new file for create/update document
 * @params id - documentId (If update document only)
 */
const uploadDocument = async (req, res) => {
  try {
    // Check upload file status
    if (!req?.file) return res.status(400).json({ code: 400, message: "File is required" });
    const { originalname, buffer, mimetype } = req.file; // File from request

    // Check upload file status
    if (!originalname || !buffer) return res.status(400).json({ code: 400, message: "File is required" });
    
    // Generates random UUID for document(if create only) and file name prefix
    const documentId = documentIdFromParams || uuidv4();
    const uniqueId = uuidv4();
    const fileName = `${uniqueId}-${originalname}`;

    // Upload to Supabase Storage then get file url in Supabase
    const { error:uploadError } = await DocumentModel.uploadDocument(`${documentId}/${fileName}`, buffer, mimetype);
    if(uploadError) throw uploadError;

    // Success
    return res.status(200).json({ 
      code: 200, 
      message: "Document uploaded successfully", 
      data: {
        document_id: documentId,
        file_name: fileName,
      }
    });
  } catch (error) {
    console.error("Error uploading document:", error);
    return res.status(500).json({ code: 500, message: "Failed to upload document", error: error.message });
  }
};

/**
 * Get temporary access url of document for download
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const getDocumentUrl = async (req, res) => {
  try {
    // Query current user from Supabase
    const { userId } = req.auth;
    const { data:userData, error:userError } = await UserModel.getUserById(userId);
    if (userError) throw userError;
    if (!userData) {
      return res.status(404).json({ code: 404, message: "User not found" });
    }

    // Get document
    const { id } = req.params;
    const { data:documentData, error:documentError } = await DocumentModel.getDocumentById(id, userData?.user_id, userData?.role);
    if (documentError) throw documentError;
    if (!documentData) {
      return res.status(404).json({ code: 404, message: "Document not found" });
    }
    
    // Get Signed Access Link
    const { data:accessData, error:accessError } = await DocumentModel.getDocumentAccessLink(`${documentData.id}/${documentData.file_name}`);
    if (accessError) throw accessError;
    if (!accessData || !accessData.length === 0 || !accessData[0]?.signedUrl) {
      return res.status(404).json({ code: 404, message: "Document not found" });
    }

    // Success
    return res.status(200).json({ 
      code: 200, 
      data: {
        access_url: accessData[0]?.signedUrl
      }
    });
    
  } catch (error) {
    console.error("Error obtaining document url:", error);
    return res.status(400).json({ code: 400, message: "Failed to obtain document url", error: error.message });
  }
}

/**
 * Get all document versions
 * @param {*} req 
 * @param {*} res 
 */
const getAllDocumentVersions = async (req, res) => {
  try {
    // Get all document versions
    const { id: document_id } = req.params;
    const { data, error } = await DocumentModel.getAllDocumentVersions(document_id);
    if (error) throw error;

    return res.status(200).json({ code: 200, message: "Success", data });
  } catch (error) {
    console.error("Error fetching documents:", error);
    return res.status(500).json({ code: 500, message: "Failed to retrieve documents", error: error.message });
  }
};

module.exports = { 
  getAllDocuments, 
  getDocument, 
  createDocument, 
  updateDocument, 
  deleteDocument, 
  uploadDocument, 
  getDocumentUrl,
  getAllDocumentVersions
};
