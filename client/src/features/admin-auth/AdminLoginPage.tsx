import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import { ChangePasswordModal } from './ChangePasswordModal';

export function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, login, isLoading: authLoading } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showChangePasswordModal, setShowChangePasswordModal] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      if (user.mustChangePassword) {
        setShowChangePasswordModal(true);
      } else {
        navigate('/admin', { replace: true });
      }
    }
  }, [user, authLoading, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const admin = await login({ email, password });
      if (admin.mustChangePassword) {
        setShowChangePasswordModal(true);
      } else {
        navigate('/admin', { replace: true });
      }
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Invalid login credentials. Please try again.';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handlePasswordSuccess() {
    setShowChangePasswordModal(false);
    navigate('/admin', { replace: true });
  }

  return (
    <main className="min-h-screen bg-stone-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-800 text-white shadow-lg text-xl mb-4">
          🦷
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-stone-900">Clinic CMS Dashboard</h1>
        <p className="mt-1 text-xs text-stone-500">
          Secure administrator portal for managing clinic content, appointments, and reviews.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="rounded-2xl bg-white px-6 py-8 shadow-xl border border-stone-200/80 sm:px-10">
          {error && (
            <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-stone-700">
                Administrator Email
              </label>
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@example.com"
                className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm transition focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
            </div>

            <div>
              <div className="flex items-center justify-between">
                <label className="block text-xs font-semibold text-stone-700">Password</label>
              </div>
              <input
                type="password"
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="mt-1 w-full rounded-xl border border-stone-300 px-3.5 py-2.5 text-sm transition focus:border-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-700/20"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full rounded-xl bg-emerald-800 py-3 text-sm font-semibold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {isSubmitting ? 'Signing in...' : 'Sign in to Dashboard'}
              </button>
            </div>
          </form>

          <div className="mt-6 border-t border-stone-200 pt-4 text-center">
            <Link
              to="/"
              className="inline-flex items-center text-xs font-medium text-emerald-800 hover:text-emerald-900 transition"
            >
              ← Back to public website
            </Link>
          </div>
        </div>
      </div>

      <ChangePasswordModal
        isOpen={showChangePasswordModal}
        onSuccess={handlePasswordSuccess}
        isMandatory={true}
      />
    </main>
  );
}
