import { useEffect, useMemo, useRef, useState } from 'react';
import type { PublicServiceItem } from '@/api/public';

interface ServicesSectionProps {
  services: PublicServiceItem[];
  settings: {
    heading: string;
    description: string;
    showPricing: boolean;
    featuredOnly: boolean;
  };
  isLoading?: boolean;
  onSelectService?: (service: PublicServiceItem) => void;
}

export function formatPrice(service: PublicServiceItem): string {
  switch (service.priceType) {
    case 'fixed':
      return service.price !== null && Number.isFinite(service.price) && service.price >= 0
        ? `₹${service.price.toLocaleString('en-IN')}`
        : 'Contact for pricing';
    case 'starting_at':
      return service.minPrice !== null && Number.isFinite(service.minPrice) && service.minPrice >= 0
        ? `From ₹${service.minPrice.toLocaleString('en-IN')}`
        : 'Contact for pricing';
    case 'range':
      if (
        service.minPrice !== null &&
        service.maxPrice !== null &&
        Number.isFinite(service.minPrice) &&
        Number.isFinite(service.maxPrice) &&
        service.minPrice >= 0 &&
        service.maxPrice >= service.minPrice
      ) {
        return `₹${service.minPrice.toLocaleString('en-IN')} – ₹${service.maxPrice.toLocaleString('en-IN')}`;
      }
      return 'Contact for pricing';
    case 'quote':
      return 'Contact for pricing';
    default:
      return 'Contact clinic';
  }
}

function getServiceTitle(name: string): string {
  const normalizedName = name.trim();
  if (/^rct$/i.test(normalizedName)) return 'Root Canal Treatment (RCT)';
  if (/^root canal treatment$/i.test(normalizedName)) return 'Root Canal Treatment (RCT)';
  return normalizedName;
}

function getServiceIconLabel(service: PublicServiceItem): string {
  return `${service.category} ${service.name}`.toLowerCase();
}

function ServiceIcon({ service }: { service: PublicServiceItem }) {
  const label = getServiceIconLabel(service);
  const isCosmetic = /cosmetic|whiten|veneer|smile|aesthetic/.test(label);
  const isOrthodontic = /orthodont|braces|aligner/.test(label);

  if (isCosmetic) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Z" />
        <path d="m19 15 .9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15Z" />
      </svg>
    );
  }

  if (isOrthodontic) {
    return (
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        fill="none"
        className="h-6 w-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M5 4c0 5 1 12 3 16 1 .8 2-2 4-2s3 2.8 4 2c2-4 3-11 3-16-2-1-4 0-7 0s-5-1-7 0Z" />
        <path d="M5.5 10h13M8 10v2m4-2v2m4-2v2" />
      </svg>
    );
  }

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      className="h-6 w-6"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 4c0 5 1 12 3 16 1 .8 2-2 4-2s3 2.8 4 2c2-4 3-11 3-16-2-1-4 0-7 0s-5-1-7 0Z" />
      <path d="M9 8h.01M15 8h.01" />
    </svg>
  );
}

