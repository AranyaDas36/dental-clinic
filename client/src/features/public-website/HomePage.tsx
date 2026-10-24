import { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchPublicWebsite,
  fetchPublicServices,
  fetchPublicReviews,
  type PublicServiceItem,
} from '@/api/public';
import { applyThemeTokens } from '@/lib/theme';
import { CLINIC_HERO_HEADLINE, SEOHead } from './SEOHead';
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

  useEffect(() => {
    if (websiteQuery.data) {
      document.documentElement.classList.remove('clinic-home-pending');
    }
  }, [websiteQuery.data]);

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
      // Keep unpublished or unverified clinic content out of the public page.
      return (
        <main className="flex min-h-screen flex-col items-center justify-center p-6 text-center">
          <div className="max-w-md space-y-4 rounded-[var(--radius-card)] border border-black/5 bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)]">
            <h1 className="text-3xl font-bold text-[var(--color-text)]">Website not published</h1>
            <p className="text-sm text-[var(--color-muted-text)]">
              This clinic website is being updated. Please check back soon.
            </p>
          </div>
          <SEOHead
            seo={{
              title: 'Website not published',
              description: 'This clinic website has not been published yet.',
              canonicalPath: '/',
              socialImageMediaId: null,
            }}
            clinicName="Dental clinic"
          />
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
  const isPrimaryClinic =
    clinic.name === 'Chakdaha Dental Clinic' && clinic.dentist.name === 'Dr. Kalyan Das';
  const renderedSnapshot = isPrimaryClinic
    ? {
        ...snapshot,
        sections: snapshot.sections.map((section) =>
          section.type === 'hero'
            ? {
                ...section,
                settings: { ...section.settings, headline: CLINIC_HERO_HEADLINE },
              }
            : section,
        ),
      }
    : snapshot;
  const dentistPortraitUrl = clinic.dentist.portraitMediaId
    ? websiteQuery.data.media[clinic.dentist.portraitMediaId]?.url
    : null;

  return (
    <>
      <SEOHead
        seo={snapshot.seo}
        clinicName={clinic.name}
        clinic={clinic}
        services={services}
        socialImageUrl={
          snapshot.seo.socialImageMediaId
            ? websiteQuery.data.media[snapshot.seo.socialImageMediaId]?.url
            : dentistPortraitUrl
        }
      />
      <PublicSectionRenderer
        snapshot={renderedSnapshot}
        clinic={clinic}
        media={websiteQuery.data.media ?? {}}
        services={services}
        reviews={reviews}
        onSelectService={handleSelectService}
        onReviewSubmitted={handleReviewSubmitted}
        selectedServiceId={selectedServiceId}
      />
    </>
  );
}
