interface WhyChooseUsSectionProps {
  settings: {
    heading: string;
    description: string;
    items: Array<{ title: string; description: string }>;
  };
  layoutVariant?: string;
}

const FEATURE_MARKS = [
  <path
    key="spark"
    d="m12 2 1.8 6.2L20 10l-6.2 1.8L12 18l-1.8-6.2L4 10l6.2-1.8L12 2Zm7 12 .9 3.1L23 18l-3.1.9L19 22l-.9-3.1L15 18l3.1-.9L19 14Z"
  />,
  <path
    key="heart"
    d="M20.8 8.8c0 5-8.8 11-8.8 11s-8.8-6-8.8-11A4.8 4.8 0 0 1 12 6.1a4.8 4.8 0 0 1 8.8 2.7Z"
  />,
  <path
    key="smile"
    d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm-3.5-7s1.2 2 3.5 2 3.5-2 3.5-2M9 9h.01M15 9h.01"
  />,
  <path
    key="tooth"
    d="M12 4.5c-2.6-2-6.8-.5-7.3 3-.6 4.2 2.4 6.5 3 11 .2 1.5 2.2 1.8 2.7.2l.8-2.5c.3-.9 1.6-.9 1.8 0l.8 2.5c.5 1.6 2.5 1.3 2.7-.2.6-4.5 3.6-6.8 3-11-.5-3.5-4.7-5-7.3-3Z"
  />,
  <path key="time" d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Zm0-14v5l3 2" />,
  <path
    key="leaf"
    d="M20.5 3.5C12 3.5 5 5.8 5 12.5a5 5 0 0 0 5 5c6.7 0 9-7 10.5-14ZM4 21c2-5 6-8 11-10"
  />,
  <path key="check" d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Zm-4-11 2.5 2.5L16 8" />,
  <path key="sparkle" d="m12 2 2.4 7.6L22 12l-7.6 2.4L12 22l-2.4-7.6L2 12l7.6-2.4L12 2Z" />,
];

function FeatureMark({ index }: { index: number }) {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
      viewBox="0 0 24 24"
    >
      {FEATURE_MARKS[index % FEATURE_MARKS.length]}
    </svg>
  );
}

export function WhyChooseUsSection({ settings, layoutVariant = 'grid' }: WhyChooseUsSectionProps) {
  const isList = layoutVariant === 'list';

  return (
    <section className="why-visit-section relative isolate overflow-hidden py-[var(--section-space)]">
      <div aria-hidden="true" className="why-visit-orb why-visit-orb-one" />
      <div aria-hidden="true" className="why-visit-orb why-visit-orb-two" />
      <div className="container-page relative z-10 space-y-12 md:space-y-16">
        <header className="mx-auto grid max-w-5xl items-end gap-5 md:grid-cols-[1fr_0.8fr] md:gap-12">
          <div>
            <p className="why-visit-eyebrow mb-4 text-xs font-bold uppercase tracking-[0.24em]">
              A more considered visit
            </p>
            <h2 className="why-visit-heading text-4xl leading-[1.08] tracking-tight md:text-6xl">
              {settings.heading}
              <span aria-hidden="true" className="why-visit-heading-mark">
                .
              </span>
            </h2>
          </div>
          {settings.description && (
            <p className="why-visit-intro max-w-xl border-l pl-5 text-base leading-relaxed md:mb-2 md:text-lg">
              {settings.description}
            </p>
          )}
        </header>

        {isList ? (
          <div className="mx-auto grid max-w-5xl gap-3">
            {settings.items.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className="why-visit-list-item group flex gap-5 rounded-2xl border p-5 shadow-sm backdrop-blur-sm transition duration-300 hover:-translate-y-0.5 hover:shadow-lg md:items-center md:gap-7 md:p-7"
              >
                <span className="why-visit-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-full transition duration-300">
                  <FeatureMark index={index} />
                </span>
                <span className="grid gap-1 md:grid-cols-[minmax(12rem,0.8fr)_1.2fr] md:items-center md:gap-8">
                  <span className="why-visit-title font-[var(--font-heading)] text-xl font-semibold md:text-2xl">
                    {item.title}
                  </span>
                  <span className="why-visit-copy text-sm leading-relaxed md:text-base">
                    {item.description}
                  </span>
                </span>
              </article>
            ))}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
            {settings.items.map((item, index) => (
              <article
                key={`${item.title}-${index}`}
                className={`why-visit-card group relative overflow-hidden rounded-3xl border p-6 shadow-lg backdrop-blur-sm transition duration-500 hover:-translate-y-2 md:p-8 ${
                  index % 3 === 1 ? 'lg:translate-y-6' : ''
                }`}
              >
                <span
                  aria-hidden="true"
                  className="why-visit-card-orb absolute -right-8 -top-10 h-32 w-32 rounded-full transition duration-500 group-hover:scale-125"
                />
                <div className="relative flex items-start justify-between gap-4">
                  <span className="why-visit-icon why-visit-icon-card flex h-14 w-14 items-center justify-center rounded-2xl shadow-inner transition duration-300 group-hover:rotate-[-5deg] group-hover:scale-105">
                    <FeatureMark index={index} />
                  </span>
                  <span className="why-visit-number font-mono text-xs tracking-[0.18em]">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                </div>
                <h3 className="why-visit-title relative mt-8 font-[var(--font-heading)] text-2xl font-semibold leading-snug md:text-3xl">
                  {item.title}
                </h3>
                <p className="why-visit-copy relative mt-3 text-sm leading-7 md:text-base">
                  {item.description}
                </p>
                <span
                  aria-hidden="true"
                  className="why-visit-accent-line relative mt-7 block h-px w-12 transition-all duration-500 group-hover:w-24"
                />
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
