import { useState, useRef, useEffect, useCallback } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RoleLayout({ navItems, children, theme = 'light', headerExtra }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const dark = theme === 'dark';

  return (
    <div className={`min-h-screen flex ${dark ? 'bg-[#0B1120]' : 'bg-gray-50/80'}`}>
      {/* Sidebar */}
      <aside className={`w-64 flex flex-col fixed h-full z-40 ${
        dark
          ? 'bg-[#0f1629] border-r border-white/5'
          : 'bg-white border-r border-gray-200/80 shadow-sm'
      }`}>
        <div className={`px-6 py-5 border-b ${dark ? 'border-white/5' : 'border-gray-100'}`}>
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-md transition-shadow duration-300 ${
              dark
                ? 'bg-blue-500 shadow-blue-500/20 group-hover:shadow-lg group-hover:shadow-blue-500/30'
                : 'bg-blue-600 shadow-blue-600/20 group-hover:shadow-lg group-hover:shadow-blue-600/30'
            }`}>
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <span className={`text-lg font-bold tracking-tight ${dark ? 'text-white' : 'text-gray-800'}`}>LinguaPro</span>
              <p className={`text-[11px] font-medium ${dark ? 'text-slate-500' : 'text-gray-400'}`}>Language Platform</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-xl transition-all duration-200 ${
                  dark
                    ? isActive
                      ? 'font-semibold text-blue-400 bg-blue-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                    : isActive
                      ? 'font-semibold text-blue-600 bg-blue-50/80 shadow-sm shadow-blue-100'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}>
                <span className={`transition-colors duration-200 ${
                  dark
                    ? isActive ? 'text-blue-400' : 'text-slate-500'
                    : isActive ? 'text-blue-600' : 'text-gray-400'
                }`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 pb-4 pt-3 mt-auto">
          <div className={`rounded-2xl p-3 border ${
            dark
              ? 'bg-white/[0.03] border-white/5'
              : 'bg-gradient-to-br from-gray-50/80 to-blue-50/40 border-gray-100/80'
          }`}>
            <Link to="/profile" className="flex items-center gap-3 group cursor-pointer">
              {user?.avatar ? (
                <img src={`http://localhost:8000/storage/${user.avatar}`} alt="Avatar"
                  className={`w-10 h-10 rounded-xl object-cover ring-2 shadow-sm shrink-0 transition-all duration-300 ${
                    dark ? 'ring-white/10 group-hover:ring-blue-500/30' : 'ring-white group-hover:ring-blue-100'
                  }`} />
              ) : (
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-semibold text-sm shadow-sm shrink-0 transition-all duration-300 ${
                  dark
                    ? 'bg-gradient-to-br from-blue-400 to-blue-500 text-white shadow-blue-500/20 group-hover:shadow-md group-hover:shadow-blue-500/30'
                    : 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-blue-500/20 group-hover:shadow-md group-hover:shadow-blue-500/30'
                }`}>
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className={`text-[13px] font-semibold leading-tight truncate transition-colors duration-200 ${
                  dark ? 'text-slate-200 group-hover:text-white' : 'text-gray-700 group-hover:text-gray-900'
                }`}>{user?.name}</p>
                <p className={`text-[11px] truncate mt-0.5 ${dark ? 'text-slate-500' : 'text-gray-400'}`}>{user?.email}</p>
              </div>
              <svg className={`w-4 h-4 transition-colors duration-200 shrink-0 ${
                dark ? 'text-slate-600 group-hover:text-slate-400' : 'text-gray-300 group-hover:text-gray-400'
              }`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
            </Link>
            <div className={`h-px my-2.5 ${
              dark ? 'bg-gradient-to-r from-transparent via-white/5 to-transparent' : 'bg-gradient-to-r from-transparent via-gray-200/60 to-transparent'
            }`} />
            <button onClick={logout}
              className={`flex items-center gap-2.5 px-1 py-1.5 text-[12px] font-medium transition-all duration-200 cursor-pointer w-full group ${
                dark ? 'text-slate-500 hover:text-red-400' : 'text-gray-400 hover:text-red-500'
              }`}>
              <svg className={`w-4 h-4 transition-colors duration-200 ${
                dark ? 'text-slate-600 group-hover:text-red-400' : 'text-gray-300 group-hover:text-red-400'
              }`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Sign out
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64">
        {/* Top bar */}
        <header className={`backdrop-blur-md border-b sticky top-0 z-30 ${
          dark
            ? 'bg-[#0B1120]/80 border-white/5'
            : 'bg-white/80 border-gray-200/60'
        }`}>
          <div className="px-8 py-3.5 flex items-center">
            {/* Search */}
            <SearchBar navItems={navItems} dark={dark} />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Header extra (e.g. language selector) — right side */}
            {headerExtra}
          </div>
        </header>

        <main className="px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

/* ── Search bar with navigation command palette ── */
function SearchBar({ navItems, dark }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const inputRef = useRef(null);
  const wrapperRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  // All searchable items: nav items + common pages
  const allItems = navItems;

  const filtered = query.trim()
    ? allItems.filter((item) =>
        item.label.toLowerCase().includes(query.toLowerCase())
      )
    : allItems;

  // Reset active index when filtered results change
  useEffect(() => {
    setActiveIdx(0);
  }, [query]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close on route change
  useEffect(() => {
    setOpen(false);
    setQuery('');
  }, [location.pathname]);

  // Keyboard shortcut: Ctrl+K or / to focus
  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, []);

  const goTo = useCallback((item) => {
    navigate(item.to);
    setOpen(false);
    setQuery('');
    inputRef.current?.blur();
  }, [navigate]);

  const handleKeyDown = (e) => {
    if (!open) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % filtered.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === 'Enter' && filtered[activeIdx]) {
      e.preventDefault();
      goTo(filtered[activeIdx]);
    } else if (e.key === 'Escape') {
      setOpen(false);
      inputRef.current?.blur();
    }
  };

  return (
    <div className="relative w-72" ref={wrapperRef}>
      {/* Search icon */}
      <svg className={`absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none transition-colors duration-200 ${
        open
          ? dark ? 'text-blue-400' : 'text-violet-500'
          : dark ? 'text-slate-500' : 'text-gray-400'
      }`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>

      {/* Input */}
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        onKeyDown={handleKeyDown}
        placeholder="Search pages..."
        className={`w-full pl-9 pr-16 py-2 text-sm rounded-xl outline-none transition-all duration-200 ${
          dark
            ? open
              ? 'bg-white/10 border border-blue-500/40 text-slate-200 placeholder-slate-400 ring-2 ring-blue-500/20'
              : 'bg-white/5 border border-white/10 text-slate-300 placeholder-slate-500'
            : open
              ? 'bg-white border border-violet-300 placeholder-gray-400 ring-2 ring-violet-500/20 shadow-sm'
              : 'bg-gray-50 border border-gray-200 placeholder-gray-400 hover:border-gray-300'
        }`}
      />

      {/* Kbd shortcut hint */}
      {!open && (
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-0.5 pointer-events-none">
          <kbd className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
            dark
              ? 'bg-white/5 border-white/10 text-slate-500'
              : 'bg-gray-100 border-gray-200 text-gray-400'
          }`}>Ctrl</kbd>
          <kbd className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${
            dark
              ? 'bg-white/5 border-white/10 text-slate-500'
              : 'bg-gray-100 border-gray-200 text-gray-400'
          }`}>K</kbd>
        </div>
      )}

      {/* Clear button when typing */}
      {open && query && (
        <button
          onClick={() => { setQuery(''); inputRef.current?.focus(); }}
          className={`absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
            dark ? 'bg-white/10 hover:bg-white/20 text-slate-400' : 'bg-gray-200 hover:bg-gray-300 text-gray-500'
          }`}>
          <svg className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}

      {/* Dropdown */}
      {open && (
        <div className={`absolute top-full left-0 right-0 mt-2 rounded-xl border shadow-xl overflow-hidden z-50 ${
          dark
            ? 'bg-[#111827] border-white/10 shadow-black/30'
            : 'bg-white border-gray-100 shadow-gray-200/60'
        }`}>
          {/* Header */}
          <div className={`px-3.5 py-2 text-[10px] font-bold uppercase tracking-widest border-b ${
            dark ? 'text-slate-500 border-white/5 bg-white/[0.02]' : 'text-gray-400 border-gray-50 bg-gray-50/50'
          }`}>
            {query ? `Results for "${query}"` : 'Quick Navigation'}
          </div>

          {/* Results */}
          <div className="max-h-64 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <div className={`px-4 py-6 text-center ${dark ? 'text-slate-500' : 'text-gray-400'}`}>
                <svg className={`w-8 h-8 mx-auto mb-2 ${dark ? 'text-slate-600' : 'text-gray-300'}`} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                </svg>
                <p className="text-xs font-medium">No pages match "{query}"</p>
              </div>
            ) : (
              filtered.map((item, idx) => {
                const isActive = idx === activeIdx;
                const isCurrent = location.pathname === item.to;
                return (
                  <button
                    key={item.to}
                    onClick={() => goTo(item)}
                    onMouseEnter={() => setActiveIdx(idx)}
                    className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-left transition-all duration-100 cursor-pointer ${
                      dark
                        ? isActive ? 'bg-blue-500/10 text-blue-400' : 'text-slate-300 hover:bg-white/5'
                        : isActive ? 'bg-violet-50 text-violet-700' : 'text-gray-700 hover:bg-gray-50'
                    }`}>
                    {/* Icon */}
                    <span className={`shrink-0 transition-colors ${
                      dark
                        ? isActive ? 'text-blue-400' : 'text-slate-500'
                        : isActive ? 'text-violet-500' : 'text-gray-400'
                    }`}>
                      {item.icon}
                    </span>
                    {/* Label */}
                    <span className="flex-1 text-[13px] font-semibold truncate">
                      {item.label}
                    </span>
                    {/* Current page indicator */}
                    {isCurrent && (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        dark ? 'bg-blue-500/15 text-blue-400' : 'bg-violet-100 text-violet-500'
                      }`}>current</span>
                    )}
                    {/* Arrow on active */}
                    {isActive && !isCurrent && (
                      <svg className={`w-3.5 h-3.5 shrink-0 ${dark ? 'text-blue-400/50' : 'text-violet-400'}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                      </svg>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer hint */}
          <div className={`px-3.5 py-2 border-t flex items-center gap-3 ${
            dark ? 'border-white/5 bg-white/[0.02]' : 'border-gray-50 bg-gray-50/50'
          }`}>
            <div className="flex items-center gap-1">
              <kbd className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                dark ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-white border-gray-200 text-gray-400'
              }`}>↑↓</kbd>
              <span className={`text-[10px] ${dark ? 'text-slate-500' : 'text-gray-400'}`}>navigate</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                dark ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-white border-gray-200 text-gray-400'
              }`}>↵</kbd>
              <span className={`text-[10px] ${dark ? 'text-slate-500' : 'text-gray-400'}`}>go</span>
            </div>
            <div className="flex items-center gap-1">
              <kbd className={`text-[9px] font-bold px-1.5 py-0.5 rounded border ${
                dark ? 'bg-white/5 border-white/10 text-slate-500' : 'bg-white border-gray-200 text-gray-400'
              }`}>esc</kbd>
              <span className={`text-[10px] ${dark ? 'text-slate-500' : 'text-gray-400'}`}>close</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
