import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { useRouter } from 'next/router';
import {
  getUserInquiryInbox,
  getUserInquirySent,
  updateUserInquiryStatus
} from '../utils/userService';

const formatDateTime = (value) => {
  const date = value ? new Date(value) : null;
  if (!date || Number.isNaN(date.getTime())) return '-';
  return date.toLocaleString();
};

export default function InquiryCenterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState([]);
  const [userType, setUserType] = useState('buyer');
  const [statusActionState, setStatusActionState] = useState({});

  useEffect(() => {
    const load = async () => {
      try {
        const isLoggedIn = localStorage.getItem('userLoggedIn');
        const storedUserType = localStorage.getItem('userType') || 'buyer';
        const userId = localStorage.getItem('userId');

        if (!isLoggedIn || !userId) {
          router.push('/login');
          return;
        }

        setUserType(storedUserType);
        const result = storedUserType === 'seller'
          ? await getUserInquiryInbox(userId)
          : await getUserInquirySent(userId);

        setRows(result?.inquiries || []);
      } catch (error) {
        console.error('Failed to load inquiries:', error);
        setRows([]);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [router]);

  const title = useMemo(
    () => (userType === 'seller' ? 'Customer Inquiry Inbox' : 'My Sent Inquiries'),
    [userType]
  );

  const handleStatusUpdate = async (inquiryId, nextStatus) => {
    if (userType !== 'seller') return;
    const userId = localStorage.getItem('userId');
    if (!userId || !inquiryId) return;

    setStatusActionState((prev) => ({ ...prev, [inquiryId]: true }));
    const result = await updateUserInquiryStatus(userId, inquiryId, nextStatus);
    setStatusActionState((prev) => ({ ...prev, [inquiryId]: false }));
    if (!result?.success) return;

    setRows((prev) =>
      prev.map((entry) =>
        String(entry.id || entry._id) === String(inquiryId)
          ? { ...entry, status: nextStatus, updatedAt: new Date().toISOString() }
          : entry
      )
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Inquiry Center | B2B E-Commerce Platform</title>
        <meta name="description" content="Simple inquiry center for buyers and sellers" />
      </Head>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-6 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
            <p className="text-sm text-gray-600 mt-1">
              {userType === 'seller'
                ? 'See who contacted your shop and respond faster.'
                : 'Track messages you sent to product owners.'}
            </p>
          </div>
          <Link
            href={userType === 'seller' ? '/dashboard/seller' : '/dashboard/customer'}
            className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back to Dashboard
          </Link>
        </div>

        <section className="rounded-lg border border-gray-200 bg-white shadow-sm">
          {loading ? (
            <div className="p-6 text-sm text-gray-500">Loading inquiries...</div>
          ) : rows.length === 0 ? (
            <div className="p-8 text-center text-sm text-gray-500">No inquiries found.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {rows.map((entry) => {
                const counterpartName = userType === 'seller'
                  ? (entry?.buyer?.name || 'Unknown customer')
                  : (entry?.seller?.name || 'Shop owner');
                const counterpartEmail = userType === 'seller'
                  ? (entry?.buyer?.email || '')
                  : (entry?.seller?.email || '');

                return (
                  <article key={entry.id || `${entry.productId}-${entry.createdAt}`} className="p-5">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-semibold text-gray-900">{entry.productName || `Product ${entry.productId || '-'}`}</h2>
                        <p className="text-sm text-gray-700 mt-1">
                          {userType === 'seller' ? 'Customer' : 'Seller'}: {counterpartName}
                          {counterpartEmail ? ` (${counterpartEmail})` : ''}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Quantity: {entry.quantity || 1}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-500">{formatDateTime(entry.createdAt)}</p>
                        <span className="inline-flex mt-1 rounded-full bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700">
                          {String(entry.status || 'new')}
                        </span>
                      </div>
                    </div>
                    <div className="mt-3 rounded border border-gray-200 bg-gray-50 px-3 py-2">
                      <p className="text-xs text-gray-500">Message</p>
                      <p className="text-sm text-gray-700 whitespace-pre-line">{entry.message || '-'}</p>
                    </div>
                    {userType === 'seller' ? (
                      <div className="mt-3 flex flex-wrap gap-2">
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
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
