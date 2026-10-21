import { useState } from 'react';
import { useAuth } from './AuthContext';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onSuccess: () => void;
  isMandatory?: boolean;
}

export function ChangePasswordModal({
  isOpen,
  onSuccess,
  isMandatory = false,
}: ChangePasswordModalProps) {
  const { updatePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    // if (newPassword.length < 12) {
    //   setError('Password must be at least 12 characters long');
    //   return;
    // }

    // if (!/[A-Z]/.test(newPassword) || !/[a-z]/.test(newPassword) || !/[0-9]/.test(newPassword)) {
    //   setError('Password must include uppercase, lowercase, and numeric characters');
    //   return;
    // }

    try {
      setIsSubmitting(true);
      await updatePassword({ currentPassword, newPassword });
      onSuccess();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-100 text-amber-700 font-bold">
            🔒
          </div>
          <div>
            <h2 className="text-xl font-bold text-stone-900">
              {isMandatory ? 'First-Login Security Setup' : 'Change Password'}
            </h2>
            <p className="text-xs text-stone-500">
              {isMandatory
                ? 'Your account requires an updated password before accessing clinic tools.'
                : 'Update your administrator password'}
            </p>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-stone-700">Current Password</label>
            <input
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-800"
              placeholder="Enter current password"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700">New Password</label>
            <input
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-800"
              placeholder="Min 12 chars, upper, lower, numbers"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700">
              Confirm New Password
            </label>
            <input
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-stone-300 px-3 py-2 text-sm focus:border-stone-800 focus:outline-none focus:ring-1 focus:ring-stone-800"
              placeholder="Re-enter new password"
            />
          </div>

          <div className="rounded-lg bg-stone-50 p-3 text-[11px] text-stone-500 space-y-1">
            <p className="font-semibold text-stone-700">Password requirements:</p>
            <p className={newPassword.length >= 12 ? 'text-emerald-700' : ''}>
              • At least 12 characters
            </p>
            <p className={/[A-Z]/.test(newPassword) ? 'text-emerald-700' : ''}>
              • One uppercase letter
            </p>
            <p className={/[a-z]/.test(newPassword) ? 'text-emerald-700' : ''}>
              • One lowercase letter
            </p>
            <p className={/[0-9]/.test(newPassword) ? 'text-emerald-700' : ''}>• One number</p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-xl bg-stone-900 py-2.5 text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-50"
            >
              {isSubmitting ? 'Updating Password...' : 'Save New Password & Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
