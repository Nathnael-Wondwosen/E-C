export const CUSTOMER_SESSION_KEYS = [
  'userLoggedIn',
  'userEmail',
  'userType',
  'userId',
  'userToken',
  'customerSessionSnapshot'
];

const CUSTOMER_SESSION_SNAPSHOT_KEY = 'customerSessionSnapshot';

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

const readSessionSnapshot = () => {
  if (typeof window === 'undefined') return null;

  try {
    const raw = localStorage.getItem(CUSTOMER_SESSION_SNAPSHOT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null;
  }
};

const normalizeSessionUserType = (value, fallback = 'buyer') => {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized || fallback;
};

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

  localStorage.setItem(CUSTOMER_SESSION_SNAPSHOT_KEY, JSON.stringify({
    loggedIn: true,
    userId,
    userEmail,
    userType,
    userToken: token && String(token).trim() ? String(token).trim() : String(localStorage.getItem('userToken') || '').trim()
  }));

  window.dispatchEvent(new CustomEvent('loginStatusChanged'));
  return userType;
};

export const hydrateCustomerSessionFromToken = () => {
  if (typeof window === 'undefined') return false;
  const snapshot = readSessionSnapshot();
  const token = String(localStorage.getItem('userToken') || snapshot?.userToken || '').trim();
  const snapshotLoggedIn = snapshot?.loggedIn === true;
  const currentLoggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const hasRecoverableSession = snapshotLoggedIn || currentLoggedIn;

  if (!token && !hasRecoverableSession) return false;

  if (token && !localStorage.getItem('userToken')) {
    localStorage.setItem('userToken', token);
  }

  const payload = token ? decodeJwtPayload(token) : null;

  const expiresAtMs = Number(payload?.exp || 0) * 1000;
  if (Number.isFinite(expiresAtMs) && expiresAtMs > 0 && Date.now() >= expiresAtMs) {
    clearCustomerSession({ preserveRedirect: true });
    return false;
  }

  const userId = String(localStorage.getItem('userId') || snapshot?.userId || payload?.sub || payload?.id || '').trim();
  const userType = normalizeSessionUserType(localStorage.getItem('userType') || snapshot?.userType || getTypeFromPayload(payload) || 'buyer');
  const userEmail = String(localStorage.getItem('userEmail') || snapshot?.userEmail || payload?.email || '').trim();
  const shouldHydrate = hasRecoverableSession || Boolean(token);

  if (shouldHydrate && (!currentLoggedIn || !localStorage.getItem('userId') || !localStorage.getItem('userType'))) {
    localStorage.setItem('userLoggedIn', 'true');
    localStorage.setItem('userId', userId);
    localStorage.setItem('userType', userType);
    if (userEmail) localStorage.setItem('userEmail', userEmail);
    window.dispatchEvent(new CustomEvent('loginStatusChanged'));
  }

  localStorage.setItem(CUSTOMER_SESSION_SNAPSHOT_KEY, JSON.stringify({
    loggedIn: true,
    userId,
    userEmail,
    userType,
    userToken: token
  }));

  return shouldHydrate;
};

export const getCustomerSessionState = () => {
  if (typeof window === 'undefined') {
    return {
      loggedIn: false,
      userId: '',
      userType: 'buyer',
      userEmail: '',
      userName: 'User'
    };
  }

  hydrateCustomerSessionFromToken();

  const loggedIn = localStorage.getItem('userLoggedIn') === 'true';
  const userId = String(localStorage.getItem('userId') || '').trim();
  const userType = String(localStorage.getItem('userType') || 'buyer').trim() || 'buyer';
  const userEmail = String(localStorage.getItem('userEmail') || '').trim();
  const userName = userEmail ? userEmail.split('@')[0] : 'User';

  return {
    loggedIn,
    userId,
    userType,
    userEmail,
    userName
  };
};

export const getRequiredCustomerSession = (expectedUserType = '') => {
  if (typeof window === 'undefined') {
    return {
      loggedIn: false,
      userId: '',
      userType: '',
      userEmail: ''
    };
  }

  const state = getCustomerSessionState();
  const expected = normalizeSessionUserType(expectedUserType, '');
  const userType = normalizeSessionUserType(state.userType, 'buyer');
  const typeMatches = !expected || userType === expected;

  return {
    ...state,
    userType,
    loggedIn: Boolean(state.loggedIn && state.userId && typeMatches)
  };
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
