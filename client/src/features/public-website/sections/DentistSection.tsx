import { useState } from 'react';
import type { ClinicInfo } from '@dental/shared';
import type { PublicMediaItem } from '@/api/public';

interface DentistSectionProps {
  dentist: ClinicInfo['dentist'];
  media: Record<string, PublicMediaItem>;
  settings: {
    heading: string;
    showQualifications: boolean;
    showSpecializations: boolean;
  };
  layoutVariant?: string;
}

export function DentistSection({
  dentist,
  media,
  settings,
  layoutVariant = 'portraitLeft',
}: DentistSectionProps) {
  const [portraitLoadFailed, setPortraitLoadFailed] = useState(false);
  const portrait = dentist.portraitMediaId ? media[dentist.portraitMediaId] : undefined;
  const portraitElement =
    portrait?.url && !portraitLoadFailed ? (
      <img
        src={portrait.url}
        alt={portrait.altText || dentist.name}
        onError={() => setPortraitLoadFailed(true)}
        className="h-full w-full rounded-[var(--radius-card)] object-cover"
      />
    ) : (
      <div className="flex h-full min-h-64 items-center justify-center rounded-[var(--radius-card)] bg-[var(--color-primary)]/10 text-6xl font-semibold text-[var(--color-primary)]">
        {dentist.name.charAt(0) || 'D'}
      </div>
    );

  return (
    <section id="dentist" className="scroll-mt-16 py-[var(--section-space)]">
      <div className="container-page">
        <div
          className={`grid items-center gap-10 lg:grid-cols-12 ${
            layoutVariant === 'portraitRight' ? 'lg:[&>*:first-child]:order-2' : ''
          }`}
        >
          <div className="lg:col-span-5">
            <div className="mx-auto aspect-4/5 max-w-md overflow-hidden rounded-[var(--radius-card)] border border-black/5 bg-[var(--color-surface)]">
              {portraitElement}
            </div>
          </div>

          <div className="space-y-6 lg:col-span-7">
            <div>
              <h2 className="text-3xl leading-tight tracking-tight md:text-5xl">
                {settings.heading}
              </h2>
              <h3 className="mt-3 text-xl font-semibold text-[var(--color-text)]">
                {dentist.name}
              </h3>
              {dentist.title && (
                <p className="mt-1 text-sm font-medium text-[var(--color-primary)]">
                  {dentist.title}
                </p>
              )}
            </div>

            {dentist.bio.trim() && (
              <p className="text-base leading-relaxed text-[var(--color-muted-text)]">
                {dentist.bio}
              </p>
            )}

            {settings.showSpecializations && dentist.specializations.length > 0 && (
              <div className="space-y-2 border-t border-black/5 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
                  Areas of practice
                </h4>
                <div className="flex flex-wrap gap-2">
                  {dentist.specializations.map((specialty) => (
                    <span
                      key={specialty}
                      className="rounded-full bg-[var(--color-primary)]/10 px-3.5 py-1 text-xs font-medium text-[var(--color-secondary)]"
                    >
                      {specialty}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {settings.showQualifications && dentist.qualifications.length > 0 && (
              <div className="space-y-2 border-t border-black/5 pt-4">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
                  Qualifications
                </h4>
                <ul className="space-y-1.5 text-sm text-[var(--color-muted-text)]">
                  {dentist.qualifications.map((qualification) => (
                    <li key={qualification}>{qualification}</li>
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
