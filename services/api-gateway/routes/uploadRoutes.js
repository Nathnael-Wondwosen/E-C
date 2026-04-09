const cloudinary = require('cloudinary').v2;

const registerUploadRoutes = ({
  app,
  middleware,
  upload
}) => {
  const {
    authenticateToken,
    requireAdmin,
    requireSellerOrAdmin
  } = middleware;

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
    console.warn('Cloudinary credentials are missing. Upload endpoints will fail until CLOUDINARY_* env vars are set.');
  }

  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  app.post('/api/upload', authenticateToken, requireAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const result = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder: 'general_uploads',
            use_filename: true,
            unique_filename: true
          },
          (error, uploadResult) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(error);
            } else {
              resolve(uploadResult);
            }
          }
        );

        uploadStream.end(req.file.buffer);
      });

      res.json({ url: result.secure_url });
    } catch (error) {
      console.error('Error uploading file:', error);
      res.status(500).json({ error: 'Failed to upload image to Cloudinary' });
    }
  });

  app.post('/api/upload/product-image', authenticateToken, requireSellerOrAdmin, upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        console.error('[upload/product-image] Missing file in request body');
        return res.status(400).json({ error: 'No file uploaded' });
      }

      console.log('=== UPLOAD REQUEST /api/upload/product-image ===');
      console.log('Seller ID:', String(req.auth?.sub || 'unknown'));
      console.log('Body:', req.body);
      console.log('Filename param:', req.body.filename);
      console.log('MIME:', req.file.mimetype);
      console.log('Size(bytes):', req.file.size);

      const filename = req.body.filename;

      const result = await new Promise((resolve, reject) => {
        const options = {
          folder: 'products',
          use_filename: true,
          unique_filename: true,
          transformation: [
            { width: 800, height: 800, crop: 'fill', quality: 'auto', fetch_format: 'auto' },
            { width: 400, height: 400, crop: 'fill', quality: 'auto', fetch_format: 'auto' }
          ]
        };

        if (filename) {
          options.filename = filename.split('.')[0];
          console.log('Using custom filename:', options.filename);
        } else {
          console.log('Using default filename generation');
        }

        const uploadStream = cloudinary.uploader.upload_stream(
          options,
          (error, uploadResult) => {
            if (error) {
              console.error('[upload/product-image] Cloudinary upload error:', {
                message: error?.message || error,
                name: error?.name || '',
                http_code: error?.http_code || error?.status || '',
                ...(error?.error && typeof error.error === 'object' ? { cloudinary: error.error } : {})
              });
              reject(error);
            } else {
              console.log('[upload/product-image] Upload successful:', uploadResult.secure_url);
              resolve(uploadResult);
            }
          }
        );

        uploadStream.end(req.file.buffer);
      });

      res.json({
        url: result.secure_url,
        publicId: result.public_id,
        width: result.width,
        height: result.height,
        format: result.format
      });
    } catch (error) {
      console.error('[upload/product-image] Error uploading product image:', {
        message: error?.message || error,
        stack: error?.stack || ''
      });
      res.status(500).json({ error: 'Failed to upload product image to Cloudinary' });
    }
  });
};

module.exports = registerUploadRoutes;
