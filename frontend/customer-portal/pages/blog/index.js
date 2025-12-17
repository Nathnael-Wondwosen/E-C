import Link from 'next/link';
import Head from 'next/head';

// Sample blog data with image URLs
const blogPosts = [
  {
    id: 1,
    title: "The Future of B2B E-Commerce: Trends to Watch in 2026",
    excerpt: "Explore the emerging trends that will shape the B2B e-commerce landscape in the coming year, from AI-powered procurement to sustainable supply chains.",
    author: "Sarah Johnson",
    date: "December 10, 2025",
    category: "Industry Insights",
    readTime: "8 min read",
    image: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    tags: ["E-commerce", "Technology", "Future Trends"]
  },
  {
    id: 2,
    title: "Optimizing Your Supply Chain for Global Markets",
    excerpt: "Learn how to streamline your supply chain operations to reach international customers efficiently while maintaining quality and reducing costs.",
    author: "Michael Chen",
    date: "December 5, 2025",
    category: "Operations",
    readTime: "6 min read",
    image: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    tags: ["Supply Chain", "Logistics", "Global Trade"]
  },
  {
    id: 3,
    title: "Building Trust with Verified Supplier Programs",
    excerpt: "Discover how verified supplier programs can enhance credibility, reduce risk, and foster long-term partnerships in B2B transactions.",
    author: "Emma Rodriguez",
    date: "November 28, 2025",
    category: "Supplier Relations",
    readTime: "7 min read",
    image: "https://images.unsplash.com/photo-1551836022-25b39be590d6?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    tags: ["Verification", "Trust", "Partnerships"]
  },
  {
    id: 4,
    title: "Digital Transformation in Manufacturing: A CEO's Perspective",
    excerpt: "Hear from industry leaders about their digital transformation journeys and the impact on productivity and innovation.",
    author: "David Park",
    date: "November 22, 2025",
    category: "Leadership",
    readTime: "10 min read",
    image: "https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    tags: ["Digitalization", "Manufacturing", "Innovation"]
  },
  {
    id: 5,
    title: "Sustainable Procurement: Meeting Consumer Demand Responsibly",
    excerpt: "Understand how sustainable procurement practices can meet growing consumer expectations while maintaining profitability.",
    author: "Lisa Thompson",
    date: "November 15, 2025",
    category: "Sustainability",
    readTime: "9 min read",
    image: "https://images.unsplash.com/photo-1556742111-a301076d9d18?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    tags: ["Sustainability", "Procurement", "CSR"]
  },
  {
    id: 6,
    title: "Cybersecurity Best Practices for B2B Platforms",
    excerpt: "Protect your business with essential cybersecurity measures tailored for B2B e-commerce environments.",
    author: "Robert Kim",
    date: "November 8, 2025",
    category: "Security",
    readTime: "12 min read",
    image: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    tags: ["Cybersecurity", "Data Protection", "Best Practices"]
  }
];

// Categories for filtering
const categories = [
  "All",
  "Industry Insights",
  "Operations",
  "Supplier Relations",
  "Leadership",
  "Sustainability",
  "Security"
];

export default function BlogPage() {
  return (
    <>
      <Head>
        <title>Business Insights & News | B2B E-Commerce Platform</title>
        <meta name="description" content="Stay updated with the latest industry trends, business strategies, and market insights for B2B commerce." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Header */}
        <header className="bg-gradient-to-r from-blue-700 to-indigo-800 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Business Insights & News</h1>
            <p className="text-xl text-blue-100 max-w-3xl mx-auto">
              Expert perspectives, industry analysis, and actionable strategies to grow your business
            </p>
          </div>
        </header>

        {/* Category Filter */}
        <section className="py-8 bg-white shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                    category === "All"
                      ? "bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Blog Posts Grid */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {blogPosts.map((post) => (
                <article 
                  key={post.id} 
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
                >
                  <div className="relative">
                    <img 
                      src={post.image} 
                      alt={post.title} 
                      className="w-full h-56 object-cover"
                    />
                    <div className="absolute top-4 left-4">
                      <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-xs font-bold px-3 py-1.5 rounded-full">
                        {post.category}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-500 text-sm">{post.date}</span>
                      <span className="text-gray-500 text-sm">{post.readTime}</span>
                    </div>
                    
                    <h2 className="text-xl font-bold text-gray-800 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                      <Link href={`/blog/${post.id}`}>
                        {post.title}
                      </Link>
                    </h2>
                    
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.map((tag, index) => (
                        <span 
                          key={index} 
                          className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-1 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-3">
                          {post.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-gray-800 font-medium text-sm">{post.author}</p>
                          <p className="text-gray-500 text-xs">Author</p>
                        </div>
                      </div>
                      
                      <Link 
                        href={`/blog/${post.id}`}
                        className="text-blue-600 hover:text-blue-800 font-semibold text-sm flex items-center group"
                      >
                        Read Article
                        <svg 
                          className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24" 
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            
            {/* Load More Button */}
            <div className="text-center mt-12">
              <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-700 text-white font-semibold rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                Load More Articles
              </button>
            </div>
          </div>
        </section>

        {/* Newsletter Signup */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
              <p className="text-blue-100 mb-8 text-lg">
                Subscribe to our newsletter and never miss our latest insights and industry news.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="flex-grow px-5 py-3 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-300"
                />
                <button className="px-6 py-3 bg-white text-blue-700 font-semibold rounded-full shadow-lg hover:bg-gray-100 transition-colors">
                  Subscribe
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}