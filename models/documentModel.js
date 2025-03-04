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
 * Create a new document
 * @param documentData - Document details
 * @returns Created document
 */
const createDocument = async (documentData) => {
    const { data, error } = await supabaseClient.from("Document").insert([documentData]).select().limit(1).maybeSingle();
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
const deleteDocumentById = async (documentId) => {
    const { data, error } = await supabaseClient.from("Document").delete().eq("id", documentId);
    return { data, error };
};

/**
 * Delete a document history
 * @param documentId
 */
const deleteDocumentHistory= async (documentId) => {
    const { data, error } = await supabaseClient.from("DocumentHistory").delete().eq("document_id", documentId);
    return { data, error };
};

/**
 * Delete a document folder in Supabase Storage
 * @param documentId - document_id act as file's prefix, aka. Its folder
 */
const deleteDocumentFolder= async (documentId) => {
    const { data, error } = await supabaseClient.storage.from("Document").list(documentId);

    // Extract file names to delete
    const filePaths = data.map(file => `${documentId}/${file.name}`);

    // Delete all files inside the folder
    const { data: deleteData, error: deleteError } = await supabaseClient.storage
      .from("Document")
      .remove(filePaths);

    return { data: deleteData, deleteError };
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

/**
 * Find the document existence in Supabase Storage based on file name
 */
const findDocument = async (path_folder, file_name) => {
    const { data, error } = await supabaseClient.storage
      .from("Document")
      .list(path_folder,);
    if(error) return { data, error };

    // Filter the file name
    const file = data.filter(file => file.file_name === file_name);
    return { data: file || null, error };
};

/**
 * Create access link for document in Supabase Storage
 */
const getDocumentAccessLink = async (filePath) => {
    const { data, error } = await supabaseClient.storage.from("Document").createSignedUrls(filePath, 60);
    return { data, error };
}

/**
 * Create a history version record of a updated document
 */
const createDocumentVersion = async (document) => {
    // Get the latest version number (if any)
    const { data: versions, error: versionError } = await supabaseClient
        .from("DocumentHistory")
        .select("version")
        .eq("document_id", document.id)
        .order("version", { ascending: false })
        .limit(1); // Get the highest version number

    if (versionError) return { versions, versionError };

    // Determine new version number (if none exists, start with 1)
    const latestVersion = versions.length ? versions[0].version : 0;
    const newVersion = latestVersion === 0 ? 1 : latestVersion + 1;

    // Add the new version into DocumentHistory
    const { data: newEntry, error: insertError } = await supabaseClient
        .from("DocumentHistory")
        .insert([{ document_id: document.id, version: newVersion, file_name: document.file_name }])
        .select()
        .single();

    return { data: newEntry, error: insertError };
}

/**
 * Get all documents
 * @param user_id
 * @param role
 * @returns List of documents
 */
const getAllDocumentVersions = async (document_id) => {
    let query = supabaseClient
        .from("DocumentHistory")
        .select("*")
        .eq("document_id", document_id);

    const { data, error } = await query;

    return { data, error };
};

module.exports = {
    getAllDocuments,
    getDocumentById,
    createDocument,
    updateDocumentById,
    deleteDocumentById,
    deleteDocumentHistory,
    deleteDocumentFolder,
    uploadDocument,
    findDocument,
    getDocumentAccessLink,
    createDocumentVersion,
    getAllDocumentVersions,
};
