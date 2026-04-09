import { useEffect, useMemo, useState } from 'react';

function resolveThemeClasses(isDarkMode) {
  if (isDarkMode) {
    return {
      page: 'bg-[#091018] text-[#F5E7C2]',
      background:
        'bg-[radial-gradient(circle_at_top_left,rgba(200,169,107,0.14),transparent_22%),radial-gradient(circle_at_top_right,rgba(31,50,69,0.38),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(200,169,107,0.08),transparent_26%),linear-gradient(180deg,#081018,#101A25)]',
      glowA: 'bg-[#C8A96B]/10',
      glowB: 'bg-[#1B2A38]/70',
      glowC: 'bg-[#A8823E]/10',
      shell: 'border-[#2A3644] bg-[#101922]/92 shadow-[0_28px_90px_rgba(0,0,0,0.45)]',
      shellGlow: 'bg-[#C8A96B]/10',
      panel: 'border-[#2A3644] bg-[linear-gradient(180deg,rgba(16,25,34,0.82),rgba(11,18,26,0.94))]',
      panelGlow: 'bg-[#C8A96B]/10',
      panelTitle: 'text-[#F8F4EA]',
      panelText: 'text-[#B5BDC8]',
      panelMuted: 'text-[#8D97A4]',
      panelCard: 'border-[#324153] bg-white/[0.03]',
      badge: 'border-[#C8A96B]/30 bg-[#C8A96B]/10 text-[#E7D3A5]',
      title: 'text-[#F8F4EA]',
      text: 'text-[#B5BDC8]',
      muted: 'text-[#8D97A4]',
      link: 'text-[#D4B06A] hover:text-[#E7C98D]',
      toggle: 'border-[#324153] bg-[#111B26] text-[#E7D3A5]',
      grid:
        '[background-image:linear-gradient(to_right,rgba(200,169,107,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(200,169,107,0.05)_1px,transparent_1px)]',
    };
  }

  return {
    page: 'bg-white text-[#111827]',
    background:
      'bg-[radial-gradient(circle_at_top_left,rgba(244,114,182,0.09),transparent_32%),radial-gradient(circle_at_top_right,rgba(96,165,250,0.09),transparent_32%),linear-gradient(135deg,#ffffff_0%,#fffafe_45%,#f8fbff_100%)]',
    glowA: 'bg-[#FBCFE8]/12',
    glowB: 'bg-[#BFDBFE]/10',
    glowC: 'bg-[#FCE7F3]/10',
    shell: 'border-white/90 bg-white/72 shadow-[0_24px_72px_rgba(15,23,42,0.07)]',
    shellGlow: 'bg-[#EEF2FF]/14',
    panel: 'border-white/90 bg-[linear-gradient(180deg,rgba(255,255,255,0.86),rgba(254,248,252,0.72)_55%,rgba(248,251,255,0.82))]',
    panelGlow: 'bg-[#FCE7F3]/12',
    panelTitle: 'text-[#111827]',
    panelText: 'text-[#475569]',
    panelMuted: 'text-[#64748B]',
    panelCard: 'border-white/82 bg-white/62',
    badge: 'border-[#F5D0FE] bg-white/94 text-[#C026D3]',
    title: 'text-[#111827]',
    text: 'text-[#475569]',
    muted: 'text-[#64748B]',
    link: 'text-[#C026D3] hover:text-[#DB2777]',
    toggle: 'border-white/90 bg-white/96 text-[#7C3AED]',
    grid:
      '[background-image:linear-gradient(to_right,rgba(148,163,184,0.07)_1px,transparent_1px),linear-gradient(to_bottom,rgba(148,163,184,0.07)_1px,transparent_1px)]',
  };
}

const defaultHighlights = [
  'Cleaner access for buyer and seller workflows.',
  'Editorial presentation inspired by the flagship homepage.',
  'Secure entry with a calmer form experience.'
];

const defaultMetrics = [
  { label: 'Marketplace', value: 'Unified' },
  { label: 'Design Tone', value: 'Editorial' }
];

