import { useState, useCallback } from 'react';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

const ImageUploader = ({ onImagesChange, initialImages = [], maxImages = 10 }) => {
  const [images, setImages] = useState(initialImages);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');

  // Handle file selection and upload to Cloudinary
  const handleFileSelect = useCallback(async (e) => {
    const files = Array.from(e.target.files);
    
    // Check if we're within the limit
    if (images.length + files.length > maxImages) {
      setError(`You can only upload up to ${maxImages} images.`);
      return;
    }
    
    setIsUploading(true);
    setError('');
    
    try {
      // Process each file
      const newImages = [];
      
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          setError('Please upload only image files.');
          continue;
        }
        
        // Validate file size (5MB limit)
        if (file.size > 5 * 1024 * 1024) {
          setError('File size exceeds 5MB limit.');
          continue;
        }
        
        // Upload to Cloudinary
        try {
          const formData = new FormData();
          formData.append('file', file);
          // Preserve original filename for Cloudinary
          formData.append('filename', file.name);
          
          const response = await fetch(`${API_BASE_URL}/api/upload/product-image`, {
            method: 'POST',
            body: formData
          });
          
          if (!response.ok) {
            throw new Error('Failed to upload image');
          }
          
          const imageData = await response.json();
          
          newImages.push({
            url: imageData.url,
            publicId: imageData.publicId,
            width: imageData.width,
            height: imageData.height,
            format: imageData.format,
            name: file.name,
            size: file.size,
            type: file.type
          });
        } catch (uploadError) {
          console.error('Error uploading image to Cloudinary:', uploadError);
          setError('Failed to upload image to Cloudinary. Please try again.');
          continue;
        }
      }
      
      const updatedImages = [...images, ...newImages];
      setImages(updatedImages);
      onImagesChange(updatedImages);
    } catch (err) {
      console.error('Error processing images:', err);
      setError('Failed to process images. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }, [images, maxImages, onImagesChange]);

  // Remove an image
  const removeImage = (index) => {
    const updatedImages = images.filter((_, i) => i !== index);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  // Set as thumbnail
  const setAsThumbnail = (index) => {
    const updatedImages = [...images];
    // Move selected image to the beginning
    const [selectedImage] = updatedImages.splice(index, 1);
    updatedImages.unshift(selectedImage);
    setImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
        <input
          type="file"
          id="image-upload"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isUploading || images.length >= maxImages}
        />
        <label 
          htmlFor="image-upload" 
          className={`cursor-pointer flex flex-col items-center justify-center ${
            isUploading || images.length >= maxImages 
              ? 'opacity-50 cursor-not-allowed' 
              : 'hover:bg-gray-50 dark:hover:bg-gray-800'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-10 h-10 mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              PNG, JPG, GIF up to 5MB (Max {maxImages} images)
            </p>
          </div>
        </label>
      </div>
      
      {/* Error Message */}
      {error && (
        <div className="text-red-500 text-sm py-2">{error}</div>
      )}
      
      {/* Uploading Indicator */}
      {isUploading && (
        <div className="flex items-center text-blue-600 dark:text-blue-400">
          <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Uploading images...
        </div>
      )}
      
      {/* Image Previews */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                <img 
                  src={image.url} 
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Image Actions */}
              <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setAsThumbnail(index)}
                    className="p-1 bg-white rounded-full text-gray-700 hover:bg-gray-100"
                    title="Set as thumbnail"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"></path>
                    </svg>
                  </button>
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="p-1 bg-white rounded-full text-red-600 hover:bg-red-100"
                    title="Remove image"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                  </button>
                </div>
              </div>
              
              {/* Thumbnail Indicator */}
              {index === 0 && (
                <div className="absolute top-1 left-1 bg-blue-500 text-white text-xs px-2 py-1 rounded">
                  Thumbnail
                </div>
              )}
            </div>
          ))}
        </div>
      )}
      
      {/* Image Count */}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        {images.length} of {maxImages} images uploaded
      </div>
    </div>
  );
};

export default ImageUploader;