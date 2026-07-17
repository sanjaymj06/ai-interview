import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Edit2, Trash2, Shield, ChevronLeft, ChevronRight, Users } from 'lucide-react';
import { getUsers, updateUser, deleteUser } from '../../api/admin';
import { useToast } from '../../components/Toast';
import Modal from '../../components/Modal';
import { useDebounce } from '../../hooks/useDebounce';
import { formatDate } from '../../utils/format';

export default function AdminUsers() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [editUser, setEditUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    setLoading(true);
    getUsers({ page, limit: 10, search: debouncedSearch })
      .then((res) => {
        const data = res.data;
        setUsers(data?.users || data || []);
        setTotalPages(data?.totalPages || 1);
      })
      .catch(() => toast.error('Failed to load users'))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch]);

  const handleEdit = async () => {
    if (!editUser) return;
    setSaving(true);
    try {
      await updateUser(editUser._id, { role: editUser.role, status: editUser.status });
      toast.success('User updated');
      setEditUser(null);
      const res = await getUsers({ page, limit: 10, search: debouncedSearch });
      setUsers(res.data?.users || res.data || []);
    } catch (err) {
      toast.error(err.message || 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this user? This cannot be undone.')) return;
    try {
      await deleteUser(id);
      setUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success('User deleted');
    } catch {
      toast.error('Failed to delete');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center gap-3 mb-8">
        <Shield className="h-7 w-7 text-brand-500" />
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 dark:text-dark-100">User Management</h1>
          <p className="text-sm text-dark-500">Manage all registered users</p>
        </div>
      </div>

      <div className="glass-card p-6">
        <div className="relative max-w-sm mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dark-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search users..."
            className="input-field pl-10"
          />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => <div key={i} className="skeleton h-12 rounded-xl" />)}
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-12 w-12 text-dark-300 mx-auto mb-3" />
            <p className="text-dark-500">No users found</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-xs font-medium text-dark-500 dark:text-dark-400 uppercase tracking-wider">
                    <th className="pb-3 pr-4">User</th>
                    <th className="pb-3 pr-4">Email</th>
                    <th className="pb-3 pr-4">Role</th>
                    <th className="pb-3 pr-4">Status</th>
                    <th className="pb-3 pr-4">Joined</th>
                    <th className="pb-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-dark-100 dark:divide-dark-800">
                  {users.map((u, i) => (
                    <motion.tr
                      key={u._id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.03 }}
                      className="text-sm"
                    >
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-xl bg-gradient-to-br from-brand-500 to-purple-600 flex items-center justify-center text-white text-sm font-semibold">
                            {u.name?.charAt(0) || 'U'}
                          </div>
                          <span className="font-medium text-dark-900 dark:text-dark-100">{u.name}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 text-dark-500">{u.email}</td>
                      <td className="py-3 pr-4">
                        <span className={u.role === 'admin' ? 'badge-info' : 'badge-neutral'}>
                          {u.role || 'user'}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <span className={u.status === 'active' ? 'badge-success' : 'badge-error'}>
                          {u.status || 'active'}
                        </span>
                      </td>
                      <td className="py-3 pr-4 text-dark-500">{formatDate(u.createdAt)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setEditUser(u)}
                            className="p-2 rounded-xl text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-900/20"
                          >
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(u._id)}
                            className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-dark-100 dark:border-dark-700">
                <p className="text-sm text-dark-500">Page {page} of {totalPages}</p>
                <div className="flex gap-2">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="btn-secondary text-sm py-2 px-3">
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="btn-secondary text-sm py-2 px-3">
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Modal isOpen={!!editUser} onClose={() => setEditUser(null)} title="Edit User">
        {editUser && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Role</label>
              <select
                value={editUser.role}
                onChange={(e) => setEditUser({ ...editUser, role: e.target.value })}
                className="input-field"
              >
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-dark-700 dark:text-dark-300 mb-1.5">Status</label>
              <select
                value={editUser.status}
                onChange={(e) => setEditUser({ ...editUser, status: e.target.value })}
                className="input-field"
              >
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end gap-3 pt-2">
              <button onClick={() => setEditUser(null)} className="btn-secondary">Cancel</button>
              <button onClick={handleEdit} disabled={saving} className="btn-primary">
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
