import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';

const topLinks = ['Today\'s Deals', 'Ecosystems', 'Categories'];

const marketStores = [
  {
    code: 'LOCAL',
    label: 'Ethiopia First',
    accent: 'from-emerald-700 to-emerald-500',
    icon: '✦',
    detail: 'Local producers, retail demand, and domestic trade acceleration.',
    route: 'Domestic trade lane',
  },
  {
    code: 'AFRICA',
    label: 'Regional Africa',
    accent: 'from-amber-600 to-orange-500',
    icon: '◌',
    detail: 'Cross-border East and pan-African opportunities for sourcing and expansion.',
    route: 'Regional growth corridor',
  },
  {
    code: 'GLOBAL',
    label: 'Global Access',
    accent: 'from-slate-900 to-slate-700',
    icon: '◎',
    detail: 'International supply, premium catalog depth, and broader commercial reach.',
    route: 'Worldwide sourcing lane',
  },
  {
    code: 'ASIA',
    label: 'Asia Supply',
    accent: 'from-red-600 to-rose-500',
    icon: '◈',
    detail: 'Manufacturing depth, packaging, electronics, and industrial procurement.',
    route: 'High-volume procurement',
  },
  {
    code: 'EUROPE',
    label: 'Europe Premium',
    accent: 'from-sky-700 to-cyan-500',
    icon: '⬢',
    detail: 'Design-forward goods, specialized equipment, and premium category lines.',
    route: 'Premium product lane',
  },
  {
    code: 'AMERICAS',
    label: 'Americas Reach',
    accent: 'from-indigo-700 to-blue-500',
    icon: '◉',
    detail: 'Brand visibility, innovation categories, and higher-value product discovery.',
    route: 'Strategic import channel',
  },
];

const ecosystems = [
  {
    id: 'b2b',
    name: 'B2B Marketplace',
    stat: 'Digital Trade Core',
    summary: 'Supplier discovery, sourcing, pricing, and commercial transactions across local and cross-border markets.',
    cta: 'Enter Marketplace',
    href: '/marketplace',
    tone: 'bg-blue-50 text-blue-700 border-blue-200',
  },
  {
    id: 'tesbinn',
    name: 'Tesbinn',
    stat: 'Learning Hub',
    summary: 'Training programs, business capability building, and practical enterprise skill acceleration.',
    cta: 'Open Tesbinn',
    href: '/tesbinn',
    tone: 'bg-amber-50 text-amber-700 border-amber-200',
  },
  {
    id: 'enisra',
    name: 'Enisra',
    stat: 'AI Job Matching',
    summary: 'Talent discovery, opportunity alignment, and workforce connection for growth-focused organizations.',
    cta: 'Explore Enisra',
    href: '/signup',
    tone: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'tradex-tv',
    name: 'Tradex TV',
    stat: 'Media Layer',
    summary: 'Business storytelling, campaign visibility, and ecosystem-wide exposure through media presence.',
    cta: 'Watch Tradex',
    href: '/tradex',
    tone: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
  },
  {
    id: 'expo',
    name: 'Ethio International Expo',
    stat: 'Global Showcase',
    summary: 'International exposure, exhibitions, investor attention, and partnership positioning.',
    cta: 'See Expo',
    href: '/expo',
    tone: 'bg-indigo-50 text-indigo-700 border-indigo-200',
  },
  {
    id: 'buna',
    name: 'Buna Tale',
    stat: 'Coffee Ecosystem',
    summary: 'A signature vertical brand example built around quality, identity, and premium Ethiopian presence.',
    cta: 'Discover Buna Tale',
    href: '/products',
    tone: 'bg-orange-50 text-orange-700 border-orange-200',
  },
];

const trustSignals = [
  'Unified ecosystem, not just a single storefront',
  'Trade, training, talent, media, expo, and brand layers connected',
  'Designed for Ethiopia-first growth with global reach',
  'Structured to feel investor-ready and business-grade',
];

const ecosystemPulse = [
  { value: '06', label: 'Core Platforms', detail: 'Connected operating layers' },
  { value: '24/7', label: 'Digital Presence', detail: 'Always-on ecosystem access' },
  { value: '360°', label: 'Business View', detail: 'Trade, talent, media, expo' },
  { value: '01', label: 'Unified Identity', detail: 'One business-group story' },
];

