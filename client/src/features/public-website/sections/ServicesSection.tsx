import { useState, useMemo } from 'react';
import type { PublicServiceItem } from '@/api/public';

function ServiceImage({ service }: { service: PublicServiceItem }) {
  const [failed, setFailed] = useState(false);
  if (!service.imageUrl || failed) return null;
  return (
    <img
      src={service.imageUrl}
      alt={service.imageAltText || service.name}
      onError={() => setFailed(true)}
      className="mb-4 aspect-4/3 w-full rounded-[var(--radius-button)] object-cover"
    />
  );
}

interface ServicesSectionProps {
  services: PublicServiceItem[];
  settings: {
    heading: string;
    description: string;
    showPricing: boolean;
    featuredOnly: boolean;
  };
  layoutVariant?: string;
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

export function ServicesSection({
  services,
  settings,
  layoutVariant = 'cards',
  onSelectService,
}: ServicesSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const displayedServices = useMemo(() => {
    let list = settings.featuredOnly ? services.filter((s) => s.isFeatured) : services;
    if (selectedCategory !== 'All') {
      list = list.filter((s) => s.category.toLowerCase() === selectedCategory.toLowerCase());
    }
    return list;
  }, [services, settings.featuredOnly, selectedCategory]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    services.forEach((s) => {
      if (s.category) set.add(s.category);
    });
    return ['All', ...Array.from(set)];
  }, [services]);

  const isList = layoutVariant === 'list';

  return (
    <section
      id="services"
      className="scroll-mt-16 bg-[var(--color-surface)] py-[var(--section-space)]"
    >
      <div className="container-page space-y-10">
        {/* Header */}
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            <span>●</span>
            <span>Treatment Options</span>
          </div>
          <h2 className="text-3xl leading-tight tracking-tight md:text-5xl">{settings.heading}</h2>
          {settings.description && (
            <p className="text-base text-[var(--color-muted-text)] md:text-lg">
              {settings.description}
            </p>
          )}
        </div>

        {/* Category Filter Tabs */}
        {categories.length > 2 && (
          <div className="flex flex-wrap gap-2 border-b border-black/5 pb-4">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`rounded-[var(--radius-button)] px-4 py-2 text-xs font-semibold tracking-wide transition ${
                  selectedCategory.toLowerCase() === cat.toLowerCase()
                    ? 'bg-[var(--color-primary)] text-white shadow-2xs'
                    : 'bg-black/5 text-[var(--color-text)] hover:bg-black/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}

        {/* Services List / Cards */}
        {displayedServices.length === 0 ? (
          <div className="rounded-[var(--radius-card)] border border-dashed border-black/15 p-12 text-center">
            <p className="text-[var(--color-muted-text)]">
              No services currently listed under this filter.
            </p>
          </div>
        ) : isList ? (
          <div className="divide-y divide-black/5 rounded-[var(--radius-card)] border border-black/5 bg-[var(--color-background)]">
            {displayedServices.map((service) => (
              <div
                key={service.id}
                className="flex flex-col justify-between gap-4 p-6 transition hover:bg-white md:flex-row md:items-center"
              >
                <div className="space-y-1">
                  <ServiceImage service={service} />
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[var(--color-secondary)]/10 px-2.5 py-0.5 text-xs font-medium text-[var(--color-secondary)]">
                      {service.category}
                    </span>
                    {service.isFeatured && (
                      <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-2xs font-semibold text-amber-700">
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--color-text)]">{service.name}</h3>
                  <p className="max-w-xl text-sm text-[var(--color-muted-text)]">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  {settings.showPricing && (
                    <div className="text-right">
                      <span className="block text-base font-semibold text-[var(--color-primary)]">
                        {formatPrice(service)}
                      </span>
                      {service.priceType !== 'quote' && (
                        <span className="text-2xs text-[var(--color-muted-text)]">INR</span>
                      )}
                    </div>
                  )}
                  <a
                    href="#appointment"
                    onClick={() => onSelectService?.(service)}
                    className="inline-block rounded-[var(--radius-button)] bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold !text-white transition hover:opacity-90"
                  >
                    Request
                  </a>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedServices.map((service) => (
              <div
                key={service.id}
                className="flex flex-col justify-between rounded-[var(--radius-card)] border border-black/5 bg-[var(--color-background)] p-7 shadow-2xs transition hover:-translate-y-0.5 hover:shadow-xs"
              >
                <ServiceImage service={service} />
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded-full bg-[var(--color-secondary)]/10 px-3 py-1 text-xs font-medium text-[var(--color-secondary)]">
                      {service.category}
                    </span>
                    {service.isFeatured && (
                      <span className="rounded-full bg-amber-500/10 px-2.5 py-0.5 text-2xs font-semibold text-amber-700">
                        Featured
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-semibold text-[var(--color-text)]">{service.name}</h3>
                  <p className="text-sm leading-relaxed text-[var(--color-muted-text)]">
                    {service.shortDescription}
                  </p>
                </div>

                <div className="mt-6 border-t border-black/5 pt-4">
                  <div className="flex items-end justify-between">
                    {settings.showPricing ? (
                      <div>
                        <span className="block text-xs uppercase tracking-wider text-[var(--color-muted-text)]">
                          Price
                        </span>
                        <span className="text-lg font-bold text-[var(--color-primary)]">
                          {formatPrice(service)}
                        </span>
                      </div>
                    ) : (
                      <div />
                    )}
                    <a
                      href="#appointment"
                      onClick={() => onSelectService?.(service)}
                      className="inline-block rounded-[var(--radius-button)] bg-[var(--color-secondary)] px-4 py-2 text-xs font-semibold !text-white transition hover:opacity-90"
                    >
                      Book Care
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
