import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

export default function DashboardPage() {
  const { user } = useAuth();

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="space-y-8">
        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">{greeting()}, {user?.name?.split(' ')[0]}</h1>
          <p className="text-sm text-gray-500 mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>

        {/* Stats Cards */}
        {user?.role === 'learner' && <LearnerStats />}
        {user?.role === 'instructor' && <InstructorStats />}
        {user?.role === 'admin' && <AdminStats />}

        {/* Quick Actions */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-4">Quick Actions</h3>
          {user?.role === 'learner' && <LearnerActions />}
          {user?.role === 'instructor' && <InstructorActions />}
          {user?.role === 'admin' && <AdminActions />}
        </div>

        {/* Recent Activity */}
        <div>
          <h3 className="text-base font-semibold text-gray-800 mb-4">Recent Activity</h3>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
            <div className="text-center py-6 text-gray-400">
              <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="font-semibold text-gray-500 text-sm">No recent activity</p>
              <p className="text-xs mt-1.5 text-gray-400 max-w-xs mx-auto">Your activity will appear here as you start using the platform.</p>
            </div>
          </div>
        </div>
    </div>
  );
}

// ─── Learner Components ────────────────────────────────

function LearnerStats() {
  const stats = [
    { label: 'Courses Enrolled', value: '0', icon: BookIcon, color: 'blue' },
    { label: 'Lessons Completed', value: '0', icon: CheckIcon, color: 'green' },
    { label: 'Day Streak', value: '0', icon: FireIcon, color: 'orange' },
    { label: 'Overall Progress', value: '0%', icon: ChartIcon, color: 'purple' },
  ];
  return <StatsGrid stats={stats} />;
}

function LearnerActions() {
  const actions = [
    { label: 'Browse Courses', desc: 'Find new languages to learn', icon: SearchIcon, color: 'blue' },
    { label: 'My Courses', desc: 'Continue where you left off', icon: BookIcon, color: 'green' },
    { label: 'My Profile', desc: 'Update your information', icon: UserIcon, color: 'purple' },
  ];
  return <ActionsGrid actions={actions} />;
}

// ─── Instructor Components ─────────────────────────────

function InstructorStats() {
  const stats = [
    { label: 'My Courses', value: '0', icon: BookIcon, color: 'blue' },
    { label: 'Total Students', value: '0', icon: UsersIcon, color: 'green' },
    { label: 'Lessons Created', value: '0', icon: FileIcon, color: 'orange' },
    { label: 'Avg. Rating', value: '—', icon: StarIcon, color: 'purple' },
  ];
  return <StatsGrid stats={stats} />;
}

function InstructorActions() {
  const actions = [
    { label: 'Create Course', desc: 'Build a new course', icon: PlusIcon, color: 'blue' },
    { label: 'My Courses', desc: 'Manage your courses', icon: BookIcon, color: 'green' },
    { label: 'My Profile', desc: 'Update your information', icon: UserIcon, color: 'purple' },
  ];
  return <ActionsGrid actions={actions} />;
}

// ─── Admin Components ──────────────────────────────────

function AdminStats() {
  const stats = [
    { label: 'Total Users', value: '0', icon: UsersIcon, color: 'blue' },
    { label: 'Total Courses', value: '0', icon: BookIcon, color: 'green' },
    { label: 'Languages', value: '0', icon: GlobeIcon, color: 'orange' },
    { label: 'Active Instructors', value: '0', icon: UserIcon, color: 'purple' },
  ];
  return <StatsGrid stats={stats} />;
}

function AdminActions() {
  const actions = [
    { label: 'Manage Users', desc: 'View and manage all users', icon: UsersIcon, color: 'blue', to: '/admin/users' },
    { label: 'Manage Languages', desc: 'Add or edit languages', icon: GlobeIcon, color: 'green', to: '/admin/languages' },
    { label: 'Manage Courses', desc: 'Review all courses', icon: BookIcon, color: 'orange' },
  ];
  return <ActionsGrid actions={actions} />;
}

// ─── Reusable Layout Components ────────────────────────

function StatsGrid({ stats }) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    orange: 'bg-orange-100 text-orange-600',
    purple: 'bg-purple-100 text-purple-600',
  };

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 group">
          <div className="flex items-center justify-between mb-4">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${colorMap[stat.color]} transition-transform duration-300 group-hover:scale-105`}>
              <stat.icon />
            </div>
          </div>
          <p className="text-2xl font-bold text-gray-800 tracking-tight">{stat.value}</p>
          <p className="text-[13px] text-gray-500 mt-0.5">{stat.label}</p>
        </div>
      ))}
    </div>
  );
}

function ActionsGrid({ actions }) {
  const colorMap = {
    blue: 'bg-blue-50 text-blue-600 hover:bg-blue-100',
    green: 'bg-green-50 text-green-600 hover:bg-green-100',
    orange: 'bg-orange-50 text-orange-600 hover:bg-orange-100',
    purple: 'bg-purple-50 text-purple-600 hover:bg-purple-100',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {actions.map((action) => {
        const cardClass = "bg-white rounded-2xl border border-gray-100 p-6 text-left hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 cursor-pointer block group";
        const content = (
          <>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-105 ${colorMap[action.color]}`}>
              <action.icon />
            </div>
            <h4 className="font-semibold text-gray-800 mb-1 text-[15px]">{action.label}</h4>
            <p className="text-[13px] text-gray-500 leading-relaxed">{action.desc}</p>
          </>
        );
        return action.to ? (
          <Link key={action.label} to={action.to} className={cardClass}>{content}</Link>
        ) : (
          <button key={action.label} className={cardClass}>{content}</button>
        );
      })}
    </div>
  );
}

// ─── Icons ─────────────────────────────────────────────

function BookIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}

function FireIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
    </svg>
  );
}

function ChartIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
    </svg>
  );
}

function StarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  );
}
