const supabaseClient = require("../config/supabase.js");

// Document table:
// - id (uuid, primary key, not null, default: gen_random_uuid())
// - creator_id (uuid, not null)
// - name (text, not null)
// - status (USER-DEFINED, not null)
// - content (jsonb, nullable)
// - created_at (timestamptz, not null, default: now())
// - updated_at (timestamptz, not null, default: now())
// - company_id (uuid, not null)
// - signer_id (uuid, nullable)
// - is_private (boolean, not null, default: false)

/**
 * Get all documents
 * @param user_id
 * @param role
 * @returns List of documents
 */
const getAllDocuments = async (user_id, role) => {
    let query = supabaseClient
        .from("Document")
        .select("*");

    if (role === "user") {
        query = query.eq("signer_id", user_id);
    } else if (role === "sender") {
        query = query.eq("creator_id", user_id);
    }

    const { data, error } = await query;

    return { data, error };
};

/**
 * Get a specific document by ID
 * @param documentId
 * @param user_id
 * @param role
 * @returns Document details
 */
const getDocumentById = async (documentId, user_id, role) => {
    let query = supabaseClient.from("Document").select("*").eq("id", documentId).limit(1).maybeSingle();

    // User and sender can only see those related to them only
    if (role === "user") {
        query = query.eq("signer_id", user_id);
    } else if (role === "sender") {
        query = query.eq("creator_id", user_id);
    }

    const { data, error } = await query;
    return { data, error };
};

/**
 * Create a new document (Only Senders or Admins)
 * @param documentData - Document details
 * @returns Created document
 */
const createDocument = async (documentData) => {
    const { data, error } = await supabaseClient.from("Document").insert([documentData]).select();
    return { data, error };
};

/**
 * Update a document (Only the sender or admin)
 * @param documentId
 * @param user_id
 * @param role
 * @param updatedData
 * @returns Updated document
 */
const updateDocumentById = async (documentId, user_id, role, updatedData) => {
    let query = supabaseClient.from("Document").update(updatedData).eq("id", documentId);

    // Sender can only delete those they create only
    if (role === "sender") {
        query = query.eq("creator_id", user_id);
    }

    const { data, error } = await query.select();
    return { data, error };
};

/**
 * Delete a document (Only the sender or admin)
 * @param documentId
 * @param user_id
 * @param role
 * @returns Success
 */
const deleteDocumentById = async (documentId, user_id, role) => {
    let query = supabaseClient.from("Document").delete().eq("id", documentId);

    // Senders can only delete documents they created
    if (role === "sender") {
        query = query.eq("creator_id", user_id);
    }

    const { error } = await query;
    return { success: !error, error };
};

/**
 * Create a new document entry in Supabase DB
 */
const uploadDocument = async (filePath, buffer, mimetype) => {
    const { data, error } = await supabaseClient.storage
      .from("Document")
      .upload(filePath, buffer, { contentType: mimetype });
  
    return { data, error };
};

const getDocumentAccessLink = async (fileName) => {
    const { data:signedUrl } = await supabaseClient.storage.from("Document").createSignedUrls(fileName, 604800);
    console.log("signedDocumentUrl",signedUrl);

    return signedUrl;
}

module.exports = {
    getAllDocuments,
    getDocumentById,
    createDocument,
    updateDocumentById,
    deleteDocumentById,
    uploadDocument,
    getDocumentAccessLink,
};
