const STORAGE_KEY = 'adminScope';

const readStoredScope = () => {
  if (typeof window === 'undefined') return null;
  const value = window.localStorage.getItem(STORAGE_KEY);
  return value ? `${value}`.trim().toLowerCase() : null;
};

export const withAdminScopeUrl = (url) => {
  try {
    const scope = readStoredScope();
    if (!scope) return url;

    const parsed = new URL(url, typeof window !== 'undefined' ? window.location.origin : 'http://localhost');
    if (!parsed.searchParams.has('scope')) {
      parsed.searchParams.set('scope', scope);
    }

    if (typeof window === 'undefined' && !/^https?:\/\//i.test(url)) {
      return `${parsed.pathname}${parsed.search}`;
    }
    return parsed.toString();
  } catch (error) {
    return url;
  }
};

