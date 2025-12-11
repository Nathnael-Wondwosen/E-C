import { useState } from 'react';
import AdminLayout from '../../components/AdminLayout';

export default function NewsBlogManagement() {
  const [posts, setPosts] = useState([
    {
      id: 1,
      title: "New Product Launch: Smart Home Series",
      excerpt: "Introducing our latest line of smart home devices with AI integration.",
      imageUrl: "/images/smart-home-launch.jpg",
      category: "Product News",
      date: "2025-12-01",
      isActive: true
    },
    {
      id: 2,
      title: "Holiday Shipping Guidelines",
      excerpt: "Important updates to our shipping schedule for the holiday season.",
      imageUrl: "/images/holiday-shipping.jpg",
      category: "Company News",
      date: "2025-12-05",
      isActive: true
    },
    {
      id: 3,
      title: "Industry Trends: E-commerce in 2026",
      excerpt: "Expert analysis on the future of B2B e-commerce platforms.",
      imageUrl: "/images/industry-trends.jpg",
      category: "Industry Insights",
      date: "2025-12-08",
      isActive: false
    },
    {
      id: 4,
      title: "Customer Success Story: Global Retailer",
      excerpt: "How our platform helped increase sales by 40% for a major retailer.",
      imageUrl: "/images/customer-success.jpg",
      category: "Case Studies",
      date: "2025-12-10",
      isActive: true
    }
  ]);

  const [newPost, setNewPost] = useState({
    title: '',
    excerpt: '',
    imageUrl: '',
    category: ''
  });

  const handleAddPost = () => {
    if (newPost.title && newPost.excerpt) {
      const post = {
        id: posts.length + 1,
        ...newPost,
        date: new Date().toISOString().split('T')[0],
        isActive: true
      };
      setPosts([...posts, post]);
      setNewPost({
        title: '',
        excerpt: '',
        imageUrl: '',
        category: ''
      });
    }
  };

  const handleDeletePost = (id) => {
    setPosts(posts.filter(post => post.id !== id));
  };

  const togglePostStatus = (id) => {
    setPosts(posts.map(post => 
      post.id === id ? { ...post, isActive: !post.isActive } : post
    ));
  };

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

          <div className="mt-6">
            {/* Add New Post Form */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-none p-6 mb-8">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Add New Post</h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Post Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="Post title"
                    value={newPost.title}
                    onChange={(e) => setNewPost({...newPost, title: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Category
                  </label>
                  <select
                    id="category"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    value={newPost.category}
                    onChange={(e) => setNewPost({...newPost, category: e.target.value})}
                  >
                    <option value="">Select a category</option>
                    <option value="Product News">Product News</option>
                    <option value="Company News">Company News</option>
                    <option value="Industry Insights">Industry Insights</option>
                    <option value="Case Studies">Case Studies</option>
                    <option value="Events">Events</option>
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Excerpt
                  </label>
                  <textarea
                    id="excerpt"
                    rows={3}
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="Brief excerpt of the post"
                    value={newPost.excerpt}
                    onChange={(e) => setNewPost({...newPost, excerpt: e.target.value})}
                  />
                </div>
                <div>
                  <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Image URL
                  </label>
                  <input
                    type="text"
                    id="imageUrl"
                    className="mt-1 focus:ring-blue-500 focus:border-blue-500 block w-full shadow-sm sm:text-sm border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white rounded-md"
                    placeholder="/images/post-image.jpg"
                    value={newPost.imageUrl}
                    onChange={(e) => setNewPost({...newPost, imageUrl: e.target.value})}
                  />
                </div>
              </div>
              <div className="mt-4">
                <button
                  type="button"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={handleAddPost}
                >
                  Add Post
                </button>
              </div>
            </div>

            {/* Posts List */}
            <div className="bg-white dark:bg-gray-800 shadow rounded-none overflow-hidden">
              <div className="bg-white dark:bg-gray-800 px-4 py-5 border-b border-gray-200 dark:border-gray-700 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white">Current Posts</h3>
              </div>
              <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                {posts.map((post) => (
                  <li key={post.id} className={`${post.isActive ? '' : 'opacity-60'} hover:bg-gray-50 dark:hover:bg-gray-700`}>
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
                            </div>
                            <div className="hidden md:block">
                              <div>
                                <p className="text-sm text-gray-900 dark:text-white">
                                  Category: <span className="font-medium">{post.category}</span>
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
                            onClick={() => togglePostStatus(post.id)}
                            className="text-sm font-medium text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          >
                            {post.isActive ? 'Deactivate' : 'Activate'}
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
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
        </div>
      </div>
    </AdminLayout>
  );
}