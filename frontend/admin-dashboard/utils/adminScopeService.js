const STORAGE_KEY = 'adminScope';

export const getStoredAdminScope = () => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEY);
};

export const setStoredAdminScope = (scope) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, scope);
};
