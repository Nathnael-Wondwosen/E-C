import Link from 'next/link';
import Head from 'next/head';

const blogPosts = [
  {
    id: 1,
    title: 'The Future of B2B E-Commerce: Trends to Watch in 2026',
    excerpt: 'Explore the emerging trends that will shape the B2B e-commerce landscape in the coming year, from AI-powered procurement to sustainable supply chains.',
    author: 'Sarah Johnson',
    date: 'December 10, 2025',
    category: 'Industry Insights',
    readTime: '8 min read',
    image: 'https://images.unsplash.com/photo-1551836022-d5d88e9218df?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    tags: ['E-commerce', 'Technology', 'Future Trends'],
  },
  {
    id: 2,
    title: 'Optimizing Your Supply Chain for Global Markets',
    excerpt: 'Learn how to streamline your supply chain operations to reach international customers efficiently while maintaining quality and reducing costs.',
    author: 'Michael Chen',
    date: 'December 5, 2025',
    category: 'Operations',
    readTime: '6 min read',
    image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    tags: ['Supply Chain', 'Logistics', 'Global Trade'],
  },
  {
    id: 3,
    title: 'Building Trust with Verified Supplier Programs',
    excerpt: 'Discover how verified supplier programs can enhance credibility, reduce risk, and foster long-term partnerships in B2B transactions.',
    author: 'Emma Rodriguez',
    date: 'November 28, 2025',
    category: 'Supplier Relations',
    readTime: '7 min read',
    image: 'https://images.unsplash.com/photo-1551836022-25b39be590d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    tags: ['Verification', 'Trust', 'Partnerships'],
  },
  {
    id: 4,
    title: "Digital Transformation in Manufacturing: A CEO's Perspective",
    excerpt: 'Hear from industry leaders about their digital transformation journeys and the impact on productivity and innovation.',
    author: 'David Park',
    date: 'November 22, 2025',
    category: 'Leadership',
    readTime: '10 min read',
    image: 'https://images.unsplash.com/photo-1581091226033-d5c48150dbaa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    tags: ['Digitalization', 'Manufacturing', 'Innovation'],
  },
  {
    id: 5,
    title: 'Sustainable Procurement: Meeting Consumer Demand Responsibly',
    excerpt: 'Understand how sustainable procurement practices can meet growing consumer expectations while maintaining profitability.',
    author: 'Lisa Thompson',
    date: 'November 15, 2025',
    category: 'Sustainability',
    readTime: '9 min read',
    image: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    tags: ['Sustainability', 'Procurement', 'CSR'],
  },
  {
    id: 6,
    title: 'Cybersecurity Best Practices for B2B Platforms',
    excerpt: 'Protect your business with essential cybersecurity measures tailored for B2B e-commerce environments.',
    author: 'Robert Kim',
    date: 'November 8, 2025',
    category: 'Security',
    readTime: '12 min read',
    image: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
    tags: ['Cybersecurity', 'Data Protection', 'Best Practices'],
  },
];

const categories = [
  'All',
  'Industry Insights',
  'Operations',
  'Supplier Relations',
  'Leadership',
  'Sustainability',
  'Security',
];

export default function BlogPage() {
  return (
    <>
      <Head>
        <title>Business Insights & News | B2B E-Commerce Platform</title>
        <meta name="description" content="Stay updated with the latest industry trends, business strategies, and market insights for B2B commerce." />
      </Head>

      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
        <header className="bg-gradient-to-r from-blue-700 to-indigo-800 py-16 text-white">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold md:text-5xl">Business Insights & News</h1>
            <p className="mx-auto mt-4 max-w-3xl text-xl text-blue-100">
              Expert perspectives, industry analysis, and actionable strategies to grow your business
            </p>
          </div>
        </header>

        <section className="bg-white py-8 shadow-sm">
          <div className="container mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`rounded-full px-5 py-2 text-sm font-medium transition-all duration-300 ${
                    category === 'All'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-md'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {blogPosts.map((post) => (
                <article
                  key={post.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-lg transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="relative">
                    <img src={post.image} alt={post.title} className="h-56 w-full object-cover" />
                    <div className="absolute left-4 top-4">
                      <span className="rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 px-3 py-1.5 text-xs font-bold text-white">
                        {post.category}
                      </span>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="text-sm text-gray-500">{post.date}</span>
                      <span className="text-sm text-gray-500">{post.readTime}</span>
                    </div>

                    <h2 className="mb-3 line-clamp-2 text-xl font-bold text-gray-800 transition-colors hover:text-blue-600">
                      <Link href={`/blog/${post.id}`}>{post.title}</Link>
                    </h2>

                    <p className="mb-4 line-clamp-3 text-gray-600">{post.excerpt}</p>

                    <div className="mb-4 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span key={tag} className="rounded bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                      <div className="flex items-center">
                        <div className="mr-3 flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 font-bold text-white">
                          {post.author.charAt(0)}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-800">{post.author}</p>
                          <p className="text-xs text-gray-500">Author</p>
                        </div>
                      </div>

                      <Link href={`/blog/${post.id}`} className="group flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800">
                        Read Article
                        <svg className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-12 text-center">
              <button className="rounded-full bg-gradient-to-r from-blue-600 to-indigo-700 px-8 py-3 font-semibold text-white shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                Load More Articles
              </button>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
