import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchWebsiteDraft,
  fetchWebsiteVersions,
  restoreWebsiteVersion,
  type WebsiteVersionItem,
} from '@/api/admin';

export function RevisionsHistoryPage() {
  const queryClient = useQueryClient();
  const [feedback, setFeedback] = useState<string | null>(null);

  const draftQuery = useQuery({
    queryKey: ['admin', 'website', 'draft'],
    queryFn: fetchWebsiteDraft,
  });

  const versionsQuery = useQuery({
    queryKey: ['admin', 'website', 'versions'],
    queryFn: fetchWebsiteVersions,
  });

  const rollbackMutation = useMutation({
    mutationFn: async (versionItem: WebsiteVersionItem) => {
      if (!draftQuery.data) return;
      return restoreWebsiteVersion(versionItem.id, draftQuery.data.draftVersion);
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      setFeedback(`Draft restored from revision (new draft v${res?.draftVersion})`);
      setTimeout(() => setFeedback(null), 5000);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Rollback failed';
      setFeedback(`Rollback error: ${msg}`);
    },
  });

  if (versionsQuery.isLoading || draftQuery.isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-stone-200">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-800 border-t-transparent" />
          <p className="mt-2 text-xs text-stone-500">Loading revision history...</p>
        </div>
      </div>
    );
  }

  const versions = versionsQuery.data?.items || [];
  const draft = draftQuery.data;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">
            Website Revisions &amp; Rollback History
          </h2>
          <p className="text-xs text-stone-500">
            View every published version of your clinic website. Restore any previous revision with
            1 click.
          </p>
        </div>
        {feedback && (
          <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
            {feedback}
          </span>
        )}
      </div>

      {/* Revisions Table */}
      <div className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs">
        <table className="w-full border-collapse text-left text-xs">
          <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Version</th>
              <th className="py-3 px-4">Published Date</th>
              <th className="py-3 px-4">Administrator</th>
              <th className="py-3 px-4">Change Summary</th>
              <th className="py-3 px-4 text-right">Rollback Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {versions.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-stone-400">
                  No revisions found.
                </td>
              </tr>
            ) : (
              versions.map((rev) => {
                const isCurrentLive = draft?.activeRevisionVersion === rev.version;
                return (
                  <tr key={rev.id} className="hover:bg-stone-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-sm text-stone-900">
                          v{rev.version}
                        </span>
                        {isCurrentLive && (
                          <span className="rounded-full bg-emerald-100 text-emerald-800 text-[9px] px-2 py-0.5 font-bold uppercase tracking-wider">
                            Currently Live
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-stone-600">
                      {new Date(rev.publishedAt).toLocaleString('en-IN', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-stone-500">
                      {rev.publishedBy?.email || 'admin@example.com'}
                    </td>
                    <td className="py-3.5 px-4 text-stone-700 italic">
                      {rev.changeSummary || 'Published update'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        type="button"
                        disabled={rollbackMutation.isPending}
                        onClick={() => {
                          if (
                            confirm(
                              `Rollback website draft to revision v${rev.version}? You will be able to preview and re-publish.`,
                            )
                          ) {
                            rollbackMutation.mutate(rev);
                          }
                        }}
                        className="rounded-lg border border-stone-200 px-3 py-1 font-semibold text-stone-700 hover:bg-stone-100 transition disabled:opacity-50"
                      >
                        Restore Draft to v{rev.version}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
