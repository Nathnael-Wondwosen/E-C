import dynamic from 'next/dynamic';

// Create a client-only version of the NewsBlogSection component
const ClientOnlyNewsBlogSection = dynamic(
  () => import('./NewsBlogSection'),
  { 
    ssr: false,
    loading: () => (
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-10">Loading...</h2>
            <div className="flex animate-pulse">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="flex-[0_0_auto] min-w-0 w-full md:w-1/2 lg:w-1/3 xl:w-1/4 px-3">
                  <div className="bg-white shadow-xl border border-gray-100 h-full flex flex-col">
                    <div className="relative h-48 bg-gray-200"></div>
                    <div className="p-5 flex flex-col flex-grow">
                      <div className="h-6 bg-gray-200 mb-2"></div>
                      <div className="h-4 bg-gray-200 mb-2 w-3/4"></div>
                      <div className="h-4 bg-gray-200 mb-4 w-1/2"></div>
                      <div className="mt-4 flex justify-between">
                        <div className="h-4 bg-gray-200 w-1/3"></div>
                        <div className="h-4 bg-gray-200 w-1/6"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="py-16 bg-gray-50">
            <h3 className="text-3xl font-bold text-center mb-10">Our Trusted Partners</h3>
            <div className="flex animate-pulse">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex-[0_0_auto] min-w-0 w-1/2 md:w-1/3 lg:w-1/5 xl:w-1/6 px-4">
                  <div className="h-24 bg-gray-200 border flex items-center justify-center"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    )
  }
);

export default ClientOnlyNewsBlogSection;