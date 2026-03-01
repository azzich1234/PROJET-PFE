import { useState, useEffect } from 'react';
import {
  getChapters,
  addChapter,
  updateChapter,
  deleteChapter,
  toggleChapterPublish,
  getInstructorLanguages,
  getInstructorLevels,
} from '../../api/auth';

export default function InstructorChaptersPage() {
  const [chapters, setChapters] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterLang, setFilterLang] = useState('');
  const [filterLevel, setFilterLevel] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', level_id: '', language_id: '', video_url: '', order: '', pdf: null });
  const [formErrors, setFormErrors] = useState({});

  // Fetch instructor languages on mount
  useEffect(() => {
    getInstructorLanguages().then(({ data }) => {
      setLanguages(data);
      if (data.length === 1) {
        setFilterLang(String(data[0].id));
      }
    }).catch(() => {});
  }, []);

  // Fetch levels when language filter changes
  useEffect(() => {
    if (filterLang) {
      getInstructorLevels({ language_id: filterLang })
        .then(({ data }) => setLevels(data))
        .catch(() => setLevels([]));
    } else {
      setLevels([]);
      setFilterLevel('');
    }
  }, [filterLang]);

  // Fetch chapters
  const fetchChapters = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (filterLang) params.language_id = filterLang;
    if (filterLevel) params.level_id = filterLevel;
    getChapters(params)
      .then(({ data }) => setChapters(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchChapters(); }, [search, filterLang, filterLevel]);

  // Modal form levels (for language selected in form)
  const [formLevels, setFormLevels] = useState([]);
  useEffect(() => {
    if (form.language_id) {
      getInstructorLevels({ language_id: form.language_id })
        .then(({ data }) => setFormLevels(data))
        .catch(() => setFormLevels([]));
    } else {
      setFormLevels([]);
    }
  }, [form.language_id]);

  const openAdd = () => {
    setEditing(null);
    setForm({ title: '', description: '', level_id: '', language_id: languages.length === 1 ? String(languages[0].id) : '', video_url: '', order: '', pdf: null });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (ch) => {
    setEditing(ch);
    setForm({
      title: ch.title,
      description: ch.description || '',
      level_id: ch.level_id,
      language_id: ch.language_id,
      video_url: ch.video_url || '',
      order: ch.order || '',
      pdf: null,
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    try {
      if (editing) {
        await updateChapter(editing.id, form);
      } else {
        await addChapter(form);
      }
      setShowModal(false);
      fetchChapters();
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors || {});
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteChapter(deleting.id);
    setDeleting(null);
    fetchChapters();
  };

  const handleToggle = async (ch) => {
    const { data } = await toggleChapterPublish(ch.id);
    setChapters((prev) => prev.map((c) => (c.id === data.id ? data : c)));
  };

  // Helpers
  const levelBadge = (level) => {
    const colors = {
      1: 'bg-emerald-50 text-emerald-700 ring-emerald-200',
      2: 'bg-amber-50 text-amber-700 ring-amber-200',
      3: 'bg-rose-50 text-rose-700 ring-rose-200',
    };
    return colors[level?.order] || 'bg-gray-50 text-gray-700 ring-gray-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Chapters</h1>
          <p className="text-sm text-gray-500 mt-1">Create and manage your course chapters</p>
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl font-semibold text-sm hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20 cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Chapter
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            type="text"
            placeholder="Search chapters..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
          />
        </div>

        {/* Language filter */}
        <select
          value={filterLang}
          onChange={(e) => setFilterLang(e.target.value)}
          disabled={languages.length <= 1}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer disabled:opacity-70"
        >
          {languages.length > 1 && <option value="">All Languages</option>}
          {languages.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>

        {/* Level filter */}
        <select
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
          disabled={!filterLang}
          className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer disabled:opacity-50"
        >
          <option value="">All Levels</option>
          {levels.map((l) => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>

      {/* Stats */}
      <div className="flex gap-4">
        <div className="px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">Total</p>
          <p className="text-lg font-bold text-gray-900">{chapters.length}</p>
        </div>
        <div className="px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">Published</p>
          <p className="text-lg font-bold text-green-600">{chapters.filter((c) => c.is_published).length}</p>
        </div>
        <div className="px-4 py-3 bg-white rounded-xl border border-gray-100 shadow-sm">
          <p className="text-xs text-gray-400 font-medium">Draft</p>
          <p className="text-lg font-bold text-amber-600">{chapters.filter((c) => !c.is_published).length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="h-4 w-48 bg-gray-100 rounded" />
                <div className="h-4 w-20 bg-gray-100 rounded" />
                <div className="h-4 w-24 bg-gray-100 rounded" />
                <div className="flex-1" />
                <div className="h-4 w-16 bg-gray-100 rounded" />
              </div>
            ))}
          </div>
        ) : chapters.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            </div>
            <p className="font-semibold text-gray-600">No chapters yet</p>
            <p className="text-sm text-gray-400 mt-1">Click "Add Chapter" to create your first one</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">#</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Title</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Language</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Level</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Content</th>
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                <th className="text-right px-5 py-3.5 text-xs font-semibold text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {chapters.map((ch) => (
                <tr key={ch.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-4 text-sm text-gray-400 font-mono">{ch.order}</td>
                  <td className="px-5 py-4">
                    <p className="text-sm font-semibold text-gray-800">{ch.title}</p>
                    {ch.description && (
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{ch.description}</p>
                    )}
                  </td>
                  <td className="px-5 py-4">
                    <span className="text-sm text-gray-600">{ch.language?.name}</span>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-semibold ring-1 ${levelBadge(ch.level)}`}>
                      {ch.level?.name}
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {ch.pdf_url && (
                        <a href={ch.pdf_url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-red-500 hover:text-red-600 font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                          </svg>
                          PDF
                        </a>
                      )}
                      {ch.video_url && (
                        <a href={ch.video_url} target="_blank" rel="noreferrer"
                          className="flex items-center gap-1 text-xs text-blue-500 hover:text-blue-600 font-medium">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                          </svg>
                          Video
                        </a>
                      )}
                      {!ch.pdf_url && !ch.video_url && (
                        <span className="text-xs text-gray-300">—</span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggle(ch)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                        ch.is_published
                          ? 'bg-green-50 text-green-700 hover:bg-green-100'
                          : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${ch.is_published ? 'bg-green-500' : 'bg-gray-400'}`} />
                      {ch.is_published ? 'Published' : 'Draft'}
                    </button>
                  </td>
                  <td className="px-5 py-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => openEdit(ch)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                        title="Edit"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleting(ch)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="Delete"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-gray-900">
                {editing ? 'Edit Chapter' : 'Add Chapter'}
              </h2>
              <button onClick={() => setShowModal(false)} className="p-1 text-gray-400 hover:text-gray-600 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Chapter title"
                />
                {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title[0]}</p>}
              </div>

              {/* Description */}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Description <span className="text-gray-400">(optional)</span></label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none"
                  placeholder="Brief description of this chapter"
                />
              </div>

              {/* Language & Level – side by side */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Language</label>
                  <select
                    value={form.language_id}
                    onChange={(e) => setForm({ ...form, language_id: e.target.value, level_id: '' })}
                    disabled={languages.length <= 1}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer disabled:opacity-70"
                  >
                    {languages.length > 1 && <option value="">Select language</option>}
                    {languages.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                  {formErrors.language_id && <p className="text-red-500 text-xs mt-1">{formErrors.language_id[0]}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Level</label>
                  <select
                    value={form.level_id}
                    onChange={(e) => setForm({ ...form, level_id: e.target.value })}
                    disabled={!form.language_id}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none cursor-pointer disabled:opacity-50"
                  >
                    <option value="">Select level</option>
                    {formLevels.map((l) => (
                      <option key={l.id} value={l.id}>{l.name}</option>
                    ))}
                  </select>
                  {formErrors.level_id && <p className="text-red-500 text-xs mt-1">{formErrors.level_id[0]}</p>}
                </div>
              </div>

              {/* PDF Upload */}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">PDF File <span className="text-gray-400">(optional)</span></label>
                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setForm({ ...form, pdf: e.target.files[0] || null })}
                    className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 file:cursor-pointer cursor-pointer"
                  />
                </div>
                {editing?.pdf_url && !form.pdf && (
                  <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                    <svg className="w-3 h-3 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                    </svg>
                    Current PDF attached
                  </p>
                )}
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Video URL <span className="text-gray-400">(optional)</span></label>
                <input
                  type="url"
                  value={form.video_url}
                  onChange={(e) => setForm({ ...form, video_url: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="https://youtube.com/watch?v=..."
                />
              </div>

              {/* Order */}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Order <span className="text-gray-400">(auto if empty)</span></label>
                <input
                  type="number"
                  min="1"
                  value={form.order}
                  onChange={(e) => setForm({ ...form, order: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="1"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors cursor-pointer shadow-sm shadow-blue-600/20"
              >
                {saving ? 'Saving...' : editing ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Confirmation Modal ── */}
      {deleting && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setDeleting(null)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center space-y-4">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center mx-auto">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900">Delete Chapter</h3>
              <p className="text-sm text-gray-500 mt-1">
                Are you sure you want to delete "<span className="font-semibold">{deleting.title}</span>"? This action cannot be undone.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => setDeleting(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
