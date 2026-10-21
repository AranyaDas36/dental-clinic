import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { DEFAULT_CLINIC, createDefaultWebsiteSnapshot } from '@dental/shared';
import {
  fetchPublicWebsite,
  fetchPublicServices,
  fetchPublicReviews,
  type PublicServiceItem,
} from '@/api/public';
import { applyThemeTokens } from '@/lib/theme';
import { SEOHead } from './SEOHead';
import { PublicSectionRenderer } from './PublicSectionRenderer';

export function HomePage() {
  const queryClient = useQueryClient();
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);

  const websiteQuery = useQuery({
    queryKey: ['public', 'website'],
    queryFn: fetchPublicWebsite,
    retry: 1,
    staleTime: 1000 * 60 * 5, // 5 minutes cache
  });

  const servicesQuery = useQuery({
    queryKey: ['public', 'services'],
    queryFn: fetchPublicServices,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  const reviewsQuery = useQuery({
    queryKey: ['public', 'reviews'],
    queryFn: fetchPublicReviews,
    retry: 1,
    staleTime: 1000 * 60 * 5,
  });

  // Apply published theme tokens to CSS custom properties
  useEffect(() => {
    if (websiteQuery.data?.snapshot.theme) {
      applyThemeTokens(websiteQuery.data.snapshot.theme);
    }
  }, [websiteQuery.data?.snapshot.theme]);

  function handleSelectService(service: PublicServiceItem) {
    setSelectedServiceId(service.id);
  }

  function handleReviewSubmitted() {
    queryClient.invalidateQueries({ queryKey: ['public', 'reviews'] });
  }

  // Loading state
  if (websiteQuery.isLoading) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-3xl animate-pulse text-[var(--color-primary)]">
          ✦
        </div>
        <p className="mt-4 font-[family-name:var(--font-heading)] text-2xl font-semibold text-[var(--color-secondary)]">
          Loading Clinic Care...
        </p>
        <p className="mt-1 text-xs text-[var(--color-muted-text)]">
          Preparing patient services and schedule
        </p>
      </div>
    );
  }

  // Website not published yet state
  if (websiteQuery.isError) {
    const isNotPublished = (websiteQuery.error as { status?: number })?.status === 404;

    if (isNotPublished) {
      // Graceful fallback showing clinic launch placeholder
      const defaultSnapshot = createDefaultWebsiteSnapshot();
      return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4 rounded-[var(--radius-card)] border border-black/5 bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-2xl text-[var(--color-primary)]">
              🌿
            </div>
            <h1 className="text-3xl font-bold text-[var(--color-text)]">{DEFAULT_CLINIC.name}</h1>
            <p className="text-sm text-[var(--color-muted-text)]">
              Our website is currently preparing for public launch. If you need immediate dental
              assistance, please reach out directly:
            </p>
            <div className="rounded-[var(--radius-button)] bg-[var(--color-background)] p-4 text-xs space-y-1">
              <p className="font-semibold text-[var(--color-text)]">
                Phone: {DEFAULT_CLINIC.contact.phone}
              </p>
              <p className="text-[var(--color-muted-text)]">
                Email: {DEFAULT_CLINIC.contact.email}
              </p>
            </div>
            <div className="pt-2">
              <a
                href="/admin/login"
                className="inline-block rounded-[var(--radius-button)] bg-[var(--color-primary)] px-5 py-2 text-xs font-semibold text-white"
              >
                Dentist & Admin Sign In →
              </a>
            </div>
          </div>
          <SEOHead seo={defaultSnapshot.seo} clinicName={DEFAULT_CLINIC.name} />
        </main>
      );
    }

    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md space-y-4 rounded-[var(--radius-card)] border border-red-200 bg-red-50 p-8 text-red-800">
          <h2 className="text-2xl font-bold">Unable to Load Clinic Information</h2>
          <p className="text-xs">
            {websiteQuery.error instanceof Error
              ? websiteQuery.error.message
              : 'Connection error while contacting the clinic API.'}
          </p>
          <button
            type="button"
            onClick={() => websiteQuery.refetch()}
            className="rounded-[var(--radius-button)] bg-red-700 px-4 py-2 text-xs font-semibold text-white hover:bg-red-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!websiteQuery.data) {
    return null;
  }

  const { snapshot, clinic } = websiteQuery.data;
  const services = servicesQuery.data?.items || [];
  const reviews = reviewsQuery.data?.items || [];

  return (
    <>
      <SEOHead seo={snapshot.seo} clinicName={clinic.name} />
      <PublicSectionRenderer
        snapshot={snapshot}
        clinic={clinic}
        services={services}
        reviews={reviews}
        onSelectService={handleSelectService}
        onReviewSubmitted={handleReviewSubmitted}
        selectedServiceId={selectedServiceId}
      />
    </>
  );
}
