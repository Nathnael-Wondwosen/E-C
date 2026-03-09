import Link from 'next/link';

export default function TradexTVSection() {
  return (
    <section className="py-12 bg-gray-900 text-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-red-300 font-semibold">Tradex TV</p>
            <h2 className="text-3xl font-bold mt-2">Tradex TV Promotional Window</h2>
            <p className="text-gray-300 mt-4 leading-relaxed">
              Watch supplier spotlights, product launches, and market intelligence clips curated for buyers and sellers.
            </p>
            <div className="mt-6 flex gap-3">
              <Link href="/blog" className="px-5 py-3 bg-red-600 hover:bg-red-700 font-semibold transition-colors">Watch Now</Link>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="px-5 py-3 border border-gray-500 hover:border-white font-semibold transition-colors">
                Open Channel
              </a>
            </div>
          </div>

          <div className="border border-gray-700 bg-black/40 p-3 shadow-2xl">
            <div className="aspect-video bg-black flex items-center justify-center">
              <iframe
                title="Tradex TV"
                className="w-full h-full"
                src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
