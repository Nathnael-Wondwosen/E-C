// Cloudinary service for frontend image handling
// Using shared Cloudinary service

import { uploadImageToCloudinary, getCloudinaryImageUrl } from '../../../shared/utils/cloudinaryService';

export { uploadImageToCloudinary, getCloudinaryImageUrl };

// Named export as default for backward compatibility
export default {
  uploadImageToCloudinary,
  getCloudinaryImageUrl
};