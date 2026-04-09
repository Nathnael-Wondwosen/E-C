import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../components/AdminLayout';
import { getRequestLogs } from '../utils/mongoService';

export default function LogsPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [requestIdFilter, setRequestIdFilter] = useState('');
  const [limit, setLimit] = useState(200);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const payload = await getRequestLogs({
        limit,
        requestId: requestIdFilter.trim()
      });
      setItems(payload);
    } catch (error) {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
    const timer = setInterval(loadLogs, 8000);
    return () => clearInterval(timer);
  }, [requestIdFilter, limit]);

  const errorCount = useMemo(
    () => items.filter((item) => item.statusCode >= 400).length,
    [items]
  );

  return (
    <AdminLayout title="Request Logs">
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
          <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Request Log Stream</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Live API request logs with requestId tracing.
          </p>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-3">
            <input
              type="text"
              value={requestIdFilter}
              onChange={(e) => setRequestIdFilter(e.target.value)}
              placeholder="Filter by requestId"
              className="md:col-span-2 px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            />
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-3 py-2 border border-gray-300 rounded-md text-sm dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            >
              <option value={100}>100 rows</option>
              <option value={200}>200 rows</option>
              <option value={500}>500 rows</option>
              <option value={1000}>1000 rows</option>
            </select>
            <button
              onClick={loadLogs}
              className="px-4 py-2 rounded-md bg-gray-900 text-white text-sm font-medium hover:bg-black"
            >
              {loading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
            Rows: {items.length} | Error rows: {errorCount}
          </div>

          <div className="mt-4 bg-white dark:bg-gray-900 shadow rounded-none overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Request ID</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Method</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Path</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Latency</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-800">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan="6" className="px-4 py-4 text-sm text-gray-500 dark:text-gray-400">
                        No logs available.
                      </td>
                    </tr>
                  ) : (
                    items.map((row, idx) => (
                      <tr key={`${row.requestId}-${idx}`}>
                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">{row.ts}</td>
                        <td className="px-4 py-3 text-xs font-mono text-gray-900 dark:text-gray-100">{row.requestId}</td>
                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">{row.method}</td>
                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">{row.path}</td>
                        <td className="px-4 py-3 text-xs">
                          <span className={`px-2 py-0.5 rounded ${row.statusCode >= 500 ? 'bg-red-100 text-red-700' : row.statusCode >= 400 ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                            {row.statusCode}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 dark:text-gray-300">{row.durationMs} ms</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
