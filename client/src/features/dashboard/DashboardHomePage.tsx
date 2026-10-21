import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchDashboard } from '@/api/admin';

export function DashboardHomePage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'dashboard'],
    queryFn: fetchDashboard,
    refetchInterval: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-stone-200">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-800 border-t-transparent" />
          <p className="mt-2 text-xs text-stone-500">Loading clinic dashboard overview...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
        <h3 className="font-semibold text-sm">Failed to load dashboard overview</h3>
        <p className="mt-1 text-xs">
          {error instanceof Error ? error.message : 'Unknown connection error'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-900 to-emerald-800 p-6 text-white shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="inline-block rounded-full bg-emerald-700/60 px-3 py-1 text-[11px] font-medium tracking-wide uppercase">
              Clinic Command Center
            </span>
            <h2 className="mt-2 text-2xl font-bold">Welcome back, Clinic Administrator</h2>
            <p className="mt-1 text-xs text-emerald-100 max-w-xl">
              Manage your dental clinic profile, customize theme styling, update treatments &amp;
              INR pricing, and moderate patient feedback.
            </p>
          </div>
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-xl bg-white px-4 py-2 text-xs font-semibold text-emerald-900 shadow hover:bg-emerald-50 transition"
          >
            Open Live Clinic Site ↗
          </a>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Pending Appointments */}
        <Link
          to="/admin/appointments"
          className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Pending Appointments
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-700 text-lg">
              📅
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">
              {data.pendingAppointmentRequests}
            </span>
            {data.pendingAppointmentRequests > 0 && (
              <span className="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800">
                Action Needed
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-stone-400 group-hover:text-emerald-800 transition">
            Review patient requests &amp; confirm dates →
          </p>
        </Link>

        {/* Pending Reviews */}
        <Link
          to="/admin/reviews"
          className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Pending Reviews
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-purple-50 text-purple-700 text-lg">
              ⭐
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">{data.pendingReviews}</span>
            {data.pendingReviews > 0 && (
              <span className="rounded-full bg-purple-100 px-2.5 py-0.5 text-[11px] font-semibold text-purple-800">
                Awaiting Moderation
              </span>
            )}
          </div>
          <p className="mt-1 text-[11px] text-stone-400 group-hover:text-emerald-800 transition">
            Approve or reject patient feedback →
          </p>
        </Link>

        {/* Active Revision */}
        <Link
          to="/admin/revisions"
          className="group rounded-2xl border border-stone-200 bg-white p-5 shadow-xs transition hover:border-emerald-300 hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Published Version
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 text-lg">
              🌐
            </span>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-stone-900">
              v{data.website.activeRevisionVersion ?? 1}
            </span>
            <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
              {data.website.hasDraftChanges ? 'Draft pending' : 'Synchronized'}
            </span>
          </div>
          <p className="mt-1 text-[11px] text-stone-400 group-hover:text-emerald-800 transition">
            View publishing log &amp; rollbacks →
          </p>
        </Link>
      </div>

      {/* Recent Appointments & Quick Actions */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Recent Appointments Table */}
        <div className="lg:col-span-2 rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-stone-100 pb-4">
            <h3 className="font-bold text-stone-900 text-sm">Recent Appointment Requests</h3>
            <Link
              to="/admin/appointments"
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-900"
            >
              View All ({data.recentAppointmentRequests.length}) →
            </Link>
          </div>

          <div className="divide-y divide-stone-100 mt-2">
            {data.recentAppointmentRequests.length === 0 ? (
              <p className="py-6 text-center text-xs text-stone-400">
                No appointment requests submitted yet.
              </p>
            ) : (
              data.recentAppointmentRequests.map((appt) => (
                <div key={appt.id} className="flex items-center justify-between py-3">
                  <div>
                    <p className="text-xs font-bold text-stone-800">{appt.patientName}</p>
                    <p className="text-[11px] text-stone-500">
                      {appt.requestedServiceName || 'General Consultation'} • {appt.preferredDate}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      appt.status === 'pending'
                        ? 'bg-amber-100 text-amber-800'
                        : appt.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : appt.status === 'contacted'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Shortcuts Panel */}
        <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-3">
          <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-3">
            Quick Actions
          </h3>
          <div className="space-y-2">
            <Link
              to="/admin/content"
              className="flex items-center justify-between rounded-xl border border-stone-100 p-3 hover:bg-stone-50 transition"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">📝</span>
                <span className="text-xs font-semibold text-stone-800">
                  Edit Clinic Info &amp; Bio
                </span>
              </div>
              <span className="text-stone-400">→</span>
            </Link>

            <Link
              to="/admin/theme"
              className="flex items-center justify-between rounded-xl border border-stone-100 p-3 hover:bg-stone-50 transition"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">🎨</span>
                <span className="text-xs font-semibold text-stone-800">
                  Customize Theme &amp; Colors
                </span>
              </div>
              <span className="text-stone-400">→</span>
            </Link>

            <Link
              to="/admin/services"
              className="flex items-center justify-between rounded-xl border border-stone-100 p-3 hover:bg-stone-50 transition"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">🩺</span>
                <span className="text-xs font-semibold text-stone-800">
                  Manage Dental Treatments
                </span>
              </div>
              <span className="text-stone-400">→</span>
            </Link>

            <Link
              to="/admin/reviews"
              className="flex items-center justify-between rounded-xl border border-stone-100 p-3 hover:bg-stone-50 transition"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-base">⭐</span>
                <span className="text-xs font-semibold text-stone-800">
                  Moderate Patient Reviews
                </span>
              </div>
              <span className="text-stone-400">→</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
