export const CUSTOMER_SESSION_KEYS = [
  'userLoggedIn',
  'userEmail',
  'userType',
  'userId',
  'userToken',
];

const decodeJwtPayload = (token = '') => {
  try {
    const parts = String(token || '').split('.');
    if (parts.length < 2) return null;
    const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
    const json = atob(padded);
    return JSON.parse(json);
  } catch {
    return null;
  }
};

const getTypeFromPayload = (payload = {}) => {
  if (payload?.userType) return String(payload.userType);
  if (payload?.role) return String(payload.role);
  if (Array.isArray(payload?.roles) && payload.roles.length) return String(payload.roles[0]);
  return '';
};

const resolveUserType = (user = {}, fallback = 'buyer') =>
  user?.userType ||
  user?.role ||
  (Array.isArray(user?.roles) && user.roles.length ? user.roles[0] : '') ||
  user?.profile?.userType ||
  fallback ||
  'buyer';

export const setCustomerSession = ({ user = {}, token = '', fallbackEmail = '', fallbackUserType = 'buyer' }) => {
  if (typeof window === 'undefined') return '';

  const userId = String(user?.id || user?._id || '');
  const userEmail = String(user?.email || fallbackEmail || '').trim();
  const userType = resolveUserType(user, fallbackUserType);

  localStorage.setItem('userLoggedIn', 'true');
  localStorage.setItem('userEmail', userEmail);
  localStorage.setItem('userType', userType);
  localStorage.setItem('userId', userId);

  if (token && String(token).trim()) {
    localStorage.setItem('userToken', String(token).trim());
  }

  window.dispatchEvent(new CustomEvent('loginStatusChanged'));
  return userType;
};

export const hydrateCustomerSessionFromToken = () => {
  if (typeof window === 'undefined') return false;
  const token = String(localStorage.getItem('userToken') || '').trim();
  if (!token) return false;

  const payload = decodeJwtPayload(token);
  if (!payload) return false;

  const expiresAtMs = Number(payload?.exp || 0) * 1000;
  if (Number.isFinite(expiresAtMs) && expiresAtMs > 0 && Date.now() >= expiresAtMs) {
    clearCustomerSession({ preserveRedirect: true });
    return false;
  }

  const currentLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const userId = String(localStorage.getItem('userId') || payload?.sub || payload?.id || '').trim();
  const userType = String(localStorage.getItem('userType') || getTypeFromPayload(payload) || 'buyer').trim();
  const userEmail = String(localStorage.getItem('userEmail') || payload?.email || '').trim();

  if (!currentLoggedIn || !localStorage.getItem('userId') || !localStorage.getItem('userType')) {
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userId', userId);
    localStorage.setItem('userType', userType || 'buyer');
    if (userEmail) localStorage.setItem('userEmail', userEmail);
    window.dispatchEvent(new CustomEvent('loginStatusChanged'));
  }

  return true;
};

export const clearCustomerSession = ({ preserveRedirect = false } = {}) => {
  if (typeof window === 'undefined') return;

  const redirectDestination = preserveRedirect ? localStorage.getItem('redirectAfterLogin') : '';
  CUSTOMER_SESSION_KEYS.forEach((key) => localStorage.removeItem(key));

  if (!preserveRedirect) {
    localStorage.removeItem('redirectAfterLogin');
  } else if (redirectDestination) {
    localStorage.setItem('redirectAfterLogin', redirectDestination);
  }

  window.dispatchEvent(new CustomEvent('loginStatusChanged'));
};
