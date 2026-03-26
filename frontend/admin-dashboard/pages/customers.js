import { useEffect, useMemo, useState } from 'react';
import Head from 'next/head';
import AdminLayout from '../components/AdminLayout';
import {
  deleteAdminUserAccount,
  getAdminUsersPage,
  updateAdminUserAccount
} from '../utils/mongoService';

const ROLE_OPTIONS = ['buyer', 'seller', 'admin'];
const STATUS_OPTIONS = ['active', 'inactive'];

const defaultSummary = { roles: {}, statuses: {} };

export default function CustomersManagement() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tableBusyState, setTableBusyState] = useState({});
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [role, setRole] = useState('');
  const [status, setStatus] = useState('');

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [summary, setSummary] = useState(defaultSummary);

  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'buyer',
    status: 'active'
  });

  const loadUsers = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await getAdminUsersPage({ search, role, status, page, limit: 20 });
      setItems(result.items || []);
      setTotal(result.total || 0);
      setTotalPages(result.totalPages || 1);
      setSummary(result.summary || defaultSummary);
    } catch (err) {
      setError(err.message || 'Failed to load users');
      setItems([]);
      setTotal(0);
      setTotalPages(1);
      setSummary(defaultSummary);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [search, role, status, page]);

  const hasActiveFilters = useMemo(() => Boolean(search || role || status), [search, role, status]);
  const roleCount = (value) => Number(summary?.roles?.[value] || 0);
  const statusCount = (value) => Number(summary?.statuses?.[value] || 0);

  const applySearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const clearFilters = () => {
    setSearchInput('');
    setSearch('');
    setRole('');
    setStatus('');
    setPage(1);
  };

  const openEditDialog = (user) => {
    setEditingUser(user);
    setEditForm({
      name: String(user?.name || ''),
      email: String(user?.email || ''),
      phone: String(user?.phone || ''),
      role: String(user?.role || 'buyer'),
      status: String(user?.status || 'active')
    });
  };

  const closeEditDialog = () => {
    setEditingUser(null);
    setEditForm({
      name: '',
      email: '',
      phone: '',
      role: 'buyer',
      status: 'active'
    });
  };

  const saveEditDialog = async () => {
    if (!editingUser?.id) return;
    const userId = editingUser.id;
    setTableBusyState((prev) => ({ ...prev, [userId]: true }));
    setError('');
    setNotice('');
    try {
      await updateAdminUserAccount(userId, {
        name: editForm.name.trim(),
        email: editForm.email.trim().toLowerCase(),
        phone: editForm.phone.trim(),
        role: editForm.role,
        status: editForm.status
      });
      setNotice(`Updated account for ${editForm.email || editingUser.email || userId}.`);
      closeEditDialog();
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to update user');
    } finally {
      setTableBusyState((prev) => ({ ...prev, [userId]: false }));
    }
  };

  const deleteRow = async (user) => {
    const emailOrName = user?.email || user?.name || user?.id;
    if (!window.confirm(`Delete this user account?\n\n${emailOrName}`)) {
      return;
    }

    setTableBusyState((prev) => ({ ...prev, [user.id]: true }));
    setError('');
    setNotice('');
    try {
      await deleteAdminUserAccount(user.id);
      setNotice(`Deleted account for ${emailOrName}.`);
      await loadUsers();
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    } finally {
      setTableBusyState((prev) => ({ ...prev, [user.id]: false }));
    }
  };

  return (
    <AdminLayout title="User Management">
      <Head>
        <title>User Management | Admin Dashboard</title>
      </Head>

      <div className="space-y-5">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">User Accounts</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Manage customer and seller accounts in one structured role-based table.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-[1.4fr_1fr_1fr_auto_auto]">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') applySearch(); }}
              placeholder="Search by email, name, or phone"
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            />

            <select
              value={role}
              onChange={(e) => { setPage(1); setRole(e.target.value); }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="">All Roles</option>
              {ROLE_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>

            <select
              value={status}
              onChange={(e) => { setPage(1); setStatus(e.target.value); }}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
            >
              <option value="">All Statuses</option>
              {STATUS_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
            </select>

            <button
              onClick={applySearch}
              className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700"
            >
              Search
            </button>

            <button
              onClick={clearFilters}
              disabled={!hasActiveFilters}
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Clear
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {ROLE_OPTIONS.map((value) => {
            const active = role === value;
            return (
              <button
                key={value}
                onClick={() => { setPage(1); setRole(active ? '' : value); }}
                className={`rounded-2xl border p-4 text-left transition ${
                  active
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/40'
                    : 'border-slate-200 bg-white/90 hover:border-cyan-400 dark:border-slate-700 dark:bg-slate-900/70'
                }`}
              >
                <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">{value}</p>
                <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-slate-100">{roleCount(value)}</p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-400">Accounts in current filters</p>
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">Status</span>
          <button
            onClick={() => { setPage(1); setStatus(''); }}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              !status
                ? 'border-slate-900 bg-slate-900 text-white dark:border-cyan-500 dark:bg-cyan-600 dark:text-slate-950'
                : 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800'
            }`}
          >
            All ({total})
          </button>
          {STATUS_OPTIONS.map((value) => (
            <button
              key={value}
              onClick={() => { setPage(1); setStatus(status === value ? '' : value); }}
              className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                status === value
                  ? 'border-slate-900 bg-slate-900 text-white dark:border-cyan-500 dark:bg-cyan-600 dark:text-slate-950'
                  : 'border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {value} ({statusCount(value)})
            </button>
          ))}
        </div>

        {notice ? (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{notice}</div>
        ) : null}

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div>
        ) : null}

        <div className="rounded-2xl border border-slate-200 bg-white/90 p-0 shadow-sm dark:border-slate-700 dark:bg-slate-900/70">
          <div className="flex items-center justify-between border-b border-slate-200 px-5 py-3 dark:border-slate-700">
            <p className="text-sm text-slate-600 dark:text-slate-400">Total users: <span className="font-semibold text-slate-900 dark:text-slate-100">{total}</span></p>
            <p className="text-sm text-slate-600 dark:text-slate-400">Page {page} of {totalPages}</p>
          </div>

          {loading ? (
            <div className="p-8 text-sm text-slate-500">Loading users...</div>
          ) : items.length === 0 ? (
            <div className="p-8 text-sm text-slate-500">No users found for current filters.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800 dark:text-slate-300">
                  <tr>
                    <th className="px-4 py-3 text-left">User</th>
                    <th className="px-4 py-3 text-left">Role</th>
                    <th className="px-4 py-3 text-left">Status</th>
                    <th className="px-4 py-3 text-left">Source</th>
                    <th className="px-4 py-3 text-left">Updated</th>
                    <th className="px-4 py-3 text-left">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {items.map((user) => {
                    const isBusy = !!tableBusyState[user.id];
                    return (
                      <tr key={user.id}>
                        <td className="px-4 py-3 align-top">
                          <p className="font-medium text-slate-900 dark:text-slate-100">{user.name || 'Unnamed'}</p>
                          <p className="text-slate-600 dark:text-slate-400">{user.email || '-'}</p>
                          <p className="text-xs text-slate-500">{user.phone || '-'}</p>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-200">
                            {user.role || 'buyer'}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top">
                          <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                            user.status === 'active'
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300'
                          }`}
                          >
                            {user.status || 'active'}
                          </span>
                        </td>
                        <td className="px-4 py-3 align-top text-slate-600 dark:text-slate-400">{user.source || '-'}</td>
                        <td className="px-4 py-3 align-top text-slate-600 dark:text-slate-400">
                          {user.updatedAt ? new Date(user.updatedAt).toLocaleString() : '-'}
                        </td>
                        <td className="px-4 py-3 align-top">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => openEditDialog(user)}
                              disabled={isBusy}
                              title="Edit user"
                              aria-label="Edit user"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-slate-900 text-white hover:bg-black disabled:opacity-60 dark:bg-cyan-600 dark:hover:bg-cyan-700"
                            >
                              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m16.862 3.487 3.651 3.651M4 20h4l10.2-10.2a2.58 2.58 0 0 0-3.65-3.65L4.35 16.35 4 20z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => deleteRow(user)}
                              disabled={isBusy}
                              title="Delete user"
                              aria-label="Delete user"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-red-300 text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-500/40 dark:text-red-300 dark:hover:bg-red-900/20"
                            >
                              {isBusy ? (
                                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v4m0 8v4m8-8h-4M8 12H4m12.364 5.657-2.828-2.828M10.464 9.757 7.636 6.93m8.728 0-2.828 2.828m-2.828 5.657-2.828 2.828" />
                                </svg>
                              ) : (
                                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" />
                                </svg>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          <div className="flex items-center justify-between border-t border-slate-200 px-5 py-3 dark:border-slate-700">
            <button
              onClick={() => setPage((prev) => Math.max(1, prev - 1))}
              disabled={page <= 1}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={page >= totalPages}
              className="rounded-md border border-slate-300 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {editingUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/55 p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-900">
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Edit User</h2>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Update profile and role details for this account.
            </p>

            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Full name"
                value={editForm.name}
                onChange={(e) => setEditForm((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
              <input
                type="email"
                placeholder="Email address"
                value={editForm.email}
                onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
              <input
                type="text"
                placeholder="Phone number"
                value={editForm.phone}
                onChange={(e) => setEditForm((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              />
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                <select
                  value={editForm.role}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, role: e.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                >
                  {ROLE_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                  className="rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-cyan-500 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                >
                  {STATUS_OPTIONS.map((value) => <option key={value} value={value}>{value}</option>)}
                </select>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2">
              <button
                onClick={closeEditDialog}
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={saveEditDialog}
                disabled={!!tableBusyState[editingUser.id]}
                className="rounded-lg bg-cyan-600 px-4 py-2 text-sm font-semibold text-white hover:bg-cyan-700 disabled:opacity-60"
              >
                {tableBusyState[editingUser.id] ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </AdminLayout>
  );
}
