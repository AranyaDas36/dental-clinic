interface WhyChooseUsSectionProps {
  settings: {
    heading: string;
    description: string;
    items: Array<{ title: string; description: string }>;
  };
  layoutVariant?: string;
}

const FEATURE_ICONS = ['🛡️', '💬', '👨‍👩‍👧', '🔬', '⏱️', '🌱', '📋', '✨'];

export function WhyChooseUsSection({ settings, layoutVariant = 'grid' }: WhyChooseUsSectionProps) {
  const isList = layoutVariant === 'list';

  return (
    <section className="bg-[var(--color-surface)] py-[var(--section-space)]">
      <div className="container-page space-y-12">
        <div className="mx-auto max-w-2xl text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            <span>✦</span>
            <span>Why Choose Our Clinic</span>
          </div>
          <h2 className="text-3xl leading-tight tracking-tight md:text-5xl">{settings.heading}</h2>
          {settings.description && (
            <p className="text-base text-[var(--color-muted-text)] md:text-lg">
              {settings.description}
            </p>
          )}
        </div>

        {isList ? (
          <div className="mx-auto max-w-3xl divide-y divide-black/5">
            {settings.items.map((item, idx) => (
              <div key={idx} className="flex gap-4 py-6">
                <span className="text-2xl">{FEATURE_ICONS[idx % FEATURE_ICONS.length]}</span>
                <div>
                  <h3 className="text-lg font-semibold text-[var(--color-text)]">{item.title}</h3>
                  <p className="mt-1 text-sm text-[var(--color-muted-text)]">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {settings.items.map((item, idx) => (
              <div
                key={idx}
                className="rounded-[var(--radius-card)] border border-black/5 bg-[var(--color-background)] p-8 shadow-2xs transition hover:shadow-xs hover:-translate-y-0.5"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-[var(--radius-button)] bg-white text-2xl shadow-2xs">
                  {FEATURE_ICONS[idx % FEATURE_ICONS.length]}
                </div>
                <h3 className="mt-5 text-xl font-semibold text-[var(--color-text)]">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-[var(--color-muted-text)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
