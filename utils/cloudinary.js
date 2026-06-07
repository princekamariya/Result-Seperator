const cloudinary = require('../config/cloudinary');

// Upload a buffer to Cloudinary
const uploadFile = (buffer, folder = 'result_separator') =>
  new Promise((resolve, reject) => {
    cloudinary.uploader
      .upload_stream(
        { folder, resource_type: 'auto', access_mode: 'public', allowed_formats: ['jpg', 'jpeg', 'png', 'pdf'] },
        (err, result) => (err ? reject(err) : resolve({ url: result.secure_url, publicId: result.public_id }))
      )
      .end(buffer);
  });

// Delete a file from Cloudinary by publicId
const deleteFile = (publicId) =>
  publicId
    ? cloudinary.uploader.destroy(publicId, { resource_type: 'auto' })
    : Promise.resolve();

module.exports = { uploadFile, deleteFile };
