import Head from 'next/head';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import NetworkCore from '../components/NetworkCore';

const sectorEcosystem = [
  {
    id: 'tesbinn',
    title: 'Tesbinn',
    subtitle: 'Business Training Hub',
    description:
      'Professional learning, innovation programs, enterprise training and business capability development.',
    icon: '📚',
  },
  {
    id: 'enisra',
    title: 'Enisra',
    subtitle: 'AI-Powered Job Matching',
    description:
      'A smart employment ecosystem connecting talent, opportunity and enterprise growth.',
    icon: '💼',
  },
  {
    id: 'tv', // ✅ FIXED
    title: 'Tradex TV',
    subtitle: 'Media & Business Visibility',
    description:
      'A premium media layer for exposure, storytelling, visibility and business intelligence.',
    icon: '📺',
  },
  {
    id: 'expo', // ✅ FIXED
    title: 'Ethio International Expo',
    subtitle: 'Global Business Showcase',
    description:
      'A gateway for exhibitions, partnerships, investor attention and international positioning.',
    icon: '🌍',
  },
  {
    id: 'buna', // ✅ FIXED
    title: 'Buna Tale',
    subtitle: 'Coffee Ecosystem',
    description:
      'A refined coffee-focused platform built around branding, market presence and premium identity.',
    icon: '☕',
  },
  {
    id: 'b2b',
    title: 'B2B Marketplace',
    subtitle: 'Digital Trade Infrastructure',
    description:
      'A central commercial layer for business discovery, interaction and ecosystem connection.',
    icon: '🛒',
  },
];

const pitchStats = [
  { value: '01', label: 'Unified Ecosystem' },
  { value: '06', label: 'Core Platforms' },
  { value: '24/7', label: 'Digital Presence' },
  { value: '360°', label: 'Business Experience' },
];

const investorPillars = [
  {
    title: 'Investor-Ready Identity',
    text: 'A stronger digital presence that communicates scale, structure, innovation and long-term potential.',
  },
  {
    title: 'Business Group Positioning',
    text: 'Every section is designed so the visitor feels that TradeEthiopia Business Group is broad, active and future-ready.',
  },
  {
    title: 'Experience-First Interface',
    text: 'This is not a plain corporate site. It feels like entering a connected trade universe with premium visual depth.',
  },
];

const pricingPlans = [
  {
    name: 'Starter',
    price: 'Free',
    description: 'For visitors exploring the ecosystem and entry-level exposure.',
    features: ['Core access', 'Basic visibility', 'Platform discovery'],
    featured: false,
  },
  {
    name: 'Pro',
    price: '$29/mo',
    description: 'For stronger ecosystem participation and business presence.',
    features: ['Enhanced visibility', 'Premium access experience', 'Growth-ready positioning'],
    featured: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For strategic positioning, major presence and tailored support.',
    features: ['Custom strategy', 'High-end business presence', 'Advanced support experience'],
    featured: false,
  },
];

const navItems = [
  { name: 'Marketplace', href: '/marketplace' },
  { name: 'Tesbinn', href: 'https://tesbinn.com' },
  { name: 'Enisra', href: 'https://enisra.com' },
  { name: 'TradeX', href: 'https://tradex.com' },
  { name: 'Expo', href: 'https://ethiointernationalexpo.com' },
  { name: 'Buna Tale', href: 'https://bunatale.com' },
  { name: 'Contact', href: '#contact' },
];

function createDeterministicParticles(length, seedBase) {
  const particles = [];
  let seed = seedBase;

  const next = () => {
    seed = (seed * 1664525 + 1013904223) % 4294967296;
    return seed / 4294967296;
  };

  for (let index = 0; index < length; index += 1) {
    particles.push({
      id: index,
      size: 4 + next() * 8,
      left: next() * 100,
      top: next() * 100,
      delay: next() * 6,
      duration: 6 + next() * 8,
    });
  }

  return particles;
}

function useReveal() {
  const ref = useRef(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) node.classList.add('revealed');
      },
      { threshold: 0.18 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return ref;
}

function SectionHeading({ isDarkMode, badge, title, text }) {
  return (
    <div className="max-w-3xl mx-auto text-center space-y-4">
      <span
        className={`inline-flex px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border ${
          isDarkMode
            ? 'bg-indigo-500/10 text-indigo-300 border-indigo-400/20'
            : 'bg-white/80 text-fuchsia-700 border-fuchsia-200'
        }`}
      >
        {badge}
      </span>

      <h2
        className={`text-3xl sm:text-4xl lg:text-5xl font-black leading-tight ${
          isDarkMode ? 'text-white' : 'text-slate-950'
        }`}
      >
        {title}
      </h2>

      <p
        className={`text-sm sm:text-base lg:text-lg leading-7 max-w-2xl mx-auto ${
          isDarkMode ? 'text-slate-300' : 'text-slate-600'
        }`}
      >
        {text}
      </p>
    </div>
  );
}

