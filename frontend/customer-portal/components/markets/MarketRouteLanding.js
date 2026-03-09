import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import Header from '../header/Header';

export default function MarketRouteLanding({ title, subtitle, targetHref }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <Head>
        <title>{`${title} | TradeEthiopia`}</title>
        <meta name="description" content={subtitle} />
      </Head>

      <main className="min-h-screen bg-slate-100 text-slate-900">
        <Header isMenuOpen={isMenuOpen} setIsMenuOpen={setIsMenuOpen} categories={[]} />

        <section className="mx-auto max-w-5xl px-4 py-14">
          <div className="rounded-2xl border border-slate-200 bg-gradient-to-r from-cyan-50 via-white to-blue-50 p-8 shadow-sm">
            <p className="inline-flex rounded-full border border-cyan-200 bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-cyan-700">
              Market Access
            </p>
            <h1 className="mt-3 text-3xl font-bold text-slate-900">{title}</h1>
            <p className="mt-2 max-w-2xl text-sm text-slate-600">{subtitle}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                href={targetHref}
                className="inline-flex items-center rounded-lg bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700"
              >
                Continue to {title}
              </Link>
              <Link
                href="/marketplace"
                className="inline-flex items-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Open Marketplace
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
