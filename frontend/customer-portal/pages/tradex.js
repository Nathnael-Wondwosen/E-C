import Head from 'next/head';
import Link from 'next/link';

export default function TradexPage() {
  return (
    <>
      <Head>
        <title>Tradex | TradeEthiopia</title>
      </Head>
      <main className="min-h-screen bg-slate-50 px-6 py-16 text-slate-900">
        <div className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-8">
          <h1 className="text-3xl font-extrabold">Tradex</h1>
          <p className="mt-4 text-slate-600">
            Tradex experience is ready. Continue building module-specific sections from this route.
          </p>
          <Link href="/" className="mt-8 inline-block rounded-full bg-slate-900 px-5 py-2 text-sm font-semibold text-white">
            Back to Portal
          </Link>
        </div>
      </main>
    </>
  );
}
