const cloudinary = require('../config/cloudinary');

const isPdf = (buffer) => buffer.slice(0, 4).toString() === '%PDF';

// Generate JPEG URL for one specific page of a PDF (1-indexed).
// These bypass Cloudinary's PDF delivery restriction on free plan.
const pdfPageUrl = (publicId, page) =>
  cloudinary.url(publicId, {
    resource_type:  'image',
    format:         'jpg',
    transformation: [{ page, quality: 'auto' }],
    secure:         true,
  });

// Upload a buffer to Cloudinary.
// Returns { url, publicId, imageUrls[] }
// - Images: imageUrls has one entry (the image URL)
// - PDFs:   imageUrls has one entry per page, ordered page 1 → last page
const uploadFile = (buffer, folder = 'result_separator') =>
  new Promise((resolve, reject) => {
    const pdf  = isPdf(buffer);
    const opts = pdf
      ? { folder, resource_type: 'image', allowed_formats: ['pdf'] }
      : { folder, resource_type: 'image', allowed_formats: ['jpg', 'jpeg', 'png'] };

    cloudinary.uploader.upload_stream(opts, (err, result) => {
      if (err) return reject(err);

      const pageCount = result.pages || 1;
      const imageUrls = pdf
        ? Array.from({ length: pageCount }, (_, i) => pdfPageUrl(result.public_id, i + 1))
        : [result.secure_url];

      resolve({ url: result.secure_url, publicId: result.public_id, imageUrls });
    }).end(buffer);
  });

// Delete a file from Cloudinary by publicId
const deleteFile = (publicId) =>
  publicId
    ? cloudinary.uploader.destroy(publicId, { resource_type: 'auto' })
    : Promise.resolve();

module.exports = { uploadFile, deleteFile, pdfPageUrl };
