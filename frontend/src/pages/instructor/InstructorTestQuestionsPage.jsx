import { useState, useEffect, useRef } from 'react';
import {
  getTestQuestions,
  addTestQuestion,
  updateTestQuestion,
  deleteTestQuestion,
  getTestQuestionStats,
  getInstructorLanguages,
} from '../../api/auth';

const CATEGORIES = [
  { value: 'vocabulary', label: 'Vocabulary', icon: '📝', color: 'bg-purple-50 text-purple-700 ring-purple-200', desc: 'Multiple choice — word meanings, synonyms, translations' },
  { value: 'grammar',    label: 'Grammar',    icon: '📐', color: 'bg-blue-50 text-blue-700 ring-blue-200',    desc: 'Multiple choice — correct forms, sentence structure' },
  { value: 'reading',    label: 'Reading',    icon: '📖', color: 'bg-emerald-50 text-emerald-700 ring-emerald-200', desc: 'Read a passage, then answer comprehension MCQ' },
  { value: 'listening',  label: 'Listening',  icon: '🎧', color: 'bg-cyan-50 text-cyan-700 ring-cyan-200',    desc: 'Listen to audio, then answer MCQ' },
  { value: 'writing',    label: 'Writing',    icon: '✍️', color: 'bg-amber-50 text-amber-700 ring-amber-200',  desc: 'Type the correct answer — fill in the blank / translate' },
];

const DIFFICULTIES = [
  { value: 1, label: 'Easy',   color: 'bg-green-50 text-green-700 ring-green-200' },
  { value: 2, label: 'Medium', color: 'bg-amber-50 text-amber-700 ring-amber-200' },
  { value: 3, label: 'Hard',   color: 'bg-red-50 text-red-700 ring-red-200' },
];

const EMPTY_FORM = {
  language_id: '', category: 'vocabulary', difficulty: 1,
  passage: '', question_text: '', audio: null,
  option_a: '', option_b: '', option_c: '', option_d: '',
  correct_option: 'a', correct_text: '',
};

const isMcq = (cat) => cat !== 'writing';