function ParticleBackground({ isDarkMode }) {
  const particles = useMemo(
    () => createDeterministicParticles(36, 97),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute rounded-full opacity-30 floating-particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            top: `${p.top}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            background: isDarkMode
              ? 'linear-gradient(135deg, rgba(99,102,241,0.95), rgba(34,211,238,0.9))'
              : 'linear-gradient(135deg, rgba(217,70,239,0.95), rgba(251,113,133,0.9))',
          }}
        />
      ))}
    </div>
  );
}

// function Globe3D({ isDarkMode, activeNode, onNodeClick }) {
//   const globeNodes = [
//     { id: 'b2b', label: 'B2B', x: 52, y: 20, z: 48 },
//     { id: 'tesbinn', label: 'Tesbinn', x: 26, y: 34, z: 34 },
//     { id: 'enisra', label: 'Enisra', x: 70, y: 42, z: 44 },
//     { id: 'tradex-tv', label: 'TV', x: 38, y: 62, z: 22 },
//     { id: 'ethio-expo', label: 'Expo', x: 61, y: 68, z: 36 },
//     { id: 'buna-tale', label: 'Buna', x: 48, y: 82, z: 18 },
//   ];

//   return (
//     <div className="relative w-full max-w-[620px] mx-auto aspect-square">
//       <div className="absolute inset-0 rounded-full blur-3xl opacity-40 bg-gradient-to-br from-indigo-500/20 via-cyan-500/10 to-fuchsia-500/10" />

//       <div className="absolute inset-[8%] rounded-full border border-white/10 rotate-slow" />
//       <div className={`absolute inset-[16%] rounded-full border ${isDarkMode ? 'border-cyan-400/10' : 'border-fuchsia-300/40'} rotate-slow-reverse`} />
//       <div className={`absolute inset-[25%] rounded-full border ${isDarkMode ? 'border-indigo-400/10' : 'border-sky-300/40'} rotate-slow`} />

//       <div className="absolute inset-0 flex items-center justify-center">
//         <div className="globe-stage">
//           <div
//             className={`globe-sphere ${isDarkMode ? 'globe-dark' : 'globe-light'}`}
//           >
//             <div className="globe-grid globe-grid-1" />
//             <div className="globe-grid globe-grid-2" />
//             <div className="globe-glow" />

//             {globeNodes.map((node) => {
//               const active = activeNode === node.id;
//               return (
//                 <button
//                   key={node.id}
//                   onClick={() => onNodeClick(node.id)}
//                   className={`globe-node ${active ? 'globe-node-active' : ''}`}
//                   style={{
//                     left: `${node.x}%`,
//                     top: `${node.y}%`,
//                     transform: `translate(-50%, -50%) translateZ(${node.z}px)`,
//                   }}
//                   aria-label={node.label}
//                 >
//                   <span>{node.label}</span>
//                 </button>
//               );
//             })}

//             <div className="globe-core-ring globe-core-ring-1" />
//             <div className="globe-core-ring globe-core-ring-2" />
//           </div>
//         </div>
//       </div>

//       <div className="absolute top-[8%] left-[4%] sm:left-[0%] glass-panel p-4 sm:p-5 w-[160px] sm:w-[190px] floating-soft">
//         <p className={`text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] ${isDarkMode ? 'text-cyan-300' : 'text-fuchsia-700'}`}>
//           Global Feel
//         </p>
//         <h3 className={`text-base sm:text-lg font-black mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
//           Trade Universe
//         </h3>
//         <p className={`text-xs sm:text-sm mt-2 leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
//           A world-class gateway experience that visually communicates scale and connection.
//         </p>
//       </div>

//       <div className="absolute bottom-[9%] right-[2%] sm:right-[0%] glass-panel p-4 sm:p-5 w-[170px] sm:w-[205px] floating">
//         <p className={`text-[11px] sm:text-xs font-semibold uppercase tracking-[0.25em] ${isDarkMode ? 'text-cyan-300' : 'text-fuchsia-700'}`}>
//           Investor View
//         </p>
//         <h3 className={`text-base sm:text-lg font-black mt-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
//           Structured Growth
//         </h3>
//         <p className={`text-xs sm:text-sm mt-2 leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
//           Built to present TradeEthiopia as a serious digital ecosystem with premium business potential.
//         </p>
//       </div>
//     </div>
//   );
// }

export default function Home() {
  const router = useRouter();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isThemeManagedBySystem, setIsThemeManagedBySystem] = useState(true);
  const [activeNode, setActiveNode] = useState('b2b');
  const [activeModal, setActiveModal] = useState(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const heroMotionRef = useRef(null);
  const heroFrameRef = useRef(null);

  const valueRef = useReveal();
  const ecosystemRef = useReveal();
  const pricingRef = useReveal();
  const ctaRef = useReveal();

  useEffect(() => {
    document.body.classList.remove('dark-mode', 'light-mode');
    document.body.classList.add(isDarkMode ? 'dark-mode' : 'light-mode');
  }, [isDarkMode]);

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
      setIsDarkMode(false);
      return undefined;
    }

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applySystemTheme = () => {
      if (isThemeManagedBySystem) {
        setIsDarkMode(mediaQuery.matches);
      }
    };

    applySystemTheme();

    if (typeof mediaQuery.addEventListener === 'function') {
      mediaQuery.addEventListener('change', applySystemTheme);
      return () => mediaQuery.removeEventListener('change', applySystemTheme);
    }

    mediaQuery.addListener(applySystemTheme);
    return () => mediaQuery.removeListener(applySystemTheme);
  }, [isThemeManagedBySystem]);

  useEffect(() => {
    const updateViewportMode = () => {
      setIsMobileViewport(window.innerWidth < 768);
    };

    updateViewportMode();
    window.addEventListener('resize', updateViewportMode);
    return () => window.removeEventListener('resize', updateViewportMode);
  }, []);

  useEffect(() => {
    if (isMobileViewport) return undefined;

    const interval = setInterval(() => {
      setActiveNode((prev) => {
        const currentIndex = sectorEcosystem.findIndex((item) => item.id === prev);
        const nextIndex = (currentIndex + 1) % sectorEcosystem.length;
        return sectorEcosystem[nextIndex].id;
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [isMobileViewport]);

  useEffect(() => {
    if (isMobileViewport) {
      heroMotionRef.current?.style.setProperty('--hero-translate', 'translate3d(0, 0, 0)');
      return undefined;
    }

    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 18;
      const y = (e.clientY / window.innerHeight - 0.5) * 18;
      if (heroFrameRef.current) {
        cancelAnimationFrame(heroFrameRef.current);
      }

      heroFrameRef.current = window.requestAnimationFrame(() => {
        heroMotionRef.current?.style.setProperty('--hero-translate', `translate3d(${x}px, ${y}px, 0)`);
      });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (heroFrameRef.current) {
        cancelAnimationFrame(heroFrameRef.current);
      }
    };
  }, [isMobileViewport]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      document.documentElement.style.setProperty('--hero-shift', `${scrollY * 0.12}px`);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const openSectorModal = (id) => {
    const sector = sectorEcosystem.find((item) => item.id === id);
    setActiveNode(id);
    setActiveModal(sector || null);
  };

  return (
    <>
      <Head>
        <title>TradeEthiopia | All is There</title>
        <meta
          name="description"
          content="A futuristic, investor-ready gateway for the TradeEthiopia Business Group ecosystem."
        />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="color-scheme" content={isDarkMode ? 'dark' : 'light'} />
      </Head>

      <style jsx global>{`
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        html {
          scroll-behavior: smooth;
        }

        body {
          transition: background 0.8s ease, color 0.8s ease;
        }

        body.dark-mode {
          background: #050816;
          color: #e5e7eb;
          font-family: 'Space Grotesk', sans-serif;
        }

        body.light-mode {
          background:
            radial-gradient(circle at top left, rgba(236,72,153,0.12), transparent 28%),
            radial-gradient(circle at top right, rgba(59,130,246,0.12), transparent 28%),
            linear-gradient(135deg, #ffffff 0%, #fdf4ff 45%, #eef6ff 100%);
          color: #0f172a;
          font-family: 'Inter', sans-serif;
          background-attachment: fixed;
        }

        ::-webkit-scrollbar {
          width: 12px;
        }

        ::-webkit-scrollbar-thumb {
          border-radius: 999px;
        }

        body.dark-mode ::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.45);
        }

        body.dark-mode ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #6366f1, #22d3ee);
        }

        body.light-mode ::-webkit-scrollbar-track {
          background: rgba(226, 232, 240, 0.7);
        }

        body.light-mode ::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, #d946ef, #fb7185);
        }

        @keyframes floatY {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-14px); }
        }

        @keyframes floatSoft {
          0%, 100% { transform: translateY(0) scale(1); }
          50% { transform: translateY(-18px) scale(1.02); }
        }

        @keyframes rotateSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes rotateSlowReverse {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes fadeUp {
          from {
            opacity: 0;
            transform: translateY(42px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes particleFloat {
          0%, 100% {
            transform: translate3d(0, 0, 0);
            opacity: 0.15;
          }
          50% {
            transform: translate3d(0, -22px, 0);
            opacity: 0.45;
          }
        }

        @keyframes pulseRing {
          0% {
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.4;
          }
          80% {
            transform: translate(-50%, -50%) scale(1.28);
            opacity: 0;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.3);
            opacity: 0;
          }
        }

        @keyframes gridSpinX {
          from { transform: rotateX(75deg) rotateZ(0deg); }
          to { transform: rotateX(75deg) rotateZ(360deg); }
        }

        @keyframes gridSpinY {
          from { transform: rotateY(80deg) rotateZ(0deg); }
          to { transform: rotateY(80deg) rotateZ(360deg); }
        }

        .floating {
          animation: floatY 6s ease-in-out infinite;
        }

        .floating-soft {
          animation: floatSoft 9s ease-in-out infinite;
        }

        .rotate-slow {
          animation: rotateSlow 22s linear infinite;
        }

        .rotate-slow-reverse {
          animation: rotateSlowReverse 20s linear infinite;
        }

        .floating-particle {
          animation: particleFloat linear infinite;
          filter: blur(0.3px);
        }

        .reveal {
          opacity: 0;
          transform: translateY(56px);
          transition: opacity 0.9s ease, transform 0.9s ease;
        }

        .reveal.revealed {
          opacity: 1;
          transform: translateY(0);
        }

        .glass-dark {
          background: rgba(8, 14, 28, 0.55);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .glass-light {
          background: rgba(255, 255, 255, 0.68);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.78);
        }

        .glass-panel {
          background: rgba(255,255,255,0.08);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          border: 1px solid rgba(255,255,255,0.12);
          border-radius: 1.5rem;
          box-shadow: 0 20px 70px rgba(0,0,0,0.16);
        }

        body.light-mode .glass-panel {
          background: rgba(255,255,255,0.72);
          border: 1px solid rgba(255,255,255,0.86);
        }

        .card-hover {
          transition: transform 0.35s ease, box-shadow 0.35s ease, border-color 0.35s ease;
        }

        .card-hover:hover {
          transform: translateY(-8px) scale(1.01);
          box-shadow: 0 24px 60px rgba(0,0,0,0.16);
        }

        .glow-hover:hover {
          box-shadow: 0 0 38px rgba(99,102,241,0.3);
        }

        .hero-perspective {
          perspective: 1400px;
        }

        .globe-stage {
          width: min(78vw, 420px);
          height: min(78vw, 420px);
          display: flex;
          align-items: center;
          justify-content: center;
          perspective: 1200px;
        }

        .globe-sphere {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 999px;
          transform-style: preserve-3d;
          transform: rotateX(16deg) rotateY(-18deg);
          box-shadow:
            inset -40px -40px 80px rgba(0,0,0,0.22),
            inset 20px 20px 50px rgba(255,255,255,0.03),
            0 30px 80px rgba(0,0,0,0.28);
          overflow: hidden;
        }

        .globe-dark {
          background:
            radial-gradient(circle at 30% 28%, rgba(255,255,255,0.12), transparent 18%),
            radial-gradient(circle at 70% 70%, rgba(34,211,238,0.12), transparent 24%),
            linear-gradient(140deg, #0f172a 0%, #172554 42%, #0f172a 100%);
          border: 1px solid rgba(255,255,255,0.08);
        }

        .globe-light {
          background:
            radial-gradient(circle at 30% 28%, rgba(255,255,255,0.7), transparent 18%),
            radial-gradient(circle at 70% 70%, rgba(217,70,239,0.12), transparent 24%),
            linear-gradient(140deg, #ffffff 0%, #eef2ff 42%, #fdf4ff 100%);
          border: 1px solid rgba(255,255,255,0.78);
        }

        .globe-grid {
          position: absolute;
          inset: 8%;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.12);
          transform-style: preserve-3d;
        }

        .globe-grid-1 {
          animation: gridSpinX 18s linear infinite;
        }

        .globe-grid-2 {
          animation: gridSpinY 20s linear infinite;
        }

        .globe-glow {
          position: absolute;
          inset: 10%;
          border-radius: 999px;
          background: radial-gradient(circle at 50% 50%, rgba(99,102,241,0.12), transparent 62%);
          filter: blur(10px);
        }

        .globe-core-ring {
          position: absolute;
          left: 50%;
          top: 50%;
          width: 18%;
          height: 18%;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          pointer-events: none;
        }

        .globe-core-ring-1 {
          animation: pulseRing 2.6s ease-out infinite;
        }

        .globe-core-ring-2 {
          animation: pulseRing 2.6s ease-out 1.2s infinite;
        }

        .globe-node {
          position: absolute;
          min-width: 64px;
          padding: 0.45rem 0.75rem;
          border-radius: 999px;
          border: 1px solid rgba(255,255,255,0.14);
          background: rgba(255,255,255,0.08);
          color: white;
          font-size: 0.72rem;
          font-weight: 800;
          letter-spacing: 0.02em;
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          box-shadow: 0 10px 28px rgba(0,0,0,0.18);
          transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
          z-index: 4;
        }

        .globe-node:hover,
        .globe-node-active {
          transform: translate(-50%, -50%) translateZ(54px) scale(1.06) !important;
          box-shadow: 0 0 26px rgba(99,102,241,0.42);
          background: rgba(99,102,241,0.24);
        }

        body.light-mode .globe-node {
          color: #0f172a;
          background: rgba(255,255,255,0.76);
          border: 1px solid rgba(255,255,255,0.9);
        }

        body.light-mode .globe-node:hover,
        body.light-mode .globe-node-active {
          background: rgba(236,72,153,0.12);
          box-shadow: 0 0 22px rgba(217,70,239,0.22);
        }

        @media (max-width: 640px) {
          .globe-stage {
            width: min(88vw, 330px);
            height: min(88vw, 330px);
          }

          .globe-node {
            min-width: 54px;
            padding: 0.36rem 0.58rem;
            font-size: 0.62rem;
          }
        }
      `}</style>

      <main
        className={`relative min-h-screen overflow-hidden ${isDarkMode ? 'bg-slate-950 text-white' : 'text-slate-900'}`}
      >
        <ParticleBackground isDarkMode={isDarkMode} />

        {isDarkMode ? (
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 left-1/4 w-[26rem] h-[26rem] bg-indigo-600/20 rounded-full blur-3xl floating-soft" />
            <div className="absolute top-1/3 right-[-4rem] w-[22rem] h-[22rem] bg-cyan-500/16 rounded-full blur-3xl floating" />
            <div className="absolute bottom-[-6rem] left-1/3 w-[28rem] h-[28rem] bg-fuchsia-500/10 rounded-full blur-3xl floating-soft" />
          </div>
        ) : (
          <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 left-[-2rem] w-[24rem] h-[24rem] bg-fuchsia-300/30 rounded-full blur-3xl floating-soft" />
            <div className="absolute top-1/3 right-[-4rem] w-[22rem] h-[22rem] bg-sky-300/28 rounded-full blur-3xl floating" />
            <div className="absolute bottom-[-6rem] left-1/3 w-[26rem] h-[26rem] bg-violet-200/30 rounded-full blur-3xl floating-soft" />
          </div>
        )}

        <header
          className={`sticky top-0 z-50 border-b ${
            isDarkMode
              ? 'border-white/10 bg-slate-950/70 backdrop-blur-xl'
              : 'border-slate-200/60 bg-white/60 backdrop-blur-xl'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-lg ${
                  isDarkMode
                    ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white'
                    : 'bg-gradient-to-br from-fuchsia-500 via-rose-500 to-orange-400 text-white'
                }`}
              >
                TE
              </div>
              <div className="min-w-0">
                <p className="font-black text-base sm:text-lg truncate">TradeEthiopia</p>
                <p className={`text-xs sm:text-sm font-medium truncate ${isDarkMode ? 'text-indigo-300' : 'text-fuchsia-700'}`}>
                  Investor Pitch Gateway
                </p>
              </div>
            </div>

            <nav className="hidden lg:flex items-center gap-7">
              {navItems.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className={`text-sm font-semibold transition-colors ${
                    isDarkMode ? 'text-slate-300 hover:text-white' : 'text-slate-700 hover:text-slate-950'
                  }`}
                >
                  {item.name}
                </a>
              ))}
            </nav>

            <div className="flex items-center gap-2 sm:gap-3">
              <button
                onClick={() => {
                  setIsThemeManagedBySystem(false);
                  setIsDarkMode((prev) => !prev);
                }}
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg ${
                  isDarkMode ? 'bg-white/5 text-yellow-300' : 'bg-slate-900 text-white'
                }`}
                aria-label="Toggle theme"
              >
                {isDarkMode ? '🌙' : '☀️'}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen((prev) => !prev)}
                className={`lg:hidden w-11 h-11 rounded-2xl flex items-center justify-center ${
                  isDarkMode ? 'bg-white/5 text-white' : 'bg-white border border-slate-200 text-slate-900'
                }`}
                aria-label="Menu"
              >
                ☰
              </button>

              <button
                onClick={() => router.push('/signup')}
                className={`hidden sm:inline-flex px-5 py-3 rounded-2xl text-sm font-bold ${
                  isDarkMode
                    ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white'
                    : 'bg-gradient-to-r from-fuchsia-500 via-rose-500 to-orange-400 text-white'
                }`}
              >
                Sign Up
              </button>
            </div>
          </div>

          {isMobileMenuOpen && (
            <div className={`lg:hidden border-t px-4 sm:px-6 py-4 ${isDarkMode ? 'border-white/10 bg-slate-950/95' : 'border-slate-200 bg-white/95'}`}>
              <div className="flex flex-col gap-4">
                {navItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`text-sm font-semibold ${isDarkMode ? 'text-slate-200' : 'text-slate-800'}`}
                  >
                    {item.name}
                  </a>
                ))}
              </div>
            </div>
          )}
        </header>

        <section id="gateway" className="relative z-10 px-4 sm:px-6 pt-10 sm:pt-16 pb-12 sm:pb-28">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col xl:grid xl:grid-cols-2 gap-8 sm:gap-12 lg:gap-16 items-center min-h-[auto] xl:min-h-[82vh]">
              <div className="space-y-8 reveal revealed">
                <div className="space-y-5">
                  <span
                    className={`inline-flex px-4 py-2 rounded-full text-xs sm:text-sm font-semibold border ${
                      isDarkMode
                        ? 'bg-indigo-500/10 text-indigo-300 border-indigo-400/20'
                        : 'bg-white/80 text-fuchsia-700 border-fuchsia-200'
                    }`}
                  >
                    Futuristic Business Group Experience
                  </span>

                  <h1 className={`text-3xl sm:text-5xl lg:text-7xl font-black leading-[1.02] ${isDarkMode ? 'text-white' : 'text-slate-950'}`}>
                    Everything
                    <br />
                    <span
                      className={`text-transparent bg-clip-text ${
                        isDarkMode
                          ? 'bg-gradient-to-r from-indigo-400 via-cyan-400 to-blue-400'
                          : 'bg-gradient-to-r from-fuchsia-600 via-rose-500 to-orange-500'
                      }`}
                    >
                      you need
                    </span>
                    <br />
                    is here
                  </h1>

                  <p className={`max-w-2xl text-base sm:text-lg lg:text-xl leading-8 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    All the platforms, partnerships, and opportunities your business needs to thrive—in one connected ecosystem.
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    type="button"
                    onClick={() => router.push('/marketplace')}
                    className={`px-7 py-4 rounded-2xl font-bold ${
                      isDarkMode
                        ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white'
                        : 'bg-gradient-to-r from-fuchsia-500 via-rose-500 to-orange-400 text-white'
                    }`}
                  >
                    Explore Ecosystem →
                  </button>
                  <button
                    className={`px-7 py-4 rounded-2xl font-bold border ${
                      isDarkMode
                        ? 'border-white/12 text-white bg-white/5'
                        : 'border-slate-300 text-slate-900 bg-white/70'
                    }`}
                  >
                    Investor Overview
                  </button>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {pitchStats.map((stat) => (
                    <div
                      key={stat.label}
                      className={`${isDarkMode ? 'glass-dark' : 'glass-light shadow-sm'} rounded-[1.4rem] p-4`}
                    >
                      <p className={`text-2xl sm:text-3xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                        {stat.value}
                      </p>
                      <p className={`text-xs sm:text-sm mt-1 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        {stat.label}
                      </p>
                    </div>
                  ))}
                </div>


              </div>

              <div
                ref={heroMotionRef}
                className="hero-perspective w-full transition-transform duration-300"
                style={{
                  transform: 'var(--hero-translate, translate3d(0, 0, 0)) translateY(var(--hero-shift, 0px))',
                }}
              >
<div className="w-full max-w-[620px] h-auto min-h-[320px] sm:h-[540px]">
  <NetworkCore
    activeNode={activeNode}
    isDarkMode={isDarkMode}
    onNodeSelect={openSectorModal}
  />
</div>
              </div>
            </div>
          </div>
        </section>

        <section id="vision" ref={valueRef} className="relative z-10 px-4 sm:px-6 py-14 sm:py-24 reveal">
          <div className="max-w-7xl mx-auto">
            <SectionHeading
              isDarkMode={isDarkMode}
              badge="Investor Pitch Layer"
              title="Positioned to communicate more than features."
              text="This presentation style helps communicate direction, structure, business range and digital maturity — which is exactly what makes a stronger investor-facing experience."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-14">
              {investorPillars.map((item, idx) => (
                <div
                  key={item.title}
                  className={`${isDarkMode ? 'glass-dark' : 'glass-light shadow-sm'} rounded-[2rem] p-7 sm:p-8 card-hover glow-hover`}
                  style={{ transitionDelay: `${idx * 0.06}s` }}
                >
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-5 font-black ${
                      isDarkMode
                        ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white'
                        : 'bg-gradient-to-br from-fuchsia-500 to-orange-400 text-white'
                    }`}
                  >
                    0{idx + 1}
                  </div>

                  <h3 className={`text-xl font-black mb-3 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {item.title}
                  </h3>

                  <p className={`text-sm sm:text-base leading-7 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {item.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="ecosystem" ref={ecosystemRef} className="relative z-10 px-4 sm:px-6 py-20 sm:py-24 reveal">
          <div className="max-w-7xl mx-auto">
            <SectionHeading
              isDarkMode={isDarkMode}
              badge="TradeEthiopia Ecosystem"
              title="Multiple platforms. One premium business universe."
              text="Every platform adds a different layer of value to the business group presence — education, visibility, employment, expo, media and digital trade infrastructure."
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-14">
              {sectorEcosystem.map((sector) => (
                <button
                  key={sector.id}
                  onClick={() => openSectorModal(sector.id)}
                  className={`${isDarkMode ? 'glass-dark' : 'glass-light shadow-sm'} rounded-[2rem] p-6 sm:p-7 text-left card-hover glow-hover`}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl ${
                        isDarkMode ? 'bg-white/8 border border-white/10' : 'bg-white border border-white/90'
                      }`}
                    >
                      {sector.icon}
                    </div>

                    <span
                      className={`text-xs font-bold px-3 py-2 rounded-full ${
                        isDarkMode ? 'bg-indigo-500/10 text-indigo-300' : 'bg-fuchsia-100 text-fuchsia-700'
                      }`}
                    >
                      Connected
                    </span>
                  </div>

                  <div className="mt-5">
                    <h3 className={`text-2xl font-black mb-2 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {sector.title}
                    </h3>
                    <p className={`text-sm font-semibold mb-3 ${isDarkMode ? 'text-indigo-300' : 'text-fuchsia-700'}`}>
                      {sector.subtitle}
                    </p>
                    <p className={`text-sm sm:text-base leading-7 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                      {sector.description}
                    </p>
                  </div>

                  <div className="mt-6 flex items-center justify-between">
                    <span className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Investor-view storytelling
                    </span>
                    <span className={`text-sm font-bold ${isDarkMode ? 'text-cyan-300' : 'text-fuchsia-700'}`}>
                      Open →
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </section>


        <section id="pricing" ref={pricingRef} className="relative z-10 px-4 sm:px-6 py-20 sm:py-24 reveal">
          <div className="max-w-7xl mx-auto">
            <SectionHeading
              isDarkMode={isDarkMode}
              badge="Subscription Layer"
              title="Business depth that strengthens the whole presentation."
              text="Adding pricing and access layers makes the experience feel more complete, more productized and more investment-ready."
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-14">
              {pricingPlans.map((plan) => (
                <div
                  key={plan.name}
                  className={`rounded-[2rem] p-7 sm:p-8 card-hover ${
                    plan.featured
                      ? isDarkMode
                        ? 'bg-gradient-to-br from-indigo-600/16 to-cyan-600/10 border border-indigo-400/25 backdrop-blur-xl'
                        : 'bg-gradient-to-br from-fuchsia-100 to-orange-50 border border-fuchsia-200'
                      : isDarkMode
                      ? 'glass-dark'
                      : 'glass-light shadow-sm'
                  }`}
                >
                  {plan.featured && (
                    <span
                      className={`inline-flex px-3 py-2 rounded-full text-xs font-bold mb-6 ${
                        isDarkMode ? 'bg-cyan-400/12 text-cyan-300' : 'bg-fuchsia-600 text-white'
                      }`}
                    >
                      Recommended
                    </span>
                  )}

                  <h3 className={`text-2xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`mt-3 text-sm leading-6 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {plan.description}
                  </p>

                  <div className="mt-8 mb-8">
                    <span className={`text-4xl font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      {plan.price}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature} className="flex items-start gap-3">
                        <span className={isDarkMode ? 'text-cyan-300' : 'text-fuchsia-700'}>✦</span>
                        <p className={`text-sm sm:text-base ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                          {feature}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    className={`mt-8 w-full py-4 rounded-2xl font-bold ${
                      plan.featured
                        ? isDarkMode
                          ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white'
                          : 'bg-gradient-to-r from-fuchsia-500 via-rose-500 to-orange-400 text-white'
                        : isDarkMode
                        ? 'bg-white/5 text-white border border-white/10'
                        : 'bg-white text-slate-900 border border-slate-200'
                    }`}
                  >
                    Choose Plan
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="contact" ref={ctaRef} className="relative z-10 px-4 sm:px-6 py-20 sm:py-24 reveal">
          <div className="max-w-6xl mx-auto">
            <div
              className={`rounded-[2.25rem] p-8 sm:p-12 lg:p-14 text-center ${
                isDarkMode
                  ? 'bg-gradient-to-br from-indigo-600/15 via-slate-900/60 to-cyan-600/10 border border-indigo-400/20 backdrop-blur-xl'
                  : 'bg-gradient-to-br from-white to-fuchsia-50 border border-white/70 shadow-sm'
              }`}
            >
              <span
                className={`inline-flex px-4 py-2 rounded-full text-xs sm:text-sm font-semibold mb-5 ${
                  isDarkMode ? 'bg-white/5 text-cyan-300' : 'bg-fuchsia-100 text-fuchsia-700'
                }`}
              >
                Final investor-facing impression
              </span>

              <h2 className={`text-3xl sm:text-4xl lg:text-5xl font-black leading-tight ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                TradeEthiopia presented
                <br />
                as a serious digital universe.
              </h2>

              <p className={`max-w-2xl mx-auto mt-5 text-sm sm:text-base lg:text-lg leading-8 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                This experience is designed to attract attention, communicate confidence and help people immediately feel the scale and promise of the TradeEthiopia Business Group ecosystem.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
                <button
                  className={`px-7 py-4 rounded-2xl font-bold ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white'
                      : 'bg-gradient-to-r from-fuchsia-500 via-rose-500 to-orange-400 text-white'
                  }`}
                >
                  Enter TradeEthiopia →
                </button>
                <button
                  className={`px-7 py-4 rounded-2xl font-bold border ${
                    isDarkMode
                      ? 'border-white/10 text-white bg-white/5'
                      : 'border-slate-300 text-slate-900 bg-white'
                  }`}
                >
                  Request Presentation
                </button>
              </div>
            </div>
          </div>
        </section>

        <footer className={`relative z-10 border-t ${isDarkMode ? 'border-white/10' : 'border-slate-200'}`}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black ${
                      isDarkMode
                        ? 'bg-gradient-to-br from-indigo-500 to-cyan-500 text-white'
                        : 'bg-gradient-to-br from-fuchsia-500 via-rose-500 to-orange-400 text-white'
                    }`}
                  >
                    TE
                  </div>
                  <div>
                    <p className={`font-black ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>
                      TradeEthiopia
                    </p>
                    {/* <p className={`text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                      Investor Pitch Gateway
                    </p> */}
                  </div>
                </div>
                <p className={`text-sm leading-7 ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  A premium digital experience built to communicate connection, scale, innovation and business potential.
                </p>
              </div>

              <div>
                <h4 className={`font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Gateway</h4>
                <ul className={`space-y-3 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <li><a href="#gateway">Overview</a></li>
                  <li><a href="#ecosystem">Ecosystem</a></li>
                  <li><a href="#vision">Vision</a></li>
                </ul>
              </div>

              <div>
                <h4 className={`font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Business</h4>
                <ul className={`space-y-3 text-sm ${isDarkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                  <li><a href="#pricing">Pricing</a></li>
                  <li><a href="#contact">Contact</a></li>
                  <li><a href="#ecosystem">Platforms</a></li>
                </ul>
              </div>

              <div>
                <h4 className={`font-black mb-4 ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>Presence</h4>
                <div className="flex gap-3">
                  {['f', 'x', 'in'].map((item) => (
                    <button
                      key={item}
                      className={`w-11 h-11 rounded-2xl font-bold ${
                        isDarkMode
                          ? 'bg-white/5 text-white border border-white/10'
                          : 'bg-white text-slate-900 border border-slate-200'
                      }`}
                    >
                      {item}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div
              className={`mt-10 pt-8 border-t text-sm text-center ${
                isDarkMode ? 'border-white/10 text-slate-400' : 'border-slate-200 text-slate-500'
              }`}
            >
              © 2026 TradeEthiopia. All rights reserved.
            </div>
          </div>
        </footer>

        {activeModal && (
          <div className="fixed inset-0 z-[999] flex items-center justify-center px-4 bg-black/60 backdrop-blur-lg">
            <div
              className={`w-full max-w-xl rounded-[2rem] p-7 sm:p-8 ${
                isDarkMode ? 'bg-slate-900 text-white border border-white/10' : 'bg-white text-slate-900 border border-slate-200'
              } shadow-2xl`}
            >
              <div className="flex justify-between items-start gap-4 mb-6">
                <div>
                  <h3 className="text-2xl sm:text-3xl font-black flex items-center gap-3">
                    <span className="text-3xl">{activeModal.icon}</span>
                    {activeModal.title}
                  </h3>
                  <p className={`mt-2 text-sm font-semibold ${isDarkMode ? 'text-indigo-300' : 'text-fuchsia-700'}`}>
                    {activeModal.subtitle}
                  </p>
                </div>

                <button
                  onClick={() => setActiveModal(null)}
                  className={`w-10 h-10 rounded-xl font-bold ${
                    isDarkMode ? 'bg-white/5 text-white' : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  ✕
                </button>
              </div>

              <p className={`text-sm sm:text-base leading-7 ${isDarkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                {activeModal.description}
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => router.push('/signup')}
                  className={`px-6 py-4 rounded-2xl font-bold ${
                    isDarkMode
                      ? 'bg-gradient-to-r from-indigo-600 to-cyan-600 text-white'
                      : 'bg-gradient-to-r from-fuchsia-500 via-rose-500 to-orange-400 text-white'
                  }`}
                >
                  Get in Touch →
                </button>

                <button
                  onClick={() => setActiveModal(null)}
                  className={`px-6 py-4 rounded-2xl font-bold border ${
                    isDarkMode ? 'border-white/10 text-white bg-white/5' : 'border-slate-300 text-slate-900 bg-white'
                  }`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

    </>
  );
}
