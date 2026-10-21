import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/features/admin-auth/AuthContext';
import { ChangePasswordModal } from '@/features/admin-auth/ChangePasswordModal';
import { PublishBanner } from './PublishBanner';

export function AdminShell() {
  const navigate = useNavigate();
  const { user, isLoading, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-800 border-t-transparent" />
          <p className="mt-2 text-xs font-medium text-stone-600">
            Verifying administrator session...
          </p>
        </div>
      </div>
    );
  }

  if (!user) {
    navigate('/admin/login', { replace: true });
    return null;
  }

  const navItems = [
    { label: 'Overview', to: '/admin', icon: '📊', end: true },
    { label: 'Content & Sections', to: '/admin/content', icon: '📝' },
    { label: 'Theme Customizer', to: '/admin/theme', icon: '🎨' },
    { label: 'Dental Services', to: '/admin/services', icon: '🩺' },
    { label: 'Patient Reviews', to: '/admin/reviews', icon: '⭐' },
    { label: 'Appointments', to: '/admin/appointments', icon: '📅' },
    { label: 'Media Library', to: '/admin/media', icon: '🖼️' },
    { label: 'Revision History', to: '/admin/revisions', icon: '⏮️' },
  ];

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 border-b border-stone-200 bg-white shadow-xs">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-800 text-lg text-white shadow">
              🦷
            </span>
            <div>
              <h1 className="text-sm font-bold text-stone-900 leading-tight">Clinic CMS</h1>
              <p className="text-[10px] text-stone-500 font-mono">Administrator Portal</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 hover:text-emerald-800 transition px-2.5 py-1.5 rounded-lg hover:bg-stone-50"
            >
              Public Site ↗
            </a>
            <button
              type="button"
              onClick={() => setShowPasswordModal(true)}
              className="text-xs font-medium text-stone-600 hover:text-stone-900 transition px-2.5 py-1.5 rounded-lg hover:bg-stone-50"
            >
              Change Password
            </button>
            <div className="h-4 w-px bg-stone-200" />
            <div className="flex items-center gap-2">
              <span className="text-xs text-stone-500 font-medium">{user.email}</span>
              <button
                type="button"
                onClick={async () => {
                  await logout();
                  navigate('/admin/login');
                }}
                className="rounded-lg border border-stone-200 px-3 py-1 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Body */}
      <div className="mx-auto flex w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 gap-6">
        {/* Sidebar Nav */}
        <aside className="w-56 shrink-0">
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-xs font-semibold transition ${
                    isActive
                      ? 'bg-emerald-800 text-white shadow-sm'
                      : 'text-stone-600 hover:bg-white hover:text-stone-900'
                  }`
                }
              >
                <span className="text-base">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </nav>
        </aside>

        {/* Content Area */}
        <main className="flex-1 space-y-5 min-w-0">
          <PublishBanner />
          <Outlet />
        </main>
      </div>

      <ChangePasswordModal
        isOpen={showPasswordModal || user.mustChangePassword}
        onSuccess={() => setShowPasswordModal(false)}
        isMandatory={user.mustChangePassword}
      />
    </div>
  );
}
