import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteAdminMedia, fetchAdminMedia, uploadAdminMedia } from '@/api/admin';

export function MediaManagerPage() {
  const queryClient = useQueryClient();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [altText, setAltText] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'media'],
    queryFn: () => fetchAdminMedia({ pageSize: 50 }),
  });

  const uploadMutation = useMutation({
    mutationFn: async () => {
      if (!selectedFile) return;
      const formData = new FormData();
      formData.append('file', selectedFile);
      if (altText.trim()) formData.append('altText', altText.trim());
      return uploadAdminMedia(formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
      setSelectedFile(null);
      setAltText('');
      setError(null);
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : 'Media upload failed');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteAdminMedia(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'media'] });
    },
  });

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-stone-200">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-800 border-t-transparent" />
          <p className="mt-2 text-xs text-stone-500">Loading clinic media library...</p>
        </div>
      </div>
    );
  }

  const mediaItems = data?.items || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Clinic Media Library</h2>
          <p className="text-xs text-stone-500">
            Upload and organize clinic photography, dentist portraits, and dental treatment imagery.
          </p>
        </div>
      </div>

      {/* Upload Box */}
      <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-xs">
        <h3 className="font-bold text-stone-900 text-xs uppercase tracking-wider mb-3">
          Upload New Image
        </h3>

        {error && (
          <div className="mb-3 rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="file"
            accept="image/png,image/jpeg,image/webp"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="text-xs text-stone-600 file:mr-3 file:rounded-xl file:border-0 file:bg-stone-100 file:px-4 file:py-2 file:text-xs file:font-semibold file:text-stone-700 hover:file:bg-stone-200"
          />

          <input
            type="text"
            placeholder="Alt text description (optional)"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            className="rounded-xl border border-stone-300 px-3 py-1.5 text-xs focus:border-emerald-700 focus:outline-none"
          />

          <button
            type="button"
            disabled={!selectedFile || uploadMutation.isPending}
            onClick={() => uploadMutation.mutate()}
            className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700 transition disabled:opacity-40"
          >
            {uploadMutation.isPending ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      </div>

      {/* Media Grid */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {mediaItems.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-stone-200 bg-white p-12 text-center text-xs text-stone-400">
            No media assets uploaded yet. Upload images above.
          </div>
        ) : (
          mediaItems.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-xs hover:border-emerald-300 transition"
            >
              <div className="aspect-video w-full overflow-hidden bg-stone-100">
                <img
                  src={item.secureUrl || item.url}
                  alt={item.altText || 'Clinic asset'}
                  className="h-full w-full object-cover transition group-hover:scale-105"
                />
              </div>

              <div className="p-3 text-xs space-y-1">
                <p className="font-semibold text-stone-900 truncate">
                  {item.altText || item.publicId}
                </p>
                <p className="text-[10px] text-stone-400 font-mono">
                  {item.width} × {item.height} • {Math.round(item.bytes / 1024)} KB
                </p>

                <div className="flex items-center justify-between pt-2 border-t border-stone-100">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(item.secureUrl || item.url);
                      setCopiedId(item.id);
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="text-[11px] font-semibold text-emerald-800 hover:underline"
                  >
                    {copiedId === item.id ? '✓ Copied URL' : 'Copy URL'}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this media asset permanently?')) {
                        deleteMutation.mutate(item.id);
                      }
                    }}
                    className="text-[11px] font-semibold text-red-600 hover:underline"
                  >
                    Delete
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
