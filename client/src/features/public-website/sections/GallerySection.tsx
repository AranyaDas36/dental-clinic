import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { PublicMediaItem } from '@/api/public';

interface GallerySectionProps {
  settings: {
    heading: string;
    description: string;
    mediaIds: string[];
  };
  media: Record<string, PublicMediaItem>;
  layoutVariant?: string;
}

interface GalleryItemData {
  id: string;
  item: PublicMediaItem;
}

const INITIAL_PHOTO_COUNT = 6;

export function GallerySection({ settings, media }: GallerySectionProps) {
  const [failedMediaIds, setFailedMediaIds] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const items = settings.mediaIds
    .map((id) => ({ id, item: media[id] }))
    .filter(
      (entry): entry is GalleryItemData =>
        Boolean(entry.item?.url) && !failedMediaIds.includes(entry.id),
    );
  const visibleItems = showAll ? items : items.slice(0, INITIAL_PHOTO_COUNT);

  function markImageFailed(id: string) {
    setFailedMediaIds((previous) => (previous.includes(id) ? previous : [...previous, id]));
  }

  return (
    <section id="gallery" className="bg-[var(--color-background)] py-[var(--section-space)]">
      <div className="container-page space-y-9 md:space-y-12">
        <header className="max-w-2xl space-y-3">
          <p className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.18em] text-[var(--color-primary)]">
            <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[var(--color-primary)]" />
            Our clinic
          </p>
          <h2 className="text-3xl leading-tight tracking-tight md:text-5xl">
            A look inside our clinic
          </h2>
          <p className="text-base text-[var(--color-muted-text)] md:text-lg">
            Modern equipment, a clean environment, and a team that puts your comfort first.
          </p>
        </header>

        {visibleItems.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:auto-rows-[minmax(11rem,1fr)] lg:grid-cols-4">
              {visibleItems.map(({ id, item }, index) => (
                <GalleryItem
                  key={id}
                  item={item}
                  index={index}
                  featured={visibleItems.length >= 3 && index === 0}
                  onOpen={() => setActiveIndex(index)}
                  onError={() => markImageFailed(id)}
                />
              ))}
            </div>
            {items.length > INITIAL_PHOTO_COUNT && (
              <div className="flex justify-center">
                <button
                  type="button"
                  onClick={() => setShowAll((current) => !current)}
                  className="rounded-full border border-[var(--color-primary)]/20 bg-white px-6 py-3 text-sm font-semibold text-[var(--color-primary)] shadow-sm transition hover:border-[var(--color-primary)]/40 hover:bg-[var(--color-primary)]/5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)]"
                >
                  {showAll ? 'Show fewer photos' : 'View all photos'}
                </button>
              </div>
            )}
          </>
        ) : (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-white/80 px-6 py-12 text-center shadow-sm">
            <span
              aria-hidden="true"
              className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--color-primary)]/8 text-[var(--color-primary)]"
            >
              <GalleryIcon className="h-7 w-7" />
            </span>
            <h3 className="text-xl font-semibold text-[var(--color-secondary)]">
              Clinic photos coming soon
            </h3>
            <p className="mt-2 max-w-md text-sm text-[var(--color-muted-text)]">
              We look forward to sharing a closer look at our clinic with you.
            </p>
          </div>
        )}
      </div>

      {activeIndex !== null && items[activeIndex] && (
        <Lightbox
          items={items}
          activeIndex={activeIndex}
          onChange={setActiveIndex}
          onClose={() => setActiveIndex(null)}
          onError={markImageFailed}
        />
      )}
    </section>
  );
}

interface GalleryItemProps {
  item: PublicMediaItem;
  index: number;
  featured: boolean;
  onOpen: () => void;
  onError: () => void;
}

