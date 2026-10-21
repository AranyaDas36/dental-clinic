import { useState } from 'react';
import type { PublicReviewItem } from '@/api/public';
import { ReviewModal } from '../ReviewModal';

interface ReviewsSectionProps {
  reviews: PublicReviewItem[];
  settings: {
    heading: string;
    description: string;
    allowPublicSubmission: boolean;
  };
  layoutVariant?: string;
  onReviewSubmitted?: () => void;
}

export function ReviewsSection({
  reviews,
  settings,
  layoutVariant = 'cards',
  onReviewSubmitted,
}: ReviewsSectionProps) {
  const [modalOpen, setModalOpen] = useState(false);

  const averageRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <section id="reviews" className="scroll-mt-16 py-[var(--section-space)]">
      <div className="container-page space-y-10">
        {/* Section Header */}
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl space-y-3">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              <span>★</span>
              <span>Patient Stories</span>
            </div>
            <h2 className="text-3xl leading-tight tracking-tight md:text-5xl">
              {settings.heading}
            </h2>
            {settings.description && (
              <p className="text-base text-[var(--color-muted-text)] md:text-lg">
                {settings.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {averageRating && (
              <div className="flex items-center gap-2 rounded-[var(--radius-button)] border border-black/10 bg-[var(--color-surface)] px-4 py-2 text-sm shadow-2xs">
                <span className="text-base font-bold text-amber-500">★ {averageRating}</span>
                <span className="text-xs text-[var(--color-muted-text)]">
                  ({reviews.length} approved review{reviews.length > 1 ? 's' : ''})
                </span>
              </div>
            )}
            {settings.allowPublicSubmission && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="rounded-[var(--radius-button)] bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold !text-white shadow-xs transition hover:opacity-90 active:scale-98"
              >
                Leave a review
              </button>
            )}
          </div>
        </div>

        {/* Reviews Listing */}
        {reviews.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-black/15 bg-[var(--color-surface)] p-12 text-center space-y-3">
            <p className="text-lg font-medium text-[var(--color-text)]">
              No published patient reviews yet.
            </p>
            <p className="text-sm text-[var(--color-muted-text)] max-w-md mx-auto">
              We uphold strict confidentiality. Reviews undergo administrative review before being
              published.
            </p>
            {settings.allowPublicSubmission && (
              <button
                type="button"
                onClick={() => setModalOpen(true)}
                className="mt-2 inline-block text-sm font-semibold text-[var(--color-primary)] hover:underline"
              >
                Be the first to leave a review →
              </button>
            )}
          </div>
        ) : (
          <div
            className={`grid gap-6 ${
              layoutVariant === 'grid'
                ? 'sm:grid-cols-2 md:grid-cols-4'
                : 'sm:grid-cols-2 lg:grid-cols-3'
            }`}
          >
            {reviews.map((review) => (
              <div
                key={review.id}
                className="flex flex-col justify-between rounded-[var(--radius-card)] border border-black/5 bg-[var(--color-surface)] p-6 shadow-2xs transition hover:shadow-xs"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex text-amber-500"
                      aria-label={`${review.rating} out of 5 stars`}
                    >
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} className={i < review.rating ? 'opacity-100' : 'opacity-25'}>
                          ★
                        </span>
                      ))}
                    </div>
                    {review.createdAt && (
                      <span className="text-2xs text-[var(--color-muted-text)]">
                        {new Date(review.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-sm leading-relaxed text-[var(--color-text)] italic">
                    "{review.message}"
                  </p>
                </div>

                <div className="mt-6 border-t border-black/5 pt-3">
                  <p className="text-xs font-semibold text-[var(--color-secondary)]">
                    {review.displayName}
                  </p>
                  <p className="text-2xs text-[var(--color-muted-text)]">Verified Patient Visit</p>

                  {/* Clinic response if provided */}
                  {review.adminResponse && (
                    <div className="mt-3 rounded-[var(--radius-button)] bg-[var(--color-background)] p-3 text-xs">
                      <p className="font-semibold text-[var(--color-secondary)]">
                        Clinic Response:
                      </p>
                      <p className="mt-0.5 text-[var(--color-muted-text)]">
                        {review.adminResponse}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <ReviewModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSubmitted={onReviewSubmitted}
      />
    </section>
  );
}
