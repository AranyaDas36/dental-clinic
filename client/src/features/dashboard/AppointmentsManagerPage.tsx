import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminAppointments, updateAdminAppointment } from '@/api/admin';
import type { AppointmentStatus } from '@dental/shared';

export function AppointmentsManagerPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus | 'all'>('all');
  const [notesState, setNotesState] = useState<Record<string, string>>({});

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'appointments', selectedStatus],
    queryFn: () =>
      fetchAdminAppointments({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        pageSize: 50,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      status,
      adminNotes,
    }: {
      id: string;
      status?: AppointmentStatus;
      adminNotes?: string | null;
    }) => updateAdminAppointment(id, { status, adminNotes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'appointments'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-stone-200">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-800 border-t-transparent" />
          <p className="mt-2 text-xs text-stone-500">Loading appointment requests...</p>
        </div>
      </div>
    );
  }

  const appointments = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Patient Appointment Requests</h2>
          <p className="text-xs text-stone-500">
            Track patient inquiries, confirm dental slots via phone/WhatsApp, and record internal
            clinic notes.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'contacted', 'confirmed', 'completed', 'cancelled'] as const).map(
          (st) => (
            <button
              key={st}
              type="button"
              onClick={() => setSelectedStatus(st)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold uppercase tracking-wider transition ${
                selectedStatus === st
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
              }`}
            >
              {st}
            </button>
          ),
        )}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        {appointments.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-xs text-stone-400">
            No appointment requests found matching this status filter.
          </div>
        ) : (
          appointments.map((appt) => (
            <div
              key={appt.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-4 hover:border-emerald-200 transition"
            >
              <div className="flex flex-wrap items-start justify-between gap-3 border-b border-stone-100 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-stone-900">{appt.patientName}</h3>
                    <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-mono text-stone-600">
                      Preferred: {appt.preferredDate} ({appt.preferredTimeSlot})
                    </span>
                  </div>
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-stone-600">
                    <span>
                      📞{' '}
                      <a
                        href={`tel:${appt.phone}`}
                        className="font-semibold text-emerald-800 hover:underline"
                      >
                        {appt.phone}
                      </a>
                    </span>
                    {appt.email && (
                      <span>
                        ✉️{' '}
                        <a href={`mailto:${appt.email}`} className="text-stone-700 hover:underline">
                          {appt.email}
                        </a>
                      </span>
                    )}
                    <span>
                      Treatment:{' '}
                      <strong className="text-stone-800">
                        {appt.requestedServiceName || 'General Dental Consultation'}
                      </strong>
                    </span>
                  </div>
                </div>

                {/* Status Dropdown */}
                <div className="flex items-center gap-2">
                  <label className="text-xs font-semibold text-stone-500">Status:</label>
                  <select
                    value={appt.status}
                    onChange={(e) =>
                      updateMutation.mutate({
                        id: appt.id,
                        status: e.target.value as AppointmentStatus,
                      })
                    }
                    className={`rounded-xl border px-3 py-1 text-xs font-bold uppercase tracking-wider focus:outline-none ${
                      appt.status === 'pending'
                        ? 'bg-amber-50 text-amber-800 border-amber-200'
                        : appt.status === 'confirmed'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                          : appt.status === 'contacted'
                            ? 'bg-blue-50 text-blue-800 border-blue-200'
                            : appt.status === 'completed'
                              ? 'bg-purple-50 text-purple-800 border-purple-200'
                              : 'bg-stone-100 text-stone-600 border-stone-200'
                    }`}
                  >
                    <option value="pending">Pending</option>
                    <option value="contacted">Contacted</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              </div>

              {/* Patient Notes */}
              {appt.notes && (
                <div className="rounded-xl bg-stone-50 p-3 text-xs text-stone-700">
                  <span className="font-semibold text-stone-800">Patient Note: </span>
                  {appt.notes}
                </div>
              )}

              {/* Internal Staff Notes */}
              <div className="rounded-xl border border-stone-200 bg-stone-50/50 p-3 space-y-2">
                <label className="block text-[11px] font-semibold text-stone-700">
                  🔒 Private Internal Staff Notes (Only visible to clinic team)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    defaultValue={appt.adminNotes || ''}
                    placeholder="e.g. Called on WhatsApp. Confirmed 4:30 PM slot with Dr. Roy."
                    onChange={(e) => setNotesState({ ...notesState, [appt.id]: e.target.value })}
                    className="flex-1 rounded-xl border border-stone-300 bg-white p-2 text-xs focus:border-emerald-700 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      updateMutation.mutate({
                        id: appt.id,
                        adminNotes:
                          notesState[appt.id] !== undefined ? notesState[appt.id] : appt.adminNotes,
                      })
                    }
                    disabled={updateMutation.isPending}
                    className="rounded-xl bg-stone-800 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-stone-700 shadow-xs disabled:opacity-50"
                  >
                    Save Note
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