export default function InstructorTestQuestionsPage() {
  const [questions, setQuestions] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLang, setFilterLang] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterDiff, setFilterDiff] = useState('');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState({});
  const [stats, setStats] = useState([]);
  const audioRef = useRef(null);

  useEffect(() => {
    getInstructorLanguages().then(({ data }) => {
      setLanguages(data);
      if (data.length === 1) {
        setFilterLang(String(data[0].id));
      }
    }).catch(() => {});
  }, []);

  const fetchQuestions = () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (filterLang) params.language_id = filterLang;
    if (filterCat) params.category = filterCat;
    if (filterDiff) params.difficulty = filterDiff;
    getTestQuestions(params)
      .then(({ data }) => setQuestions(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchQuestions(); }, [search, filterLang, filterCat, filterDiff]);

  useEffect(() => {
    if (filterLang) {
      getTestQuestionStats({ language_id: filterLang })
        .then(({ data }) => setStats(data))
        .catch(() => setStats([]));
    } else {
      setStats([]);
    }
  }, [filterLang, questions]);

  const openAdd = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, language_id: filterLang || (languages.length === 1 ? String(languages[0].id) : '') });
    setFormErrors({});
    setShowModal(true);
  };

  const openEdit = (q) => {
    setEditing(q);
    setForm({
      language_id: q.language_id,
      category: q.category,
      difficulty: q.difficulty,
      passage: q.passage || '',
      question_text: q.question_text,
      audio: null, // file not re-uploaded unless changed
      option_a: q.option_a || '',
      option_b: q.option_b || '',
      option_c: q.option_c || '',
      option_d: q.option_d || '',
      correct_option: q.correct_option || 'a',
      correct_text: q.correct_text || '',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    setFormErrors({});
    try {
      const payload = { ...form, difficulty: Number(form.difficulty) };
      if (!payload.passage) delete payload.passage;
      if (!payload.audio) delete payload.audio;
      if (!payload.correct_text) delete payload.correct_text;
      if (payload.category === 'writing') {
        delete payload.option_a;
        delete payload.option_b;
        delete payload.option_c;
        delete payload.option_d;
        delete payload.correct_option;
      }
      if (editing) {
        await updateTestQuestion(editing.id, payload);
      } else {
        await addTestQuestion(payload);
      }
      setShowModal(false);
      fetchQuestions();
    } catch (err) {
      if (err.response?.status === 422) {
        setFormErrors(err.response.data.errors || {});
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    await deleteTestQuestion(deleting.id);
    setDeleting(null);
    fetchQuestions();
  };

  const getCat = (v) => CATEGORIES.find((c) => c.value === v) || CATEGORIES[0];
  const getDiff = (v) => DIFFICULTIES.find((d) => d.value === v) || DIFFICULTIES[0];
  const getStatCount = (cat, diff) => {
    const s = stats.find((x) => x.category === cat && x.difficulty === diff);
    return s ? s.total : 0;
  };

  const totalStats = CATEGORIES.reduce((sum, cat) =>
    sum + DIFFICULTIES.reduce((s, d) => s + getStatCount(cat.value, d.value), 0), 0);
  const readyCount = CATEGORIES.reduce((sum, cat) =>
    sum + DIFFICULTIES.reduce((s, d) => s + (getStatCount(cat.value, d.value) >= 2 ? 1 : 0), 0), 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Test Questions</h1>
          <p className="text-sm text-gray-500 mt-1">Create placement test questions across 5 skill areas</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl font-semibold text-sm hover:from-violet-700 hover:to-purple-700 transition-all shadow-md shadow-violet-500/20 cursor-pointer">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Add Question
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-gray-100 p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px] max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input type="text" placeholder="Search questions..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-transparent outline-none" />
          </div>
          <select value={filterLang} onChange={(e) => setFilterLang(e.target.value)}
            disabled={languages.length <= 1}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer disabled:opacity-70">
            {languages.length > 1 && <option value="">All Languages</option>}
            {languages.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
          </select>
          <select value={filterCat} onChange={(e) => setFilterCat(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer">
            <option value="">All Categories</option>
            {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
          </select>
          <select value={filterDiff} onChange={(e) => setFilterDiff(e.target.value)}
            className="px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer">
            <option value="">All Difficulties</option>
            {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
          </select>
        </div>
      </div>

      {/* Stats Grid – only when a language is selected */}
      {filterLang && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="p-5 border-b border-gray-50 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-gray-800">Question Coverage</h3>
              <p className="text-xs text-gray-400 mt-0.5">Need at least 2 per cell for a complete test ({readyCount}/15 ready)</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-gray-500">{totalStats} total</span>
              <div className="w-20 h-2 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 rounded-full transition-all" style={{ width: `${Math.min(100, (readyCount / 15) * 100)}%` }} />
              </div>
            </div>
          </div>
          <div className="p-5">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr>
                    <th className="text-left py-2 px-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Category</th>
                    {DIFFICULTIES.map((d) => (
                      <th key={d.value} className="text-center py-2 px-3 text-gray-500 font-medium text-xs uppercase tracking-wider">{d.label}</th>
                    ))}
                    <th className="text-center py-2 px-3 text-gray-500 font-medium text-xs uppercase tracking-wider">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {CATEGORIES.map((cat) => {
                    const catTotal = DIFFICULTIES.reduce((s, d) => s + getStatCount(cat.value, d.value), 0);
                    return (
                      <tr key={cat.value} className="border-t border-gray-50 hover:bg-gray-50/50 transition-colors">
                        <td className="py-3 px-3">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{cat.icon}</span>
                            <div>
                              <span className="font-medium text-gray-700 text-sm">{cat.label}</span>
                              <span className="text-[10px] text-gray-400 block leading-tight">{cat.value === 'writing' ? 'Type answer' : 'MCQ'}</span>
                            </div>
                          </div>
                        </td>
                        {DIFFICULTIES.map((d) => {
                          const count = getStatCount(cat.value, d.value);
                          const ok = count >= 2;
                          return (
                            <td key={d.value} className="text-center py-3 px-3">
                              <span className={`inline-flex items-center justify-center w-9 h-9 rounded-xl font-bold text-sm transition-all ${
                                ok ? 'bg-emerald-50 text-emerald-600 ring-1 ring-emerald-200' : count > 0 ? 'bg-amber-50 text-amber-600 ring-1 ring-amber-200' : 'bg-red-50 text-red-400 ring-1 ring-red-200'
                              }`}>
                                {count}
                              </span>
                            </td>
                          );
                        })}
                        <td className="text-center py-3 px-3">
                          <span className="font-semibold text-gray-600">{catTotal}</span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Questions List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="flex items-center gap-4 animate-pulse">
                <div className="w-10 h-10 bg-gray-100 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <div className="h-3 w-48 bg-gray-100 rounded" />
                  <div className="h-3 w-80 bg-gray-50 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : questions.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-violet-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">❓</span>
            </div>
            <p className="font-semibold text-gray-700">No questions yet</p>
            <p className="text-sm text-gray-400 mt-1 mb-4">Add test questions so learners can take the placement test</p>
            <button onClick={openAdd}
              className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-semibold hover:bg-violet-700 cursor-pointer transition-colors">
              Add First Question
            </button>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {questions.map((q, idx) => {
              const cat = getCat(q.category);
              const diff = getDiff(q.difficulty);
              const isWriting = q.category === 'writing';
              const isListening = q.category === 'listening';
              const isReading = q.category === 'reading';
              return (
                <div key={q.id} className="px-5 py-4 hover:bg-gray-50/30 transition-colors group">
                  <div className="flex items-start gap-4">
                    {/* Category icon */}
                    <div className={`shrink-0 w-10 h-10 rounded-xl flex items-center justify-center text-lg ${cat.color} ring-1`}>
                      {cat.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      {/* Badges */}
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ring-1 ${cat.color}`}>
                          {cat.label}
                        </span>
                        <span className={`inline-flex px-2 py-0.5 rounded-md text-[11px] font-semibold ring-1 ${diff.color}`}>
                          {diff.label}
                        </span>
                        {isWriting && <span className="text-[10px] px-2 py-0.5 rounded-md bg-amber-50 text-amber-600 ring-1 ring-amber-200 font-semibold">✏️ Type answer</span>}
                        {isListening && <span className="text-[10px] px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-600 ring-1 ring-cyan-200 font-semibold">🎧 Audio</span>}
                        <span className="text-[11px] text-gray-400">{q.language?.name}</span>
                      </div>

                      {/* Passage preview */}
                      {isReading && q.passage && (
                        <p className="text-xs text-emerald-500 italic mb-1 line-clamp-1">📖 {q.passage}</p>
                      )}

                      {/* Audio preview */}
                      {isListening && q.audio_url && (
                        <div className="mb-2">
                          <audio controls className="h-8 w-64" src={q.audio_url}>
                            Your browser does not support audio.
                          </audio>
                        </div>
                      )}

                      {/* Question */}
                      <p className="text-sm font-medium text-gray-800 mb-2">{q.question_text}</p>

                      {/* Options or correct text */}
                      {isWriting ? (
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-gray-400">Correct answer:</span>
                          <span className="text-xs px-3 py-1.5 rounded-lg bg-green-50 text-green-700 font-semibold ring-1 ring-green-200">
                            {q.correct_text}
                          </span>
                        </div>
                      ) : (
                        <div className="grid grid-cols-2 gap-1.5">
                          {['a', 'b', 'c', 'd'].map((opt) => (
                            <div key={opt}
                              className={`text-xs px-2.5 py-1.5 rounded-lg ${
                                q.correct_option === opt
                                  ? 'bg-green-50 text-green-700 font-semibold ring-1 ring-green-200'
                                  : 'bg-gray-50 text-gray-600'
                              }`}>
                              <span className="font-bold uppercase mr-1">{opt}.</span>
                              {q[`option_${opt}`]}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(q)}
                        className="p-2 text-gray-400 hover:text-violet-600 hover:bg-violet-50 rounded-lg transition-colors cursor-pointer" title="Edit">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                        </svg>
                      </button>
                      <button onClick={() => setDeleting(q)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer" title="Delete">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Add/Edit Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto">
            {/* Modal header */}
            <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
              <div>
                <h2 className="text-lg font-bold text-gray-900">{editing ? 'Edit Question' : 'New Question'}</h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {getCat(form.category).icon} {getCat(form.category).desc}
                </p>
              </div>
              <button onClick={() => setShowModal(false)} className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="p-6 space-y-5">
              {/* Row 1: Language, Category, Difficulty */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Language</label>
                  <select value={form.language_id} onChange={(e) => setForm({ ...form, language_id: e.target.value })}
                    disabled={languages.length <= 1}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer disabled:opacity-70">
                    {languages.length > 1 && <option value="">Select...</option>}
                    {languages.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>
                  {formErrors.language_id && <p className="text-red-500 text-xs mt-1">{formErrors.language_id[0]}</p>}
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Category</label>
                  <select value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value, passage: '', audio: null, correct_text: '', option_a: '', option_b: '', option_c: '', option_d: '', correct_option: 'a' })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer">
                    {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.icon} {c.label}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Difficulty</label>
                  <select value={form.difficulty} onChange={(e) => setForm({ ...form, difficulty: e.target.value })}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-white focus:ring-2 focus:ring-violet-500 outline-none cursor-pointer">
                    {DIFFICULTIES.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
                  </select>
                </div>
              </div>

              {/* Category hint banner */}
              <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm ${getCat(form.category).color} ring-1`}>
                <span className="text-xl">{getCat(form.category).icon}</span>
                <span className="font-medium">{getCat(form.category).desc}</span>
              </div>

              {/* Reading passage */}
              {form.category === 'reading' && (
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">📖 Reading Passage</label>
                  <textarea value={form.passage} onChange={(e) => setForm({ ...form, passage: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none resize-none leading-relaxed"
                    placeholder="Enter the passage that learners will read before answering..." />
                  {formErrors.passage && <p className="text-red-500 text-xs mt-1">{formErrors.passage[0]}</p>}
                </div>
              )}

              {/* Listening audio upload */}
              {form.category === 'listening' && (
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">🎧 Audio File</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-violet-300 transition-colors">
                    {form.audio ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-center gap-2 text-sm text-cyan-700 font-medium">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 9l10.5-3m0 6.553v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 11-.99-3.467l2.31-.66a2.25 2.25 0 001.632-2.163zm0 0V2.25L9 5.25v10.303m0 0v3.75a2.25 2.25 0 01-1.632 2.163l-1.32.377a1.803 1.803 0 01-.99-3.467l2.31-.66A2.25 2.25 0 009 15.553z" />
                          </svg>
                          {form.audio.name}
                        </div>
                        <button onClick={() => setForm({ ...form, audio: null })}
                          className="text-xs text-red-500 hover:text-red-700 cursor-pointer font-medium">Remove</button>
                      </div>
                    ) : editing?.audio_url ? (
                      <div className="space-y-2">
                        <audio controls className="mx-auto h-8" src={editing.audio_url} ref={audioRef} />
                        <p className="text-xs text-gray-400">Current audio — upload new to replace</p>
                        <label className="inline-flex items-center gap-2 px-4 py-2 bg-cyan-50 text-cyan-700 rounded-lg text-xs font-semibold cursor-pointer hover:bg-cyan-100 transition-colors">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                          </svg>
                          Upload New
                          <input type="file" accept="audio/*" className="hidden"
                            onChange={(e) => setForm({ ...form, audio: e.target.files[0] })} />
                        </label>
                      </div>
                    ) : (
                      <label className="cursor-pointer block py-4">
                        <svg className="w-8 h-8 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                        <span className="text-sm text-gray-500">Click to upload audio</span>
                        <span className="block text-xs text-gray-400 mt-1">MP3, WAV, OGG, M4A (max 10MB)</span>
                        <input type="file" accept="audio/*" className="hidden"
                          onChange={(e) => setForm({ ...form, audio: e.target.files[0] })} />
                      </label>
                    )}
                  </div>
                  {formErrors.audio && <p className="text-red-500 text-xs mt-1">{formErrors.audio[0]}</p>}
                </div>
              )}

              {/* Question text */}
              <div>
                <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">Question</label>
                <textarea value={form.question_text} onChange={(e) => setForm({ ...form, question_text: e.target.value })}
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none resize-none"
                  placeholder={
                    form.category === 'vocabulary' ? 'e.g. What is the meaning of "abundant"?' :
                    form.category === 'grammar' ? 'e.g. Choose the correct sentence:' :
                    form.category === 'reading' ? 'e.g. What is the main idea of the passage?' :
                    form.category === 'listening' ? 'e.g. What did the speaker say?' :
                    'e.g. Translate: "The cat is on the table"'
                  } />
                {formErrors.question_text && <p className="text-red-500 text-xs mt-1">{formErrors.question_text[0]}</p>}
              </div>

              {/* MCQ Options (vocabulary, grammar, reading, listening) */}
              {isMcq(form.category) && (
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-2">Answer Options</label>
                  <div className="space-y-2">
                    {['a', 'b', 'c', 'd'].map((opt) => (
                      <div key={opt} className="flex items-center gap-2">
                        <button type="button"
                          onClick={() => setForm({ ...form, correct_option: opt })}
                          className={`shrink-0 w-9 h-9 flex items-center justify-center rounded-xl text-xs font-bold uppercase cursor-pointer transition-all ${
                            form.correct_option === opt
                              ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-500/30'
                              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                          }`}
                          title={`Mark ${opt.toUpperCase()} as correct`}>
                          {form.correct_option === opt ? '✓' : opt}
                        </button>
                        <input type="text" value={form[`option_${opt}`]}
                          onChange={(e) => setForm({ ...form, [`option_${opt}`]: e.target.value })}
                          className={`flex-1 px-4 py-2.5 border rounded-xl text-sm outline-none transition-colors ${
                            form.correct_option === opt
                              ? 'border-emerald-300 bg-emerald-50/30 focus:ring-2 focus:ring-emerald-500'
                              : 'border-gray-200 focus:ring-2 focus:ring-violet-500'
                          }`}
                          placeholder={`Option ${opt.toUpperCase()}`} />
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-gray-400 mt-2 flex items-center gap-1.5">
                    <span className="w-4 h-4 bg-emerald-500 text-white rounded-md text-[9px] font-bold flex items-center justify-center">✓</span>
                    Click a letter to mark it as the correct answer
                  </p>
                </div>
              )}

              {/* Writing: correct text */}
              {form.category === 'writing' && (
                <div>
                  <label className="block text-[13px] font-semibold text-gray-700 mb-1.5">✅ Correct Answer</label>
                  <input type="text" value={form.correct_text}
                    onChange={(e) => setForm({ ...form, correct_text: e.target.value })}
                    className="w-full px-4 py-3 border border-emerald-200 rounded-xl text-sm bg-emerald-50/30 focus:ring-2 focus:ring-emerald-500 outline-none"
                    placeholder="The exact answer the learner must type (case-insensitive)" />
                  <p className="text-xs text-gray-400 mt-1.5">Learner's answer is compared case-insensitively. Must be an exact match.</p>
                  {formErrors.correct_text && <p className="text-red-500 text-xs mt-1">{formErrors.correct_text[0]}</p>}
                </div>
              )}
            </div>

            {/* Modal footer */}
            <div className="sticky bottom-0 bg-white border-t border-gray-100 px-6 py-4 flex items-center justify-end gap-3 rounded-b-2xl">
              <button onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">
                Cancel
              </button>
              <button onClick={handleSave} disabled={saving}
                className="px-6 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white rounded-xl text-sm font-semibold hover:from-violet-700 hover:to-purple-700 disabled:opacity-50 transition-all cursor-pointer shadow-md shadow-violet-500/20">
                {saving ? 'Saving...' : editing ? 'Update Question' : 'Create Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Delete Modal ── */}
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
              <h3 className="text-lg font-bold text-gray-900">Delete Question</h3>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">"{deleting.question_text}"</p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setDeleting(null)}
                className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-xl transition-colors cursor-pointer">Cancel</button>
              <button onClick={handleDelete}
                className="px-5 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 transition-colors cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
