import { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { updateProfile, updatePassword, uploadAvatar, removeAvatar } from '../api/auth';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();
  const [activeTab, setActiveTab] = useState('personal');
  const fileInputRef = useRef(null);

  const [form, setForm] = useState({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    password: '',
    password_confirmation: '',
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [avatarLoading, setAvatarLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setSaved(false);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      await updateProfile({
        name: [form.firstName, form.lastName].filter(Boolean).join(' '),
        email: form.email,
        bio: form.bio,
      });
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSaving(true);
    try {
      await updatePassword(passwordForm);
      setPasswordSaved(true);
      setPasswordForm({ current_password: '', password: '', password_confirmation: '' });
      setTimeout(() => setPasswordSaved(false), 3000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to update password.');
    } finally {
      setPasswordSaving(false);
    }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      await uploadAvatar(file);
      await refreshUser();
    } catch {}
    setAvatarLoading(false);
  };

  const handleAvatarRemove = async () => {
    setAvatarLoading(true);
    try {
      await removeAvatar();
      await refreshUser();
    } catch {}
    setAvatarLoading(false);
  };

  const tabs = [
    { id: 'personal', label: 'Personal Info' },
    { id: 'security', label: 'Account Security' },
    { id: 'notifications', label: 'Notifications' },
  ];

  return (
    <div>
        {/* Title */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Manage Profile</h1>
          <p className="text-sm text-gray-500 mt-1.5 leading-relaxed">
            Update your photo and personal details here. These changes will be visible across the platform.
          </p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200/80 mb-8">
          <div className="flex gap-1">
            {tabs.map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`px-4 pb-3 text-[13px] font-medium border-b-2 transition-all duration-200 cursor-pointer ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-400 hover:text-gray-600'
                }`}>
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'personal' && (
          <div className="space-y-6">
            {/* Profile Photo */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow duration-300">
              <div className="flex items-center gap-6">
                <div className="relative">
                  {user?.avatar ? (
                    <img src={`http://localhost:8000/storage/${user.avatar}`} alt="Avatar"
                      className="w-20 h-20 rounded-full object-cover ring-4 ring-gray-50" />
                  ) : (
                    <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-2xl ring-4 ring-blue-50/50">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="absolute -bottom-0.5 -right-0.5 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center ring-2 ring-white shadow-sm">
                    <svg className="w-3.5 h-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
                    </svg>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800 text-[15px]">Profile Photo</h3>
                  <p className="text-[13px] text-gray-500 mb-3">This will be displayed on your profile and in courses.</p>
                  <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
                  <div className="flex items-center gap-3">
                    <button onClick={() => fileInputRef.current.click()} disabled={avatarLoading}
                      className="px-4 py-1.5 text-[13px] border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200 cursor-pointer disabled:opacity-50 font-medium">
                      {avatarLoading ? 'Uploading...' : 'Change photo'}
                    </button>
                    {user?.avatar && (
                      <button onClick={handleAvatarRemove} disabled={avatarLoading}
                        className="px-4 py-1.5 text-[13px] text-red-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 font-medium">
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Personal Details */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow duration-300">
              <h3 className="font-semibold text-gray-800 mb-1 text-[15px]">Personal Details</h3>
              <p className="text-[13px] text-gray-500 mb-6">Update your personal information used for communications.</p>

              <form onSubmit={handleSave} className="space-y-5">
                {error && (
                  <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[13px] flex items-center gap-2">
                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                    {error}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">First Name</label>
                    <input name="firstName" value={form.firstName} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-shadow duration-200 hover:border-gray-300" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Last Name</label>
                    <input name="lastName" value={form.lastName} onChange={handleChange}
                      className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-shadow duration-200 hover:border-gray-300" />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Email Address</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </span>
                    <input name="email" type="email" value={form.email} onChange={handleChange}
                      className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-shadow duration-200 hover:border-gray-300" />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-medium text-gray-700 mb-1.5">
                    Bio <span className="text-gray-400 font-normal">(Optional)</span>
                  </label>
                  <textarea name="bio" value={form.bio} onChange={handleChange} rows={4} maxLength={500}
                    placeholder="Tell us a little about yourself..."
                    className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none text-sm transition-shadow duration-200 hover:border-gray-300" />
                  <div className="flex items-center justify-between mt-1">
                    <p className="text-xs text-gray-400">Brief description for your profile. URLs are hyperlinked.</p>
                    <span className="text-xs text-gray-400">{form.bio.length}/500</span>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-3">
                  <button type="submit" disabled={saving}
                    className="px-6 py-2.5 bg-blue-600 text-white text-[13px] rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 cursor-pointer shadow-sm shadow-blue-600/20 hover:shadow-md hover:shadow-blue-600/25">
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                  {saved && (
                    <span className="text-sm text-green-600 flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      Changes saved
                    </span>
                  )}
                </div>
              </form>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow duration-300">
            <h3 className="font-semibold text-gray-800 mb-1 text-[15px]">Change Password</h3>
            <p className="text-[13px] text-gray-500 mb-6">Update your password to keep your account secure.</p>

            <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-md">
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-[13px] flex items-center gap-2">
                  <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008H12v-.008z" /></svg>
                  {passwordError}
                </div>
              )}
              {passwordSaved && (
                <div className="p-3 bg-green-50 border border-green-100 text-green-600 rounded-xl text-[13px] flex items-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Password updated successfully.
                </div>
              )}
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Current Password</label>
                <input type="password" name="current_password" value={passwordForm.current_password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, current_password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-shadow duration-200 hover:border-gray-300" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">New Password</label>
                <input type="password" name="password" value={passwordForm.password}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-shadow duration-200 hover:border-gray-300" />
              </div>
              <div>
                <label className="block text-[13px] font-medium text-gray-700 mb-1.5">Confirm New Password</label>
                <input type="password" name="password_confirmation" value={passwordForm.password_confirmation}
                  onChange={(e) => setPasswordForm({ ...passwordForm, password_confirmation: e.target.value })}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-sm transition-shadow duration-200 hover:border-gray-300" />
              </div>
              <button type="submit" disabled={passwordSaving}
                className="px-6 py-2.5 bg-blue-600 text-white text-[13px] rounded-xl font-semibold hover:bg-blue-700 disabled:opacity-50 transition-all duration-200 cursor-pointer shadow-sm shadow-blue-600/20 hover:shadow-md hover:shadow-blue-600/25">
                {passwordSaving ? 'Updating...' : 'Update Password'}
              </button>
            </form>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-sm transition-shadow duration-300">
            <h3 className="font-semibold text-gray-800 mb-1 text-[15px]">Notification Preferences</h3>
            <p className="text-[13px] text-gray-500 mb-6">Choose how you want to be notified.</p>

            <div className="space-y-3">
              {[
                { label: 'Email notifications', desc: 'Receive email updates about your courses and progress.' },
                { label: 'New course alerts', desc: 'Get notified when new courses are available in your languages.' },
                { label: 'Lesson reminders', desc: 'Daily reminders to continue your learning streak.' },
              ].map((item) => (
                <label key={item.label} className="flex items-start justify-between p-4 rounded-xl border border-gray-100 hover:bg-gray-50/50 hover:border-gray-200 cursor-pointer transition-all duration-200">
                  <div>
                    <p className="text-[13px] font-medium text-gray-700">{item.label}</p>
                    <p className="text-xs text-gray-400 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                  <input type="checkbox" defaultChecked
                    className="mt-1 w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                </label>
              ))}
            </div>
          </div>
        )}
      </div>
  );
}