const leftRailItems = [
  'B2B Marketplace',
  'Tesbinn Learning',
  'Enisra Talent',
  'Tradex TV Media',
  'Ethio Expo',
  'Buna Tale Coffee',
  'Industrial Sourcing',
  'Retail Expansion',
  'Export Readiness',
  'Brand Partnerships',
  'Training Tracks',
  'Growth Programs',
];

const heroCards = [
  {
    title: 'Marketplace Engine',
    text: 'Products, suppliers, imports, and demand-side discovery in one operational trade layer.',
    image: '/placeholder-carousel.jpg',
  },
  {
    title: 'Capability & Visibility',
    text: 'Learning through Tesbinn and promotion through Tradex TV strengthen every commercial outcome.',
    image: '/hero-background.jpg',
  },
  {
    title: 'Talent, Expo, and Brand Power',
    text: 'Enisra, Expo, and Buna Tale show how the ecosystem scales beyond commerce alone.',
    image: '/login-card1.png',
  },
];

const topSelling = [
  { title: 'Verified supplier onboarding for wholesale and institutional buyers', tag: 'B2B Marketplace', price: '24/7' },
  { title: 'Business training tracks for sales, operations, and digital readiness', tag: 'Tesbinn', price: 'New Cohorts' },
  { title: 'AI-assisted talent matching for emerging companies and hiring teams', tag: 'Enisra', price: 'Smart Match' },
  { title: 'Media slots and campaign storytelling for stronger visibility', tag: 'Tradex TV', price: 'Featured' },
  { title: 'Expo packages for regional and international market exposure', tag: 'Expo', price: 'Seasonal' },
];

const ecosystemCollections = [
  'Supplier and Buyer Pathways',
  'Training and Capability Tracks',
  'Hiring and Workforce Signals',
  'Media Exposure Campaigns',
  'Expo Participation Routes',
  'Signature Vertical Brands',
];

const ecosystemFlow = [
  {
    title: 'Marketplace',
    text: 'Commercial movement starts with supplier discovery, sourcing, and product demand.',
  },
  {
    title: 'Capability',
    text: 'Tesbinn upgrades people and companies with the skills needed to perform better.',
  },
  {
    title: 'Talent',
    text: 'Enisra connects opportunity, hiring, and business growth through smarter matching.',
  },
  {
    title: 'Visibility',
    text: 'Tradex TV gives stories, campaigns, and brands the exposure they need to be seen.',
  },
  {
    title: 'Global Reach',
    text: 'Expo opens doors to partnerships, investors, buyers, and international recognition.',
  },
  {
    title: 'Brand Equity',
    text: 'Buna Tale shows how ecosystem participation can mature into premium vertical identity.',
  },
];

const opportunityZones = [
  {
    title: 'Investor & Partner View',
    text: 'A stronger strategic picture of how the business group compounds value across multiple verticals.',
    accent: 'from-slate-950 via-indigo-950 to-blue-900',
  },
  {
    title: 'SME Growth Corridor',
    text: 'A path for Ethiopian businesses to access trade, knowledge, visibility, and premium positioning.',
    accent: 'from-emerald-700 via-emerald-600 to-cyan-500',
  },
  {
    title: 'Media and Attention Layer',
    text: 'Campaigns, storytelling, and ecosystem-wide awareness that support business credibility.',
    accent: 'from-fuchsia-700 via-rose-600 to-orange-500',
  },
  {
    title: 'International Access Layer',
    text: 'Routes into exhibitions, buyers, and global business presence without fragmenting the story.',
    accent: 'from-amber-500 via-orange-500 to-red-500',
  },
];

const featurePanels = [
  {
    title: 'Why these ecosystems belong together',
    subtitle: 'TradeEthiopia works as one connected business universe: commerce creates movement, learning upgrades capacity, talent expands execution, media builds visibility, expo opens doors, and brand ecosystems create long-term identity.',
    cta: 'See Ecosystem Logic',
  },
  {
    title: 'A marketplace layout that communicates more than shopping',
    subtitle: 'This sample keeps the dense commercial rhythm you liked, but the content is repositioned so the page presents the full TradeEthiopia model rather than only imported products.',
    cta: 'Explore All Layers',
  },
];

