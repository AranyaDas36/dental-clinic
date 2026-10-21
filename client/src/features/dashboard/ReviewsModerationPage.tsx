import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAdminReview, fetchAdminReviews, updateAdminReview } from '@/api/admin';
import type { ReviewStatus } from '@dental/shared';

export function ReviewsModerationPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<ReviewStatus | 'all'>('all');
  const [editingResponseId, setEditingResponseId] = useState<string | null>(null);
  const [responseText, setResponseText] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'reviews', selectedStatus],
    queryFn: () =>
      fetchAdminReviews({
        status: selectedStatus === 'all' ? undefined : selectedStatus,
        pageSize: 50,
      }),
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      status,
      adminResponse,
    }: {
      id: string;
      status?: ReviewStatus;
      adminResponse?: string | null;
    }) => updateAdminReview(id, { status, adminResponse }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'reviews'] });
      setEditingResponseId(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'reviews'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['public', 'reviews'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-stone-200">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-800 border-t-transparent" />
          <p className="mt-2 text-xs text-stone-500">Loading patient reviews...</p>
        </div>
      </div>
    );
  }

  const reviews = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Patient Review Moderation</h2>
          <p className="text-xs text-stone-500">
            Moderate public patient reviews and attach official dental practice responses.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {(['all', 'pending', 'approved', 'hidden', 'rejected'] as const).map((st) => (
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
        ))}
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-xs text-stone-400">
            No patient reviews found matching the selected filter.
          </div>
        ) : (
          reviews.map((rev) => (
            <div
              key={rev.id}
              className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs space-y-3 hover:border-emerald-200 transition"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-stone-100 pb-3">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-sm text-stone-900">{rev.displayName}</span>
                  <span className="text-amber-500 text-sm tracking-wider">
                    {'★'.repeat(rev.rating)}
                    {'☆'.repeat(5 - rev.rating)}
                  </span>
                  <span className="text-[11px] text-stone-400">
                    {new Date(rev.createdAt).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${
                      rev.status === 'approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : rev.status === 'pending'
                          ? 'bg-amber-100 text-amber-800'
                          : rev.status === 'hidden'
                            ? 'bg-stone-100 text-stone-700'
                            : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {rev.status}
                  </span>
                </div>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed italic">"{rev.message}"</p>

              {rev.adminResponse && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 p-3 text-xs text-emerald-900 space-y-1">
                  <p className="font-bold text-[10px] uppercase tracking-wider text-emerald-800">
                    Clinic Official Reply
                  </p>
                  <p>{rev.adminResponse}</p>
                </div>
              )}

              {/* Actions & Response Input */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-xs">
                <div className="flex items-center gap-2">
                  {rev.status !== 'approved' && (
                    <button
                      type="button"
                      onClick={() => updateMutation.mutate({ id: rev.id, status: 'approved' })}
                      className="rounded-lg bg-emerald-800 px-3 py-1 font-semibold text-white hover:bg-emerald-700 shadow-xs"
                    >
                      ✓ Approve Live
                    </button>
                  )}
                  {rev.status !== 'hidden' && (
                    <button
                      type="button"
                      onClick={() => updateMutation.mutate({ id: rev.id, status: 'hidden' })}
                      className="rounded-lg border border-stone-200 px-3 py-1 font-semibold text-stone-700 hover:bg-stone-50"
                    >
                      Hide
                    </button>
                  )}
                  {rev.status !== 'rejected' && (
                    <button
                      type="button"
                      onClick={() => updateMutation.mutate({ id: rev.id, status: 'rejected' })}
                      className="rounded-lg border border-stone-200 px-3 py-1 font-semibold text-stone-700 hover:bg-stone-50"
                    >
                      Reject
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this patient review permanently?')) {
                        deleteMutation.mutate(rev.id);
                      }
                    }}
                    className="rounded-lg border border-red-200 px-3 py-1 font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setEditingResponseId(editingResponseId === rev.id ? null : rev.id);
                    setResponseText(rev.adminResponse || '');
                  }}
                  className="font-semibold text-emerald-800 hover:text-emerald-900"
                >
                  {editingResponseId === rev.id ? 'Close Reply Box' : '💬 Add Clinic Reply'}
                </button>
              </div>

              {editingResponseId === rev.id && (
                <div className="rounded-xl border border-stone-200 bg-stone-50 p-3 space-y-2 mt-2">
                  <label className="block text-[11px] font-semibold text-stone-700">
                    Clinic Response (Displayed under review on public website)
                  </label>
                  <textarea
                    rows={2}
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    placeholder="e.g. Thank you so much for your feedback, we look forward to seeing you at your next regular check-up!"
                    className="w-full rounded-lg border border-stone-300 p-2 text-xs focus:border-emerald-700 focus:outline-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setEditingResponseId(null)}
                      className="rounded-lg border border-stone-200 bg-white px-3 py-1 text-xs text-stone-600"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        updateMutation.mutate({
                          id: rev.id,
                          adminResponse: responseText.trim() || null,
                        })
                      }
                      className="rounded-lg bg-emerald-800 px-3 py-1 text-xs font-semibold text-white shadow"
                    >
                      Save Reply
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
