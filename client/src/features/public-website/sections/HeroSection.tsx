import { useEffect, useRef, useState } from 'react';
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
        {!minimal && (
          <div className="min-h-48 overflow-hidden rounded-[var(--radius-card)]">
            {imageElement ?? <HeroToothIllustration />}
          </div>
        )}
      </div>
    </section>
  );
}

function HeroToothIllustration() {
  const illustrationRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const illustration = illustrationRef.current;
    if (!illustration || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry) setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '80px' },
    );
    observer.observe(illustration);

    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={illustrationRef}
      aria-hidden="true"
      className={`hero-illustration relative mx-auto flex aspect-[6/5] min-h-[22rem] w-full max-w-xl items-center justify-center md:min-h-[30rem] ${
        isVisible ? '' : 'hero-animation-paused'
      }`}
    >
      <span className="hero-orbit absolute aspect-square h-[74%] rounded-full" />
      <span className="hero-orbit hero-orbit-inner absolute aspect-square h-[59%] rounded-full" />
      <svg
        className="relative z-10 h-full max-h-[32rem] w-full"
        focusable="false"
        preserveAspectRatio="xMidYMid meet"
        viewBox="0 0 600 520"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="hero-glow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="var(--color-accent, #38bdf8)" stopOpacity=".22" />
            <stop offset="100%" stopColor="var(--color-background, #f8fafc)" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="hero-enamel" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#fffefa" />
            <stop offset="55%" stopColor="#f9fdfc" />
            <stop offset="100%" stopColor="var(--color-accent, #38bdf8)" stopOpacity=".34" />
          </linearGradient>
          <linearGradient id="hero-brush-handle" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--color-accent, #38bdf8)" />
            <stop offset="55%" stopColor="var(--color-primary, #248b81)" />
            <stop offset="100%" stopColor="var(--color-secondary, #176a70)" />
          </linearGradient>
          <linearGradient id="hero-brush-head" x1="0" x2="1">
            <stop offset="0%" stopColor="#fffefa" />
            <stop offset="100%" stopColor="var(--color-accent, #38bdf8)" stopOpacity=".25" />
          </linearGradient>
          <linearGradient id="hero-paste" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#fffefa" />
            <stop offset="100%" stopColor="var(--color-accent, #38bdf8)" stopOpacity=".32" />
          </linearGradient>
          <filter height="140%" id="hero-tooth-shadow" width="140%" x="-20%" y="-15%">
            <feDropShadow
              dx="0"
              dy="14"
              floodColor="var(--color-secondary, #527d7b)"
              floodOpacity=".16"
              stdDeviation="12"
            />
          </filter>
        </defs>
        <circle cx="300" cy="260" fill="url(#hero-glow)" r="235" />
        <ellipse
          className="hero-tooth-shadow"
          cx="304"
          cy="431"
          fill="var(--color-secondary, #72aaa2)"
          opacity=".14"
          rx="150"
          ry="22"
        />
        <path
          className="hero-orbit-path"
          d="M125 274a175 138 0 1 0 350 0 175 138 0 1 0-350 0Z"
          fill="none"
          stroke="var(--color-primary, #5b9b91)"
          strokeDasharray="2 14"
          strokeLinecap="round"
          strokeOpacity=".28"
          strokeWidth="3"
        />
        <g className="hero-bubbles" fill="none" stroke="var(--color-accent, #38bdf8)">
          <circle className="hero-bubble hero-bubble-one" cx="177" cy="197" r="15" />
          <circle className="hero-bubble hero-bubble-two" cx="434" cy="364" r="10" />
          <circle className="hero-bubble hero-bubble-three" cx="218" cy="389" r="7" />
          <circle cx="181" cy="193" r="3" fill="#fff" stroke="none" />
        </g>
        <circle cx="135" cy="268" fill="var(--color-accent, #38bdf8)" r="5" />
        <circle cx="466" cy="295" fill="var(--color-primary, #6ab7a8)" r="5" />
        <g className="hero-tooth-float" filter="url(#hero-tooth-shadow)">
          <path
            d="M300 105c-32-27-86-21-108 16-20 33-14 77 3 117 17 40 29 125 58 125 27 0 20-80 49-80s22 80 49 80c29 0 41-85 58-125 17-40 23-84 3-117-22-37-76-43-108-16-1 1-3 1-4 0Z"
            fill="url(#hero-enamel)"
            stroke="var(--color-accent, #b9d9d7)"
            strokeOpacity=".6"
            strokeWidth="4"
          />
          <path
            d="M236 158c13-20 35-28 54-24"
            fill="none"
            stroke="#fff"
            strokeLinecap="round"
            strokeWidth="12"
          />
          <path
            d="M246 178c13-10 24-13 37-13"
            fill="none"
            stroke="#fff"
            strokeLinecap="round"
            strokeOpacity=".7"
            strokeWidth="5"
          />
          <path
            d="M263 222c8 5 16 5 24 0m26 0c8 5 16 5 24 0"
            fill="none"
            stroke="var(--color-primary, #7fb9b3)"
            strokeLinecap="round"
            strokeWidth="5"
          />
          <path
            d="M287 251c8 6 18 6 26 0"
            fill="none"
            stroke="#d99688"
            strokeLinecap="round"
            strokeWidth="5"
          />
          <circle cx="245" cy="235" fill="#e8a99d" r="6" opacity=".4" />
          <circle cx="355" cy="235" fill="#e8a99d" r="6" opacity=".4" />
        </g>
        <g className="hero-brush-float">
          <rect fill="url(#hero-brush-handle)" height="252" rx="22" width="43" x="365" y="220" />
          <path
            d="M374 274h25m-25 9h25"
            stroke="#fff"
            strokeLinecap="round"
            strokeOpacity=".65"
            strokeWidth="3"
          />
          <rect fill="url(#hero-brush-head)" height="40" rx="14" width="31" x="371" y="256" />
          <path d="M371 205h31v-47a15 15 0 0 0-15-15h-1a15 15 0 0 0-15 15v47Z" fill="#fff" />
          <path
            d="M375 198v-41m8 41v-49m8 49v-49m8 49v-41"
            stroke="var(--color-primary, #74b7ad)"
            strokeOpacity=".68"
            strokeWidth="4"
          />
          <path d="M379 412h15" stroke="#fff" strokeLinecap="round" strokeWidth="4" />
        </g>
        <g className="hero-paste-float">
          <path
            d="m154 313 29-9 31 99-29 9c-7 2-14-2-16-9l-22-73c-2-7 2-14 7-17Z"
            fill="url(#hero-paste)"
            stroke="var(--color-primary, #5b9b91)"
            strokeOpacity=".34"
            strokeWidth="3"
          />
          <path d="m161 321 25-8 3 10-25 8Z" fill="var(--color-primary, #248b81)" opacity=".72" />
          <path d="m169 342 20-6" stroke="#fff" strokeLinecap="round" strokeWidth="4" />
          <path
            d="m176 356 10-3"
            stroke="var(--color-primary, #248b81)"
            strokeLinecap="round"
            strokeOpacity=".65"
            strokeWidth="3"
          />
          <path d="m186 408 29-9 5 15-29 9Z" fill="var(--color-secondary, #176a70)" />
        </g>
        <g className="hero-mirror-float" fill="none">
          <path
            d="m434 194-43 55"
            stroke="var(--color-secondary, #176a70)"
            strokeLinecap="round"
            strokeWidth="8"
          />
          <path
            d="m434 194-43 55"
            stroke="#fff"
            strokeLinecap="round"
            strokeOpacity=".42"
            strokeWidth="2"
          />
          <circle
            cx="444"
            cy="181"
            fill="var(--color-background, #f8fafc)"
            r="24"
            stroke="var(--color-primary, #248b81)"
            strokeWidth="7"
          />
          <path d="M432 176a13 13 0 0 1 12-8" stroke="#fff" strokeLinecap="round" strokeWidth="4" />
        </g>
        <g className="hero-sparkle" fill="#e5b96e">
          <path d="m175 153 6 17 17 6-17 6-6 17-6-17-17-6 17-6 6-17Z" />
          <path d="m438 139 4 11 11 4-11 4-4 11-4-11-11-4 11-4 4-11Z" />
          <circle cx="175" cy="295" r="5" />
          <circle cx="443" cy="314" r="6" />
        </g>
      </svg>
    </div>
  );
}
