import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';

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
    tags: ["E-commerce", "Technology", "Future Trends"],
    content: `
      <p>In the rapidly evolving world of B2B e-commerce, staying ahead of trends is crucial for maintaining a competitive edge. As we approach 2026, several transformative technologies and methodologies are poised to reshape how businesses buy and sell goods online.</p>
      
      <h2>AI-Powered Procurement Systems</h2>
      <p>Artificial Intelligence is revolutionizing procurement processes by automating routine tasks, predicting demand patterns, and optimizing supplier selection. Advanced AI algorithms can now analyze vast datasets to identify cost-saving opportunities and mitigate supply chain risks in real-time.</p>
      
      <p>Machine learning models are becoming increasingly sophisticated at forecasting inventory needs based on historical data, seasonal trends, and market conditions. This predictive capability enables businesses to maintain optimal stock levels while reducing carrying costs.</p>
      
      <h2>Sustainable Supply Chains</h2>
      <p>Environmental consciousness is no longer a differentiator—it's a necessity. Companies are investing heavily in sustainable supply chain solutions that minimize carbon footprints and promote circular economy principles.</p>
      
      <p>Blockchain technology is playing a pivotal role in ensuring transparency and traceability throughout the supply chain. Consumers and businesses alike are demanding proof of ethical sourcing and environmental compliance, making blockchain an essential tool for modern enterprises.</p>
      
      <h2>Immersive Shopping Experiences</h2>
      <p>Augmented Reality (AR) and Virtual Reality (VR) technologies are transforming how B2B buyers evaluate products. These immersive technologies allow customers to visualize products in their own environments before making purchasing decisions, significantly reducing return rates and increasing customer satisfaction.</p>
      
      <p>Virtual showrooms and 3D product configurators are becoming standard offerings, especially in industries dealing with complex machinery, construction materials, and industrial equipment.</p>
      
      <h2>Conclusion</h2>
      <p>As we move into 2026, the convergence of AI, sustainability, and immersive technologies will define the next generation of B2B e-commerce platforms. Businesses that embrace these innovations early will be best positioned to thrive in an increasingly digital and environmentally conscious marketplace.</p>
    `
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
    tags: ["Supply Chain", "Logistics", "Global Trade"],
    content: `
      <p>Expanding into global markets presents unparalleled opportunities for growth, but it also introduces complex supply chain challenges. Successful international expansion requires a strategic approach to logistics, compliance, and customer experience.</p>
      
      <h2>Understanding Regional Requirements</h2>
      <p>Each market has unique regulatory, cultural, and logistical considerations. What works in North America may not be suitable for Asian or European markets. Thorough research into local regulations, import/export requirements, and consumer preferences is essential.</p>
      
      <p>Partnering with local distributors and logistics providers can significantly reduce entry barriers and operational complexities. These partners bring invaluable market knowledge and established networks that can accelerate your expansion timeline.</p>
      
      <h2>Diversification Strategies</h2>
      <p>Relying on a single supplier or distribution channel creates vulnerability to disruptions. Diversifying your supply base across multiple regions and suppliers mitigates risks associated with geopolitical tensions, natural disasters, and economic fluctuations.</p>
      
      <p>Implementing a hybrid fulfillment model that combines centralized warehouses with regional distribution centers allows for faster delivery times while maintaining cost efficiency.</p>
      
      <h2>Technology Integration</h2>
      <p>Modern supply chain management relies heavily on integrated technology platforms that provide real-time visibility into inventory levels, shipment statuses, and demand forecasts across all markets.</p>
      
      <p>Cloud-based Enterprise Resource Planning (ERP) systems enable seamless coordination between different departments and geographic locations, ensuring consistent data flow and operational alignment.</p>
      
      <h2>Performance Metrics</h2>
      <p>Establishing key performance indicators (KPIs) specific to each market allows for targeted improvements and resource allocation. Metrics such as on-time delivery rates, customs clearance times, and return processing speeds should be monitored continuously.</p>
      
      <p>Regular performance reviews with partners and stakeholders ensure accountability and identify opportunities for optimization.</p>
    `
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
    tags: ["Verification", "Trust", "Partnerships"],
    content: `
      <p>In the B2B landscape, trust is the foundation of successful long-term partnerships. Verified supplier programs serve as critical mechanisms for establishing credibility and reducing transaction risks in an increasingly complex global marketplace.</p>
      
      <h2>The Importance of Verification</h2>
      <p>Third-party verification processes provide objective assessments of supplier capabilities, financial stability, and compliance with industry standards. These evaluations go beyond self-reported information to offer buyers confidence in their sourcing decisions.</p>
      
      <p>Comprehensive verification typically includes financial audits, facility inspections, quality management system certifications, and compliance checks for labor practices and environmental regulations.</p>
      
      <h2>Components of Effective Programs</h2>
      <p>Successful verified supplier programs incorporate multiple evaluation criteria including:</p>
      <ul>
        <li>Financial health and stability assessments</li>
        <li>Quality management system certifications (ISO 9001, etc.)</li>
        <li>Environmental and social compliance</li>
        <li>Production capacity and scalability</li>
        <li>Track record and references from other clients</li>
      </ul>
      
      <h2>Benefits for Buyers</h2>
      <p>Buyers utilizing verified supplier programs experience reduced procurement risks, improved product quality consistency, and enhanced supply chain resilience. These programs also facilitate faster vendor onboarding by pre-qualifying suppliers against established criteria.</p>
      
      <p>Additionally, verified suppliers often demonstrate higher levels of innovation and commitment to continuous improvement, providing buyers with competitive advantages through access to cutting-edge products and services.</p>
      
      <h2>Implementation Best Practices</h2>
      <p>Developing an effective verified supplier program requires clear criteria, standardized evaluation processes, and ongoing monitoring. Regular reassessments ensure suppliers maintain their verified status and continue meeting evolving requirements.</p>
      
      <p>Transparent communication with suppliers about verification criteria and processes encourages participation and fosters collaborative relationships built on mutual trust and shared values.</p>
    `
  }
  // Additional posts would follow the same structure
];

