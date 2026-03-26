import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import { getUserInquiryInbox, getUserProfile, updateUserInquiryStatus } from '../../utils/userService';

const formatDateTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

export default function SellerDashboard() {
  const [user, setUser] = useState(null);
  const [inquiries, setInquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inquiryLoading, setInquiryLoading] = useState(true);
  const [inquiryFilter, setInquiryFilter] = useState('all');
  const [copyMessage, setCopyMessage] = useState('');
  const [statusActionState, setStatusActionState] = useState({});
  const router = useRouter();

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    const userType = localStorage.getItem('userType');
    if (!isLoggedIn || userType !== 'seller') {
      router.push('/login');
      return;
    }

    const loadUserData = async () => {
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          router.push('/login');
          return;
        }

        const [userProfile, inboxResult] = await Promise.all([
          getUserProfile(userId),
          getUserInquiryInbox(userId)
        ]);

        setUser(userProfile);
        setInquiries(inboxResult?.inquiries || []);
      } catch (error) {
        console.error('Error loading seller dashboard data:', error);
        localStorage.removeItem('userLoggedIn');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('userType');
        localStorage.removeItem('userId');
        localStorage.removeItem('userToken');
        router.push('/login');
      } finally {
        setInquiryLoading(false);
        setLoading(false);
      }
    };

    loadUserData();
  }, [router]);

  const filteredInquiries = useMemo(() => {
    if (inquiryFilter === 'all') return inquiries;
    return inquiries.filter((entry) => String(entry.status || 'new') === inquiryFilter);
  }, [inquiries, inquiryFilter]);

  const newInquiryCount = useMemo(
    () => inquiries.filter((entry) => String(entry.status || 'new') === 'new').length,
    [inquiries]
  );

  const handleLogout = () => {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    localStorage.removeItem('userId');
    localStorage.removeItem('userToken');
    router.push('/login');
  };

  const handleCopyBuyerId = async (buyerId) => {
    try {
      await navigator.clipboard.writeText(String(buyerId || ''));
      setCopyMessage('Buyer ID copied.');
      setTimeout(() => setCopyMessage(''), 1800);
    } catch {
      setCopyMessage('Could not copy Buyer ID.');
      setTimeout(() => setCopyMessage(''), 1800);
    }
  };

  const handleStatusUpdate = async (inquiryId, nextStatus) => {
    const userId = localStorage.getItem('userId');
    if (!userId || !inquiryId) return;

    setStatusActionState((prev) => ({ ...prev, [inquiryId]: true }));
    const result = await updateUserInquiryStatus(userId, inquiryId, nextStatus);
    setStatusActionState((prev) => ({ ...prev, [inquiryId]: false }));

    if (!result?.success) {
      setCopyMessage(result?.message || 'Failed to update inquiry status.');
      setTimeout(() => setCopyMessage(''), 2200);
      return;
    }

    setInquiries((prev) =>
      prev.map((entry) =>
        String(entry.id || entry._id) === String(inquiryId)
          ? { ...entry, status: nextStatus, updatedAt: new Date().toISOString() }
          : entry
      )
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Seller Dashboard | B2B E-Commerce Platform</title>
        <meta name="description" content="Seller dashboard with customer inquiry inbox" />
      </Head>

      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-800">Seller Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-700">
                Welcome, {user?.profile?.name || user?.name || 'Seller'}
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Products</h3>
            <p className="mt-2 text-2xl font-semibold text-gray-800">0</p>
            <div className="mt-4">
              <Link href="/products" className="text-blue-600 hover:text-blue-800 text-sm font-medium">Manage products</Link>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">New Inquiries</h3>
            <p className="mt-2 text-2xl font-semibold text-gray-800">{newInquiryCount}</p>
            <div className="mt-4">
              <a href="#seller-inbox" className="text-blue-600 hover:text-blue-800 text-sm font-medium">Open inbox</a>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Total Inquiries</h3>
            <p className="mt-2 text-2xl font-semibold text-gray-800">{inquiries.length}</p>
            <p className="mt-4 text-xs text-gray-500">Buyer messages for your products</p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-sm font-medium text-gray-500">Available to Withdraw</h3>
            <p className="mt-2 text-2xl font-semibold text-gray-800">$0.00</p>
            <div className="mt-4">
              <Link href="/settlements" className="text-blue-600 hover:text-blue-800 text-sm font-medium">View settlements</Link>
            </div>
          </div>
        </div>

        <section id="seller-inbox" className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Customer Inquiry Inbox</h2>
              <p className="text-sm text-gray-500">Customers contacting your shop are listed here with identity details.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setInquiryFilter('all')}
                className={`px-3 py-1.5 text-sm rounded-md border ${inquiryFilter === 'all' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                All
              </button>
              <button
                type="button"
                onClick={() => setInquiryFilter('new')}
                className={`px-3 py-1.5 text-sm rounded-md border ${inquiryFilter === 'new' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                New
              </button>
              <button
                type="button"
                onClick={() => setInquiryFilter('contacted')}
                className={`px-3 py-1.5 text-sm rounded-md border ${inquiryFilter === 'contacted' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                Contacted
              </button>
              <button
                type="button"
                onClick={() => setInquiryFilter('closed')}
                className={`px-3 py-1.5 text-sm rounded-md border ${inquiryFilter === 'closed' ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300'}`}
              >
                Closed
              </button>
            </div>
          </div>

          <div className="p-6">
            {copyMessage ? <p className="mb-3 text-xs text-blue-700">{copyMessage}</p> : null}

            {inquiryLoading ? (
              <p className="text-sm text-gray-500">Loading inquiries...</p>
            ) : filteredInquiries.length === 0 ? (
              <div className="rounded-lg border border-dashed border-gray-300 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
                No customer inquiries yet.
              </div>
            ) : (
              <div className="space-y-4">
                {filteredInquiries.map((entry) => {
                  const buyerName = entry?.buyer?.name || 'Unknown customer';
                  const buyerEmail = entry?.buyer?.email || '';
                  return (
                    <article key={entry.id || `${entry.productId}-${entry.createdAt}`} className="rounded-lg border border-gray-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <h3 className="font-semibold text-gray-900">{entry.productName || `Product ${entry.productId || '-'}`}</h3>
                          <p className="mt-1 text-sm text-gray-700">Customer: {buyerName}{buyerEmail ? ` (${buyerEmail})` : ''}</p>
                          <p className="text-xs text-gray-500">Customer ID: {entry.fromUserId || '-'}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">{formatDateTime(entry.createdAt)}</p>
                          <span className="inline-flex mt-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                            {String(entry.status || 'new')}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                        <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2">
                          <p className="text-xs text-gray-500">Quantity</p>
                          <p className="font-semibold text-gray-800">{entry.quantity || 1}</p>
                        </div>
                        <div className="rounded border border-gray-200 bg-gray-50 px-3 py-2 md:col-span-2">
                          <p className="text-xs text-gray-500">Message</p>
                          <p className="text-gray-700 whitespace-pre-line">{entry.message || '-'}</p>
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        {buyerEmail ? (
                          <a
                            href={`mailto:${encodeURIComponent(buyerEmail)}?subject=${encodeURIComponent(`Regarding ${entry.productName || 'your inquiry'}`)}`}
                            className="inline-flex items-center rounded-md bg-blue-600 px-3 py-2 text-xs font-semibold text-white hover:bg-blue-700"
                          >
                            Reply by Email
                          </a>
                        ) : null}
                        <button
                          type="button"
                          onClick={() => handleCopyBuyerId(entry.fromUserId)}
                          className="inline-flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                          Copy Customer ID
                        </button>
                        <button
                          type="button"
                          disabled={statusActionState[entry.id]}
                          onClick={() => handleStatusUpdate(entry.id, 'contacted')}
                          className="inline-flex items-center rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100 disabled:opacity-60"
                        >
                          Mark Contacted
                        </button>
                        <button
                          type="button"
                          disabled={statusActionState[entry.id]}
                          onClick={() => handleStatusUpdate(entry.id, 'closed')}
                          className="inline-flex items-center rounded-md border border-emerald-300 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                        >
                          Mark Closed
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        <section className="bg-white shadow rounded-lg mb-8">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Seller Actions</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Link href="/products/add" className="border border-gray-200 p-6 rounded-lg text-center hover:border-blue-300 hover:shadow-md transition-all duration-200">
              <h3 className="text-lg font-medium text-gray-900">Add Product</h3>
              <p className="mt-2 text-sm text-gray-500">List a new product for sale</p>
            </Link>
            <Link href="/products" className="border border-gray-200 p-6 rounded-lg text-center hover:border-blue-300 hover:shadow-md transition-all duration-200">
              <h3 className="text-lg font-medium text-gray-900">Manage Products</h3>
              <p className="mt-2 text-sm text-gray-500">View and edit your products</p>
            </Link>
            <Link href="/orders" className="border border-gray-200 p-6 rounded-lg text-center hover:border-blue-300 hover:shadow-md transition-all duration-200">
              <h3 className="text-lg font-medium text-gray-900">Order Management</h3>
              <p className="mt-2 text-sm text-gray-500">Process and track orders</p>
            </Link>
            <Link href="/inquiries" className="border border-gray-200 p-6 rounded-lg text-center hover:border-blue-300 hover:shadow-md transition-all duration-200">
              <h3 className="text-lg font-medium text-gray-900">Inquiry Center</h3>
              <p className="mt-2 text-sm text-gray-500">Track and respond to customer messages</p>
            </Link>
          </div>
        </section>

        <section className="bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Shop Information</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">Company Name</h3>
              <p className="text-gray-600">{user?.profile?.companyName || 'Not set'}</p>
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">Business Type</h3>
              <p className="text-gray-600">{user?.profile?.businessType || 'Not set'}</p>
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">Email</h3>
              <p className="text-gray-600">{user?.profile?.email || user?.email || 'Not set'}</p>
            </div>
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-2">Phone</h3>
              <p className="text-gray-600">{user?.profile?.phone || 'Not set'}</p>
            </div>
          </div>
          <div className="px-6 pb-6">
            <Link href="/profile" className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700">
              Edit Profile
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
