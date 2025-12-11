import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminLayout from '../../components/AdminLayout';
import { getHeroSlides, getAllHeroSlides, createHeroSlide, updateHeroSlide, deleteHeroSlide, toggleHeroSlideStatus, uploadHeroImage, getGlobalBackgroundImage, saveGlobalBackgroundImage } from '../../utils/heroSectionService';
import { getCloudinaryImageUrl } from '../../utils/cloudinaryService';

// Add CSS for image error handling
const imageErrorStyles = `
  .image-load-error {
    background-color: #f3f4f6;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #9ca3af;
    font-size: 0.75rem;
  }
`;

export default function HeroCarouselManagement() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingSlide, setEditingSlide] = useState(null);
  const [newSlide, setNewSlide] = useState({
    title: '',
    subtitle: '',
    imageUrl: '',
    ctaText: '',
    ctaLink: ''
  });
  const [globalBackgroundImage, setGlobalBackgroundImage] = useState('');
  const [globalBackgroundImageFile, setGlobalBackgroundImageFile] = useState(null);
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState(''); // For success/error messages
  const [messageType, setMessageType] = useState(''); // 'success' or 'error'
  const router = useRouter();

  // Inject CSS styles for image error handling
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = imageErrorStyles;
    document.head.appendChild(styleElement);
    
    // Cleanup function to remove the style element
    return () => {
      if (styleElement.parentNode) {
        styleElement.parentNode.removeChild(styleElement);
      }
    };
  }, []);

  useEffect(() => {
    console.log('HeroCarouselManagement component mounted');
    // Check if user is logged in
    const loggedIn = localStorage.getItem('adminLoggedIn');
    if (!loggedIn) {
      console.log('User not logged in, redirecting to login');
      router.push('/login');
    } else {
      console.log('User logged in, loading slides and global background image');
      loadSlides();
      loadGlobalBackgroundImage();
    }
  }, [router]);

  const loadSlides = async () => {
    try {
      setLoading(true);
      const data = await getAllHeroSlides();
      console.log('Raw slides data:', data);
      // Ensure all IDs are properly formatted
      const convertedData = data.map(slide => ({
        ...slide,
        id: slide.id ? slide.id.toString() : (slide._id ? slide._id.toString() : '')
      })).filter(slide => slide.id); // Filter out slides without valid IDs
      console.log('Converted slides data:', convertedData);
      setSlides(convertedData);
    } catch (error) {
      console.error('Error loading slides:', error);
      showMessage('Error loading slides', 'error');
    } finally {
      setLoading(false);
    }
  };
  
  const loadGlobalBackgroundImage = async () => {
    try {
      const imageUrl = await getGlobalBackgroundImage();
      setGlobalBackgroundImage(imageUrl);
    } catch (error) {
      console.error('Error loading global background image:', error);
      showMessage('Error loading global background image', 'error');
    }
  };

  const showMessage = (msg, type) => {
    setMessage(msg);
    setMessageType(type);
    // Auto-hide message after 3 seconds
    setTimeout(() => {
      setMessage('');
      setMessageType('');
    }, 3000);
  };

  const handleCreateSlide = async (e) => {
    e.preventDefault();
    try {
      console.log('Creating slide with data:', newSlide);
      console.log('Foreground image file selected:', imageFile);
      
      let imageUrl = newSlide.imageUrl;
      
      // Upload foreground image if file is selected
      if (imageFile) {
        setUploading(true);
        const cloudinaryUrl = await uploadHeroImage(imageFile);
        // Use the Cloudinary URL
        imageUrl = cloudinaryUrl;
        console.log('Uploaded foreground image URL:', imageUrl);
      }
      
      const slideData = { ...newSlide, imageUrl };
      console.log('Final slide data to be created:', slideData);
      await createHeroSlide(slideData);
      setNewSlide({
        title: '',
        subtitle: '',
        imageUrl: '',
        ctaText: '',
        ctaLink: ''
      });
      setImageFile(null);
      loadSlides();
      showMessage('Slide created successfully!', 'success');
    } catch (error) {
      console.error('Error creating slide:', error);
      showMessage('Error creating slide: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const handleUpdateSlide = async (e) => {
    e.preventDefault();
    try {
      console.log('Updating slide with data:', editingSlide);
      console.log('Foreground image file selected:', imageFile);
      
      let imageUrl = editingSlide.imageUrl;
      
      // Upload foreground image if file is selected
      if (imageFile) {
        setUploading(true);
        const cloudinaryUrl = await uploadHeroImage(imageFile);
        // Use the Cloudinary URL
        imageUrl = cloudinaryUrl;
        console.log('Updated foreground image URL:', imageUrl);
      }
      
      const slideData = { 
        ...editingSlide, 
        imageUrl: imageUrl || editingSlide.imageUrl
      };
      
      // Use the ID for the update call, ensuring it's in the correct format
      const slideId = editingSlide.id || editingSlide._id;
      if (!slideId) {
        throw new Error('Slide ID is missing');
      }
      
      console.log('Final slide data to be updated:', slideData);
      await updateHeroSlide(slideId.toString(), slideData);
      setEditingSlide(null);
      setImageFile(null);
      loadSlides();
      showMessage('Slide updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating slide:', error);
      showMessage('Error updating slide: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };
  
  const handleDeleteSlide = async (slide) => {
    const id = slide.id ? slide.id.toString() : (slide._id ? slide._id.toString() : '');
    if (!id) {
      showMessage('Slide ID is missing', 'error');
      return;
    }
    
    if (confirm(`Are you sure you want to delete the slide "${slide.title}"?`)) {
      try {
        await deleteHeroSlide(id);
        loadSlides();
        showMessage('Slide deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting slide:', error);
        showMessage('Error deleting slide: ' + error.message, 'error');
      }
    }
  };
  
  const handleToggleStatus = async (slide) => {
    const id = slide.id ? slide.id.toString() : (slide._id ? slide._id.toString() : '');
    if (!id) {
      showMessage('Slide ID is missing', 'error');
      return;
    }
    
    try {
      await toggleHeroSlideStatus(id);
      loadSlides();
      showMessage(`Slide ${slide.isActive ? 'deactivated' : 'activated'} successfully!`, 'success');
    } catch (error) {
      console.error('Error toggling slide status:', error);
      showMessage('Error toggling slide status: ' + error.message, 'error');
    }
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleGlobalBackgroundImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setGlobalBackgroundImageFile(e.target.files[0]);
    }
  };

  const handleSaveGlobalBackgroundImage = async () => {
    if (!globalBackgroundImageFile) {
      showMessage('Please select an image file first', 'error');
      return;
    }

    try {
      setUploading(true);
      const imageUrl = await uploadHeroImage(globalBackgroundImageFile);
      await saveGlobalBackgroundImage(imageUrl);
      setGlobalBackgroundImage(imageUrl);
      showMessage('Global background image saved successfully!', 'success');
    } catch (error) {
      console.error('Error saving global background image:', error);
      showMessage('Error saving global background image: ' + error.message, 'error');
    } finally {
      setUploading(false);
    }
  };

  const startEditing = (slide) => {
    // Ensure proper ID handling and set default values if not present
    const slideWithDefaults = {
      title: '',
      subtitle: '',
      imageUrl: '',
      ctaText: '',
      ctaLink: '',
      ...slide,
      id: slide.id ? slide.id.toString() : (slide._id ? slide._id.toString() : '')
    };
    setEditingSlide(slideWithDefaults);
    setImageFile(null);
  };
  
  const cancelEditing = () => {
    setEditingSlide(null);
    setImageFile(null);
  };

  // Function to handle image URLs using Cloudinary
  const getImageUrl = (imageUrl) => {
    // Log the image URL for debugging
    console.log('Processing image URL:', imageUrl);
    
    // Handle null/undefined/empty URLs
    if (!imageUrl || imageUrl.trim() === '') {
      console.log('Empty image URL, returning placeholder');
      return '/placeholder-carousel.jpg';
    }
    
    // If it's already a full HTTP/HTTPS URL, return as-is
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      console.log('Direct URL detected, returning as-is');
      return imageUrl;
    }
    
    // If it's a local path, return as-is
    if (imageUrl.startsWith('/')) {
      console.log('Local path detected, returning as-is');
      return imageUrl;
    }
    
    // For Cloudinary file IDs or other identifiers, use the Cloudinary service
    try {
      const result = getCloudinaryImageUrl(imageUrl);
      console.log('Cloudinary URL processed for', imageUrl, ':', result);
      return result;
    } catch (error) {
      console.error('Error processing Cloudinary URL for', imageUrl, ':', error);
      return '/placeholder-carousel.jpg';
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Hero Carousel Management">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Hero Carousel Management">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Hero Carousel Management</h1>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            Manage the hero carousel slides displayed on the homepage
          </p>
        </div>

        {/* Message display */}
        {message && (
          <div className={`max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-4 ${
            messageType === 'success' 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          } px-4 py-3 rounded relative`} role="alert">
            <span className="block sm:inline">{message}</span>
          </div>
        )}

        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 mt-8">
          {/* Global Background Image Section */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Global Background Image
            </h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              This background image will be used for all hero slides. Upload a high-quality image (recommended 1920x1080 pixels).
            </p>
            
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label htmlFor="globalBackgroundImageUpload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Upload Background Image
                </label>
                <input
                  type="file"
                  id="globalBackgroundImageUpload"
                  accept="image/*"
                  onChange={handleGlobalBackgroundImageChange}
                  className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                    file:mr-4 file:py-2 file:px-4
                    file:rounded-md file:border-0
                    file:text-sm file:font-semibold
                    file:bg-blue-50 file:text-blue-700
                    hover:file:bg-blue-100
                    dark:file:bg-blue-900 dark:file:text-blue-100
                    dark:hover:file:bg-blue-800"
                />
                {globalBackgroundImageFile && (
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Selected file: {globalBackgroundImageFile.name}
                  </p>
                )}
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Upload a background image file to store it on Cloudinary. Supported formats: JPG, PNG, GIF, WebP (max 5MB).
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Current Background Image
                </label>
                {globalBackgroundImage ? (
                  <div className="relative h-32 w-full rounded-md overflow-hidden border border-gray-300 dark:border-gray-600">
                    <img 
                      src={globalBackgroundImage} 
                      alt="Global background" 
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.src = '/placeholder-carousel.jpg';
                      }}
                    />
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-32 w-full rounded-md border-2 border-dashed border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700">
                    <span className="text-gray-500 dark:text-gray-400">No background image set</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-6">
              <button
                type="button"
                onClick={handleSaveGlobalBackgroundImage}
                disabled={uploading || !globalBackgroundImageFile}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Uploading...
                  </>
                ) : (
                  'Save Background Image'
                )}
              </button>
            </div>
          </div>
          
          {/* Add/Edit Slide Form */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6 mb-8">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              {editingSlide ? 'Edit Slide' : 'Add New Slide'}
            </h2>
            <form onSubmit={editingSlide ? handleUpdateSlide : handleCreateSlide}>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    required
                    value={editingSlide ? editingSlide.title : newSlide.title}
                    onChange={(e) => 
                      editingSlide 
                        ? setEditingSlide({...editingSlide, title: e.target.value})
                        : setNewSlide({...newSlide, title: e.target.value})
                    }
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="subtitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Subtitle
                  </label>
                  <input
                    type="text"
                    id="subtitle"
                    required
                    value={editingSlide ? editingSlide.subtitle : newSlide.subtitle}
                    onChange={(e) => 
                      editingSlide 
                        ? setEditingSlide({...editingSlide, subtitle: e.target.value})
                        : setNewSlide({...newSlide, subtitle: e.target.value})
                    }
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="ctaText" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Call to Action Text
                  </label>
                  <input
                    type="text"
                    id="ctaText"
                    required
                    value={editingSlide ? editingSlide.ctaText : newSlide.ctaText}
                    onChange={(e) => 
                      editingSlide 
                        ? setEditingSlide({...editingSlide, ctaText: e.target.value})
                        : setNewSlide({...newSlide, ctaText: e.target.value})
                    }
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div>
                  <label htmlFor="ctaLink" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Call to Action Link
                  </label>
                  <input
                    type="text"
                    id="ctaLink"
                    required
                    value={editingSlide ? editingSlide.ctaLink : newSlide.ctaLink}
                    onChange={(e) => 
                      editingSlide 
                        ? setEditingSlide({...editingSlide, ctaLink: e.target.value})
                        : setNewSlide({...newSlide, ctaLink: e.target.value})
                    }
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Foreground Image URL
                  </label>
                  <input
                    type="text"
                    id="imageUrl"
                    value={editingSlide ? editingSlide.imageUrl : newSlide.imageUrl}
                    onChange={(e) => 
                      editingSlide 
                        ? setEditingSlide({...editingSlide, imageUrl: e.target.value})
                        : setNewSlide({...newSlide, imageUrl: e.target.value})
                    }
                    className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="Enter image URL or upload an image below"
                  />
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Enter a direct image URL (e.g., https://example.com/image.jpg) or upload an image file below.
                    If both are provided, the uploaded image will be used.
                  </p>
                </div>

                <div className="sm:col-span-2">
                  <label htmlFor="imageUpload" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Upload Foreground Image
                  </label>
                  <input
                    type="file"
                    id="imageUpload"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="mt-1 block w-full text-sm text-gray-500 dark:text-gray-400
                      file:mr-4 file:py-2 file:px-4
                      file:rounded-md file:border-0
                      file:text-sm file:font-semibold
                      file:bg-blue-50 file:text-blue-700
                      hover:file:bg-blue-100
                      dark:file:bg-blue-900 dark:file:text-blue-100
                      dark:hover:file:bg-blue-800"
                  />
                  {imageFile && (
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                      Selected file: {imageFile.name}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    Upload an image file to store it on Cloudinary. Supported formats: JPG, PNG, GIF, WebP (max 5MB).
                  </p>
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  type="submit"
                  disabled={uploading}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {uploading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {editingSlide ? 'Updating...' : 'Uploading...'}
                    </>
                  ) : (
                    editingSlide ? 'Update Slide' : 'Add Slide'
                  )}
                </button>
                
                {editingSlide && (
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* Slides List */}
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">Current Slides</h2>
            </div>
            {slides.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <p className="text-gray-500 dark:text-gray-400">No slides found. Add your first slide above.</p>
              </div>
            ) : (
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {slides.map((slide) => (
                  <li key={slide.id || slide._id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-24 rounded-md overflow-hidden bg-gray-200 dark:bg-gray-700">
                          <img 
                            src={getImageUrl(slide.imageUrl)} 
                            alt={slide.title} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              console.log('Image load error for slide:', slide.title);
                              console.log('Original URL:', slide.imageUrl);
                              console.log('Processed URL was:', e.target.src);
                              console.log('Error event:', e);
                              // Ensure the placeholder image is displayed
                              e.target.src = '/placeholder-carousel.jpg';
                              // Add error class for styling if needed
                              e.target.classList.add('image-load-error');
                            }}
                            onLoad={(e) => {
                              console.log('Image loaded successfully for slide:', slide.title);
                              console.log('Original URL:', slide.imageUrl);
                              console.log('Processed URL was:', e.target.src);
                            }}
                          />
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-gray-900 dark:text-white">{slide.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{slide.subtitle}</p>
                          <p className="text-sm text-blue-600 dark:text-blue-400">{slide.ctaText}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          slide.isActive 
                            ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                            : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                        }`}>
                          {slide.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <button
                          onClick={() => startEditing(slide)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleToggleStatus(slide)}
                          className="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                        >
                          {slide.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                        <button
                          onClick={() => handleDeleteSlide(slide)}
                          className="text-sm font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}