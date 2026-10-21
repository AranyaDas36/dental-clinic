interface TrustSectionProps {
  settings: {
    heading: string;
    items: Array<{ label: string; detail: string }>;
  };
  layoutVariant?: string;
}

export function TrustSection({ settings, layoutVariant = 'row' }: TrustSectionProps) {
  const isCards = layoutVariant === 'cards';
  const isMinimal = layoutVariant === 'minimal';

  if (isMinimal) {
    return (
      <section className="border-y border-black/5 bg-[var(--color-surface)] py-6">
        <div className="container-page flex flex-wrap items-center justify-around gap-6 text-center">
          {settings.items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-text)]">
                {item.label}:
              </span>
              <span className="text-sm font-medium text-[var(--color-text)]">{item.detail}</span>
            </div>
          ))}
        </div>
      </section>
    );
  }

  if (isCards) {
    return (
      <section className="bg-[var(--color-surface)] py-12">
        <div className="container-page space-y-8">
          {settings.heading && (
            <h2 className="text-center text-2xl tracking-tight md:text-3xl">{settings.heading}</h2>
          )}
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {settings.items.map((item, idx) => (
              <div
                key={idx}
                className="rounded-[var(--radius-card)] border border-black/5 bg-[var(--color-background)] p-6 shadow-2xs transition hover:shadow-xs"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)] font-bold">
                  {idx + 1}
                </div>
                <h3 className="mt-4 font-semibold text-[var(--color-text)]">{item.label}</h3>
                <p className="mt-1 text-sm text-[var(--color-muted-text)]">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  // Default 'row' layout
  return (
    <section className="border-y border-black/5 bg-[var(--color-surface)] py-10">
      <div className="container-page">
        {settings.heading && (
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-[var(--color-muted-text)]">
            {settings.heading}
          </p>
        )}
        <div className="grid grid-cols-1 divide-y divide-black/5 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {settings.items.map((item, idx) => (
            <div key={idx} className="px-6 py-4 text-center first:pl-0 last:pr-0">
              <span className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-text)]">
                {item.label}
              </span>
              <span className="mt-1 block text-base font-semibold text-[var(--color-secondary)]">
                {item.detail}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