function ProductRail({ title, items }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-slate-900">{title}</h2>
        <Link href="/marketplace" className="text-sm font-semibold text-blue-700">
          View all
        </Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {items.map((item) => (
          <article
            key={item.title}
            className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-transform duration-200 hover:-translate-y-1 hover:bg-white"
          >
            <div className="mb-3 rounded-xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-700 p-3 text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-blue-100">{item.tag}</p>
              <p className="mt-6 text-xl font-black">{item.price}</p>
            </div>
            <h3 className="text-sm font-bold leading-6 text-slate-900">{item.title}</h3>
          </article>
        ))}
      </div>
    </section>
  );
}

export default function Index2Page() {
  return (
    <>
      <Head>
        <title>TradeEthiopia Index 2 | Ecosystem Gateway Sample</title>
        <meta
          name="description"
          content="Sample ecosystem gateway page for TradeEthiopia using a dense commerce-style layout."
        />
      </Head>

      <style jsx global>{`
        .scrollbar-hidden {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .scrollbar-hidden::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="min-h-screen bg-[#f4f7fb] text-slate-900">
        <header className="border-b border-slate-200 bg-white">
          <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3 px-4 py-2 text-xs font-semibold text-slate-600 sm:px-6">
            <div className="flex flex-wrap items-center gap-4">
              {topLinks.map((link) => (
                <span key={link}>{link}</span>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-4">
              <span>Download App</span>
              <span>Delivery: ET</span>
              <span>English EN</span>
              <span>Account</span>
            </div>
          </div>

          <div className="border-t border-slate-100">
            <div className="mx-auto flex max-w-[1440px] flex-wrap items-center gap-4 px-4 py-4 sm:px-6">
              <Link href="/" className="flex items-center gap-3">
                <Image src="/TE-logo.png" alt="TradeEthiopia" width={160} height={42} priority className="h-10 w-auto" />
              </Link>

              <div className="min-w-[220px] flex-1">
                <div className="flex overflow-hidden rounded-xl border-2 border-[#f59e0b] bg-white shadow-sm">
                  <div className="hidden items-center border-r border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-600 md:flex">
                    Search Ecosystem
                  </div>
                  <input
                    type="text"
                    placeholder="Search ecosystems, trade categories, supplier programs, media, expo or learning tracks"
                    className="h-12 flex-1 px-4 text-sm outline-none"
                  />
                  <button className="h-12 bg-[#f59e0b] px-6 text-sm font-bold text-white">
                    Search
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-3 text-sm font-semibold text-slate-700">
                <Link href="/wishlist">Wishlist</Link>
                <Link href="/cart">Cart</Link>
              </div>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6">
          <section className="grid gap-5 lg:grid-cols-[280px_1fr]">
            <aside className="rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_rgba(15,23,42,0.05)] lg:max-h-[360px] lg:overflow-hidden">
              <div className="mb-4 rounded-xl bg-slate-900 px-4 py-3 text-sm font-bold text-white">
                Explore TradeEthiopia
              </div>
              <div className="space-y-2 lg:max-h-[288px] lg:overflow-y-auto lg:pr-1 scrollbar-hidden">
                {leftRailItems.map((item) => (
                  <Link
                    key={item}
                    href="/marketplace"
                    className="flex items-center justify-between rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-blue-700"
                  >
                    <span>{item}</span>
                    <span className="text-slate-400">›</span>
                  </Link>
                ))}
              </div>
            </aside>

            <div className="space-y-5">
              <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_18px_40px_rgba(15,23,42,0.08)]">
                <div className="grid gap-0 lg:grid-cols-[1.3fr_0.9fr]">
                  <div className="relative min-h-[360px] overflow-hidden bg-gradient-to-r from-[#082c52] via-[#0a3b70] to-[#0c5aa6] px-7 py-8 text-white sm:px-10">
                    <div className="absolute inset-0 opacity-20">
                      <Image src="/hero-background.jpg" alt="" fill sizes="100vw" className="object-cover" />
                    </div>
                    <div className="relative max-w-2xl">
                      <p className="text-xs font-bold uppercase tracking-[0.24em] text-amber-300">
                        One connected business ecosystem
                      </p>
                      <h1 className="mt-4 text-3xl font-black leading-tight sm:text-5xl">
                        TradeEthiopia is where trade, learning, talent, media, expo, and brand identity meet.
                      </h1>
                      <p className="mt-4 max-w-xl text-sm leading-7 text-blue-50 sm:text-base">
                        Use this gateway to move between the B2B Marketplace, Tesbinn, Enisra, Tradex TV, Ethio International Expo, and Buna Tale while still keeping the dense, high-energy commerce layout you wanted.
                      </p>

                      <div className="mt-6 flex flex-wrap gap-3">
                        <Link
                          href="/marketplace"
                          className="rounded-xl bg-[#f59e0b] px-5 py-3 text-sm font-bold text-white"
                        >
                          Enter Ecosystem
                        </Link>
                        <Link
                          href="/signup"
                          className="rounded-xl border border-white/30 bg-white/10 px-5 py-3 text-sm font-bold text-white"
                        >
                          Create Trade Account
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-0 sm:grid-cols-3 lg:grid-cols-1">
                    {heroCards.map((card) => (
                      <article key={card.title} className="relative min-h-[160px] overflow-hidden border-l border-slate-200 border-t first:border-t-0 sm:first:border-t sm:first:border-l-0 lg:first:border-t-0">
                        <Image src={card.image} alt={card.title} fill sizes="(min-width: 1024px) 30vw, 100vw" className="object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/55 to-black/20" />
                        <div className="relative flex h-full flex-col justify-end p-5 text-white">
                          <h2 className="text-lg font-black">{card.title}</h2>
                          <p className="mt-2 text-sm leading-6 text-slate-100">{card.text}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </section>

              <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="text-lg font-extrabold text-slate-900">Order From</h2>
                  <span className="text-sm font-semibold text-slate-500">Multi-market routing</span>
                </div>
                <div className="grid gap-3 sm:grid-cols-4 lg:grid-cols-8">
                  {marketStores.map((store) => (
                    <button
                      key={store.code}
                      className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition-transform duration-200 hover:-translate-y-1 hover:bg-white"
                    >
                      <div className={`inline-flex rounded-lg bg-gradient-to-r px-3 py-2 text-xs font-black text-white ${store.accent}`}>
                        {store.code}
                      </div>
                      <p className="mt-3 text-sm font-bold text-slate-900">{store.label}</p>
                    </button>
                  ))}
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {trustSignals.map((signal) => (
                  <div key={signal} className="rounded-2xl border border-slate-200 bg-white px-5 py-4 text-sm font-bold text-slate-800 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                    {signal}
                  </div>
                ))}
              </section>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <div className="grid gap-4 lg:grid-cols-[1.25fr_0.9fr]">
              <div className="rounded-[1.8rem] bg-gradient-to-br from-slate-950 via-slate-900 to-blue-900 p-6 text-white">
                <p className="text-xs font-bold uppercase tracking-[0.24em] text-cyan-200">Ecosystem Pulse</p>
                <h2 className="mt-3 text-3xl font-black leading-tight">
                  One platform story with multiple business engines working together.
                </h2>
                <p className="mt-4 max-w-2xl text-sm leading-7 text-slate-200">
                  The sections below should feel less like disconnected website blocks and more like one coordinated system. This layer gives the page a stronger sense of operational scale before users enter the detailed ecosystem cards.
                </p>
                <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                  {ecosystemPulse.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl">
                      <p className="text-3xl font-black text-white">{item.value}</p>
                      <p className="mt-2 text-sm font-bold text-cyan-200">{item.label}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-300">{item.detail}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                {trustSignals.map((signal, index) => (
                  <div
                    key={signal}
                    className={`rounded-[1.6rem] border p-5 ${
                      index % 2 === 0
                        ? 'border-slate-200 bg-slate-50 text-slate-900'
                        : 'border-amber-200 bg-amber-50 text-slate-900'
                    }`}
                  >
                    <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Signal</p>
                    <p className="mt-3 text-base font-black leading-7">{signal}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-slate-900">All TradeEthiopia Ecosystems</h2>
              <Link href="/" className="text-sm font-semibold text-blue-700">
                Back to main page
              </Link>
            </div>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {ecosystems.map((item) => (
                <article
                  key={item.id}
                  className="group relative overflow-hidden rounded-[1.9rem] border border-slate-200 bg-slate-50 p-6 transition-transform duration-300 hover:-translate-y-1 hover:bg-white"
                >
                  <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-blue-600 via-cyan-500 to-indigo-500 opacity-70" />
                  <div className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] ${item.tone}`}>
                    {item.stat}
                  </div>
                  <div className="mt-6 flex items-start justify-between gap-4">
                    <h3 className="text-xl font-black text-slate-900">{item.name}</h3>
                    <div className="rounded-2xl bg-white px-3 py-2 text-xl shadow-sm">{item.name === 'Tesbinn' ? '📚' : item.name === 'Enisra' ? '💼' : item.name === 'Tradex TV' ? '📺' : item.name === 'Ethio International Expo' ? '🌍' : item.name === 'Buna Tale' ? '☕' : '🛒'}</div>
                  </div>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{item.summary}</p>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Connected Layer</span>
                    <Link href={item.href} className="inline-flex text-sm font-bold text-blue-700">
                    {item.cta}
                    </Link>
                  </div>
                </article>
              ))}
            </div>
          </section>

          <div className="mt-6 grid gap-6">
            <section className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <div className="border-b border-slate-200 px-5 py-4">
                <p className="text-xs font-bold uppercase tracking-[0.22em] text-slate-500">How The System Works</p>
                <h2 className="mt-2 text-2xl font-black text-slate-900">
                  A single ecosystem journey, shown as a progression instead of disconnected pages.
                </h2>
              </div>
              <div className="grid gap-px bg-slate-200 md:grid-cols-2 xl:grid-cols-3">
                {ecosystemFlow.map((step, index) => (
                  <article key={step.title} className="bg-white p-5">
                    <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-900 text-sm font-black text-white">
                      0{index + 1}
                    </div>
                    <h3 className="text-lg font-black text-slate-900">{step.title}</h3>
                    <p className="mt-3 text-sm leading-7 text-slate-600">{step.text}</p>
                  </article>
                ))}
              </div>
            </section>

            <ProductRail title="Core Business Layers in Motion" items={topSelling} />

            <section className="grid gap-5 lg:grid-cols-2">
              {opportunityZones.map((zone) => (
                <article
                  key={zone.title}
                  className={`rounded-[2rem] bg-gradient-to-br ${zone.accent} p-7 text-white shadow-[0_18px_40px_rgba(15,23,42,0.1)]`}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/75">Opportunity Zone</p>
                  <h2 className="mt-4 text-3xl font-black leading-tight">{zone.title}</h2>
                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/90">{zone.text}</p>
                </article>
              ))}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_10px_30px_rgba(15,23,42,0.05)]">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-extrabold text-slate-900">Ecosystem Collections</h2>
                <Link href="/marketplace" className="text-sm font-semibold text-blue-700">
                  Explore all
                </Link>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
                {ecosystemCollections.map((collection, index) => (
                  <div key={collection} className="rounded-[1.7rem] border border-slate-200 bg-slate-50 p-4 transition-transform duration-300 hover:-translate-y-1 hover:bg-white">
                    <div
                      className={`mb-4 flex h-28 items-end rounded-[1.3rem] p-4 text-white ${
                        index % 3 === 0
                          ? 'bg-gradient-to-br from-slate-900 via-blue-800 to-cyan-600'
                          : index % 3 === 1
                          ? 'bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500'
                          : 'bg-gradient-to-br from-emerald-600 via-cyan-600 to-blue-700'
                      }`}
                    >
                      <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/75">Collection</p>
                    </div>
                    <h3 className="text-sm font-bold leading-6 text-slate-900">{collection}</h3>
                  </div>
                ))}
              </div>
            </section>

            <section className="grid gap-5 lg:grid-cols-2">
              {featurePanels.map((panel, index) => (
                <article
                  key={panel.title}
                  className={`rounded-3xl border p-7 text-white shadow-[0_18px_40px_rgba(15,23,42,0.08)] ${
                    index === 0
                      ? 'border-slate-900 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-900'
                      : 'border-amber-300 bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500'
                  }`}
                >
                  <p className="text-xs font-bold uppercase tracking-[0.22em] text-white/80">TradeEthiopia Focus</p>
                  <h2 className="mt-4 text-3xl font-black leading-tight">{panel.title}</h2>
                  <p className="mt-3 max-w-xl text-sm leading-7 text-white/90">{panel.subtitle}</p>
                  <Link href="/marketplace" className="mt-6 inline-flex rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-900">
                    {panel.cta}
                  </Link>
                </article>
              ))}
            </section>
          </div>
        </main>
      </div>
    </>
  );
}
