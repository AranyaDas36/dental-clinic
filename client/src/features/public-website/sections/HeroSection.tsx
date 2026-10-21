interface HeroSectionProps {
  settings: {
    headline: string;
    subtitle: string;
    imageMediaId: string | null;
    primaryCta: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
  };
  layoutVariant?: string;
}

export function HeroSection({ settings, layoutVariant = 'split' }: HeroSectionProps) {
  const isCentered = layoutVariant === 'centered';
  const isMinimal = layoutVariant === 'minimal';

  if (isCentered) {
    return (
      <section className="relative overflow-hidden bg-[var(--color-surface)] py-[var(--section-space)]">
        <div className="container-page mx-auto max-w-4xl text-center">
          <div className="inline-flex items-center gap-2 rounded-full bg-[var(--color-primary)]/10 px-3.5 py-1 text-xs font-medium text-[var(--color-primary)]">
            <span>✦</span>
            <span>Gentle & Professional Dental Care</span>
          </div>
          <h1 className="mt-5 text-4xl leading-[1.15] tracking-tight md:text-6xl">
            {settings.headline}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[var(--color-muted-text)] md:text-xl">
            {settings.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <a
              href={settings.primaryCta.href}
              className="rounded-[var(--radius-button)] bg-[var(--color-primary)] px-7 py-3.5 font-semibold !text-white shadow-sm transition hover:opacity-90 active:scale-98"
            >
              {settings.primaryCta.label}
            </a>
            {settings.secondaryCta && (
              <a
                href={settings.secondaryCta.href}
                className="rounded-[var(--radius-button)] border border-black/15 bg-white/60 px-6 py-3.5 font-medium text-[var(--color-text)] transition hover:bg-black/5"
              >
                {settings.secondaryCta.label}
              </a>
            )}
          </div>
        </div>
      </section>
    );
  }

  if (isMinimal) {
    return (
      <section className="border-b border-black/5 bg-[var(--color-surface)] py-16 md:py-24">
        <div className="container-page max-w-3xl space-y-6">
          <h1 className="text-4xl tracking-tight md:text-5xl">{settings.headline}</h1>
          <p className="text-lg text-[var(--color-muted-text)]">{settings.subtitle}</p>
          <div className="pt-2">
            <a
              href={settings.primaryCta.href}
              className="inline-block rounded-[var(--radius-button)] bg-[var(--color-primary)] px-6 py-3 font-semibold !text-white transition hover:opacity-90"
            >
              {settings.primaryCta.label}
            </a>
          </div>
        </div>
      </section>
    );
  }

  // Default 'split' layout
  return (
    <section className="relative overflow-hidden py-[var(--section-space)]">
      <div className="container-page grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
        <div className="space-y-6 lg:col-span-7">
          <div className="inline-flex items-center gap-2 rounded-full border border-[var(--color-primary)]/20 bg-[var(--color-surface)] px-3.5 py-1 text-xs font-medium text-[var(--color-secondary)]">
            <span className="text-[var(--color-primary)]">●</span>
            <span>Welcoming New Patients</span>
          </div>
          <h1 className="text-4xl leading-[1.12] tracking-tight md:text-6xl">
            {settings.headline}
          </h1>
          <p className="max-w-xl text-lg text-[var(--color-muted-text)] md:text-xl">
            {settings.subtitle}
          </p>
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <a
              href={settings.primaryCta.href}
              className="rounded-[var(--radius-button)] bg-[var(--color-primary)] px-7 py-3.5 text-base font-semibold !text-white shadow-xs transition hover:opacity-90 active:scale-98"
            >
              {settings.primaryCta.label}
            </a>
            {settings.secondaryCta && (
              <a
                href={settings.secondaryCta.href}
                className="rounded-[var(--radius-button)] border border-[var(--color-secondary)]/20 bg-white/50 px-6 py-3.5 text-base font-medium text-[var(--color-secondary)] transition hover:bg-white"
              >
                {settings.secondaryCta.label}
              </a>
            )}
          </div>
          <div className="flex items-center gap-6 pt-4 text-xs text-[var(--color-muted-text)]">
            <span className="flex items-center gap-1.5">
              <span className="text-[var(--color-primary)]">✓</span> Verified clinic team
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[var(--color-primary)]">✓</span> Strict hygiene & sterilisation
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[var(--color-primary)]">✓</span> Transparent pricing
            </span>
          </div>
        </div>

        <div className="lg:col-span-5">
          <div className="relative">
            {/* Calming clinic visual card */}
            <div className="overflow-hidden rounded-[var(--radius-card)] border border-black/5 bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-background)] p-8 shadow-[var(--shadow-card)]">
              <div className="flex flex-col justify-between space-y-8">
                <div className="flex items-center justify-between border-b border-black/5 pb-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-text)]">
                      Patient Comfort First
                    </p>
                    <p className="text-lg font-medium text-[var(--color-secondary)]">
                      Calm, pain-conscious treatment
                    </p>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-accent)]/20 text-lg">
                    🌿
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-start gap-3 rounded-[var(--radius-button)] bg-white/80 p-3.5 shadow-2xs">
                    <span className="text-xl">🩺</span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        Detailed Initial Consultations
                      </p>
                      <p className="text-xs text-[var(--color-muted-text)]">
                        Clear explanations and preventive advice tailored to your dental health.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 rounded-[var(--radius-button)] bg-white/80 p-3.5 shadow-2xs">
                    <span className="text-xl">✨</span>
                    <div>
                      <p className="text-sm font-semibold text-[var(--color-text)]">
                        Modern Diagnostic Technology
                      </p>
                      <p className="text-xs text-[var(--color-muted-text)]">
                        Digital imaging and minimal-intervention procedures.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-[var(--radius-button)] bg-[var(--color-secondary)] p-4 text-white">
                  <p className="text-xs text-white/80">Need an appointment?</p>
                  <p className="font-semibold">Quick request, manual dentist confirmation</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
