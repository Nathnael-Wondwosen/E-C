import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import Header from '../components/header/Header';
import { createUserOrder, getUserCart, getUserProfile } from '../utils/userService';

const paymentOptions = [
  { id: 'credit-card', label: 'Credit Card', note: 'Fastest checkout for immediate confirmation.' },
  { id: 'paypal', label: 'PayPal', note: 'Use your PayPal balance or linked account.' },
  { id: 'bank-transfer', label: 'Bank Transfer', note: 'Best for larger B2B settlement flows.' }
];

export default function Checkout() {
  const [cartItems, setCartItems] = useState([]);
  const [user, setUser] = useState(null);
  const [shippingInfo, setShippingInfo] = useState({
    fullName: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    country: '',
    phone: ''
  });
  const [paymentMethod, setPaymentMethod] = useState('credit-card');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    loadCheckoutData();
  }, [router]);

  const loadCheckoutData = async () => {
    try {
      setLoading(true);
      setError(null);

      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User ID not found in localStorage');
      }

      const userProfile = await getUserProfile(userId);
      setUser({
        id: userId,
        email: localStorage.getItem('userEmail'),
        userType: localStorage.getItem('userType')
      });

      const cartData = await getUserCart(userId);
      setCartItems(Array.isArray(cartData?.items) ? cartData.items : []);

      setShippingInfo({
        fullName: userProfile?.profile?.name || userProfile?.name || '',
        address: userProfile?.profile?.address || '',
        city: userProfile?.profile?.city || '',
        state: userProfile?.profile?.state || '',
        zipCode: userProfile?.profile?.zipCode || '',
        country: userProfile?.profile?.country || 'Ethiopia',
        phone: userProfile?.profile?.phone || ''
      });
    } catch (err) {
      console.error('Error loading checkout data:', err);
      setError(err.message);
      setCartItems([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateSubtotal = () =>
    cartItems.reduce((total, item) => total + item.price * item.quantity, 0);

  const calculateTax = () => calculateSubtotal() * 0.15;

  const calculateTotal = () => calculateSubtotal() + calculateTax();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setShippingInfo((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        throw new Error('User not authenticated');
      }

      const orderData = {
        items: cartItems,
        shippingInfo,
        paymentMethod,
        total: calculateTotal(),
        subtotal: calculateSubtotal(),
        tax: calculateTax()
      };

      const result = await createUserOrder(userId, orderData);
      if (!result.success) {
        throw new Error(result.message || 'Failed to place order');
      }

      router.push('/orders');
    } catch (submitError) {
      console.error('Error placing order:', submitError);
      alert(`Failed to place order: ${submitError.message}`);
    }
  };

  if (loading) {
    return (
      <div className="portal-page flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-3 rounded-full border border-[var(--portal-border)] bg-[var(--portal-surface)] px-5 py-3 text-sm font-medium portal-heading shadow-[0_16px_36px_rgba(160,96,18,0.08)]">
          <span className="h-3 w-3 animate-pulse rounded-full bg-[#D7932D]" />
          Preparing checkout...
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="portal-page flex min-h-screen items-center justify-center">
        <div className="portal-card mx-4 w-full max-w-md p-8">
          <div className="text-center">
            <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[1.4rem] border border-red-200 bg-red-50 text-red-600">
              <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v4m0 4h.01M5.07 19h13.86c1.54 0 2.5-1.67 1.73-3L13.73 4c-.77-1.33-2.69-1.33-3.46 0L3.34 16c-.77 1.33.19 3 1.73 3z" />
              </svg>
            </div>
            <h2 className="portal-heading mb-2 text-xl font-bold">Error Loading Checkout</h2>
            <p className="portal-text mb-6">{error}</p>
            <button onClick={() => window.location.reload()} className="portal-primary-button px-6 py-3">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="portal-page min-h-screen">
      <Head>
        <title>Checkout | B2B E-Commerce Platform</title>
        <meta name="description" content="Complete your purchase" />
      </Head>
      <Header />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {cartItems.length === 0 ? (
          <section className="portal-empty-state">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-[1.4rem] border border-[var(--portal-border)] bg-[var(--portal-surface-muted)]">
              <svg className="h-12 w-12 text-[#B5A88B]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m0 0h8M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="portal-heading mb-2 text-xl font-medium">Your cart is empty</h3>
            <p className="portal-text mx-auto mb-6 max-w-md">
              Add products to your basket before moving into checkout.
            </p>
            <Link href="/marketplace" className="portal-primary-button inline-flex items-center px-6 py-3 text-base font-medium">
              Browse Products
            </Link>
          </section>
        ) : (
          <>
            <section className="portal-hero mb-8">
              <div className="bg-[linear-gradient(180deg,rgba(240,177,76,0.22),transparent)] px-5 py-6 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="portal-badge">Checkout</p>
                    <h1 className="portal-heading mt-3 text-[2rem] font-semibold tracking-[-0.03em] sm:text-[2.4rem]">Finalize Your Order</h1>
                    <p className="portal-text mt-2 text-sm leading-6 sm:text-[15px]">
                      Review your items, confirm delivery details, and move through a cleaner purchase flow that matches the rest of the portal.
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <span className="portal-pill">{cartItems.length} items ready</span>
                    <Link href="/cart" className="portal-secondary-button">
                      Back to Cart
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
              <section className="space-y-6">
                <div className="portal-card overflow-hidden">
                  <div className="border-b border-[var(--portal-border)] bg-[linear-gradient(135deg,#18232f,#283749)] px-6 py-4">
                    <h2 className="text-lg font-semibold text-white">Shipping Information</h2>
                    <p className="mt-1 text-sm text-white/70">Use a complete business delivery address for reliable fulfillment.</p>
                  </div>

                  <form onSubmit={handleSubmit} className="p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="sm:col-span-2">
                        <span className="mb-2 block text-sm font-medium portal-heading">Full Name</span>
                        <input type="text" id="fullName" name="fullName" value={shippingInfo.fullName} onChange={handleInputChange} className="portal-input" required />
                      </label>
                      <label className="sm:col-span-2">
                        <span className="mb-2 block text-sm font-medium portal-heading">Address</span>
                        <input type="text" id="address" name="address" value={shippingInfo.address} onChange={handleInputChange} className="portal-input" required />
                      </label>
                      <label>
                        <span className="mb-2 block text-sm font-medium portal-heading">City</span>
                        <input type="text" id="city" name="city" value={shippingInfo.city} onChange={handleInputChange} className="portal-input" required />
                      </label>
                      <label>
                        <span className="mb-2 block text-sm font-medium portal-heading">State</span>
                        <input type="text" id="state" name="state" value={shippingInfo.state} onChange={handleInputChange} className="portal-input" required />
                      </label>
                      <label>
                        <span className="mb-2 block text-sm font-medium portal-heading">ZIP Code</span>
                        <input type="text" id="zipCode" name="zipCode" value={shippingInfo.zipCode} onChange={handleInputChange} className="portal-input" required />
                      </label>
                      <label>
                        <span className="mb-2 block text-sm font-medium portal-heading">Country</span>
                        <input type="text" id="country" name="country" value={shippingInfo.country} onChange={handleInputChange} className="portal-input" required />
                      </label>
                      <label className="sm:col-span-2">
                        <span className="mb-2 block text-sm font-medium portal-heading">Phone Number</span>
                        <input type="tel" id="phone" name="phone" value={shippingInfo.phone} onChange={handleInputChange} className="portal-input" required />
                      </label>
                    </div>

                    <div className="mt-8 border-t border-[var(--portal-border)] pt-6">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h3 className="portal-heading text-lg font-semibold">Payment Method</h3>
                          <p className="portal-muted mt-1 text-sm">Choose the settlement path that fits this order.</p>
                        </div>
                        {user?.email ? <span className="portal-pill">{user.email}</span> : null}
                      </div>

                      <div className="mt-4 space-y-3">
                        {paymentOptions.map((option) => {
                          const selected = paymentMethod === option.id;

                          return (
                            <label
                              key={option.id}
                              className={`flex cursor-pointer items-start gap-3 rounded-[1rem] border p-4 transition ${selected ? 'border-[var(--portal-border-strong)] bg-[var(--portal-accent-soft)]' : 'border-[var(--portal-border)] bg-[var(--portal-surface-muted)] hover:border-[var(--portal-border-strong)]'}`}
                            >
                              <input
                                id={option.id}
                                name="payment-method"
                                type="radio"
                                value={option.id}
                                checked={selected}
                                onChange={(e) => setPaymentMethod(e.target.value)}
                                className="mt-1 h-4 w-4 accent-[#B86D16]"
                              />
                              <div>
                                <p className="portal-heading text-sm font-semibold">{option.label}</p>
                                <p className="portal-muted mt-1 text-sm">{option.note}</p>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <p className="portal-muted max-w-lg text-xs leading-5">
                        By placing your order, you agree to our{' '}
                        <Link href="/terms" className="font-semibold text-[var(--portal-accent)] hover:text-[#c87918]">
                          Terms of Service
                        </Link>{' '}
                        and{' '}
                        <Link href="/privacy" className="font-semibold text-[var(--portal-accent)] hover:text-[#c87918]">
                          Privacy Policy
                        </Link>.
                      </p>
                      <button type="submit" className="portal-primary-button px-6 py-3">
                        Complete Order
                      </button>
                    </div>
                  </form>
                </div>
              </section>

              <aside className="space-y-6">
                <div className="portal-card sticky top-8 overflow-hidden">
                  <div className="border-b border-[var(--portal-border)] px-6 py-4">
                    <h2 className="portal-heading text-lg font-semibold">Order Summary</h2>
                    <p className="portal-muted mt-1 text-sm">A compact view of the shipment you are about to place.</p>
                  </div>

                  <div className="space-y-4 p-6">
                    {cartItems.map((item) => (
                      <div key={item.id} className="portal-soft-card flex items-center gap-3 p-3">
                        <div className="h-16 w-16 overflow-hidden rounded-[0.9rem] border border-[var(--portal-border)] bg-white">
                          <img className="h-full w-full object-cover" src={item.image} alt={item.name} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="portal-heading truncate text-sm font-semibold">{item.name}</p>
                          <p className="portal-muted mt-1 text-xs">Qty {item.quantity} • {item.seller || 'Marketplace seller'}</p>
                        </div>
                        <p className="portal-heading text-sm font-semibold">${Number((item.price || 0) * (item.quantity || 0)).toFixed(2)}</p>
                      </div>
                    ))}

                    <div className="border-t border-[var(--portal-border)] pt-4">
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span className="portal-muted">Subtotal</span>
                        <span className="portal-heading font-semibold">${calculateSubtotal().toFixed(2)}</span>
                      </div>
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span className="portal-muted">Shipping</span>
                        <span className="portal-heading font-semibold">$0.00</span>
                      </div>
                      <div className="flex items-center justify-between py-1 text-sm">
                        <span className="portal-muted">Tax</span>
                        <span className="portal-heading font-semibold">${calculateTax().toFixed(2)}</span>
                      </div>
                      <div className="mt-3 flex items-center justify-between border-t border-[var(--portal-border)] pt-4">
                        <span className="portal-heading text-base font-semibold">Total</span>
                        <span className="portal-heading text-xl font-bold">${calculateTotal().toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="portal-soft-card p-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[var(--portal-accent-strong)]">Protected Checkout</p>
                      <p className="portal-text mt-2 text-sm leading-6">
                        Your delivery information is prefilled from your account so you can move faster with fewer errors.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
