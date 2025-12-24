import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';

export default function BuyerSettlements() {
  const [settlements, setSettlements] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check if user is logged in
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (!isLoggedIn) {
      router.push('/login');
      return;
    }

    loadSettlements();
  }, [router]);

  const loadSettlements = async () => {
    // For now, using mock data since we don't have a full settlements API
    // In a real implementation, we would fetch from the API
    const mockSettlements = [
      {
        id: 1,
        date: '2023-12-15',
        orderId: 'ORD-001',
        amount: 299.97,
        status: 'paid',
        method: 'Credit Card',
        reference: 'PAY-001'
      },
      {
        id: 2,
        date: '2023-12-10',
        orderId: 'ORD-002',
        amount: 199.99,
        status: 'paid',
        method: 'Credit Card',
        reference: 'PAY-002'
      },
      {
        id: 3,
        date: '2023-12-01',
        orderId: 'ORD-003',
        amount: 79.99,
        status: 'pending',
        method: 'Bank Transfer',
        reference: 'PAY-003'
      }
    ];

    setSettlements(mockSettlements);
    setLoading(false);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
        <title>Payment History | B2B E-Commerce Platform</title>
        <meta name="description" content="Your payment history" />
      </Head>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Payment History</h1>

        {/* Payment Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Total Paid</h3>
            <p className="text-2xl font-semibold text-green-600">$579.95</p>
            <p className="text-sm text-gray-500 mt-1">Amount paid to date</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Pending Payments</h3>
            <p className="text-2xl font-semibold text-yellow-600">$79.99</p>
            <p className="text-sm text-gray-500 mt-1">Awaiting payment</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-medium text-gray-900 mb-2">This Month</h3>
            <p className="text-2xl font-semibold text-blue-600">$499.96</p>
            <p className="text-sm text-gray-500 mt-1">Paid this month</p>
          </div>
        </div>

        {settlements.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No payments yet</h3>
            <p className="mt-1 text-sm text-gray-500">Your payment history will appear here once you make purchases.</p>
          </div>
        ) : (
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {settlements.map((settlement) => (
                <li key={settlement.id}>
                  <div className="px-4 py-4 sm:px-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          Payment #{settlement.reference}
                        </p>
                        <div className="ml-2 flex items-center">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(settlement.status)}`}>
                            {settlement.status.charAt(0).toUpperCase() + settlement.status.slice(1)}
                          </span>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(settlement.date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="mt-2 sm:flex sm:justify-between">
                      <div className="sm:flex">
                        <div className="mr-6">
                          <p className="text-sm text-gray-500">
                            Order: {settlement.orderId}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-500">
                            Amount: <span className="font-medium">${settlement.amount.toFixed(2)}</span>
                          </p>
                        </div>
                      </div>
                      <div className="mt-2 flex items-center text-sm text-gray-500 sm:mt-0">
                        <span className="mr-4">Method: {settlement.method}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>
    </div>
  );
}