import type { PublicMediaItem } from '@/api/public';

interface HeroSectionProps {
  settings: {
    headline: string;
    subtitle: string;
    imageMediaId: string | null;
    primaryCta: { label: string; href: string };
    secondaryCta?: { label: string; href: string };
  };
  media: Record<string, PublicMediaItem>;
  layoutVariant?: string;
}

export function HeroSection({ settings, media, layoutVariant = 'split' }: HeroSectionProps) {
  const image = settings.imageMediaId ? media[settings.imageMediaId] : undefined;
  const imageElement = image?.url ? (
    <img
      src={image.url}
      alt={image.altText || image.caption || 'Clinic photograph'}
      className="h-full max-h-[32rem] w-full rounded-[var(--radius-card)] object-cover"
    />
  ) : null;
  const centered = layoutVariant === 'centered';
  const minimal = layoutVariant === 'minimal';

  return (
    <section className="relative overflow-hidden bg-[var(--color-surface)] py-[var(--section-space)]">
      <div
        className={`container-page grid items-center gap-10 ${
          centered ? 'mx-auto max-w-4xl text-center' : 'lg:grid-cols-2'
        } ${minimal ? 'max-w-3xl' : ''}`}
      >
        <div className={`space-y-6 ${centered ? 'mx-auto' : ''}`}>
          <h1 className="text-4xl leading-tight tracking-tight md:text-6xl">{settings.headline}</h1>
          {settings.subtitle && (
            <p className="max-w-2xl text-lg text-[var(--color-muted-text)] md:text-xl">
              {settings.subtitle}
            </p>
          )}
          <div className={`flex flex-wrap gap-4 ${centered ? 'justify-center' : ''}`}>
            <a
              href={settings.primaryCta.href}
              className="rounded-[var(--radius-button)] bg-[var(--color-primary)] px-7 py-3.5 font-semibold !text-white shadow-sm transition hover:opacity-90"
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
        {!minimal && imageElement && (
          <div className="min-h-48 overflow-hidden rounded-[var(--radius-card)]">
            {imageElement}
          </div>
        )}
      </div>
    </section>
  );
}
