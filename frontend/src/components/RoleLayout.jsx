import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export default function RoleLayout({ navItems, children }) {
  const { user, logout } = useAuth();
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50/80 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200/80 flex flex-col fixed h-full z-40 shadow-sm">
        <div className="px-6 py-5 border-b border-gray-100">
          <Link to="/dashboard" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:shadow-lg group-hover:shadow-blue-600/30 transition-shadow duration-300">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <div>
              <span className="text-lg font-bold text-gray-800 tracking-tight">LinguaPro</span>
              <p className="text-[11px] text-gray-400 font-medium">Language Platform</p>
            </div>
          </Link>
        </div>

        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname === item.to;
            return (
              <Link key={item.to} to={item.to}
                className={`flex items-center gap-3 px-3 py-2.5 text-[13px] rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'font-semibold text-blue-600 bg-blue-50/80 shadow-sm shadow-blue-100'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                }`}>
                <span className={`transition-colors duration-200 ${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-gray-100 mt-auto">
          <button onClick={logout}
            className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-gray-500 rounded-xl hover:bg-red-50 hover:text-red-600 transition-all duration-200 cursor-pointer w-full group">
            <svg className="w-5 h-5 text-gray-400 group-hover:text-red-500 transition-colors duration-200" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 ml-64">
        {/* Top bar */}
        <header className="bg-white/80 backdrop-blur-md border-b border-gray-200/60 sticky top-0 z-30">
          <div className="px-8 py-3.5 flex items-center justify-between">
            {/* Search */}
            <div className="relative w-72">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input type="text" placeholder="Search..." readOnly
                className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none placeholder-gray-400 cursor-default" />
            </div>
            {/* User info */}
            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-700 leading-tight">{user?.name}</p>
                <p className="text-[11px] text-gray-400 capitalize font-medium">{user?.role}</p>
              </div>
              {user?.avatar ? (
                <img src={`http://localhost:8000/storage/${user.avatar}`} alt="Avatar"
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-gray-100" />
              ) : (
                <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-sm ring-2 ring-blue-100">
                  {user?.name?.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="px-8 py-8">
          {children}
        </main>
      </div>
    </div>
  );
}
