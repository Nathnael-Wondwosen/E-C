// services/api-gateway/services/SettingsService.js
// Application settings management service

const { ApiError } = require('../middleware/errorHandler');

class SettingsService {
  constructor(db) {
    this.db = db;
  }

  /**
   * Get global background image
   * @returns {Promise<string>} Image URL
   */
  async getGlobalBackgroundImage() {
    try {
      const collection = this.db.collection('settings');
      const setting = await collection.findOne({ key: 'globalBackgroundImage' });
      return setting?.value || '';
    } catch (error) {
      throw new ApiError(`Failed to get background image: ${error.message}`, 500);
    }
  }

  /**
   * Set global background image
   * @param {string} imageUrl - Image URL to set
   * @returns {Promise<string>} Updated image URL
   */
  async setGlobalBackgroundImage(imageUrl) {
    try {
      if (!imageUrl || typeof imageUrl !== 'string') {
        throw new ApiError('Image URL is required and must be a string', 400);
      }

      const collection = this.db.collection('settings');
      await collection.updateOne(
        { key: 'globalBackgroundImage' },
        {
          $set: {
            key: 'globalBackgroundImage',
            value: imageUrl,
            updatedAt: new Date()
          }
        },
        { upsert: true }
      );

      return imageUrl;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(`Failed to set background image: ${error.message}`, 500);
    }
  }
}

module.exports = SettingsService;
