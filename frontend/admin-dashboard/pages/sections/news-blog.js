import { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function NewsBlogManagement() {
  const [activeTab, setActiveTab] = useState('blog');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [blogPosts, setBlogPosts] = useState([]);
  const [newsletters, setNewsletters] = useState([]);

  const [newBlogPost, setNewBlogPost] = useState({
    title: '',
    excerpt: '',
    imageFile: null,
    imageUrl: '',
    category: '',
    tags: '',
    type: 'blog'
  });

  const [editingBlogPost, setEditingBlogPost] = useState(null);
  const [isEditing, setIsEditing] = useState(false);

  const [newNewsletter, setNewNewsletter] = useState({
    title: '',
    excerpt: '',
    imageFile: null,
    imageUrl: '',
    category: '',
    type: 'newsletter'
  });

  const [editingNewsletter, setEditingNewsletter] = useState(null);
  const [isEditingNewsletter, setIsEditingNewsletter] = useState(false);

  const [previewImage, setPreviewImage] = useState({
    blog: null,
    newsletter: null
  });

  // Define API base URL for client-side requests
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000';

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Log the API URL for debugging
      console.log('Fetching posts from:', `${API_BASE_URL}/api/news-blog-posts`);
      
      const response = await fetch(`${API_BASE_URL}/api/news-blog-posts`);
      
      // Log response status for debugging
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }
      
      const posts = await response.json();
      console.log('Fetched posts:', posts);
      
      // Separate blog posts and newsletters
      const blogPostsData = posts.filter(post => post.type === 'blog');
      const newsletterPostsData = posts.filter(post => post.type === 'newsletter');
      
      setBlogPosts(blogPostsData);
      setNewsletters(newsletterPostsData);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(`Failed to fetch posts: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load posts on component mount
  useEffect(() => {
    fetchPosts();
  }, []);

  // Handle image file selection for blog posts
  const handleBlogImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (isEditing) {
        setEditingBlogPost({...editingBlogPost, imageFile: file});
      } else {
        setNewBlogPost({...newBlogPost, imageFile: file});
      }
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage({...previewImage, blog: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle image file selection for newsletters
  const handleNewsletterImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (isEditingNewsletter) {
        setEditingNewsletter({...editingNewsletter, imageFile: file});
      } else {
        setNewNewsletter({...newNewsletter, imageFile: file});
      }
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewImage({...previewImage, newsletter: e.target.result});
      };
      reader.readAsDataURL(file);
    }
  };

  // Upload image to Cloudinary
  const uploadImage = async (file) => {
    try {
      // Check if file is actually a File object (not just a URL string)
      if (!(file instanceof File)) {
        throw new Error('Invalid file object provided for upload');
      }
      
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch(`${API_BASE_URL}/api/upload`, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.url;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  };

  // Start editing a blog post
  const startEditingBlogPost = (post) => {
    setEditingBlogPost({
      ...post,
      tags: Array.isArray(post.tags) ? post.tags.join(', ') : ''
    });
    setIsEditing(true);
    setPreviewImage({...previewImage, blog: post.imageUrl});
  };

  // Cancel editing a blog post
  const cancelEditingBlogPost = () => {
    setEditingBlogPost(null);
    setIsEditing(false);
    setPreviewImage({...previewImage, blog: null});
  };

  // Start editing a newsletter
  const startEditingNewsletter = (post) => {
    setEditingNewsletter(post);
    setIsEditingNewsletter(true);
    setPreviewImage({...previewImage, newsletter: post.imageUrl});
  };

  // Cancel editing a newsletter
  const cancelEditingNewsletter = () => {
    setEditingNewsletter(null);
    setIsEditingNewsletter(false);
    setPreviewImage({...previewImage, newsletter: null});
  };

  const handleAddBlogPost = async () => {
    if (!newBlogPost.title || !newBlogPost.excerpt) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      let imageUrl = newBlogPost.imageUrl;
      
      // Upload image if file is selected
      if (newBlogPost.imageFile) {
        imageUrl = await uploadImage(newBlogPost.imageFile);
      } else if (!imageUrl) {
        imageUrl = '/images/placeholder.jpg';
      }
      
      const postData = {
        ...newBlogPost,
        imageUrl,
        tags: newBlogPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        date: new Date().toISOString().split('T')[0],
        isActive: true,
        author: "Admin"
      };
      
      const response = await fetch(`${API_BASE_URL}/api/news-blog-posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Reset form
      setNewBlogPost({
        title: '',
        excerpt: '',
        imageFile: null,
        imageUrl: '',
        category: '',
        tags: '',
        type: 'blog'
      });
      setPreviewImage({...previewImage, blog: null});
      
      // Refresh posts
      fetchPosts();
      
      alert('Blog post created successfully!');
    } catch (error) {
      console.error('Error creating blog post:', error);
      alert('Failed to create blog post');
    }
  };

  const handleUpdateBlogPost = async () => {
    if (!editingBlogPost.title || !editingBlogPost.excerpt) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      let imageUrl = editingBlogPost.imageUrl;
      
      // Upload image only if a new file is actually selected (not just the existing one)
      if (editingBlogPost.imageFile && editingBlogPost.imageFile instanceof File) {
        imageUrl = await uploadImage(editingBlogPost.imageFile);
      }
      // If no new image is selected, keep the existing imageUrl
      
      const postData = {
        ...editingBlogPost,
        imageUrl,
        tags: editingBlogPost.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        updatedAt: new Date().toISOString()
      };
      
      // Remove immutable fields
      delete postData._id;
      delete postData.id;
      delete postData.createdAt;
      
      const response = await fetch(`${API_BASE_URL}/api/news-blog-posts/${editingBlogPost._id || editingBlogPost.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Reset editing state
      setEditingBlogPost(null);
      setIsEditing(false);
      setPreviewImage({...previewImage, blog: null});
      
      // Refresh posts
      fetchPosts();
      
      alert('Blog post updated successfully!');
    } catch (error) {
      console.error('Error updating blog post:', error);
      alert('Failed to update blog post');
    }
  };

  const handleAddNewsletter = async () => {
    if (!newNewsletter.title || !newNewsletter.excerpt) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      let imageUrl = newNewsletter.imageUrl;
      
      // Upload image if file is selected
      if (newNewsletter.imageFile) {
        imageUrl = await uploadImage(newNewsletter.imageFile);
      } else if (!imageUrl) {
        imageUrl = '/images/placeholder.jpg';
      }
      
      const postData = {
        ...newNewsletter,
        imageUrl,
        date: new Date().toISOString().split('T')[0],
        isActive: true,
        author: "Admin"
      };
      
      const response = await fetch(`${API_BASE_URL}/api/news-blog-posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Reset form
      setNewNewsletter({
        title: '',
        excerpt: '',
        imageFile: null,
        imageUrl: '',
        category: '',
        type: 'newsletter'
      });
      setPreviewImage({...previewImage, newsletter: null});
      
      // Refresh posts
      fetchPosts();
      
      alert('Newsletter created successfully!');
    } catch (error) {
      console.error('Error creating newsletter:', error);
      alert('Failed to create newsletter');
    }
  };

  const handleUpdateNewsletter = async () => {
    if (!editingNewsletter.title || !editingNewsletter.excerpt) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      let imageUrl = editingNewsletter.imageUrl;
      
      // Upload image only if a new file is actually selected (not just the existing one)
      if (editingNewsletter.imageFile && editingNewsletter.imageFile instanceof File) {
        imageUrl = await uploadImage(editingNewsletter.imageFile);
      }
      // If no new image is selected, keep the existing imageUrl
      
      const postData = {
        ...editingNewsletter,
        imageUrl,
        updatedAt: new Date().toISOString()
      };
      
      // Remove immutable fields
      delete postData._id;
      delete postData.id;
      delete postData.createdAt;
      
      const response = await fetch(`${API_BASE_URL}/api/news-blog-posts/${editingNewsletter._id || editingNewsletter.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(postData)
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Reset editing state
      setEditingNewsletter(null);
      setIsEditingNewsletter(false);
      setPreviewImage({...previewImage, newsletter: null});
      
      // Refresh posts
      fetchPosts();
      
      alert('Newsletter updated successfully!');
    } catch (error) {
      console.error('Error updating newsletter:', error);
      alert('Failed to update newsletter');
    }
  };

  const handleDeletePost = async (id) => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/news-blog-posts/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Refresh posts
      fetchPosts();
      
      alert('Post deleted successfully!');
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post');
    }
  };

  const togglePostStatus = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/news-blog-posts/${id}/toggle`, {
        method: 'PATCH'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Refresh posts
      fetchPosts();
      
      alert('Post status updated successfully!');
    } catch (error) {
      console.error('Error toggling post status:', error);
      alert('Failed to update post status');
    }
  };

  const sendNewsletter = async (id) => {
    try {
      // In a real implementation, this would trigger an email sending process
      // For now, we'll just update the sent status
      const response = await fetch(`${API_BASE_URL}/api/news-blog-posts/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sent: true })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Refresh posts
      fetchPosts();
      
      alert('Newsletter scheduled for sending!');
    } catch (error) {
      console.error('Error sending newsletter:', error);
      alert('Failed to schedule newsletter');
    }
  };

  if (loading) {
    return (
      <AdminLayout title="News & Blog Management">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="flex justify-center items-center h-64">
              <div className="text-lg">Loading...</div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  if (error) {
    return (
      <AdminLayout title="News & Blog Management">
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">Error</h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>{error}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="News & Blog Management">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold leading-7 text-gray-900 dark:text-white sm:text-3xl sm:truncate">
                News & Blog Management
              </h1>
            </div>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200 dark:border-gray-700 mt-6">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('blog')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'blog'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Blog Posts
              </button>
              <button
                onClick={() => setActiveTab('newsletter')}
                className={`whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'newsletter'
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Newsletters
              </button>
            </nav>
          </div>

          <div className="mt-6">
            {/* Blog Posts Tab */}
            {activeTab === 'blog' && (
              <div>
                {/* Add/Edit Blog Post Form */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-none p-6 mb-8">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {isEditing ? 'Edit Blog Post' : 'Add New Blog Post'}
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="blog-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Post Title *
                      </label>
                      <input
                        type="text"
                        id="blog-title"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="Post title"
                        value={isEditing ? editingBlogPost.title : newBlogPost.title}
                        onChange={(e) => 
                          isEditing 
                            ? setEditingBlogPost({...editingBlogPost, title: e.target.value})
                            : setNewBlogPost({...newBlogPost, title: e.target.value})
                        }
                      />
                    </div>
                    <div>
                      <label htmlFor="blog-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category
                      </label>
                      <select
                        id="blog-category"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        value={isEditing ? editingBlogPost.category : newBlogPost.category}
                        onChange={(e) => 
                          isEditing 
                            ? setEditingBlogPost({...editingBlogPost, category: e.target.value})
                            : setNewBlogPost({...newBlogPost, category: e.target.value})
                        }
                      >
                        <option value="">Select a category</option>
                        <option value="Product News">Product News</option>
                        <option value="Company News">Company News</option>
                        <option value="Industry Insights">Industry Insights</option>
                        <option value="Case Studies">Case Studies</option>
                        <option value="Events">Events</option>
                        <option value="Tips & Tricks">Tips & Tricks</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="blog-excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Excerpt *
                      </label>
                      <textarea
                        id="blog-excerpt"
                        rows={3}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="Brief excerpt of the post"
                        value={isEditing ? editingBlogPost.excerpt : newBlogPost.excerpt}
                        onChange={(e) => 
                          isEditing 
                            ? setEditingBlogPost({...editingBlogPost, excerpt: e.target.value})
                            : setNewBlogPost({...newBlogPost, excerpt: e.target.value})
                        }
                      />
                    </div>
                    <div>
                      <label htmlFor="blog-tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Tags (comma separated)
                      </label>
                      <input
                        type="text"
                        id="blog-tags"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="AI, Smart Home, Innovation"
                        value={isEditing ? editingBlogPost.tags : newBlogPost.tags}
                        onChange={(e) => 
                          isEditing 
                            ? setEditingBlogPost({...editingBlogPost, tags: e.target.value})
                            : setNewBlogPost({...newBlogPost, tags: e.target.value})
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cover Image
                      </label>
                      <div className="mt-1 flex items-center">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="blog-image-upload"
                          onChange={handleBlogImageChange}
                        />
                        <label
                          htmlFor="blog-image-upload"
                          className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          {isEditing ? 'Change Image' : 'Upload Image'}
                        </label>
                        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                          {isEditing 
                            ? (editingBlogPost.imageFile ? editingBlogPost.imageFile.name : 'No file chosen')
                            : (newBlogPost.imageFile ? newBlogPost.imageFile.name : 'No file chosen')
                          }
                        </span>
                      </div>
                      {(previewImage.blog || (isEditing && editingBlogPost.imageUrl)) && (
                        <div className="mt-2">
                          <img 
                            src={previewImage.blog || (isEditing && editingBlogPost.imageUrl)} 
                            alt="Preview" 
                            className="h-20 w-20 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    {isEditing ? (
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={handleUpdateBlogPost}
                        >
                          Update Blog Post
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                          onClick={cancelEditingBlogPost}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={handleAddBlogPost}
                      >
                        Add Blog Post
                      </button>
                    )}
                  </div>
                </div>

                {/* Blog Posts List */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-none overflow-hidden">
                  <div className="bg-white dark:bg-gray-800 px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Current Blog Posts</h3>
                  </div>
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {blogPosts.map((post) => (
                      <li key={post._id || post.id} className={`${post.isActive ? '' : 'opacity-60'} hover:bg-gray-50 dark:hover:bg-gray-700`}>
                        <div className="block">
                          <div className="flex items-center px-4 py-4 sm:px-6">
                            <div className="min-w-0 flex-1 flex items-center">
                              <div className="flex-shrink-0">
                                <div className="h-16 w-24 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                                  <img 
                                    src={post.imageUrl} 
                                    alt={post.title} 
                                    className="h-full w-full object-cover rounded-md"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                  <span className="text-gray-500 dark:text-gray-400 text-xs">No image</span>
                                </div>
                              </div>
                              <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-3 md:gap-4">
                                <div>
                                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{post.title}</p>
                                  <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <span>{post.excerpt}</span>
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-1">
                                    {post.tags && post.tags.map((tag, index) => (
                                      <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                        {tag}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                                <div className="hidden md:block">
                                  <div>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                      Category: <span className="font-medium">{post.category}</span>
                                    </p>
                                    <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                      <span>Author: {post.author}</span>
                                    </p>
                                    <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                      <span>Date: {post.date}</span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                    {post.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEditingBlogPost(post)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => togglePostStatus(post._id || post.id)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                {post.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDeletePost(post._id || post.id)}
                                className="text-sm font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Newsletters Tab */}
            {activeTab === 'newsletter' && (
              <div>
                {/* Add/Edit Newsletter Form */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-none p-6 mb-8">
                  <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
                    {isEditingNewsletter ? 'Edit Newsletter' : 'Create New Newsletter'}
                  </h2>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div>
                      <label htmlFor="newsletter-title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Newsletter Title *
                      </label>
                      <input
                        type="text"
                        id="newsletter-title"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="Newsletter title"
                        value={isEditingNewsletter ? editingNewsletter.title : newNewsletter.title}
                        onChange={(e) => 
                          isEditingNewsletter 
                            ? setEditingNewsletter({...editingNewsletter, title: e.target.value})
                            : setNewNewsletter({...newNewsletter, title: e.target.value})
                        }
                      />
                    </div>
                    <div>
                      <label htmlFor="newsletter-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Category
                      </label>
                      <select
                        id="newsletter-category"
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        value={isEditingNewsletter ? editingNewsletter.category : newNewsletter.category}
                        onChange={(e) => 
                          isEditingNewsletter 
                            ? setEditingNewsletter({...editingNewsletter, category: e.target.value})
                            : setNewNewsletter({...newNewsletter, category: e.target.value})
                        }
                      >
                        <option value="">Select a category</option>
                        <option value="Weekly Digest">Weekly Digest</option>
                        <option value="Monthly Report">Monthly Report</option>
                        <option value="Product Updates">Product Updates</option>
                        <option value="Industry News">Industry News</option>
                        <option value="Special Announcements">Special Announcements</option>
                      </select>
                    </div>
                    <div className="sm:col-span-2">
                      <label htmlFor="newsletter-excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Excerpt *
                      </label>
                      <textarea
                        id="newsletter-excerpt"
                        rows={3}
                        className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                        placeholder="Brief excerpt of the newsletter"
                        value={isEditingNewsletter ? editingNewsletter.excerpt : newNewsletter.excerpt}
                        onChange={(e) => 
                          isEditingNewsletter 
                            ? setEditingNewsletter({...editingNewsletter, excerpt: e.target.value})
                            : setNewNewsletter({...newNewsletter, excerpt: e.target.value})
                        }
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        Cover Image
                      </label>
                      <div className="mt-1 flex items-center">
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          id="newsletter-image-upload"
                          onChange={handleNewsletterImageChange}
                        />
                        <label
                          htmlFor="newsletter-image-upload"
                          className="cursor-pointer bg-white dark:bg-gray-700 py-2 px-3 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"
                        >
                          {isEditingNewsletter ? 'Change Image' : 'Upload Image'}
                        </label>
                        <span className="ml-3 text-sm text-gray-500 dark:text-gray-400">
                          {isEditingNewsletter 
                            ? (editingNewsletter.imageFile ? editingNewsletter.imageFile.name : 'No file chosen')
                            : (newNewsletter.imageFile ? newNewsletter.imageFile.name : 'No file chosen')
                          }
                        </span>
                      </div>
                      {(previewImage.newsletter || (isEditingNewsletter && editingNewsletter.imageUrl)) && (
                        <div className="mt-2">
                          <img 
                            src={previewImage.newsletter || (isEditingNewsletter && editingNewsletter.imageUrl)} 
                            alt="Preview" 
                            className="h-20 w-20 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    {isEditingNewsletter ? (
                      <div className="flex space-x-3">
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          onClick={handleUpdateNewsletter}
                        >
                          Update Newsletter
                        </button>
                        <button
                          type="button"
                          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:hover:bg-gray-600"
                          onClick={cancelEditingNewsletter}
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={handleAddNewsletter}
                      >
                        Create Newsletter
                      </button>
                    )}
                  </div>
                </div>

                {/* Newsletters List */}
                <div className="bg-white dark:bg-gray-800 shadow rounded-none overflow-hidden">
                  <div className="bg-white dark:bg-gray-800 px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Current Newsletters</h3>
                  </div>
                  <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                    {newsletters.map((post) => (
                      <li key={post._id || post.id} className={`${post.isActive ? '' : 'opacity-60'} hover:bg-gray-50 dark:hover:bg-gray-700`}>
                        <div className="block">
                          <div className="flex items-center px-4 py-4 sm:px-6">
                            <div className="min-w-0 flex-1 flex items-center">
                              <div className="flex-shrink-0">
                                <div className="h-16 w-24 bg-gray-200 dark:bg-gray-600 rounded-md flex items-center justify-center">
                                  <img 
                                    src={post.imageUrl} 
                                    alt={post.title} 
                                    className="h-full w-full object-cover rounded-md"
                                    onError={(e) => {
                                      e.target.style.display = 'none';
                                      e.target.nextSibling.style.display = 'flex';
                                    }}
                                  />
                                  <span className="text-gray-500 dark:text-gray-400 text-xs">No image</span>
                                </div>
                              </div>
                              <div className="min-w-0 flex-1 px-4 md:grid md:grid-cols-3 md:gap-4">
                                <div>
                                  <p className="text-sm font-medium text-blue-600 dark:text-blue-400 truncate">{post.title}</p>
                                  <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                    <span>{post.excerpt}</span>
                                  </p>
                                  <div className="mt-2">
                                    {post.sent ? (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                                        Sent
                                      </span>
                                    ) : (
                                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                                        Draft
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <div className="hidden md:block">
                                  <div>
                                    <p className="text-sm text-gray-900 dark:text-white">
                                      Category: <span className="font-medium">{post.category}</span>
                                    </p>
                                    <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                      <span>Author: {post.author}</span>
                                    </p>
                                    <p className="mt-1 flex items-center text-sm text-gray-500 dark:text-gray-400">
                                      <span>Date: {post.date}</span>
                                    </p>
                                  </div>
                                </div>
                                <div className="flex items-center">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${post.isActive ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                                    {post.isActive ? 'Active' : 'Inactive'}
                                  </span>
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => startEditingNewsletter(post)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                Edit
                              </button>
                              {!post.sent && (
                                <button
                                  onClick={() => sendNewsletter(post._id || post.id)}
                                  className="text-sm font-medium text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                                >
                                  Send
                                </button>
                              )}
                              <button
                                onClick={() => togglePostStatus(post._id || post.id)}
                                className="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                {post.isActive ? 'Deactivate' : 'Activate'}
                              </button>
                              <button
                                onClick={() => handleDeletePost(post._id || post.id)}
                                className="text-sm font-medium text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}