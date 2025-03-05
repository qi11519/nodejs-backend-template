const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require('uuid');
const pdfPoppler = require("pdf-poppler");
const DocumentModel = require("../models/documentModel.js");

/**
 * Convert all pages in document into each independant image
 * @param {*} documentId 
 * @param {*} fileName 
 * @param {*} buffer 
 * @returns 
 */
const convertPdfPagesToImages = async (documentId, fileName, buffer) => {
     // Save temp file for conversion
    const tempFilePath = path.join(__dirname, `${fileName}`);
    fs.writeFileSync(tempFilePath, buffer);

    // Temporary storage
    const outputFolder = path.join(__dirname, "temp_images"); 
    if (!fs.existsSync(outputFolder)) fs.mkdirSync(outputFolder);

    const convertOptions = {
      format: "png",
      out_dir: outputFolder,
      out_prefix: "page",
      page: null, // Convert all pages
    };

     // Convert PDF to images
    await pdfPoppler.convert(tempFilePath, convertOptions);

    // Upload all images to Supabase Storage
    const imageFiles = fs.readdirSync(outputFolder);
    const imageUrls = {};

    for (const imageFile of imageFiles) {
    const uniqueId = uuidv4();
      const pageNum = imageFile.match(/\d+/)[0]; // Extract page number
      const imageBuffer = fs.readFileSync(path.join(outputFolder, imageFile));
      const imagePath = `${documentId}/${fileName}/${uniqueId}-page_${pageNum}.png`;

      // Upload the current image to Storage  
      const { error: imgUploadError } = await DocumentModel.uploadDocument(imagePath, imageBuffer, "image/png");
      if (imgUploadError) throw imgUploadError;

      // Get Signed Access Link of current image
      const { data:accessData, error:accessError } = await DocumentModel.getDocumentAccessLink(imagePath);
      if (accessError) throw accessError;

      imageUrls[pageNum] = accessData[0]?.signedUrl;
    }

    // Cleanup temp files
    fs.unlinkSync(tempFilePath);
    fs.rmSync(outputFolder, { recursive: true, force: true });

    return imageUrls;
}

module.exports = { convertPdfPagesToImages };