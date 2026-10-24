import { useState } from 'react';
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

export function GallerySection({ settings, media }: GallerySectionProps) {
  const [failedMediaIds, setFailedMediaIds] = useState<string[]>([]);
  const items = settings.mediaIds
    .map((id) => ({ id, item: media[id] }))
    .filter(
      (entry): entry is { id: string; item: PublicMediaItem } =>
        Boolean(entry.item?.url) && !failedMediaIds.includes(entry.id),
    );

  return (
    <section className="bg-[var(--color-surface)] py-[var(--section-space)]">
      <div className="container-page space-y-8">
        <div className="max-w-2xl space-y-3">
          <h2 className="text-3xl leading-tight tracking-tight md:text-5xl">{settings.heading}</h2>
          {settings.description && (
            <p className="text-base text-[var(--color-muted-text)] md:text-lg">
              {settings.description}
            </p>
          )}
        </div>
        {items.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {items.map(({ id, item }) => (
              <figure key={id} className="overflow-hidden rounded-[var(--radius-card)]">
                <img
                  src={item.url}
                  alt={item.altText || item.caption || 'Clinic photograph'}
                  onError={() => setFailedMediaIds((previous) => [...previous, id])}
                  className="aspect-4/3 w-full object-cover"
                />
                {item.caption && (
                  <figcaption className="bg-[var(--color-background)] p-3 text-sm text-[var(--color-muted-text)]">
                    {item.caption}
                  </figcaption>
                )}
              </figure>
            ))}
          </div>
        ) : (
          <p className="rounded-[var(--radius-card)] border border-dashed border-black/15 p-8 text-center text-sm text-[var(--color-muted-text)]">
            No clinic photographs have been added.
          </p>
        )}
      </div>
    </section>
  );
}
