import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import ForgotPasswordPage from '../pages/auth/ForgotPasswordPage';
import ResetPasswordPage from '../pages/auth/ResetPasswordPage';
import DashboardPage from '../pages/DashboardPage';
import ProfilePage from '../pages/ProfilePage';
import AdminUsersPage from '../pages/admin/AdminUsersPage';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../components/AdminLayout';
import InstructorLayout from '../components/InstructorLayout';
import LearnerLayout from '../components/LearnerLayout';

// If already logged in, redirect away from login/register pages
function GuestRoute() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <Outlet />;
}

// Picks the correct sidebar layout based on role
function RoleBasedLayout() {
  const { user } = useAuth();
  if (user?.role === 'admin') return <AdminLayout />;
  if (user?.role === 'instructor') return <InstructorLayout />;
  return <LearnerLayout />;
}

const router = createBrowserRouter([
  {
    element: <GuestRoute />,
    children: [
      { path: '/login',           element: <LoginPage /> },
      { path: '/register',        element: <RegisterPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password',  element: <ResetPasswordPage /> },
    ],
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <RoleBasedLayout />,
        children: [
          { path: '/dashboard', element: <DashboardPage /> },
          { path: '/profile',   element: <ProfilePage /> },
        ],
      },
    ],
  },
  {
    element: <ProtectedRoute allowedRoles={['admin']} />,
    children: [
      {
        element: <AdminLayout />,
        children: [
          { path: '/admin/users', element: <AdminUsersPage /> },
        ],
      },
    ],
  },
  { path: '*', element: <Navigate to="/login" replace /> },
]);

export default router;
