import type { ClinicInfo, WebsiteSnapshot } from '@dental/shared';

interface FooterSectionProps {
  clinic: ClinicInfo;
  footer: WebsiteSnapshot['footer'];
  settings: {
    showPolicies: boolean;
    showSocial: boolean;
    copyrightText: string;
  };
  layoutVariant?: string;
}

export function FooterSection({ clinic, footer, settings }: FooterSectionProps) {
  return (
    <footer className="border-t border-black/5 bg-[var(--color-surface)] py-12 text-sm text-[var(--color-muted-text)]">
      <div className="container-page space-y-8">
        <div className="grid gap-8 sm:grid-cols-2 md:grid-cols-12">
          {/* Clinic Brand */}
          <div className="space-y-3 md:col-span-6">
            <p className="font-[family-name:var(--font-heading)] text-xl font-semibold text-[var(--color-secondary)]">
              {clinic.name}
            </p>
            {clinic.tagline && <p className="text-xs">{clinic.tagline}</p>}
            <p className="max-w-md text-xs leading-relaxed text-[var(--color-muted-text)]">
              {footer.aboutText}
            </p>
          </div>

          {/* Quick links & policies */}
          <div className="space-y-3 md:col-span-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
              Policies
            </p>
            {settings.showPolicies && (
              <ul className="space-y-1.5 text-xs">
                {footer.policyLinks.map((policy, idx) => (
                  <li key={idx}>
                    <a href={policy.href} className="hover:text-[var(--color-primary)]">
                      {policy.label}
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Contact quick links */}
          <div className="space-y-3 md:col-span-3">
            <p className="text-xs font-bold uppercase tracking-wider text-[var(--color-text)]">
              Quick Contacts
            </p>
            <p className="text-xs">{clinic.contact.phone}</p>
            <p className="text-xs">{clinic.contact.email}</p>
            <p className="text-xs">
              {clinic.contact.city}, {clinic.contact.state}
            </p>
          </div>
        </div>

        {/* Demo Warning Banner & Copyright */}
        <div className="border-t border-black/5 pt-6 text-2xs space-y-2">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <p>
              {settings.copyrightText ||
                `© ${new Date().getFullYear()} ${clinic.name}. All rights reserved.`}
            </p>
            <div className="flex items-center gap-4">
              <a href="/admin/login" className="hover:text-[var(--color-primary)]">
                Admin CMS
              </a>
            </div>
          </div>
          <p className="text-[var(--color-muted-text)] opacity-70">
            Notice: If this site is configured with demo placeholder text, credentials and services
            must be verified by the dentist prior to clinical use.
          </p>
        </div>
      </div>
    </footer>
  );
}
