import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { publicReviewCreateSchema, type PublicReviewCreate } from '@dental/shared';
import { submitPublicReview } from '@/api/public';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitted?: () => void;
}

export function ReviewModal({ isOpen, onClose, onSubmitted }: ReviewModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<PublicReviewCreate>({
    resolver: zodResolver(publicReviewCreateSchema),
    defaultValues: {
      displayName: '',
      rating: 5,
      message: '',
    },
  });

  const selectedRating = watch('rating');

  if (!isOpen) return null;

  async function onSubmit(data: PublicReviewCreate) {
    setIsSubmitting(true);
    setApiError(null);
    try {
      await submitPublicReview(data);
      setSuccess(true);
      reset();
      onSubmitted?.();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to submit review');
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleClose() {
    setSuccess(false);
    setApiError(null);
    onClose();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="review-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-[var(--shadow-card)] md:p-8">
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close dialog"
          className="absolute top-4 right-4 text-2xl leading-none text-[var(--color-muted-text)] hover:text-[var(--color-text)]"
        >
          &times;
        </button>

        {success ? (
          <div className="space-y-4 py-4 text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-2xl text-[var(--color-primary)]">
              ✓
            </div>
            <h3 id="review-modal-title" className="text-2xl">
              Thank you for your feedback
            </h3>
            <p className="text-sm text-[var(--color-muted-text)]">
              Your review has been securely submitted for moderation. In accordance with patient
              privacy and clinic verification guidelines, approved reviews will appear publicly
              after review by our team.
            </p>
            <button
              type="button"
              onClick={handleClose}
              className="mt-4 inline-block rounded-[var(--radius-button)] bg-[var(--color-primary)] px-6 py-2.5 text-sm font-medium text-white transition hover:opacity-90"
            >
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-1">
              <span className="text-xs tracking-wider uppercase text-[var(--color-muted-text)]">
                Patient Feedback
              </span>
              <h3 id="review-modal-title" className="text-2xl">
                Share your clinic experience
              </h3>
              <p className="text-xs text-[var(--color-muted-text)]">
                All patient reviews are moderated by clinic administration prior to public display.
              </p>
            </div>

            {apiError && (
              <div
                role="alert"
                className="rounded-[var(--radius-button)] border border-red-200 bg-red-50 p-3 text-xs text-red-800"
              >
                {apiError}
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold uppercase text-[var(--color-muted-text)]">
                Your Rating
              </label>
              <div
                className="mt-1.5 flex gap-1.5"
                role="radiogroup"
                aria-label="Rating out of 5 stars"
              >
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setValue('rating', star, { shouldValidate: true })}
                    className={`text-2xl transition hover:scale-110 ${
                      star <= (selectedRating || 5) ? 'text-amber-500' : 'text-neutral-300'
                    }`}
                    aria-label={`${star} star${star > 1 ? 's' : ''}`}
                  >
                    ★
                  </button>
                ))}
              </div>
              {errors.rating && (
                <p className="mt-1 text-xs text-red-600">{errors.rating.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[var(--color-muted-text)]">
                Display Name (e.g. First Name or Initials)
              </label>
              <input
                type="text"
                {...register('displayName')}
                placeholder="e.g. Sarah M."
                className="mt-1 w-full rounded-[var(--radius-button)] border border-black/15 bg-white px-3 py-2 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              />
              {errors.displayName && (
                <p className="mt-1 text-xs text-red-600">{errors.displayName.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase text-[var(--color-muted-text)]">
                Your Comments
              </label>
              <textarea
                rows={4}
                {...register('message')}
                placeholder="Tell us about the care you received, the comfort of your visit, and our team..."
                className="mt-1 w-full rounded-[var(--radius-button)] border border-black/15 bg-white p-3 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
              />
              {errors.message && (
                <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
              )}
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleClose}
                className="rounded-[var(--radius-button)] border border-black/15 px-4 py-2 text-sm text-[var(--color-text)] hover:bg-black/5"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-[var(--radius-button)] bg-[var(--color-primary)] px-5 py-2 text-sm font-semibold !text-white transition hover:opacity-90 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
