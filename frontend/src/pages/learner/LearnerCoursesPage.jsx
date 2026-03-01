import { useState, useEffect } from 'react';
import { getLearnerChapters } from '../../api/auth';

const LEVEL_THEMES = {
  1: { bg: 'from-emerald-500 to-teal-500', light: 'from-emerald-50 to-teal-50', badge: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: '🌱', label: 'Beginner', accent: 'emerald' },
  2: { bg: 'from-amber-500 to-orange-500', light: 'from-amber-50 to-orange-50', badge: 'bg-amber-50 text-amber-700 ring-amber-200', icon: '📚', label: 'Intermediate', accent: 'amber' },
  3: { bg: 'from-rose-500 to-pink-500', light: 'from-rose-50 to-pink-50', badge: 'bg-rose-50 text-rose-700 ring-rose-200', icon: '🎓', label: 'Advanced', accent: 'rose' },
};

export default function LearnerCoursesPage() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeLevel, setActiveLevel] = useState(null);

  const fetchChapters = (langId) => {
    if (!langId) { setGroups([]); setLoading(false); return; }
    setLoading(true);
    getLearnerChapters({ language_id: langId })
      .then(({ data }) => {
        setGroups(data);
        if (data.length) setActiveLevel(data[0].id);
        else setActiveLevel(null);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchChapters(localStorage.getItem('selectedLanguageId'));
  }, []);

  useEffect(() => {
    const handler = () => fetchChapters(localStorage.getItem('selectedLanguageId'));
    window.addEventListener('languageChanged', handler);
    return () => window.removeEventListener('languageChanged', handler);
  }, []);

  const langId = localStorage.getItem('selectedLanguageId');
  const getTheme = (order) => LEVEL_THEMES[order] || LEVEL_THEMES[1];
  const totalChapters = groups.reduce((s, g) => s + g.chapters.length, 0);

  // ─── No language ───
  if (!langId) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Track and continue your learning journey</p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-50 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <span className="text-4xl">📖</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No language selected</h3>
            <p className="text-sm text-gray-400 mb-6 max-w-xs mx-auto leading-relaxed">
              Select a language from the header dropdown to see available courses.
            </p>
            <a href="/learner/languages" className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/20">
              Browse Languages
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Courses</h1>
          <p className="text-sm text-gray-500 mt-1">Track and continue your learning journey</p>
        </div>
        {!loading && groups.length > 0 && (
          <div className="hidden sm:flex items-center gap-3">
            <div className="flex items-center gap-2 px-3.5 py-2 bg-violet-50 rounded-xl">
              <span className="text-sm">📚</span>
              <span className="text-xs font-bold text-violet-700">{totalChapters} chapters</span>
            </div>
            <div className="flex items-center gap-2 px-3.5 py-2 bg-blue-50 rounded-xl">
              <span className="text-sm">📊</span>
              <span className="text-xs font-bold text-blue-700">{groups.length} levels</span>
            </div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="space-y-5">
          {/* Skeleton tabs */}
          <div className="flex gap-2">
            {[...Array(3)].map((_, i) => <div key={i} className="h-12 w-36 bg-gray-100 rounded-2xl animate-pulse" />)}
          </div>
          {/* Skeleton cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse rounded-2xl overflow-hidden border border-gray-100">
                <div className="h-36 bg-gray-100" />
                <div className="p-5 space-y-3">
                  <div className="h-3 w-3/4 bg-gray-100 rounded" />
                  <div className="h-3 w-1/2 bg-gray-50 rounded" />
                  <div className="flex gap-2">
                    <div className="h-8 w-16 bg-gray-50 rounded-lg" />
                    <div className="h-8 w-16 bg-gray-50 rounded-lg" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm">
          <div className="text-center py-16 px-4">
            <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <span className="text-4xl">📋</span>
            </div>
            <h3 className="text-lg font-bold text-gray-800 mb-2">No courses available yet</h3>
            <p className="text-sm text-gray-400 max-w-sm mx-auto leading-relaxed">
              Chapters for this language haven't been published yet. Check back soon!
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* Level Tabs — pill style */}
          <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
            <div className="flex items-center gap-1.5 flex-wrap">
              {groups.map((g) => {
                const t = getTheme(g.order);
                const isActive = activeLevel === g.id;
                return (
                  <button key={g.id} onClick={() => setActiveLevel(g.id)}
                    className={`flex items-center gap-2.5 px-5 py-3 rounded-xl text-sm font-semibold transition-all duration-250 cursor-pointer ${
                      isActive
                        ? `bg-gradient-to-r ${t.bg} text-white shadow-lg shadow-${t.accent}-500/20`
                        : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
                    }`}>
                    <span className="text-base">{t.icon}</span>
                    <span>{g.name}</span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      isActive ? 'bg-white/25 text-white' : 'bg-gray-100 text-gray-400'
                    }`}>
                      {g.chapters.length}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Level Content */}
          {groups.filter((g) => g.id === activeLevel).map((g) => {
            const t = getTheme(g.order);
            return (
              <div key={g.id} className="space-y-5">
                {/* Level banner */}
                <div className={`bg-gradient-to-r ${t.light} rounded-2xl border border-gray-100/50 p-5 flex items-center gap-4`}>
                  <div className={`w-12 h-12 bg-gradient-to-br ${t.bg} rounded-2xl flex items-center justify-center text-2xl shadow-md shadow-${t.accent}-500/20`}>
                    {t.icon}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-base font-bold text-gray-800">{g.name}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">{g.chapters.length} chapter{g.chapters.length !== 1 ? 's' : ''} available</p>
                  </div>
                  <div className="hidden sm:flex items-center gap-2">
                    <div className="h-2 w-24 bg-white/80 rounded-full overflow-hidden shadow-inner">
                      <div className={`h-full bg-gradient-to-r ${t.bg} rounded-full`} style={{ width: '0%' }} />
                    </div>
                    <span className="text-[11px] font-semibold text-gray-400">0%</span>
                  </div>
                </div>

                {g.chapters.length === 0 ? (
                  <div className="bg-white rounded-2xl border border-gray-100 p-10 text-center">
                    <span className="text-3xl block mb-3">📝</span>
                    <p className="text-sm text-gray-400 font-medium">No chapters published for this level yet.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {g.chapters.map((ch, idx) => (
                      <div key={ch.id}
                        className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group">
                        {/* Chapter cover gradient */}
                        <div className={`h-32 bg-gradient-to-br ${t.bg} p-5 flex flex-col justify-between relative overflow-hidden`}>
                          {/* Decorative circles */}
                          <div className="absolute top-0 right-0 w-28 h-28 bg-white/10 rounded-full -translate-y-1/3 translate-x-1/4" />
                          <div className="absolute bottom-0 left-0 w-16 h-16 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/3" />

                          {/* Chapter number badge */}
                          <div className="flex items-center justify-between relative z-10">
                            <div className="flex items-center gap-1.5">
                              <span className="bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wide">
                                Chapter {idx + 1}
                              </span>
                            </div>
                            {(ch.pdf_url || ch.video_url) && (
                              <div className="flex items-center gap-1">
                                {ch.pdf_url && (
                                  <span className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center" title="Has PDF">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                )}
                                {ch.video_url && (
                                  <span className="w-6 h-6 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center" title="Has Video">
                                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                    </svg>
                                  </span>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Chapter title */}
                          <h3 className="text-white font-bold text-[15px] leading-snug line-clamp-2 relative z-10 group-hover:translate-x-0.5 transition-transform duration-300">
                            {ch.title}
                          </h3>
                        </div>

                        {/* Chapter body */}
                        <div className="p-5 space-y-4">
                          {ch.description && (
                            <p className="text-[13px] text-gray-500 line-clamp-2 leading-relaxed">{ch.description}</p>
                          )}

                          {/* Resource buttons */}
                          <div className="flex items-center gap-2">
                            {ch.pdf_url && (
                              <a href={ch.pdf_url} target="_blank" rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-red-50 to-rose-50 text-red-600 rounded-xl text-xs font-semibold hover:from-red-100 hover:to-rose-100 transition-all duration-200 ring-1 ring-red-100 group/btn">
                                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                                </svg>
                                Open PDF
                              </a>
                            )}
                            {ch.video_url && (
                              <a href={ch.video_url} target="_blank" rel="noreferrer"
                                className="flex-1 flex items-center justify-center gap-2 px-3 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-600 rounded-xl text-xs font-semibold hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 ring-1 ring-blue-100 group/btn">
                                <svg className="w-4 h-4 group-hover/btn:scale-110 transition-transform" fill="currentColor" viewBox="0 0 20 20">
                                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                </svg>
                                Watch Video
                              </a>
                            )}
                            {!ch.pdf_url && !ch.video_url && (
                              <div className="flex items-center gap-2 text-xs text-gray-400">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                Content coming soon
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </>
      )}
    </div>
  );
}
