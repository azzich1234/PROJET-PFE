import { AuthenticateWithRedirectCallback } from '@clerk/clerk-react';

export default function SSOCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-100">
      <div className="text-center">
        <div className="animate-spin h-10 w-10 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-500 text-sm">Completing sign-in...</p>
      </div>
      <AuthenticateWithRedirectCallback />
    </div>
  );
}