function CategoryFilter({
  categories,
  selectedCategory,
  onSelect,
}: {
  categories: string[];
  selectedCategory: string;
  onSelect: (category: string) => void;
}) {
  if (categories.length <= 1) return null;

  return (
    <div
      className="flex flex-wrap justify-center gap-2"
      role="group"
      aria-label="Filter services by category"
    >
      {['All', ...categories].map((category) => {
        const isSelected = selectedCategory === category;
        return (
          <button
            key={category}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onSelect(category)}
            className={`rounded-full border px-4 py-2 text-sm font-medium transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)] ${
              isSelected
                ? 'border-slate-900 bg-slate-900 text-white'
                : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400 hover:text-slate-900'
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}

function ServiceCard({
  service,
  index,
  showPricing,
  onSelectService,
}: {
  service: PublicServiceItem;
  index: number;
  showPricing: boolean;
  onSelectService?: (service: PublicServiceItem) => void;
}) {
  const cardRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const title = getServiceTitle(service.name);
  const description = service.shortDescription.trim() || service.description.trim();
  const priceLabel =
    service.priceType === 'starting_at'
      ? 'Starting from'
      : service.priceType === 'range'
        ? 'Price range'
        : service.priceType === 'quote'
          ? 'Pricing'
          : 'Treatment fee';
  const price = formatPrice(service).replace(/^From /, '');

  useEffect(() => {
    const element = cardRef.current;
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
    <article
      ref={cardRef}
      className={`services-card-reveal group flex h-full flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-[0_8px_24px_rgba(15,23,42,0.045)] transition-[opacity,transform,border-color,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:border-slate-300 hover:shadow-[0_18px_40px_rgba(15,23,42,0.10)] focus-within:border-slate-300 sm:p-7 ${
        isVisible ? 'services-card-reveal-visible' : ''
      }`}
      style={{ transitionDelay: `${Math.min(index, 5) * 65}ms` }}
    >
      <div className="flex items-start justify-between gap-4">
        <span className="inline-flex max-w-[75%] rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
          {service.category || 'Dental care'}
        </span>
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-800 transition-colors group-hover:bg-slate-100">
          <ServiceIcon service={service} />
        </span>
      </div>

      <div className="mt-6 flex-1">
        <h3 className="font-[family-name:var(--font-heading)] text-xl font-semibold leading-snug text-slate-900 sm:text-2xl">
          {title}
        </h3>
        {description && (
          <p className="mt-3 line-clamp-2 text-sm leading-6 text-slate-600">{description}</p>
        )}
      </div>

      <div className="mt-7 flex items-end justify-between gap-4 border-t border-slate-100 pt-5">
        {showPricing ? (
          <div className="min-w-0">
            <span className="block text-xs font-medium text-slate-500">{priceLabel}</span>
            <span className="mt-1 block text-xl font-bold tracking-tight text-slate-900">
              {price}
            </span>
          </div>
        ) : (
          <span className="text-sm font-medium text-slate-500">Treatment details</span>
        )}
        <a
          href="#appointment"
          aria-label={`Book now: ${title}`}
          onClick={() => onSelectService?.(service)}
          className="inline-flex shrink-0 items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 transition-colors duration-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]"
        >
          Book now
          <svg
            aria-hidden="true"
            viewBox="0 0 20 20"
            fill="none"
            className="h-4 w-4"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M3.5 10h12m-5-5 5 5-5 5" />
          </svg>
        </a>
      </div>
    </article>
  );
}

function ServiceCardSkeleton() {
  return (
    <div
      aria-hidden="true"
      className="animate-pulse rounded-2xl border border-slate-200 bg-white p-6 sm:p-7"
    >
      <div className="flex items-start justify-between">
        <div className="h-6 w-28 rounded-full bg-slate-100" />
        <div className="h-11 w-11 rounded-xl bg-slate-100" />
      </div>
      <div className="mt-6 h-7 w-3/4 rounded bg-slate-100" />
      <div className="mt-3 h-4 w-full rounded bg-slate-100" />
      <div className="mt-2 h-4 w-2/3 rounded bg-slate-100" />
      <div className="mt-7 flex items-end justify-between border-t border-slate-100 pt-5">
        <div>
          <div className="h-3 w-20 rounded bg-slate-100" />
          <div className="mt-2 h-6 w-24 rounded bg-slate-100" />
        </div>
        <div className="h-10 w-28 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}

export function ServicesSection({
  services,
  settings,
  isLoading = false,
  onSelectService,
}: ServicesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const availableServices = useMemo(
    () => (settings.featuredOnly ? services.filter((service) => service.isFeatured) : services),
    [services, settings.featuredOnly],
  );
  const categories = useMemo(
    () => Array.from(new Set(availableServices.map((service) => service.category).filter(Boolean))),
    [availableServices],
  );
  const displayedServices = useMemo(
    () =>
      selectedCategory === 'All'
        ? availableServices
        : availableServices.filter((service) => service.category === selectedCategory),
    [availableServices, selectedCategory],
  );
  const gridWidth =
    displayedServices.length === 1
      ? 'max-w-2xl'
      : displayedServices.length === 2
        ? 'max-w-5xl'
        : 'max-w-6xl';
  const gridColumns =
    displayedServices.length === 2
      ? 'sm:grid-cols-2'
      : displayedServices.length > 2
        ? 'sm:grid-cols-2 lg:grid-cols-3'
        : '';

  return (
    <section
      id="services"
      className="scroll-mt-20 bg-slate-50/70 py-[var(--section-space)]"
    >
      <div className="container-page space-y-10">
        <div className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-700">
            <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-slate-800" />
            Treatment options
          </p>
          <h2 className="font-[family-name:var(--font-heading)] text-3xl leading-tight tracking-tight text-slate-900 md:text-5xl">
            {settings.heading}
          </h2>
          <p className="mx-auto max-w-2xl text-base leading-7 text-slate-600 md:text-lg">
            Transparent pricing for every treatment, with no hidden costs.
          </p>
        </div>

        {!isLoading && (
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelect={setSelectedCategory}
          />
        )}

        {isLoading ? (
          <div
            role="status"
            aria-label="Loading services"
            aria-busy="true"
            className={`mx-auto grid w-full ${gridWidth} grid-cols-1 gap-5 sm:gap-6 sm:grid-cols-2 lg:grid-cols-3`}
          >
            <ServiceCardSkeleton />
            <ServiceCardSkeleton />
            <ServiceCardSkeleton />
          </div>
        ) : displayedServices.length === 0 ? (
          <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
            <p className="text-sm text-slate-600">No treatments are listed in this category yet.</p>
          </div>
        ) : (
          <div
            className={`mx-auto grid w-full ${gridWidth} grid-cols-1 gap-5 ${gridColumns} sm:gap-6`}
          >
            {displayedServices.map((service, index) => (
              <ServiceCard
                key={service.id}
                service={service}
                index={index}
                showPricing={settings.showPricing}
                onSelectService={onSelectService}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