function GalleryItem({ item, index, featured, onOpen, onError }: GalleryItemProps) {
  const itemRef = useRef<HTMLButtonElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const caption = item.caption.trim();
  const altText = item.altText.trim() || caption || 'Clinic photograph';

  useEffect(() => {
    const element = itemRef.current;
    if (element?.querySelector('img')?.complete) setImageLoaded(true);
    if (!element || !('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '80px' },
    );
    observer.observe(element);

    return () => observer.disconnect();
  }, []);

  return (
    <button
      ref={itemRef}
      type="button"
      aria-label={caption ? `View photo: ${caption}` : `View photo: ${altText}`}
      onClick={onOpen}
      className={`gallery-reveal group relative block aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-gradient-to-br from-slate-100 to-white text-left shadow-[0_8px_24px_rgba(15,23,42,0.07)] transition-[opacity,transform,box-shadow] duration-500 ease-out hover:shadow-[0_16px_36px_rgba(15,23,42,0.14)] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--color-primary)] ${
        featured
          ? 'lg:aspect-auto lg:col-span-2 lg:row-span-2 lg:min-h-[25rem]'
          : 'lg:aspect-auto lg:min-h-[12rem]'
      } ${isVisible ? 'gallery-reveal-visible' : ''}`}
      style={{ transitionDelay: `${Math.min(index, INITIAL_PHOTO_COUNT - 1) * 65}ms` }}
    >
      <img
        src={item.url}
        alt={altText}
        loading="lazy"
        decoding="async"
        onLoad={() => setImageLoaded(true)}
        sizes={
          featured
            ? '(min-width: 1024px) 50vw, (min-width: 640px) 50vw, 100vw'
            : '(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw'
        }
        onError={onError}
        className={`absolute inset-0 h-full w-full object-cover transition-[opacity,filter,transform] duration-500 ease-out group-hover:scale-105 group-focus-visible:scale-105 ${
          imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-md'
        }`}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 bg-gradient-to-t from-slate-950/65 via-slate-950/0 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
      />
      <span
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-4 p-4 text-sm font-medium text-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
      >
        <span>{caption || 'View clinic photo'}</span>
        <ZoomIcon className="h-5 w-5 shrink-0" />
      </span>
    </button>
  );
}

interface LightboxProps {
  items: GalleryItemData[];
  activeIndex: number;
  onChange: (index: number) => void;
  onClose: () => void;
  onError: (id: string) => void;
}

function Lightbox({ items, activeIndex, onChange, onClose, onError }: LightboxProps) {
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);
  const activeIndexRef = useRef(activeIndex);
  const itemsLengthRef = useRef(items.length);
  const onChangeRef = useRef(onChange);
  const onCloseRef = useRef(onClose);
  const current = items[activeIndex];

  activeIndexRef.current = activeIndex;
  itemsLengthRef.current = items.length;
  onChangeRef.current = onChange;
  onCloseRef.current = onClose;

  function goTo(offset: number) {
    onChange((activeIndex + offset + items.length) % items.length);
  }

  useEffect(() => {
    const previouslyFocused =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeButtonRef.current?.focus();

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onCloseRef.current();
      } else if (itemsLengthRef.current > 1 && event.key === 'ArrowRight') {
        event.preventDefault();
        onChangeRef.current((activeIndexRef.current + 1) % itemsLengthRef.current);
      } else if (itemsLengthRef.current > 1 && event.key === 'ArrowLeft') {
        event.preventDefault();
        onChangeRef.current(
          (activeIndexRef.current - 1 + itemsLengthRef.current) % itemsLengthRef.current,
        );
      } else if (event.key === 'Tab') {
        const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], [tabindex]:not([tabindex="-1"])',
        );
        if (!focusable?.length) return;
        const first = focusable.item(0);
        const last = focusable.item(focusable.length - 1);
        if (!first || !last) return;
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      previouslyFocused?.focus();
    };
  }, []);

  if (!current) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/85 p-4 backdrop-blur-md"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onTouchStart={(event) => {
        touchStartX.current = event.touches[0]?.clientX ?? null;
      }}
      onTouchEnd={(event) => {
        const startX = touchStartX.current;
        const endX = event.changedTouches[0]?.clientX;
        touchStartX.current = null;
        if (startX === null || endX === undefined || items.length < 2) return;
        const delta = endX - startX;
        if (Math.abs(delta) > 48) goTo(delta < 0 ? 1 : -1);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Clinic photo viewer"
        ref={dialogRef}
        className="relative flex max-h-full w-full max-w-6xl flex-col items-center"
      >
        <button
          ref={closeButtonRef}
          type="button"
          aria-label="Close photo viewer"
          onClick={onClose}
          className="absolute -top-12 right-0 z-10 rounded-full bg-white/10 p-2 text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:top-3 sm:right-3"
        >
          <CloseIcon className="h-6 w-6" />
        </button>

        <div className="relative flex min-h-0 w-full flex-1 items-center justify-center">
          {items.length > 1 && (
            <button
              type="button"
              aria-label="Previous photo"
              onClick={() => goTo(-1)}
              className="absolute left-2 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:left-4"
            >
              <ArrowIcon className="h-6 w-6 rotate-180" />
            </button>
          )}
          <img
            src={current.item.url}
            alt={current.item.altText.trim() || current.item.caption.trim() || 'Clinic photograph'}
            loading="eager"
            decoding="async"
            onError={() => {
              onError(current.id);
              onClose();
            }}
            className="max-h-[78vh] max-w-full rounded-2xl object-contain shadow-2xl"
          />
          {items.length > 1 && (
            <button
              type="button"
              aria-label="Next photo"
              onClick={() => goTo(1)}
              className="absolute right-2 z-10 rounded-full bg-white/10 p-3 text-white backdrop-blur-sm transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:right-4"
            >
              <ArrowIcon className="h-6 w-6" />
            </button>
          )}
        </div>

        <div className="mt-4 min-h-8 text-center text-sm text-white/90">
          {current.item.caption.trim() && <p>{current.item.caption}</p>}
          <p className="mt-1 text-xs text-white/60">
            {activeIndex + 1} / {items.length}
          </p>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function GalleryIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.5"
    >
      <rect x="3.5" y="4.5" width="17" height="15" rx="2" />
      <circle cx="9" cy="10" r="1.5" />
      <path strokeLinecap="round" strokeLinejoin="round" d="m5 17 4-4 3 3 3-4 4 5" />
    </svg>
  );
}

function ZoomIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <circle cx="10.8" cy="10.8" r="6.3" />
      <path strokeLinecap="round" d="m15.5 15.5 4 4M10.8 8v5.6M8 10.8h5.6" />
    </svg>
  );
}

function CloseIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path strokeLinecap="round" d="m6 6 12 12M18 6 6 18" />
    </svg>
  );
}

function ArrowIcon({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth="1.75"
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-6-6 6 6-6 6" />
    </svg>
  );
}
