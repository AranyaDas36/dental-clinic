import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { fetchWebsiteDraft, fetchAdminServices } from '@/api/admin';
import { applyThemeTokens } from '@/lib/theme';
import { PublicSectionRenderer } from '@/features/public-website/PublicSectionRenderer';
import { SEOHead } from '@/features/public-website/SEOHead';

export function DraftPreviewPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'website', 'draft'],
    queryFn: fetchWebsiteDraft,
  });

  const servicesQuery = useQuery({
    queryKey: ['admin', 'services'],
    queryFn: () => fetchAdminServices({ pageSize: 50 }),
  });

  useEffect(() => {
    if (data?.draft.theme) {
      applyThemeTokens(data.draft.theme);
    }
  }, [data?.draft.theme]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-stone-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-emerald-800 border-t-transparent" />
          <p className="mt-3 text-xs font-semibold text-stone-600">
            Generating live draft preview...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6 text-center">
        <div className="max-w-md rounded-2xl bg-white p-8 shadow-xl border border-red-200">
          <h2 className="text-xl font-bold text-red-800">Preview Error</h2>
          <p className="mt-2 text-xs text-stone-600">
            {error instanceof Error ? error.message : 'Unable to load draft preview.'}
          </p>
          <Link
            to="/admin"
            className="mt-4 inline-block rounded-xl bg-stone-800 px-4 py-2 text-xs font-semibold text-white"
          >
            ← Return to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const { draft, clinic, draftVersion } = data;
  const services = (servicesQuery.data?.items || []).map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    shortDescription: s.shortDescription,
    description: s.description,
    category: s.category,
    priceType: s.priceType,
    price: s.price,
    minPrice: s.minPrice,
    maxPrice: s.maxPrice,
    currency: s.currency,
    imageMediaId: s.imageMediaId,
    isFeatured: s.isFeatured,
    isPublished: s.isPublished,
    displayOrder: s.displayOrder,
    seoTitle: s.seoTitle,
    seoDescription: s.seoDescription,
  }));

  return (
    <div>
      {/* Floating Preview Banner */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-amber-300 bg-amber-500/95 px-6 py-2.5 text-black shadow-md backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="font-extrabold text-xs uppercase tracking-wider bg-black text-amber-400 px-2 py-0.5 rounded-md">
            Draft Preview Mode
          </span>
          <span className="text-xs font-semibold">
            Draft version v{draftVersion} (Private to clinic staff • Search engines blocked via
            noindex)
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin"
            className="inline-block rounded-lg bg-stone-900 px-3.5 py-1 text-xs font-bold !text-white hover:bg-stone-800 hover:!text-white transition"
          >
            ← Back to Admin CMS
          </Link>
        </div>
      </div>

      <SEOHead seo={draft.seo} clinicName={clinic.name} />
      {/* Meta tags to disallow indexing */}
      <meta name="robots" content="noindex, nofollow" />

      {/* Render Full Public Sections */}
      <PublicSectionRenderer
        snapshot={draft}
        clinic={clinic}
        services={services}
        reviews={[]}
        onSelectService={() => {}}
        onReviewSubmitted={() => {}}
        selectedServiceId={null}
      />
    </div>
  );
}
