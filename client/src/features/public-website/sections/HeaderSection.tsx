import { useState } from 'react';
import type { ClinicInfo, NavigationItem } from '@dental/shared';
import type { PublicMediaItem } from '@/api/public';

interface HeaderSectionProps {
  clinic: ClinicInfo;
  media: Record<string, PublicMediaItem>;
  navigation: NavigationItem[];
  settings: {
    showLogo: boolean;
  };
  layoutVariant?: string;
}

export function HeaderSection({
  clinic,
  media,
  navigation,
  settings,
  layoutVariant = 'simple',
}: HeaderSectionProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [logoLoadFailed, setLogoLoadFailed] = useState(false);
  const logo = clinic.logoMediaId ? media[clinic.logoMediaId] : undefined;

  const visibleNav = navigation.filter((item) => item.visible);
  const isCentered = layoutVariant === 'centered';

  return (
    <header className="sticky top-0 z-40 border-b border-black/5 bg-[var(--color-surface)]/95 backdrop-blur-md transition-colors">
      <div className="container-page flex items-center justify-between gap-6 py-4">
        {/* Brand / Logo */}
        <a
          href="#"
          className="group flex items-center gap-3 focus:outline-hidden focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
        >
          {settings.showLogo &&
            (logo?.url && !logoLoadFailed ? (
              <img
                src={logo.url}
                alt={logo.altText || clinic.name}
                onError={() => setLogoLoadFailed(true)}
                className="h-10 w-10 rounded-[var(--radius-button)] object-cover"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-button)] bg-[var(--color-primary)]/10 text-xl font-bold text-[var(--color-primary)] transition group-hover:scale-105">
                {clinic.name.charAt(0) || 'D'}
              </div>
            ))}
          <div>
            <span className="block font-[family-name:var(--font-heading)] text-xl font-semibold leading-tight text-[var(--color-secondary)]">
              {clinic.name}
            </span>
            {clinic.tagline && (
              <span className="block text-xs text-[var(--color-muted-text)]">{clinic.tagline}</span>
            )}
          </div>
        </a>

        {/* Desktop Navigation */}
        <nav
          aria-label="Primary navigation"
          className={`hidden items-center gap-8 text-sm font-medium text-[var(--color-text)] md:flex ${
            isCentered ? 'mx-auto' : ''
          }`}
        >
          {visibleNav.map((item) => (
            <a
              key={item.id}
              href={item.href}
              className="transition hover:text-[var(--color-primary)]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Admin portal link */}
        <div className="hidden items-center gap-4 md:flex">
          <a
            href="/admin/login"
            className="text-xs text-[var(--color-muted-text)] hover:text-[var(--color-primary)]"
            title="Clinic Staff Admin Login"
          >
            Staff
          </a>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-expanded={mobileMenuOpen}
            aria-label="Toggle navigation menu"
            className="rounded-[var(--radius-button)] border border-black/10 p-2 text-[var(--color-text)] hover:bg-black/5"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              {mobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile menu drawer */}
      {mobileMenuOpen && (
        <div className="border-t border-black/5 bg-[var(--color-surface)] px-6 py-5 md:hidden">
          <nav aria-label="Mobile navigation" className="flex flex-col gap-4 text-base font-medium">
            {visibleNav.map((item) => (
              <a
                key={item.id}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-1 text-[var(--color-text)] hover:text-[var(--color-primary)]"
              >
                {item.label}
              </a>
            ))}
            <div className="pt-2">
              <a
                href="/admin/login"
                className="text-xs text-[var(--color-muted-text)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Clinic Staff Sign In
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
