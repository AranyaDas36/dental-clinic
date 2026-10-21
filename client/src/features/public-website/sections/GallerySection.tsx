import { useState } from 'react';

interface GallerySectionProps {
  settings: {
    heading: string;
    description: string;
    mediaIds: string[];
  };
  layoutVariant?: string;
}

// Calming, realistic atmospheric placeholders for clinic visualization when no media is uploaded yet
const DEMO_GALLERY = [
  {
    title: 'Consultation Suite',
    desc: 'Spacious treatment room with ergonomic patient chair',
    color: 'from-emerald-900/10 to-teal-800/20',
    icon: '💺',
  },
  {
    title: 'Sterilisation Station',
    desc: 'Hospital-grade autoclaves and multi-stage sanitization',
    color: 'from-sky-900/10 to-blue-800/20',
    icon: '✨',
  },
  {
    title: 'Reception & Lounge',
    desc: 'Quiet waiting area designed for comfort and low sensory impact',
    color: 'from-amber-900/10 to-orange-800/20',
    icon: '☕',
  },
  {
    title: 'Digital Diagnostics',
    desc: 'Low-radiation panoramic x-rays and intraoral cameras',
    color: 'from-teal-900/10 to-emerald-800/20',
    icon: '🖥️',
  },
];

export function GallerySection({ settings }: GallerySectionProps) {
  const [activeItem, setActiveItem] = useState<{ title: string; desc: string } | null>(null);

  return (
    <section className="bg-[var(--color-surface)] py-[var(--section-space)]">
      <div className="container-page space-y-10">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            <span>●</span>
            <span>Clinic Environment</span>
          </div>
          <h2 className="text-3xl leading-tight tracking-tight md:text-5xl">{settings.heading}</h2>
          {settings.description && (
            <p className="text-base text-[var(--color-muted-text)] md:text-lg">
              {settings.description}
            </p>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {DEMO_GALLERY.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setActiveItem(item)}
              className="group cursor-pointer overflow-hidden rounded-[var(--radius-card)] border border-black/5 bg-[var(--color-background)] shadow-2xs transition hover:-translate-y-1 hover:shadow-md"
            >
              <div
                className={`flex aspect-4/3 items-center justify-center bg-gradient-to-br ${item.color} text-4xl transition group-hover:scale-105`}
              >
                {item.icon}
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-[var(--color-text)]">{item.title}</h3>
                <p className="mt-1 text-xs text-[var(--color-muted-text)]">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox / Preview Modal */}
      {activeItem && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs"
          onClick={() => setActiveItem(null)}
        >
          <div
            className="w-full max-w-lg rounded-[var(--radius-card)] bg-[var(--color-surface)] p-6 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-[var(--color-text)]">{activeItem.title}</h3>
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="text-2xl text-[var(--color-muted-text)] hover:text-black"
              >
                &times;
              </button>
            </div>
            <p className="mt-3 text-sm text-[var(--color-muted-text)]">{activeItem.desc}</p>
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setActiveItem(null)}
                className="rounded-[var(--radius-button)] bg-[var(--color-primary)] px-4 py-2 text-xs font-semibold text-white"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
