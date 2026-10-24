import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWebsiteDraft, publishWebsite } from '@/api/admin';

export function PublishBanner() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [changeSummary, setChangeSummary] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const draftQuery = useQuery({
    queryKey: ['admin', 'website', 'draft'],
    queryFn: fetchWebsiteDraft,
    refetchInterval: 15_000,
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!draftQuery.data) return;
      return publishWebsite({
        expectedDraftVersion: draftQuery.data.draftVersion,
        changeSummary: changeSummary.trim() || undefined,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['public'] });
      setIsModalOpen(false);
      setChangeSummary('');
      setFeedback(`Successfully published version ${data?.version}!`);
      setTimeout(() => setFeedback(null), 5000);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Publish failed';
      setPublishError(msg);
      setFeedback(`Error: ${msg}`);
    },
  });

  const draft = draftQuery.data;
  if (!draft) return null;

  const isUpToDate =
    draft.activeRevisionVersion !== null && draft.activeRevisionVersion === draft.draftVersion;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isUpToDate ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
            }`}
          />
          <div className="text-xs">
            <span className="font-semibold text-stone-800">
              {isUpToDate ? 'Published & Up to date' : 'Unpublished Draft Changes'}
            </span>
            <span className="mx-2 text-stone-300">|</span>
            <span className="text-stone-500">
              Draft v{draft.draftVersion}{' '}
              {draft.activeRevisionVersion
                ? `(Live: v${draft.activeRevisionVersion})`
                : '(No live version)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {feedback && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {feedback}
            </span>
          )}
          <a
            href="/admin/preview"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
          >
            Preview Draft ↗
          </a>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-emerald-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            Publish Live
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-xl font-bold">
                🚀
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">Publish Website Revision</h3>
                <p className="text-xs text-stone-500">
                  Instantly publish draft v{draft.draftVersion} to the live public clinic website.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-stone-700">
                Change Summary (Optional note for revision log)
              </label>
              <textarea
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                placeholder="e.g. Updated holiday hours and clinic contact phone"
                rows={3}
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            {publishError && (
              <p
                role="alert"
                className="mt-4 max-h-48 overflow-y-auto rounded-lg bg-red-50 p-3 text-xs text-red-700"
              >
                <span className="whitespace-pre-line">{publishError}</span>
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setPublishError(null);
                }}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={publishMutation.isPending}
                onClick={() => {
                  setPublishError(null);
                  publishMutation.mutate();
                }}
                className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
              >
                {publishMutation.isPending ? 'Publishing...' : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
