import { useMemo } from 'react';
import type { ClinicInfo } from '@dental/shared';

interface ContactSectionProps {
  clinic: ClinicInfo;
  settings: {
    heading: string;
    showMap: boolean;
    showWhatsApp: boolean;
    mapEmbedUrl: string | null;
  };
  layoutVariant?: string;
}

const DAY_LABELS: Record<string, string> = {
  monday: 'Monday',
  tuesday: 'Tuesday',
  wednesday: 'Wednesday',
  thursday: 'Thursday',
  friday: 'Friday',
  saturday: 'Saturday',
  sunday: 'Sunday',
};

const DAY_INDEXES: Record<number, string> = {
  0: 'sunday',
  1: 'monday',
  2: 'tuesday',
  3: 'wednesday',
  4: 'thursday',
  5: 'friday',
  6: 'saturday',
};

export function ContactSection({ clinic, settings }: ContactSectionProps) {
  const currentStatus = useMemo(() => {
    const now = new Date();
    const currentDayKey = DAY_INDEXES[now.getDay()];
    const todayHours = clinic.openingHours.find((h) => h.day.toLowerCase() === currentDayKey);

    if (!todayHours || todayHours.closed || !todayHours.open || !todayHours.close) {
      return { isOpen: false, text: 'Closed today' };
    }

    const [openH, openM] = todayHours.open.split(':').map(Number);
    const [closeH, closeM] = todayHours.close.split(':').map(Number);

    const openTime = new Date(now);
    openTime.setHours(openH ?? 0, openM ?? 0, 0, 0);

    const closeTime = new Date(now);
    closeTime.setHours(closeH ?? 0, closeM ?? 0, 0, 0);

    const isOpen = now >= openTime && now <= closeTime;
    return {
      isOpen,
      text: isOpen ? `Open now until ${todayHours.close}` : `Closed · Opens at ${todayHours.open}`,
    };
  }, [clinic.openingHours]);

  const whatsappHref = clinic.contact.whatsapp
    ? `https://wa.me/${clinic.contact.whatsapp.replace(/[^0-9]/g, '')}`
    : clinic.contact.phone
      ? `https://wa.me/${clinic.contact.phone.replace(/[^0-9]/g, '')}`
      : null;

  const currentDayKey = DAY_INDEXES[new Date().getDay()];

  return (
    <section
      id="contact"
      className="scroll-mt-16 bg-[var(--color-surface)] py-[var(--section-space)]"
    >
      <div className="container-page space-y-12">
        <div className="max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
            <span>●</span>
            <span>Location & Hours</span>
          </div>
          <h2 className="text-3xl leading-tight tracking-tight md:text-5xl">{settings.heading}</h2>
          <div className="flex items-center gap-2 pt-1">
            <span
              className={`inline-block h-2.5 w-2.5 rounded-full ${
                currentStatus.isOpen ? 'bg-emerald-500 animate-pulse' : 'bg-neutral-400'
              }`}
            />
            <span className="text-sm font-medium text-[var(--color-text)]">
              {currentStatus.text}
            </span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-12">
          {/* Contact Details Card */}
          <div className="space-y-6 lg:col-span-5">
            <div className="rounded-[var(--radius-card)] border border-black/5 bg-[var(--color-background)] p-8 shadow-2xs space-y-6">
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-text)]">
                  Clinic Address
                </h3>
                <p className="mt-2 text-base font-medium text-[var(--color-text)]">
                  {clinic.contact.addressLine1}
                  {clinic.contact.addressLine2 ? `, ${clinic.contact.addressLine2}` : ''}
                  <br />
                  {clinic.contact.city}, {clinic.contact.state} {clinic.contact.postalCode}
                  <br />
                  {clinic.contact.country}
                </p>
              </div>

              <div className="border-t border-black/5 pt-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-text)]">
                  Direct Inquiries
                </h3>
                <p className="mt-2">
                  <a
                    href={`tel:${clinic.contact.phone}`}
                    className="text-base font-semibold text-[var(--color-primary)] hover:underline"
                  >
                    📞 {clinic.contact.phone}
                  </a>
                </p>
                <p className="mt-1">
                  <a
                    href={`mailto:${clinic.contact.email}`}
                    className="text-sm text-[var(--color-muted-text)] hover:text-[var(--color-text)]"
                  >
                    ✉️ {clinic.contact.email}
                  </a>
                </p>
              </div>

              {settings.showWhatsApp && whatsappHref && (
                <div className="border-t border-black/5 pt-4">
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 rounded-[var(--radius-button)] bg-emerald-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-emerald-700"
                  >
                    <span>💬</span>
                    <span>Chat with us on WhatsApp</span>
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* 7-day Hours Schedule */}
          <div className="space-y-6 lg:col-span-7">
            <div className="rounded-[var(--radius-card)] border border-black/5 bg-[var(--color-background)] p-8 shadow-2xs">
              <h3 className="font-semibold text-[var(--color-text)]">Weekly Clinic Schedule</h3>
              <p className="mt-1 text-xs text-[var(--color-muted-text)]">
                Appointments outside regular hours are available upon prior emergency request.
              </p>

              <div className="mt-6 divide-y divide-black/5">
                {clinic.openingHours.map((schedule) => {
                  const isToday = schedule.day.toLowerCase() === currentDayKey;
                  return (
                    <div
                      key={schedule.day}
                      className={`flex items-center justify-between py-3 text-sm ${
                        isToday
                          ? 'font-bold text-[var(--color-secondary)]'
                          : 'text-[var(--color-text)]'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        {DAY_LABELS[schedule.day] || schedule.day}
                        {isToday && (
                          <span className="rounded-full bg-[var(--color-primary)]/10 px-2 py-0.5 text-2xs font-bold text-[var(--color-primary)]">
                            Today
                          </span>
                        )}
                      </span>

                      <span>
                        {schedule.closed
                          ? 'Closed'
                          : `${schedule.open || ''} – ${schedule.close || ''}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
