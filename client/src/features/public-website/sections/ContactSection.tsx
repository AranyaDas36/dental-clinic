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

function formatClinicTime(value: string): string {
  const [hour, minute] = value.split(':').map(Number);
  if (!Number.isInteger(hour) || !Number.isInteger(minute)) return value;
  return new Intl.DateTimeFormat('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(2020, 0, 1, hour, minute)));
}

function toMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) return null;
  const hour = Number(match[1]);
  const minute = Number(match[2]);
  if (hour > 23 || minute > 59) return null;
  return hour * 60 + minute;
}

export function ContactSection({ clinic, settings }: ContactSectionProps) {
  const postalCode = clinic.contact.postalCode.trim();
  const hasPostalCode = postalCode.length > 0 && !/^(not provided|unknown|n\/a)$/i.test(postalCode);
  const currentStatus = useMemo(() => {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Kolkata',
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
      hourCycle: 'h23',
    }).formatToParts(new Date());
    const part = (type: string) => parts.find((item) => item.type === type)?.value ?? '';
    const currentDayKey = part('weekday').toLowerCase();
    const todayHours = clinic.openingHours.find((h) => h.day.toLowerCase() === currentDayKey);

    if (!todayHours) {
      return { isOpen: false, text: 'Hours not available today' };
    }
    if (todayHours.closed) {
      return { isOpen: false, text: 'Closed today' };
    }
    if (!todayHours.open || !todayHours.close) {
      return { isOpen: false, text: 'Hours not available today' };
    }

    const currentMinutes = Number(part('hour')) * 60 + Number(part('minute'));
    const openMinutes = toMinutes(todayHours.open);
    const closeMinutes = toMinutes(todayHours.close);
    if (openMinutes === null || closeMinutes === null) {
      return { isOpen: false, text: 'Hours not available today' };
    }
    const isOpen = currentMinutes >= openMinutes && currentMinutes < closeMinutes;
    return {
      isOpen,
      text: isOpen ? `Open now · Closes at ${formatClinicTime(todayHours.close)}` : 'Closed now',
    };
  }, [clinic.openingHours]);

  const whatsappHref = clinic.contact.whatsapp
    ? `https://wa.me/${clinic.contact.whatsapp.replace(/[^0-9]/g, '')}`
    : clinic.contact.phone
      ? `https://wa.me/${clinic.contact.phone.replace(/[^0-9]/g, '')}`
      : null;

  const currentDayKey = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Kolkata',
    weekday: 'long',
  })
    .format(new Date())
    .toLowerCase();

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
                  {clinic.contact.city}, {clinic.contact.state}
                  {hasPostalCode ? ` ${postalCode}` : ''}
                  <br />
                  {clinic.contact.country}
                </p>
              </div>

              {(clinic.contact.phone || clinic.contact.email) && (
                <div className="border-t border-black/5 pt-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[var(--color-muted-text)]">
                    Direct Inquiries
                  </h3>
                  {clinic.contact.phone && (
                    <p className="mt-2">
                      <a
                        href={`tel:${clinic.contact.phone}`}
                        className="text-base font-semibold text-[var(--color-primary)] hover:underline"
                      >
                        📞 {clinic.contact.phone}
                      </a>
                    </p>
                  )}
                  {clinic.contact.email && (
                    <p className="mt-1">
                      <a
                        href={`mailto:${clinic.contact.email}`}
                        className="text-sm text-[var(--color-muted-text)] hover:text-[var(--color-text)]"
                      >
                        ✉️ {clinic.contact.email}
                      </a>
                    </p>
                  )}
                </div>
              )}

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
                          : schedule.open && schedule.close
                            ? `${formatClinicTime(schedule.open)} – ${formatClinicTime(schedule.close)}`
                            : 'Hours not available'}
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