export default function BlogPost() {
  const router = useRouter();
  const { id } = router.query;
  
  // Find the blog post by ID
  const post = blogPosts.find(post => post.id === parseInt(id)) || blogPosts[0];
  
  // Find related posts (same category, excluding current post)
  const relatedPosts = blogPosts
    .filter(blogPost => blogPost.category === post.category && blogPost.id !== post.id)
    .slice(0, 3);

  return (
    <>
      <Head>
        <title>{post.title} | B2B E-Commerce Platform</title>
        <meta name="description" content={post.excerpt} />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        {/* Back to Blog Link */}
        <div className="container mx-auto px-4 py-6">
          <Link href="/blog" className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium">
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
            Back to Blog
          </Link>
        </div>

        <article className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Post Header */}
          <header className="mb-12 text-center">
            <div className="inline-block mb-4">
              <span className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white text-sm font-bold px-4 py-2 rounded-full">
                {post.category}
              </span>
            </div>
            
            <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-6">{post.title}</h1>
            
            <div className="flex flex-wrap items-center justify-center gap-6 text-gray-600">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold mr-3">
                  {post.author.charAt(0)}
                </div>
                <span className="font-medium">{post.author}</span>
              </div>
              
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                {post.date}
              </div>
              
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                {post.readTime}
              </div>
            </div>
          </header>

          {/* Featured Image */}
          <div className="mb-12 rounded-2xl overflow-hidden shadow-xl">
            <img 
              src={post.image} 
              alt={post.title} 
              className="w-full h-96 object-cover"
            />
          </div>

          {/* Post Content */}
          <div className="prose prose-lg max-w-none bg-white rounded-2xl p-8 shadow-lg">
            <div 
              dangerouslySetInnerHTML={{ __html: post.content }} 
              className="text-gray-700"
            />
          </div>

          {/* Tags */}
          <div className="mt-12">
            <div className="flex flex-wrap gap-3">
              {post.tags.map((tag, index) => (
                <span 
                  key={index} 
                  className="bg-blue-50 text-blue-700 text-sm font-medium px-4 py-2 rounded-full"
                >
                  #{tag}
                </span>
              ))}
            </div>
          </div>

          {/* Author Box */}
          <div className="mt-12 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl p-8 shadow-lg">
            <div className="flex flex-col md:flex-row items-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold mr-6 mb-4 md:mb-0">
                {post.author.charAt(0)}
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{post.author}</h3>
                <p className="text-gray-600 mb-4">
                  Senior Industry Analyst with over 10 years of experience in B2B e-commerce and supply chain optimization.
                </p>
                <div className="flex justify-center md:justify-start space-x-4">
                  <a href="#" className="text-blue-600 hover:text-blue-800">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"></path>
                    </svg>
                  </a>
                  <a href="#" className="text-blue-600 hover:text-blue-800">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </a>
                  <a href="#" className="text-blue-600 hover:text-blue-800">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"></path>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Related Posts */}
          <div className="mt-16">
            <h2 className="text-3xl font-bold text-gray-800 mb-8">Related Articles</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((relatedPost) => (
                <div 
                  key={relatedPost.id} 
                  className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500"
                >
                  <img 
                    src={relatedPost.image} 
                    alt={relatedPost.title} 
                    className="w-full h-48 object-cover"
                  />
                  
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-gray-500 text-sm">{relatedPost.date}</span>
                      <span className="text-gray-500 text-sm">{relatedPost.readTime}</span>
                    </div>
                    
                    <h3 className="text-lg font-bold text-gray-800 mb-3 line-clamp-2 hover:text-blue-600 transition-colors">
                      <Link href={`/blog/${relatedPost.id}`}>
                        {relatedPost.title}
                      </Link>
                    </h3>
                    
                    <p className="text-gray-600 text-sm line-clamp-3 mb-4">
                      {relatedPost.excerpt}
                    </p>
                    
                    <Link 
                      href={`/blog/${relatedPost.id}`}
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
              ))}
            </div>
          </div>
        </article>

        {/* Newsletter Signup */}
        <section className="py-16 bg-gradient-to-r from-blue-600 to-indigo-700 mt-16">
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