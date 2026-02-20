import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getUsers, toggleUserActive, addInstructor, updateUser, deleteUser as deleteUserApi } from '../../api/auth';

export default function AdminUsersPage() {
  const { user } = useAuth();

  const [users, setUsers] = useState([]);
  const [counts, setCounts] = useState({ all: 0, admin: 0, instructor: 0, learner: 0 });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [editData, setEditData] = useState({ name: '', email: '', role: '' });
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  const [newInstructor, setNewInstructor] = useState({ name: '', email: '', password: '', password_confirmation: '' });

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await getUsers({ search, role: roleFilter });
      setUsers(res.data.users);
      setCounts(res.data.counts);
    } catch {
      setError('Failed to load users.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const toggleActive = async (id) => {
    try {
      const res = await toggleUserActive(id);
      setUsers(users.map((u) => u.id === id ? res.data.user : u));
      setCounts((prev) => ({ ...prev }));
      fetchUsers();
    } catch {
      setError('Failed to update user status.');
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteUserApi(id);
      setDeleteConfirm(null);
      fetchUsers();
    } catch {
      setError('Failed to delete user.');
    }
  };

  const openEditModal = (u) => {
    setEditUser(u);
    setEditData({ name: u.name, email: u.email, role: u.role });
    setEditError('');
  };

  const handleEditUser = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);
    try {
      await updateUser(editUser.id, editData);
      setEditUser(null);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to update user.';
      setEditError(msg);
    } finally {
      setEditLoading(false);
    }
  };

  const handleAddInstructor = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      await addInstructor(newInstructor);
      setNewInstructor({ name: '', email: '', password: '', password_confirmation: '' });
      setShowAddModal(false);
      fetchUsers();
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add instructor.';
      setAddError(msg);
    } finally {
      setAddLoading(false);
    }
  };

  return (
    <>
        {/* Error banner */}
        {error && (
          <div className="mb-4 px-4 py-3 bg-red-50 border border-red-100 text-red-700 text-[13px] rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
              <span>{error}</span>
            </div>
            <button onClick={() => setError('')} className="text-red-400 hover:text-red-600 cursor-pointer text-lg leading-none">&times;</button>
          </div>
        )}

        {/* Title + Add Button */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Users</h1>
            <p className="text-sm text-gray-500 mt-1">View, search, and manage all platform users.</p>
          </div>
          <button onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-[13px] rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 cursor-pointer shadow-sm shadow-blue-600/20 hover:shadow-md hover:shadow-blue-600/25">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Add Instructor
          </button>
        </div>

        {/* Role Filter Tabs */}
        <div className="flex gap-2 mb-4">
          {['all', 'admin', 'instructor', 'learner'].map((role) => (
            <button key={role} onClick={() => setRoleFilter(role)}
              className={`px-4 py-2 text-[13px] rounded-xl font-medium transition-all duration-200 cursor-pointer ${
                roleFilter === role
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20'
                  : 'bg-white text-gray-500 border border-gray-200 hover:bg-gray-50 hover:text-gray-700'
              }`}>
              {role === 'all' ? 'All' : role.charAt(0).toUpperCase() + role.slice(1)}
              <span className={`ml-2 px-1.5 py-0.5 text-[11px] rounded-full font-semibold ${
                roleFilter === role ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}>{counts[role]}</span>
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="relative mb-6">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-shadow duration-200 hover:border-gray-300" />
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100">
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">User</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Joined</th>
                <th className="text-right px-6 py-3.5 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                    <p className="font-medium">Loading users...</p>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    <svg className="w-12 h-12 mx-auto mb-3" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                    <p className="font-medium">No users found</p>
                    <p className="text-sm mt-1">Try adjusting your search or filter.</p>
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-gray-50/50 transition-colors duration-150">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ring-2 ring-blue-50">
                          {u.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{u.name}</p>
                          <p className="text-[12px] text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'admin'      ? 'bg-purple-100 text-purple-700' :
                        u.role === 'instructor'  ? 'bg-blue-100 text-blue-700' :
                                                   'bg-green-100 text-green-700'
                      }`}>
                        {u.role.charAt(0).toUpperCase() + u.role.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${
                        u.is_active ? 'text-green-600' : 'text-red-500'
                      }`}>
                        <span className={`w-2 h-2 rounded-full ${u.is_active ? 'bg-green-500' : 'bg-red-400'}`}></span>
                        {u.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        {/* Edit */}
                        <button onClick={() => openEditModal(u)} title="Edit user"
                          className="p-1.5 rounded-lg text-blue-500 hover:bg-blue-50 transition-colors cursor-pointer">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                          </svg>
                        </button>
                        {/* Toggle active */}
                        <button onClick={() => toggleActive(u.id)} title={u.is_active ? 'Deactivate' : 'Activate'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            u.is_active ? 'text-orange-500 hover:bg-orange-50' : 'text-green-500 hover:bg-green-50'
                          }`}>
                          {u.is_active ? (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                          )}
                        </button>
                        {/* Delete */}
                        {u.role !== 'admin' && (
                          <button onClick={() => setDeleteConfirm(u.id)} title="Delete user"
                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors cursor-pointer">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                            </svg>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Summary */}
        <p className="text-[13px] text-gray-400 mt-4">
          Showing {users.length} of {counts.all} users
        </p>

      {/* Add Instructor Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Add Instructor</h2>
              <button onClick={() => setShowAddModal(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleAddInstructor} className="space-y-4">
              {addError && (
                <div className="px-4 py-3 bg-red-50 border border-red-100 text-red-700 text-[13px] rounded-xl">{addError}</div>
              )}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Full Name</label>
                <input required value={newInstructor.name}
                  onChange={(e) => setNewInstructor({ ...newInstructor, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm hover:border-gray-300 transition-all duration-200"
                  placeholder="" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Email Address</label>
                <input required type="email" value={newInstructor.email}
                  onChange={(e) => setNewInstructor({ ...newInstructor, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm hover:border-gray-300 transition-all duration-200"
                  placeholder="" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Password</label>
                <input required type="password" value={newInstructor.password}
                  onChange={(e) => setNewInstructor({ ...newInstructor, password: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm hover:border-gray-300 transition-all duration-200"
                  placeholder="Min. 8 characters" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Confirm Password</label>
                <input required type="password" value={newInstructor.password_confirmation}
                  onChange={(e) => setNewInstructor({ ...newInstructor, password_confirmation: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm hover:border-gray-300 transition-all duration-200"
                  placeholder="" />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 cursor-pointer text-[13px]">
                  Cancel
                </button>
                <button type="submit" disabled={addLoading}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 cursor-pointer disabled:opacity-50 text-[13px] shadow-sm shadow-blue-600/20">
                  {addLoading ? 'Adding...' : 'Add Instructor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {editUser && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-800">Edit User</h2>
              <button onClick={() => setEditUser(null)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <form onSubmit={handleEditUser} className="space-y-4">
              {editError && (
                <div className="px-4 py-3 bg-red-50 border border-red-100 text-red-700 text-[13px] rounded-xl">{editError}</div>
              )}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Full Name</label>
                <input required value={editData.name}
                  onChange={(e) => setEditData({ ...editData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm hover:border-gray-300 transition-all duration-200" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Email Address</label>
                <input required type="email" value={editData.email}
                  onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm hover:border-gray-300 transition-all duration-200" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Role</label>
                <select value={editData.role}
                  onChange={(e) => setEditData({ ...editData, role: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white text-sm hover:border-gray-300 transition-all duration-200">
                  <option value="learner">Learner</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setEditUser(null)}
                  className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 cursor-pointer text-[13px]">
                  Cancel
                </button>
                <button type="submit" disabled={editLoading}
                  className="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-200 cursor-pointer disabled:opacity-50 text-[13px] shadow-sm shadow-blue-600/20">
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 text-center animate-in">
            <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-red-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">Delete User?</h3>
            <p className="text-[13px] text-gray-500 mb-6 leading-relaxed">
              This action cannot be undone. The user will be permanently removed from the platform.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-200 cursor-pointer text-[13px]">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 py-2.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-200 cursor-pointer text-[13px] shadow-sm shadow-red-600/20">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
