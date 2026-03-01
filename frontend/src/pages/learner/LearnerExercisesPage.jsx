import { useState } from 'react';

const categories = [
  { key: 'all', label: 'All', icon: '📋' },
  { key: 'grammar', label: 'Grammar', icon: '📝' },
  { key: 'vocabulary', label: 'Vocabulary', icon: '📖' },
  { key: 'reading', label: 'Reading', icon: '👁️' },
  { key: 'listening', label: 'Listening', icon: '🎧' },
  { key: 'writing', label: 'Writing', icon: '✍️' },
];

export default function LearnerExercisesPage() {
  const [activeCategory, setActiveCategory] = useState('all');

  return (
    <div className="space-y-6">
      {/* Header with stats */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Exercises</h1>
          <p className="text-sm text-gray-500 mt-1">Practice and strengthen your skills</p>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <div className="flex items-center gap-2 px-3.5 py-2 bg-emerald-50 rounded-xl">
            <svg className="w-4 h-4 text-emerald-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-xs font-bold text-emerald-700">0 completed</span>
          </div>
          <div className="flex items-center gap-2 px-3.5 py-2 bg-violet-50 rounded-xl">
            <span className="text-sm">🔥</span>
            <span className="text-xs font-bold text-violet-700">0 streak</span>
          </div>
        </div>
      </div>

      {/* Category Filter — inside a card */}
      <div className="bg-white rounded-2xl border border-gray-100 p-2 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {categories.map((cat) => (
            <button key={cat.key} onClick={() => setActiveCategory(cat.key)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all duration-250 cursor-pointer ${
                activeCategory === cat.key
                  ? 'bg-gradient-to-r from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/20'
                  : 'text-gray-500 hover:bg-gray-50 hover:text-gray-700'
              }`}>
              <span className="text-base">{cat.icon}</span>
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Empty State — engaging */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
        <div className="text-center py-16 px-4">
          <div className="w-20 h-20 bg-gradient-to-br from-violet-50 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
            <span className="text-4xl">🧩</span>
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-2">No exercises available yet</h3>
          <p className="text-sm text-gray-400 mb-6 max-w-sm mx-auto leading-relaxed">
            Exercises will appear here once you enroll in a course. Take the placement test to unlock exercises matched to your level!
          </p>
          <div className="flex items-center justify-center gap-3">
            <a href="/learner/test" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/20">
              Take Placement Test
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </a>
            <a href="/learner/languages" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition-all">
              Browse Languages
            </a>
          </div>
        </div>
      </div>

      {/* Exercise Types Preview */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-base font-bold text-gray-800">Exercise Types</h3>
          <span className="px-2.5 py-1 bg-gray-100 text-gray-500 text-xs font-bold rounded-full">6 types</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { title: 'Multiple Choice', desc: 'Choose the correct answer from options', icon: '🔘', gradient: 'from-violet-500 to-purple-500', light: 'from-violet-50 to-purple-50', count: '0' },
            { title: 'Fill in the Blank', desc: 'Complete sentences with the right word', icon: '📝', gradient: 'from-emerald-500 to-teal-500', light: 'from-emerald-50 to-teal-50', count: '0' },
            { title: 'Matching', desc: 'Match pairs of words or phrases', icon: '🔗', gradient: 'from-blue-500 to-indigo-500', light: 'from-blue-50 to-indigo-50', count: '0' },
            { title: 'Translation', desc: 'Translate sentences between languages', icon: '🌐', gradient: 'from-amber-500 to-orange-500', light: 'from-amber-50 to-orange-50', count: '0' },
            { title: 'Listening', desc: 'Listen carefully and answer questions', icon: '🎧', gradient: 'from-rose-500 to-pink-500', light: 'from-rose-50 to-pink-50', count: '0' },
            { title: 'Reading', desc: 'Read passages and answer comprehension', icon: '📖', gradient: 'from-cyan-500 to-blue-500', light: 'from-cyan-50 to-blue-50', count: '0' },
          ].map((type) => (
            <div key={type.title} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-default">
              {/* Gradient top strip */}
              <div className={`h-1.5 bg-gradient-to-r ${type.gradient}`} />
              <div className="p-5">
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-12 h-12 bg-gradient-to-br ${type.light} rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300`}>
                    {type.icon}
                  </div>
                  <span className="text-[11px] font-bold px-2.5 py-1 bg-gray-50 text-gray-400 rounded-full">{type.count} available</span>
                </div>
                <h4 className="font-bold text-gray-800 text-[14px] mb-1 group-hover:text-violet-700 transition-colors duration-200">{type.title}</h4>
                <p className="text-[12px] text-gray-400 leading-relaxed">{type.desc}</p>
                {/* Progress placeholder */}
                <div className="mt-3 flex items-center gap-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div className={`h-full bg-gradient-to-r ${type.gradient} rounded-full`} style={{ width: '0%' }} />
                  </div>
                  <span className="text-[10px] font-semibold text-gray-400">0%</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
