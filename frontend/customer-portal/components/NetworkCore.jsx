import { useEffect, useMemo, useState } from 'react';

const nodes = [
  { id: 'b2b', label: 'B2B', angle: 0, stat: 'Digital Trade' },
  { id: 'tesbinn', label: 'Tesbinn', angle: 60, stat: 'Learning Hub' },
  { id: 'enisra', label: 'Enisra', angle: 120, stat: 'AI Matching' },
  { id: 'expo', label: 'Expo', angle: 180, stat: 'Global Showcase' },
  { id: 'tv', label: 'TV', angle: 240, stat: 'Media Layer' },
  { id: 'buna', label: 'Buna', angle: 300, stat: 'Coffee Brand' },
];

export default function NetworkCore({ onNodeSelect, isDarkMode = true }) {
  const [rotation, setRotation] = useState(0);
  const [active, setActive] = useState('b2b');
  const [hovered, setHovered] = useState(null);
  const [themePulse, setThemePulse] = useState(false);
  const [introReady, setIntroReady] = useState(false);
  const [stats, setStats] = useState({
    platforms: 6,
    uptime: 24,
    reach: 360,
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((value) => value + 0.22);
    }, 30);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setIntroReady(true), 80);
    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setStats((prev) => ({
        platforms: 6,
        uptime: prev.uptime === 24 ? 25 : 24,
        reach: prev.reach >= 360 ? 356 : prev.reach + 1,
      }));
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setThemePulse(true);
    const timeout = setTimeout(() => setThemePulse(false), 900);
    return () => clearTimeout(timeout);
  }, [isDarkMode]);

  const particles = useMemo(
    () =>
      Array.from({ length: isDarkMode ? 22 : 18 }).map((_, index) => ({
        id: index,
        left: 8 + Math.random() * 84,
        top: 10 + Math.random() * 78,
        delay: Math.random() * 5,
        size: 2 + Math.random() * 4,
        duration: 6 + Math.random() * 4,
      })),
    [isDarkMode]
  );

  const primaryRadius = isDarkMode ? 170 : 158;
  const secondaryRadius = isDarkMode ? 118 : 132;

  const palette = isDarkMode
    ? {
        shell: 'from-slate-950 via-indigo-900 to-cyan-800',
        glowA: 'bg-cyan-400/12',
        glowB: 'bg-indigo-500/12',
        ringA: 'border-indigo-400/14',
        ringB: 'border-cyan-300/12',
        ringC: 'border-white/6',
        dashedA: 'border-white/6',
        dashedB: 'border-cyan-300/10',
        chipBg: 'rgba(10,16,35,0.64)',
        chipBorder: 'rgba(255,255,255,0.08)',
        chipText: 'text-cyan-300',
        card: 'bg-indigo-600 text-white border-indigo-400/30',
        cardActive: 'bg-cyan-300 text-slate-950 border-cyan-100',
        cardShadow: '0 0 20px rgba(99,102,241,0.24)',
        activeShadow: '0 0 28px rgba(34,211,238,0.42)',
        center: 'from-indigo-700 via-violet-700 to-cyan-500',
        centerGlow: 'bg-white/10',
        particle: 'bg-cyan-300/38',
      }
    : {
        shell: 'from-white via-sky-50 to-rose-50',
        glowA: 'bg-sky-300/42',
        glowB: 'bg-fuchsia-200/40',
        ringA: 'border-sky-500/52',
        ringB: 'border-fuchsia-400/42',
        ringC: 'border-slate-400/58',
        dashedA: 'border-slate-400/36',
        dashedB: 'border-sky-500/38',
        chipBg: 'rgba(255,255,255,0.78)',
        chipBorder: 'rgba(148,163,184,0.18)',
        chipText: 'text-sky-700',
        card: 'bg-white/56 text-slate-800 border-white/70',
        cardActive: 'bg-slate-950 text-white border-slate-900',
        cardShadow: '0 16px 30px rgba(148,163,184,0.18)',
        activeShadow: '0 18px 36px rgba(15,23,42,0.18)',
        center: 'from-white via-sky-100 to-fuchsia-100',
        centerGlow: 'bg-white/70',
        particle: 'bg-sky-400/18',
        orbitGlowA: '0 0 18px rgba(14,165,233,0.22), 0 0 56px rgba(186,230,253,0.22)',
        orbitGlowB: '0 0 20px rgba(217,70,239,0.2), 0 0 52px rgba(245,208,254,0.18)',
        orbitGlowC: '0 0 16px rgba(148,163,184,0.16), 0 0 34px rgba(255,255,255,0.16)',
        bubbleA: 'rgba(255,255,255,0.42)',
        bubbleB: 'rgba(186,230,253,0.28)',
        bubbleC: 'rgba(245,208,254,0.24)',
      };

  const cinematicPanels = useMemo(
    () =>
      isDarkMode
        ? []
        : [
            { id: 'panel-a', x: -188, y: -110, rotate: -14, w: 150, h: 84 },
            { id: 'panel-b', x: 176, y: 104, rotate: 12, w: 164, h: 92 },
          ],
    [isDarkMode]
  );

  const backgroundBubbles = useMemo(
    () =>
      isDarkMode
        ? []
        : [
            { id: 'bubble-a', size: 152, x: 158, y: -118, color: palette.bubbleA, blur: 26, opacity: 1 },
            { id: 'bubble-b', size: 126, x: 226, y: 98, color: palette.bubbleB, blur: 30, opacity: 0.95 },
            { id: 'bubble-c', size: 98, x: 54, y: 174, color: palette.bubbleC, blur: 24, opacity: 0.9 },
            { id: 'bubble-d', size: 86, x: -168, y: -138, color: palette.bubbleA, blur: 22, opacity: 0.8 },
          ],
    [isDarkMode, palette.bubbleA, palette.bubbleB, palette.bubbleC]
  );

  return (
    <div className="relative w-full h-[560px] flex items-center justify-center overflow-visible">
      <div className={`absolute w-[440px] h-[440px] rounded-full ${palette.glowA} blur-3xl transition-all duration-[1200ms] ease-out ${themePulse ? 'scale-[1.06] opacity-90' : ''} ${introReady ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />
      <div className={`absolute w-[310px] h-[310px] rounded-full ${palette.glowB} blur-3xl transition-all duration-[1200ms] ease-out ${themePulse ? 'scale-[1.08] opacity-90' : ''} ${introReady ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} />

      {!isDarkMode &&
        backgroundBubbles.map((bubble) => (
          <div
            key={bubble.id}
            className={`absolute rounded-full transition-all duration-[1300ms] ease-out ${introReady ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
            style={{
              width: `${bubble.size}px`,
              height: `${bubble.size}px`,
              transform: `translate(${bubble.x}px, ${bubble.y}px)`,
              background: `radial-gradient(circle at 32% 30%, rgba(255,255,255,0.92), ${bubble.color})`,
              filter: `blur(${bubble.blur}px)`,
              opacity: bubble.opacity,
            }}
          />
        ))}

      {!isDarkMode &&
        cinematicPanels.map((panel) => (
          <div
            key={panel.id}
            className="absolute rounded-[1.8rem] border border-white/60 bg-white/38 backdrop-blur-[24px] shadow-[0_22px_60px_rgba(148,163,184,0.15)] transition-all duration-[1200ms] ease-out"
            style={{
              width: `${panel.w}px`,
              height: `${panel.h}px`,
              transform: `translate(${panel.x}px, ${panel.y}px) rotate(${panel.rotate}deg)`,
            }}
          />
        ))}

      <div
        className={`absolute w-[390px] h-[390px] rounded-full border ${palette.ringA} animate-spin-slower transition-all duration-[1400ms] ease-out ${introReady ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        style={{
          boxShadow: !isDarkMode ? palette.orbitGlowA : undefined,
          background: !isDarkMode ? 'radial-gradient(circle, rgba(255,255,255,0) 60%, rgba(186,230,253,0.05) 100%)' : undefined,
        }}
      />
      <div
        className={`absolute w-[312px] h-[312px] rounded-full border ${palette.ringB} animate-spin-reverse-slower transition-all duration-[1500ms] ease-out ${introReady ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        style={{
          boxShadow: !isDarkMode ? palette.orbitGlowB : undefined,
          background: !isDarkMode ? 'radial-gradient(circle, rgba(255,255,255,0) 62%, rgba(245,208,254,0.05) 100%)' : undefined,
        }}
      />
      <div
        className={`absolute w-[232px] h-[232px] rounded-full border ${palette.ringC} transition-all duration-[1600ms] ease-out ${introReady ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}
        style={{
          boxShadow: !isDarkMode ? palette.orbitGlowC : undefined,
          background: !isDarkMode ? 'radial-gradient(circle, rgba(255,255,255,0.18), rgba(255,255,255,0.01) 76%)' : undefined,
        }}
      />
      <div
        className={`absolute w-[426px] h-[426px] rounded-full border border-dashed ${palette.dashedA} opacity-40 animate-orbit-drift transition-all duration-[1700ms] ease-out ${introReady ? 'scale-100' : 'scale-95 opacity-0'}`}
        style={{ filter: !isDarkMode ? 'drop-shadow(0 0 10px rgba(186,230,253,0.28))' : undefined }}
      />
      <div
        className={`absolute w-[344px] h-[344px] rounded-full border border-dashed ${palette.dashedB} opacity-50 animate-orbit-drift-reverse transition-all duration-[1800ms] ease-out ${introReady ? 'scale-100' : 'scale-95 opacity-0'}`}
        style={{ filter: !isDarkMode ? 'drop-shadow(0 0 10px rgba(245,208,254,0.22))' : undefined }}
      />

      <div className={`absolute w-24 h-24 rounded-full ${isDarkMode ? 'bg-cyan-400/16' : 'bg-sky-300/28'} animate-core-ping transition-all duration-[1200ms] ease-out ${introReady ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
      <div
        className={`absolute w-44 h-44 rounded-full border ${palette.ringB} animate-soft-pulse transition-all duration-[1400ms] ease-out ${introReady ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
        style={{ boxShadow: !isDarkMode ? '0 0 18px rgba(217,70,239,0.08)' : undefined }}
      />
      <div
        className={`absolute w-56 h-56 rounded-full border ${palette.ringA} animate-soft-pulse-delayed transition-all duration-[1600ms] ease-out ${introReady ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}
        style={{ boxShadow: !isDarkMode ? '0 0 18px rgba(14,165,233,0.08)' : undefined }}
      />

      <div className={`absolute top-[12%] left-[5%] z-20 transition-all duration-[900ms] ease-out ${introReady ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="rounded-[1.3rem] px-4 py-3 border backdrop-blur-xl shadow-[0_14px_36px_rgba(15,23,42,0.08)] transition-all duration-[900ms] ease-out" style={{ background: palette.chipBg, borderColor: palette.chipBorder }}>
          <p className={`text-[10px] uppercase tracking-[0.24em] mb-1 ${palette.chipText}`}>Gateway</p>
          <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats.platforms} Active Platforms</p>
        </div>
      </div>

      <div className={`absolute top-[18%] right-[5%] z-20 transition-all duration-[1000ms] ease-out ${introReady ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'}`}>
        <div className="rounded-[1.3rem] px-4 py-3 border backdrop-blur-xl shadow-[0_14px_36px_rgba(15,23,42,0.08)] transition-all duration-[900ms] ease-out" style={{ background: palette.chipBg, borderColor: palette.chipBorder }}>
          <p className={`text-[10px] uppercase tracking-[0.24em] mb-1 ${palette.chipText}`}>Reach</p>
          <p className={`text-sm font-bold ${isDarkMode ? 'text-white' : 'text-slate-900'}`}>{stats.reach} deg Network</p>
        </div>
      </div>

      <div className={`relative z-20 w-40 h-40 rounded-full overflow-hidden border shadow-[0_0_120px_rgba(103,232,249,0.18)] transition-all duration-[1400ms] ease-out ${themePulse ? 'scale-[1.03]' : ''} ${introReady ? 'opacity-100 scale-100 rotate-0' : 'opacity-0 scale-75 rotate-[-8deg]'}`} style={{ borderColor: palette.chipBorder }}>
        <div className={`absolute inset-0 bg-gradient-to-br ${palette.center} transition-all duration-[1200ms] ease-out`} />
        <div className={`absolute inset-[8%] rounded-full border ${isDarkMode ? 'border-white/10' : 'border-slate-200/80'} transition-all duration-[1200ms] ease-out`} />
        <div className={`absolute inset-[18%] rounded-full ${palette.centerGlow} blur-md transition-all duration-[1200ms] ease-out`} style={{ opacity: isDarkMode ? 1 : 0.58 }} />
        {!isDarkMode && <div className="absolute inset-x-[24%] top-[14%] h-[18%] rounded-full bg-white/70 blur-md transition-all duration-[1200ms] ease-out" />}
        <div className="absolute inset-0 flex items-center justify-center">
          <img
            src="/te-center.png"
            alt="TradeEthiopia emblem"
            className="h-[78%] w-[78%] object-contain drop-shadow-[0_10px_30px_rgba(255,215,120,0.28)]"
          />
        </div>
      </div>

      <div className={`absolute bottom-[17%] left-1/2 -translate-x-1/2 w-[220px] h-[26px] rounded-full ${isDarkMode ? 'bg-cyan-500/10' : 'bg-sky-200/45'} blur-xl transition-all duration-[1200ms] ease-out ${introReady ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />

      {nodes.slice(0, 3).map((node) => {
        const angle = ((node.angle * 1.35 - rotation * 0.45) * Math.PI) / 180;
        const x = Math.cos(angle) * secondaryRadius;
        const y = Math.sin(angle) * secondaryRadius;

        return (
          <div
            key={`secondary-${node.id}`}
            className="absolute z-10"
            style={{ transform: `translate(${x}px, ${y}px)` }}
          >
            <div
              className={`rounded-full ${isDarkMode ? 'bg-cyan-300/80' : 'bg-white'} shadow-[0_0_16px_rgba(125,211,252,0.75)] transition-all duration-[1200ms] ease-out ${introReady ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`}
              style={{
                width: isDarkMode ? '8px' : '12px',
                height: isDarkMode ? '8px' : '12px',
                boxShadow: isDarkMode
                  ? '0 0 16px rgba(125,211,252,0.75)'
                  : '0 0 20px rgba(255,255,255,0.95), 0 0 30px rgba(56,189,248,0.18)',
              }}
            />
          </div>
        );
      })}

      {nodes.map((node) => {
        const angle = ((node.angle + rotation) * Math.PI) / 180;
        const x = Math.cos(angle) * primaryRadius;
        const y = Math.sin(angle) * primaryRadius;
        const isActive = active === node.id;
        const isHovered = hovered === node.id;

        return (
          <div
            key={node.id}
            className="absolute z-30 group cursor-pointer"
            style={{ transform: `translate(${x}px, ${y}px)` }}
            onClick={() => {
              setActive(node.id);
              onNodeSelect?.(node.id);
            }}
            onMouseEnter={() => setHovered(node.id)}
            onMouseLeave={() => setHovered(null)}
          >
            <div
              className={`absolute left-1/2 w-2 h-2 -translate-x-1/2 rounded-full animate-flow-dot transition-colors duration-[900ms] ease-out ${
                isDarkMode ? (isActive ? 'bg-cyan-300' : 'bg-indigo-300') : isActive ? 'bg-slate-900' : 'bg-sky-400'
              }`}
              style={{
                top: `-${primaryRadius}px`,
                boxShadow: isDarkMode
                  ? isActive
                    ? '0 0 16px rgba(34,211,238,1)'
                    : '0 0 12px rgba(129,140,248,0.8)'
                  : isActive
                  ? '0 0 12px rgba(15,23,42,0.4)'
                  : '0 0 16px rgba(56,189,248,0.28)',
              }}
            />

            <div
              className={`relative rounded-full font-bold transition-all duration-[900ms] ease-out border ${
                isActive ? palette.cardActive : palette.card
              } ${isHovered ? 'scale-110' : ''}`}
              style={{
                boxShadow: isActive ? palette.activeShadow : palette.cardShadow,
                backdropFilter: isDarkMode ? 'blur(0px)' : 'blur(14px)',
                fontSize: isDarkMode ? '12px' : '11px',
                letterSpacing: isDarkMode ? '0' : '0.08em',
                padding: isDarkMode ? '0.5rem 1rem' : '0.42rem 0.82rem',
              }}
            >
              {node.label}
            </div>

            {(isHovered || isActive) && (
              <div className="absolute left-1/2 -translate-x-1/2 top-12 w-max max-w-[170px] z-50 pointer-events-none">
                <div
                  className="px-3 py-2 rounded-xl text-center border backdrop-blur-xl"
                  style={{
                    background: palette.chipBg,
                    borderColor: palette.chipBorder,
                    boxShadow: isDarkMode ? '0 14px 30px rgba(0,0,0,0.24)' : '0 12px 26px rgba(148,163,184,0.18)',
                  }}
                >
                  <p className={`text-[11px] font-semibold ${isDarkMode ? 'text-white' : 'text-slate-800'}`}>{node.stat}</p>
                </div>
              </div>
            )}
          </div>
        );
      })}

      <div className="absolute inset-0 pointer-events-none">
        {particles.map((particle) => (
          <span
            key={particle.id}
            className={`absolute rounded-full ${palette.particle} animate-float-particle transition-all duration-[1200ms] ease-out ${introReady ? 'opacity-100' : 'opacity-0'}`}
            style={{
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              left: `${particle.left}%`,
              top: `${particle.top}%`,
              animationDelay: `${particle.delay}s`,
              animationDuration: `${particle.duration}s`,
            }}
          />
        ))}
      </div>

      <style jsx>{`
        .animate-spin-slower {
          animation: spinSlow 34s linear infinite;
        }

        .animate-spin-reverse-slower {
          animation: spinReverseSlow 30s linear infinite;
        }

        .animate-soft-pulse {
          animation: softPulse 5.2s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .animate-soft-pulse-delayed {
          animation: softPulse 6.4s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .animate-core-ping {
          animation: corePing 4.6s cubic-bezier(0.22, 1, 0.36, 1) infinite;
        }

        .animate-orbit-drift {
          animation: orbitDrift 24s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .animate-orbit-drift-reverse {
          animation: orbitDriftReverse 28s cubic-bezier(0.4, 0, 0.2, 1) infinite;
        }

        .animate-float-particle {
          animation: floatParticle ease-in-out infinite;
        }

        .animate-flow-dot {
          animation: flowDot 2.8s linear infinite;
        }

        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @keyframes spinReverseSlow {
          from { transform: rotate(360deg); }
          to { transform: rotate(0deg); }
        }

        @keyframes softPulse {
          0%, 100% {
            transform: scale(1);
            opacity: 0.12;
          }
          50% {
            transform: scale(1.09);
            opacity: 0.26;
          }
        }

        @keyframes corePing {
          0% {
            transform: scale(0.84);
            opacity: 0.18;
          }
          72% {
            transform: scale(1.52);
            opacity: 0;
          }
          100% {
            transform: scale(1.52);
            opacity: 0;
          }
        }

        @keyframes orbitDrift {
          0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.24; }
          50% { transform: rotate(7deg) scale(1.02); opacity: 0.44; }
        }

        @keyframes orbitDriftReverse {
          0%, 100% { transform: rotate(0deg) scale(1); opacity: 0.24; }
          50% { transform: rotate(-8deg) scale(0.985); opacity: 0.44; }
        }

        @keyframes flowDot {
          0% {
            transform: translate(-50%, 0);
            opacity: 0;
          }
          18% {
            opacity: 1;
          }
          100% {
            transform: translate(-50%, ${primaryRadius}px);
            opacity: 0;
          }
        }

        @keyframes floatParticle {
          0%, 100% { transform: translateY(0px); opacity: 0.12; }
          50% { transform: translateY(-14px); opacity: 0.28; }
        }

      `}</style>
    </div>
  );
}
