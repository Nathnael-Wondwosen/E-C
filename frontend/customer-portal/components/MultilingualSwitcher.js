import { useRouter } from 'next/router';

const supportedLocales = ['en', 'es', 'fr', 'de'];

export default function MultilingualSwitcher() {
  const router = useRouter();

  const changeLocale = (locale) => {
    router.push(router.asPath, router.asPath, { locale });
  };

  return (
    <section className="py-4 bg-blue-950 text-white border-b border-blue-900">
      <div className="container mx-auto px-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
        <p className="text-sm text-blue-100">Multilingual UI</p>
        <div className="flex gap-2">
          {supportedLocales.map((locale) => {
            const active = router.locale === locale;
            return (
              <button
                key={locale}
                onClick={() => changeLocale(locale)}
                className={`px-3 py-1.5 text-xs uppercase tracking-wide border transition-colors ${
                  active ? 'bg-white text-blue-900 border-white' : 'border-blue-300 text-blue-100 hover:bg-blue-800'
                }`}
              >
                {locale}
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
