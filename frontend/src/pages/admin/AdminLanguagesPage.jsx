import { useState, useEffect } from 'react';
import { getLanguages, addLanguage, updateLanguage, deleteLanguage as deleteLanguageApi, toggleLanguageActive, assignInstructor, getInstructors } from '../../api/auth';

export default function AdminLanguagesPage() {
  const [languages, setLanguages] = useState([]);
  const [instructors, setInstructors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Add modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ name: '', code: '', image: null, instructor_id: '' });
  const [addPreview, setAddPreview] = useState(null);
  const [addError, setAddError] = useState('');
  const [addLoading, setAddLoading] = useState(false);

  // Edit modal
  const [editLang, setEditLang] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', code: '', image: null, instructor_id: '' });
  const [editPreview, setEditPreview] = useState(null);
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);

  // Delete confirm
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const fetchLanguages = async () => {
    try {
      setLoading(true);
      const res = await getLanguages({ search });
      setLanguages(res.data);
    } catch {
      setError('Failed to load languages.');
    } finally {
      setLoading(false);
    }
  };

  const fetchInstructors = async () => {
    try {
      const res = await getInstructors();
      setInstructors(res.data);
    } catch {
      // silent
    }
  };

  useEffect(() => { fetchLanguages(); }, [search]);
  useEffect(() => { fetchInstructors(); }, []);

  // Add Language
  const handleAdd = async (e) => {
    e.preventDefault();
    setAddError('');
    setAddLoading(true);
    try {
      await addLanguage({
        ...addForm,
        instructor_id: addForm.instructor_id || null,
      });
      setAddForm({ name: '', code: '', image: null, instructor_id: '' });
      setAddPreview(null);
      setShowAddModal(false);
      fetchLanguages();
    } catch (err) {
      setAddError(err.response?.data?.message || 'Failed to add language.');
    } finally {
      setAddLoading(false);
    }
  };

  // Edit Language
  const openEdit = (lang) => {
    setEditLang(lang);
    setEditForm({
      name: lang.name,
      code: lang.code,
      image: null,
      instructor_id: lang.instructor_id || '',
    });
    setEditPreview(lang.image_url || null);
    setEditError('');
  };

  const handleEdit = async (e) => {
    e.preventDefault();
    setEditError('');
    setEditLoading(true);
    try {
      await updateLanguage(editLang.id, {
        ...editForm,
        instructor_id: editForm.instructor_id || null,
      });
      setEditLang(null);
      fetchLanguages();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Failed to update language.');
    } finally {
      setEditLoading(false);
    }
  };

  // Delete Language
  const handleDelete = async (id) => {
    try {
      await deleteLanguageApi(id);
      setDeleteConfirm(null);
      fetchLanguages();
    } catch {
      setError('Failed to delete language.');
    }
  };

  // Toggle Active
  const handleToggle = async (id) => {
    try {
      const res = await toggleLanguageActive(id);
      setLanguages(languages.map((l) => l.id === id ? res.data : l));
    } catch {
      setError('Failed to update status.');
    }
  };

  return (
    <>
      {/* Error banner */}
      {error && (
        <div className="mb-4 px-4 py-3 bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] rounded-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
            <span>{error}</span>
          </div>
          <button onClick={() => setError('')} className="text-red-400 hover:text-red-300 cursor-pointer text-lg leading-none">&times;</button>
        </div>
      )}

      {/* Title + Add Button */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Manage Languages</h1>
          <p className="text-sm text-slate-400 mt-1">Add, edit, and manage platform languages.</p>
        </div>
        <button onClick={() => { setShowAddModal(true); setAddError(''); setAddForm({ name: '', code: '', image: null, instructor_id: '' }); setAddPreview(null); }}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-500 text-white text-[13px] rounded-xl font-semibold hover:bg-blue-600 transition-all duration-200 cursor-pointer shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/30">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Language
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative mb-6">
        <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input value={search} onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or code..."
          className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-slate-200 placeholder-slate-500 transition-shadow duration-200 hover:border-white/20" />
      </div>

      {/* Languages Table */}
      <div className="bg-[#111827] rounded-2xl border border-white/5 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-white/[0.02] border-b border-white/5">
              <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Language</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Code</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Instructor</th>
              <th className="text-left px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Status</th>
              <th className="text-right px-6 py-3.5 text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {loading ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <div className="animate-spin h-8 w-8 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-3"></div>
                  <p className="font-medium">Loading languages...</p>
                </td>
              </tr>
            ) : languages.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <svg className="w-12 h-12 mx-auto mb-3 text-slate-600" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 21l5.25-11.25L21 21m-9-3h7.5M3 5.621a48.474 48.474 0 016-.371m0 0c1.12 0 2.233.038 3.334.114M9 5.25V3m3.334 2.364C11.176 10.658 7.69 15.08 3 17.502m9.334-12.138c.896.061 1.785.147 2.666.257m-4.589 8.495a18.023 18.023 0 01-3.827-5.802" />
                  </svg>
                  <p className="font-medium">No languages found</p>
                  <p className="text-sm mt-1 text-slate-600">Add your first language to get started.</p>
                </td>
              </tr>
            ) : (
              languages.map((lang) => (
                <tr key={lang.id} className="hover:bg-white/[0.02] transition-colors duration-150">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {lang.image_url ? (
                        <img src={lang.image_url} alt={lang.name} className="w-8 h-8 rounded-lg object-cover ring-1 ring-white/10" />
                      ) : (
                        <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center">
                          <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.41a2.25 2.25 0 013.182 0l2.909 2.91m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>
                      )}
                      <span className="text-sm font-semibold text-slate-200">{lang.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-xs font-mono bg-white/5 text-slate-400 px-2 py-1 rounded-lg">{lang.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    {lang.instructor ? (
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 bg-blue-500/10 text-blue-400 rounded-full flex items-center justify-center font-bold text-xs ring-2 ring-blue-500/10">
                          {lang.instructor.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-slate-300">{lang.instructor.name}</p>
                          <p className="text-[11px] text-slate-500">{lang.instructor.email}</p>
                        </div>
                      </div>
                    ) : (
                      <span className="text-xs text-slate-500 italic">Not assigned</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <button onClick={() => handleToggle(lang.id)}
                      className={`px-3 py-1 text-xs font-semibold rounded-full cursor-pointer transition-colors ${
                        lang.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20'
                          : 'bg-red-500/10 text-red-400 hover:bg-red-500/20'
                      }`}>
                      {lang.is_active ? 'Active' : 'Inactive'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(lang)} title="Edit"
                        className="p-2 text-slate-500 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleteConfirm(lang)} title="Delete"
                        className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ========== ADD LANGUAGE MODAL ========== */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowAddModal(false)}>
          <div className="bg-[#111827] rounded-2xl shadow-xl w-full max-w-md p-6 mx-4 border border-white/5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Add Language</h2>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-200 cursor-pointer text-xl leading-none">&times;</button>
            </div>

            {addError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                {addError}
              </div>
            )}

            <form onSubmit={handleAdd} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-300 mb-1.5">Language Name</label>
                <input value={addForm.name} onChange={(e) => setAddForm({ ...addForm, name: e.target.value })} required
                  placeholder="e.g. English"
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-slate-200 placeholder-slate-500 hover:border-white/20 transition-all duration-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-slate-300 mb-1.5">Code</label>
                  <input value={addForm.code} onChange={(e) => setAddForm({ ...addForm, code: e.target.value.toLowerCase() })} required
                    placeholder="e.g. en" maxLength={10}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-slate-200 placeholder-slate-500 font-mono hover:border-white/20 transition-all duration-200" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-slate-300 mb-1.5">Image</label>
                  <div className="flex items-center gap-2">
                    {addPreview && (
                      <img src={addPreview} alt="Preview" className="w-10 h-10 rounded-lg object-cover ring-1 ring-white/10" />
                    )}
                    <label className="flex-1 flex items-center justify-center px-4 py-2 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all duration-200">
                      <svg className="w-4 h-4 text-slate-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="text-xs text-slate-400">{addForm.image ? addForm.image.name : 'Upload'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setAddForm({ ...addForm, image: file });
                          setAddPreview(URL.createObjectURL(file));
                        }
                      }} />
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-300 mb-1.5">Assign Instructor</label>
                <select value={addForm.instructor_id} onChange={(e) => setAddForm({ ...addForm, instructor_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-slate-200 hover:border-white/20 transition-all duration-200 cursor-pointer">
                  <option value="" className="bg-[#111827]">— No instructor —</option>
                  {instructors.map((inst) => (
                    <option key={inst.id} value={inst.id} className="bg-[#111827]">{inst.name} ({inst.email})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowAddModal(false)}
                  className="px-5 py-2.5 text-[13px] font-medium text-slate-300 border border-white/10 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={addLoading}
                  className="px-5 py-2.5 text-[13px] font-semibold text-white bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-all duration-200 cursor-pointer shadow-sm shadow-blue-500/20">
                  {addLoading ? 'Adding...' : 'Add Language'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== EDIT LANGUAGE MODAL ========== */}
      {editLang && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setEditLang(null)}>
          <div className="bg-[#111827] rounded-2xl shadow-xl w-full max-w-md p-6 mx-4 border border-white/5" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold text-white">Edit Language</h2>
              <button onClick={() => setEditLang(null)} className="text-slate-400 hover:text-slate-200 cursor-pointer text-xl leading-none">&times;</button>
            </div>

            {editError && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm flex items-center gap-2">
                <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                {editError}
              </div>
            )}

            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className="block text-[13px] font-medium text-slate-300 mb-1.5">Language Name</label>
                <input value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} required
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-slate-200 hover:border-white/20 transition-all duration-200" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-slate-300 mb-1.5">Code</label>
                  <input value={editForm.code} onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toLowerCase() })} required
                    maxLength={10}
                    className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-slate-200 font-mono hover:border-white/20 transition-all duration-200" />
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-slate-300 mb-1.5">Image</label>
                  <div className="flex items-center gap-2">
                    {editPreview && (
                      <img src={editPreview} alt="Preview" className="w-10 h-10 rounded-lg object-cover ring-1 ring-white/10" />
                    )}
                    <label className="flex-1 flex items-center justify-center px-4 py-2 border border-white/10 rounded-xl cursor-pointer hover:border-white/20 hover:bg-white/5 transition-all duration-200">
                      <svg className="w-4 h-4 text-slate-500 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                      </svg>
                      <span className="text-xs text-slate-400">{editForm.image ? editForm.image.name : 'Change'}</span>
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                          setEditForm({ ...editForm, image: file });
                          setEditPreview(URL.createObjectURL(file));
                        }
                      }} />
                    </label>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-[13px] font-medium text-slate-300 mb-1.5">Assign Instructor</label>
                <select value={editForm.instructor_id} onChange={(e) => setEditForm({ ...editForm, instructor_id: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm text-slate-200 hover:border-white/20 transition-all duration-200 cursor-pointer">
                  <option value="" className="bg-[#111827]">— No instructor —</option>
                  {instructors.map((inst) => (
                    <option key={inst.id} value={inst.id} className="bg-[#111827]">{inst.name} ({inst.email})</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setEditLang(null)}
                  className="px-5 py-2.5 text-[13px] font-medium text-slate-300 border border-white/10 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={editLoading}
                  className="px-5 py-2.5 text-[13px] font-semibold text-white bg-blue-500 rounded-xl hover:bg-blue-600 disabled:opacity-50 transition-all duration-200 cursor-pointer shadow-sm shadow-blue-500/20">
                  {editLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========== DELETE CONFIRM MODAL ========== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-[#111827] rounded-2xl shadow-xl w-full max-w-sm p-6 mx-4 text-center border border-white/5" onClick={(e) => e.stopPropagation()}>
            <div className="w-12 h-12 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-white mb-1">Delete Language</h3>
            <p className="text-sm text-slate-400 mb-6">
              Are you sure you want to delete <span className="font-semibold text-slate-200">{deleteConfirm.name}</span>? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2.5 text-[13px] font-medium text-slate-300 border border-white/10 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={() => handleDelete(deleteConfirm.id)}
                className="flex-1 px-4 py-2.5 text-[13px] font-semibold text-white bg-red-500 rounded-xl hover:bg-red-600 transition-all duration-200 cursor-pointer shadow-sm shadow-red-500/20">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
