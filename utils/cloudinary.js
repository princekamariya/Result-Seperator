const cloudinary = require('../config/cloudinary');

const isPdf = (buffer) => buffer.slice(0, 4).toString() === '%PDF';

// Upload a buffer to Cloudinary.
// PDFs are converted to JPEG (first page) to avoid delivery restrictions.
const uploadFile = (buffer, folder = 'result_separator') =>
  new Promise((resolve, reject) => {
    const opts = isPdf(buffer)
      ? { folder, resource_type: 'image', format: 'jpg', allowed_formats: ['pdf'] }
      : { folder, resource_type: 'image', allowed_formats: ['jpg', 'jpeg', 'png'] };

    cloudinary.uploader
      .upload_stream(opts,
        (err, result) => (err ? reject(err) : resolve({ url: result.secure_url, publicId: result.public_id }))
      )
      .end(buffer);
  });

// Delete a file from Cloudinary by publicId
const deleteFile = (publicId) =>
  publicId
    ? cloudinary.uploader.destroy(publicId, { resource_type: 'auto' })
    : Promise.resolve();

// Generate a signed URL for a resource (used for PDFs that require auth)
const getSignedUrl = (publicId, resourceType = 'image') =>
  cloudinary.url(publicId, {
    resource_type: resourceType,
    sign_url:      true,
    secure:        true,
  });

module.exports = { uploadFile, deleteFile, getSignedUrl };
