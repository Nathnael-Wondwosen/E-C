import Link from 'next/link';

export default function DirectoryMenuSection({ categories = [] }) {
  const visible = Array.isArray(categories) ? categories.slice(0, 12) : [];

  return (
    <section className="py-10 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Directory Menu</h2>
          <Link href="/products" className="text-blue-700 font-medium">Browse Full Directory</Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {visible.map((category) => (
            <Link
              key={category.id}
              href={`/products?category=${encodeURIComponent(category.name || '')}`}
              className="bg-white border border-gray-200 p-4 hover:border-blue-300 hover:shadow-md transition-all duration-300"
            >
              <div className="text-2xl mb-2">{category.icon || '??'}</div>
              <div className="text-sm font-semibold text-gray-900 line-clamp-1">{category.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
