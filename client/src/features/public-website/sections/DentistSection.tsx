import type { ClinicInfo } from '@dental/shared';

interface DentistSectionProps {
  dentist: ClinicInfo['dentist'];
  settings: {
    heading: string;
    showQualifications: boolean;
    showSpecializations: boolean;
  };
  layoutVariant?: string;
}

export function DentistSection({
  dentist,
  settings,
  layoutVariant = 'portraitLeft',
}: DentistSectionProps) {
  const isRight = layoutVariant === 'portraitRight';
  const isCompact = layoutVariant === 'compact';

  if (isCompact) {
    return (
      <section id="dentist" className="scroll-mt-16 bg-[var(--color-surface)] py-12">
        <div className="container-page max-w-4xl space-y-4">
          <div className="flex flex-col gap-6 md:flex-row md:items-center">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-3xl font-bold text-[var(--color-primary)]">
              {dentist.name.charAt(0) || 'D'}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-[var(--color-text)]">{dentist.name}</h2>
              {dentist.title && (
                <p className="text-sm font-medium text-[var(--color-primary)]">{dentist.title}</p>
              )}
              <p className="mt-2 text-sm text-[var(--color-muted-text)]">{dentist.bio}</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="dentist" className="scroll-mt-16 py-[var(--section-space)]">
      <div className="container-page">
        <div
          className={`grid items-center gap-12 lg:grid-cols-12 ${
            isRight ? 'lg:[&>*:first-child]:order-2' : ''
          }`}
        >
          {/* Portrait Column */}
          <div className="lg:col-span-5">
            <div className="relative mx-auto max-w-md">
              <div className="relative aspect-4/5 overflow-hidden rounded-[var(--radius-card)] border border-black/5 bg-gradient-to-tr from-[var(--color-secondary)] via-[var(--color-primary)] to-[var(--color-accent)] p-1 shadow-[var(--shadow-card)]">
                <div className="flex h-full w-full flex-col items-center justify-center rounded-[calc(var(--radius-card)-4px)] bg-[var(--color-surface)] p-8 text-center">
                  <div className="flex h-28 w-28 items-center justify-center rounded-full bg-[var(--color-background)] text-5xl text-[var(--color-secondary)]">
                    🦷
                  </div>
                  <h3 className="mt-6 text-2xl font-bold text-[var(--color-text)]">
                    {dentist.name}
                  </h3>
                  <p className="mt-1 text-sm font-medium text-[var(--color-primary)]">
                    {dentist.title}
                  </p>
                  <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-black/10 bg-[var(--color-background)] px-3 py-1 text-xs text-[var(--color-muted-text)]">
                    <span>Clinical Lead</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Biography & Credentials Column */}
          <div className="space-y-6 lg:col-span-7">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
                <span>●</span>
                <span>Doctor In Charge</span>
              </div>
              <h2 className="mt-2 text-3xl leading-tight tracking-tight md:text-5xl">
                {settings.heading}
              </h2>
            </div>

            <div className="space-y-4 text-base leading-relaxed text-[var(--color-muted-text)] md:text-lg">
              <p>{dentist.bio}</p>
            </div>

            {/* Specializations */}
            {settings.showSpecializations && dentist.specializations.length > 0 && (
              <div className="space-y-2 border-t border-black/5 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
                  Clinical Focus Areas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {dentist.specializations.map((spec, idx) => (
                    <span
                      key={idx}
                      className="rounded-full bg-[var(--color-primary)]/10 px-3.5 py-1 text-xs font-medium text-[var(--color-secondary)]"
                    >
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Qualifications */}
            {settings.showQualifications && dentist.qualifications.length > 0 && (
              <div className="space-y-2 border-t border-black/5 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
                  Qualifications & Training
                </h4>
                <ul className="space-y-1.5 text-sm text-[var(--color-muted-text)]">
                  {dentist.qualifications.map((qual, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="text-[var(--color-primary)]">✓</span>
                      <span>{qual}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