export default function AuthShell({
  badge = 'Customer Access',
  title,
  description,
  children,
  footer,
  centered = false,
  size = 'compact',
  panelBadge = 'Portal Experience',
  panelTitle = 'A premium commerce workspace built as one brand.',
  panelDescription = 'Authentication should feel connected to the flagship experience, not like a detached utility screen.',
  highlights = defaultHighlights,
  metrics = defaultMetrics,
}) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const applyPreference = (event) => setIsDarkMode(event.matches);
    setIsDarkMode(mediaQuery.matches);

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', applyPreference);
      return () => mediaQuery.removeEventListener('change', applyPreference);
    }

    mediaQuery.addListener(applyPreference);
    return () => mediaQuery.removeListener(applyPreference);
  }, []);

  const theme = useMemo(() => resolveThemeClasses(isDarkMode), [isDarkMode]);
  const shellWidthClass =
    size === 'wide'
      ? 'max-w-[1180px]'
      : centered
        ? 'max-w-[1040px]'
        : 'max-w-[1100px]';
  const formWidthClass = size === 'wide' ? 'max-w-[560px]' : 'max-w-[520px]';

  return (
    <div className={`${isDarkMode ? 'dark' : ''} relative min-h-screen overflow-hidden px-4 py-4 sm:px-6 sm:py-6 ${theme.page}`}>
      <div className={`pointer-events-none absolute inset-0 ${theme.background}`} />
      <div className={`pointer-events-none absolute -left-20 top-8 h-64 w-64 rounded-full blur-3xl ${theme.glowA}`} />
      <div className={`pointer-events-none absolute right-8 top-1/4 h-72 w-72 rounded-full blur-3xl ${theme.glowB}`} />
      <div className={`pointer-events-none absolute bottom-0 left-1/3 h-64 w-64 rounded-full blur-3xl ${theme.glowC}`} />
      <div className={`pointer-events-none absolute inset-0 opacity-40 [background-size:28px_28px] ${theme.grid}`} />
      {!isDarkMode ? (
        <>
          <div className="pointer-events-none absolute -left-16 top-14 h-[20rem] w-[20rem] rounded-full border border-[#F5D0FE]/80 opacity-70" />
          <div className="pointer-events-none absolute right-[-4rem] top-20 h-[17rem] w-[17rem] rounded-full border border-[#BFDBFE]/80 opacity-70" />
          <div className="pointer-events-none absolute bottom-[-4rem] left-1/2 h-[14rem] w-[28rem] -translate-x-1/2 rounded-[999px] border border-white/90 bg-[linear-gradient(135deg,rgba(255,255,255,0.32),rgba(255,255,255,0.10))]" />
          <div className="pointer-events-none absolute left-[9%] top-[22%] h-24 w-24 rotate-12 rounded-[2rem] border border-[#F9A8D4]/35 bg-white/30" />
          <div className="pointer-events-none absolute right-[12%] bottom-[18%] h-16 w-16 -rotate-12 rounded-[1.4rem] border border-[#93C5FD]/40 bg-white/34" />
        </>
      ) : null}

      <button
        type="button"
        onClick={() => setIsDarkMode((prev) => !prev)}
        className={`absolute right-4 top-4 z-20 inline-flex h-10 min-w-10 items-center justify-center rounded-full border px-3 text-[11px] font-semibold backdrop-blur-md sm:right-6 sm:top-6 ${theme.toggle}`}
        aria-label="Toggle theme"
      >
        {isDarkMode ? 'Light' : 'Dark'}
      </button>

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-2rem)] w-full items-center justify-center">
        <section
          className={`group relative w-full overflow-hidden rounded-[1.6rem] border p-3 backdrop-blur-xl transition duration-300 ease-out hover:-translate-y-0.5 hover:shadow-[0_34px_90px_rgba(15,23,42,0.14)] focus-within:-translate-y-1 focus-within:shadow-[0_38px_110px_rgba(15,23,42,0.18)] sm:p-4 ${theme.shell} ${shellWidthClass}`}
        >
          <div className={`pointer-events-none absolute -inset-6 -z-10 hidden rounded-[2rem] blur-3xl transition duration-300 lg:block ${theme.shellGlow}`} />
          {!isDarkMode ? (
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.34),transparent_40%,rgba(255,255,255,0.18)_100%)]" />
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[1.05fr_minmax(0,0.95fr)]">
            <aside className={`relative overflow-hidden rounded-[1.35rem] border p-6 sm:p-8 ${theme.panel}`}>
              <div className={`pointer-events-none absolute -left-10 top-0 h-44 w-44 rounded-full blur-3xl ${theme.panelGlow}`} />
              {!isDarkMode ? (
                <>
                  <div className="pointer-events-none absolute -right-8 top-8 h-28 w-28 rounded-full border border-[#FBCFE8]/70 opacity-80" />
                  <div className="pointer-events-none absolute bottom-6 right-6 h-20 w-20 rotate-45 rounded-[1.4rem] border border-[#BFDBFE]/55 bg-white/28" />
                </>
              ) : null}
              <div className="relative flex h-full flex-col">
                <div className="flex items-center justify-between gap-4">
                  <p className={`w-max rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${theme.badge}`}>
                    {panelBadge}
                  </p>
                  <span className={`text-[11px] font-semibold uppercase tracking-[0.18em] ${theme.panelMuted}`}>Portal Commerce</span>
                </div>

                <div className="mt-8 max-w-lg">
                  <h2 className={`text-[1.75rem] font-semibold leading-tight tracking-[-0.04em] sm:text-[2.2rem] ${theme.panelTitle}`}>
                    {panelTitle}
                  </h2>
                  <p className={`mt-3 max-w-xl text-[13px] leading-6 sm:text-sm ${theme.panelText}`}>
                    {panelDescription}
                  </p>
                </div>

                <div className="mt-8 grid gap-3 sm:grid-cols-2">
                  {metrics.map((metric) => (
                    <div key={`${metric.label}-${metric.value}`} className={`rounded-[1rem] border px-4 py-4 ${theme.panelCard}`}>
                      <p className={`text-[10px] font-semibold uppercase tracking-[0.14em] ${theme.panelMuted}`}>{metric.label}</p>
                      <p className={`mt-2 text-base font-semibold ${theme.panelTitle}`}>{metric.value}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-6 space-y-3">
                  {highlights.map((item) => (
                    <div key={item} className={`flex items-start gap-3 rounded-[1rem] border px-4 py-3 ${theme.panelCard}`}>
                      <span className="mt-1 inline-flex h-2.5 w-2.5 rounded-full bg-[#D7932D]" />
                      <p className={`text-[13px] leading-6 ${theme.panelText}`}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </aside>

            <div className="flex items-center justify-center">
              <div className={`relative w-full rounded-[1.25rem] px-3 py-4 sm:px-5 sm:py-6 ${formWidthClass}`}>
                <div className="mb-6 text-center">
                  <p className={`mx-auto mb-2 w-max rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] ${theme.badge}`}>
                    {badge}
                  </p>
                  <h1 className={`text-[1.5rem] font-semibold tracking-[-0.03em] sm:text-[1.8rem] ${theme.title}`}>{title}</h1>
                  <p className={`mx-auto mt-2 max-w-md text-[12.5px] leading-6 sm:text-[13px] ${theme.text}`}>{description}</p>
                </div>

                <div className="flex-1">{children}</div>

                {footer ? <div className={`mt-5 text-center text-sm ${theme.text}`}>{footer}</div> : null}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
