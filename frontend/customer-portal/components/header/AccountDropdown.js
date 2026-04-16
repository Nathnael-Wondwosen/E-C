import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { clearCustomerSession, getCustomerSessionState } from '../../utils/session';

const getLoginState = () => {
  const { loggedIn, userType, userName } = getCustomerSessionState();
  return { loggedIn, userType, userName };
};

export default function AccountDropdown({
  buttonClassName = 'h-8 w-8 inline-flex items-center justify-center rounded-md hover:bg-gray-100 hover:text-blue-700 transition-colors',
  menuClassName = 'absolute right-0 top-full w-56 bg-white border border-gray-200 shadow-xl z-40',
  buttonContent = null,
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userType, setUserType] = useState('buyer');
  const [userName, setUserName] = useState('User');
  const closeTimeoutRef = useRef(null);

  useEffect(() => {
    const refreshState = () => {
      const state = getLoginState();
      setIsLoggedIn(state.loggedIn);
      setUserType(state.userType);
      setUserName(state.userName);
    };

    refreshState();
    window.addEventListener('storage', refreshState);
    window.addEventListener('loginStatusChanged', refreshState);

    return () => {
      window.removeEventListener('storage', refreshState);
      window.removeEventListener('loginStatusChanged', refreshState);
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current);
    };
  }, []);

  const openMenu = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    setIsOpen(true);
  };

  const closeMenu = () => {
    closeTimeoutRef.current = setTimeout(() => {
      setIsOpen(false);
    }, 180);
  };

  const handleLogout = () => {
    clearCustomerSession();
    setIsOpen(false);
    router.push('/login');
  };

  return (
    <div className="relative" onMouseEnter={openMenu} onMouseLeave={closeMenu}>
      <button
        type="button"
        aria-label="Account"
        title="Account"
        className={buttonClassName}
        onFocus={openMenu}
        onBlur={closeMenu}
        onClick={() => setIsOpen((prev) => !prev)}
      >
        {buttonContent || (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM12 14a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Z" />
          </svg>
        )}
      </button>

      <div
        className={`${menuClassName} transition-all duration-150 ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'
        }`}
      >
        {isLoggedIn ? (
          <>
            <div className="px-3 py-2 text-sm text-gray-500 border-b border-gray-100">Hi, {userName}</div>
            <Link href={userType === 'seller' ? '/dashboard/seller' : '/dashboard/customer'} className="block px-3 py-2 text-sm hover:bg-gray-50">
              Dashboard
            </Link>
            <Link href="/orders" className="block px-3 py-2 text-sm hover:bg-gray-50">
              Orders
            </Link>
            <Link href="/profile" className="block px-3 py-2 text-sm hover:bg-gray-50">
              Profile
            </Link>
            <button onClick={handleLogout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50">
              Logout
            </button>
          </>
        ) : (
          <>
            <Link href="/login" className="block px-3 py-2 text-sm hover:bg-gray-50">
              Sign In
            </Link>
            <Link href="/signup" className="block px-3 py-2 text-sm hover:bg-gray-50">
              Create Account
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
