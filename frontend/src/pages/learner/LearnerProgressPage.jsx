import { useState } from 'react';

export default function LearnerProgressPage() {
  const [period, setPeriod] = useState('week');

  const periods = [
    { key: 'week', label: 'This Week' },
    { key: 'month', label: 'This Month' },
    { key: 'all', label: 'All Time' },
  ];

  // Mock heatmap (12 weeks × 7 days)
  const heatmapData = Array.from({ length: 84 }, () => Math.random() > 0.6 ? Math.floor(Math.random() * 4) : 0);
  const heatmapColors = ['bg-gray-100', 'bg-violet-200', 'bg-violet-400', 'bg-violet-600'];

  return (
    <div className="space-y-6">
      {/* Header with period switcher */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">My Progress</h1>
          <p className="text-sm text-gray-500 mt-1">Track your learning journey and achievements</p>
        </div>
        <div className="flex items-center gap-1 bg-gray-100/80 rounded-xl p-1">
          {periods.map((p) => (
            <button key={p.key} onClick={() => setPeriod(p.key)}
              className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 cursor-pointer ${
                period === p.key
                  ? 'bg-white text-violet-700 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Overview Stats — 5 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[
          { label: 'Total XP', value: '0', icon: '⚡', gradient: 'from-amber-500 to-orange-500', light: 'from-amber-50 to-orange-50', text: 'text-amber-700' },
          { label: 'Lessons Done', value: '0', icon: '📚', gradient: 'from-violet-500 to-purple-500', light: 'from-violet-50 to-purple-50', text: 'text-violet-700' },
          { label: 'Exercises Done', value: '0', icon: '✏️', gradient: 'from-emerald-500 to-teal-500', light: 'from-emerald-50 to-teal-50', text: 'text-emerald-700' },
          { label: 'Day Streak', value: '0', icon: '🔥', gradient: 'from-rose-500 to-pink-500', light: 'from-rose-50 to-pink-50', text: 'text-rose-700' },
          { label: 'Time Spent', value: '0h', icon: '⏱️', gradient: 'from-blue-500 to-indigo-500', light: 'from-blue-50 to-indigo-50', text: 'text-blue-700' },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group cursor-default">
            <div className={`h-1 bg-gradient-to-r ${stat.gradient}`} />
            <div className="p-4">
              <div className={`w-10 h-10 bg-gradient-to-br ${stat.light} rounded-xl flex items-center justify-center text-lg mb-3 group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
              <p className={`text-xl font-bold ${stat.text}`}>{stat.value}</p>
              <p className="text-[12px] text-gray-400 mt-0.5 font-medium">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Activity Heatmap */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="text-base font-bold text-gray-800">Activity Heatmap</h3>
              <p className="text-xs text-gray-400 mt-0.5">Your learning activity over the past 12 weeks</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[10px] text-gray-400 mr-1">Less</span>
              {heatmapColors.map((c, i) => (
                <div key={i} className={`w-3.5 h-3.5 rounded-[3px] ${c}`} />
              ))}
              <span className="text-[10px] text-gray-400 ml-1">More</span>
            </div>
          </div>
          <div className="grid grid-cols-12 gap-1.5">
            {heatmapData.map((val, i) => (
              <div key={i}
                className={`aspect-square rounded-[4px] ${heatmapColors[val]} transition-all duration-200 hover:ring-2 hover:ring-violet-300 hover:scale-110 cursor-default`}
                title={`${val > 0 ? val * 15 + ' min' : 'No activity'}`} />
            ))}
          </div>
        </div>

        {/* Skills Breakdown */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h3 className="text-base font-bold text-gray-800 mb-5">Skills</h3>
          <div className="space-y-4">
            {[
              { skill: 'Grammar', progress: 0, gradient: 'from-violet-500 to-purple-500', icon: '📝' },
              { skill: 'Vocabulary', progress: 0, gradient: 'from-emerald-500 to-teal-500', icon: '📖' },
              { skill: 'Reading', progress: 0, gradient: 'from-blue-500 to-indigo-500', icon: '👁️' },
              { skill: 'Listening', progress: 0, gradient: 'from-amber-500 to-orange-500', icon: '🎧' },
              { skill: 'Writing', progress: 0, gradient: 'from-rose-500 to-pink-500', icon: '✍️' },
            ].map((s) => (
              <div key={s.skill}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{s.icon}</span>
                    <span className="text-sm text-gray-700 font-semibold">{s.skill}</span>
                  </div>
                  <span className="text-xs text-gray-400 font-bold">{s.progress}%</span>
                </div>
                <div className="w-full h-2.5 bg-gray-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-gradient-to-r ${s.gradient} rounded-full transition-all duration-700`} style={{ width: `${s.progress}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-5 pt-4 border-t border-gray-50 text-center">
            <p className="text-[12px] text-gray-400 font-medium">Complete exercises to build your skills</p>
          </div>
        </div>
      </div>

      {/* Language Progress */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-violet-500 via-purple-500 to-fuchsia-500" />
        <div className="p-6">
          <h3 className="text-base font-bold text-gray-800 mb-5">Language Progress</h3>
          <div className="text-center py-8">
            <div className="w-20 h-20 bg-gradient-to-br from-violet-50 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-5 shadow-sm">
              <span className="text-4xl">🌐</span>
            </div>
            <h4 className="font-bold text-gray-700 text-base mb-1">No languages enrolled yet</h4>
            <p className="text-sm text-gray-400 max-w-xs mx-auto leading-relaxed">
              Choose a language to start tracking your progress across all skills.
            </p>
            <a href="/learner/languages" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-gradient-to-r from-violet-600 to-purple-600 text-white text-sm font-semibold rounded-xl hover:from-violet-700 hover:to-purple-700 transition-all shadow-lg shadow-violet-500/20">
              Browse Languages
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </a>
          </div>
        </div>
      </div>

      {/* Achievements */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h3 className="text-base font-bold text-gray-800">Achievements</h3>
          <span className="px-2.5 py-1 bg-amber-50 text-amber-600 text-xs font-bold rounded-full">0 / 6</span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { title: 'First Step', desc: 'Complete your first lesson', icon: '🎯', unlocked: false },
            { title: 'Word Collector', desc: 'Learn 50 new words', icon: '📝', unlocked: false },
            { title: 'Streak Master', desc: '7-day learning streak', icon: '🔥', unlocked: false },
            { title: 'Quiz Pro', desc: 'Score 100% on a test', icon: '🏆', unlocked: false },
            { title: 'Book Worm', desc: 'Complete 10 reading exercises', icon: '📚', unlocked: false },
            { title: 'Multilingual', desc: 'Enroll in 3 languages', icon: '🌍', unlocked: false },
          ].map((ach) => (
            <div key={ach.title} className={`bg-white rounded-2xl border overflow-hidden transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 group ${
              ach.unlocked ? 'border-amber-200 shadow-sm' : 'border-gray-100'
            }`}>
              {/* Top accent */}
              <div className={`h-1 ${ach.unlocked ? 'bg-gradient-to-r from-amber-400 to-yellow-400' : 'bg-gray-100'}`} />
              <div className="p-4 text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-2.5 text-2xl transition-transform duration-300 group-hover:scale-110 ${
                  ach.unlocked ? 'bg-gradient-to-br from-amber-50 to-yellow-50 shadow-sm' : 'bg-gray-50 grayscale'
                }`}>
                  {ach.icon}
                </div>
                <h4 className="text-[13px] font-bold text-gray-700 mb-0.5">{ach.title}</h4>
                <p className="text-[10px] text-gray-400 leading-relaxed">{ach.desc}</p>
                {!ach.unlocked && (
                  <div className="mt-2.5 flex items-center justify-center gap-1 text-gray-300">
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
                    </svg>
                    <span className="text-[10px] font-semibold">Locked</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
