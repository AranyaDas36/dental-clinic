import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { publicAppointmentCreateSchema, type PublicAppointmentCreate } from '@dental/shared';
import { submitPublicAppointment, type PublicServiceItem } from '@/api/public';

interface AppointmentSectionProps {
  services: PublicServiceItem[];
  settings: {
    heading: string;
    description: string;
    successMessage: string;
  };
  layoutVariant?: string;
  preselectedServiceId?: string | null;
}

const TIME_SLOTS = [
  'Morning (10:00 – 13:00)',
  'Afternoon (14:00 – 17:00)',
  'Evening (17:00 – 19:00)',
];

export function AppointmentSection({
  services,
  settings,
  preselectedServiceId,
}: AppointmentSectionProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedData, setSubmittedData] = useState<{
    id: string;
    message: string;
  } | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PublicAppointmentCreate>({
    resolver: zodResolver(publicAppointmentCreateSchema),
    defaultValues: {
      patientName: '',
      phone: '',
      email: '',
      requestedServiceId: preselectedServiceId || undefined,
      preferredDate: '',
      preferredTime: TIME_SLOTS[0],
      message: '',
    },
  });

  async function onSubmit(data: PublicAppointmentCreate) {
    setIsSubmitting(true);
    setApiError(null);
    try {
      const cleanData: PublicAppointmentCreate = {
        patientName: data.patientName.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim() ? data.email.trim() : undefined,
        requestedServiceId: data.requestedServiceId || undefined,
        preferredDate: data.preferredDate ? data.preferredDate : undefined,
        preferredTime: data.preferredTime || undefined,
        message: data.message?.trim() ? data.message.trim() : undefined,
      };
      const res = await submitPublicAppointment(cleanData);
      setSubmittedData(res);
      reset();
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to submit appointment request');
    } finally {
      setIsSubmitting(false);
    }
  }

  // Minimum date = today
  const todayIso = new Date().toISOString().split('T')[0];

  return (
    <section id="appointment" className="scroll-mt-16 py-[var(--section-space)]">
      <div className="container-page">
        <div className="grid items-start gap-12 lg:grid-cols-12">
          {/* Left info column */}
          <div className="space-y-6 lg:col-span-5">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-[var(--color-primary)]">
              <span>●</span>
              <span>Direct Clinic Booking</span>
            </div>
            <h2 className="text-3xl leading-tight tracking-tight md:text-5xl">
              {settings.heading}
            </h2>
            <p className="text-base leading-relaxed text-[var(--color-muted-text)] md:text-lg">
              {settings.description}
            </p>

            <div className="space-y-4 rounded-[var(--radius-card)] border border-black/5 bg-[var(--color-surface)] p-6 shadow-2xs">
              <h4 className="font-semibold text-[var(--color-text)]">How our appointments work</h4>
              <ul className="space-y-3 text-sm text-[var(--color-muted-text)]">
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary)]">
                    1
                  </span>
                  <span>Submit your preferred date, time slot, and reason for consultation.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary)]">
                    2
                  </span>
                  <span>
                    Our clinic receptionist reviews the schedule and calls you to confirm.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-xs font-bold text-[var(--color-primary)]">
                    3
                  </span>
                  <span>Visit our calm clinic setting for dedicated, unhurried care.</span>
                </li>
              </ul>
              <div className="rounded-[var(--radius-button)] bg-[var(--color-background)] p-3 text-xs text-[var(--color-muted-text)]">
                ℹ️ We never auto-confirm bookings or ask for upfront card payments online.
              </div>
            </div>
          </div>

          {/* Right form column */}
          <div className="lg:col-span-7">
            <div className="rounded-[var(--radius-card)] border border-black/5 bg-[var(--color-surface)] p-8 shadow-[var(--shadow-card)] md:p-10">
              {submittedData ? (
                <div className="space-y-5 py-6 text-center">
                  <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-primary)]/10 text-3xl text-[var(--color-primary)]">
                    ✓
                  </div>
                  <h3 className="text-2xl font-bold text-[var(--color-text)]">
                    Request Received Successfully
                  </h3>
                  <p className="mx-auto max-w-md text-sm text-[var(--color-muted-text)]">
                    {settings.successMessage}
                  </p>
                  <div className="rounded-[var(--radius-button)] bg-[var(--color-background)] p-4 text-xs text-[var(--color-muted-text)]">
                    <p className="font-semibold text-[var(--color-text)]">
                      Reference ID: {submittedData.id}
                    </p>
                    <p className="mt-1">
                      Our front-desk team will reach out to you shortly at the phone number
                      provided.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSubmittedData(null)}
                    className="inline-block rounded-[var(--radius-button)] bg-[var(--color-primary)] px-6 py-2.5 text-sm font-semibold !text-white transition hover:opacity-90"
                  >
                    Submit another request
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  <div>
                    <h3 className="text-xl font-bold text-[var(--color-text)]">
                      Request Consultation
                    </h3>
                    <p className="text-xs text-[var(--color-muted-text)]">
                      Please enter your contact details to help us schedule your visit.
                    </p>
                  </div>

                  {apiError && (
                    <div
                      role="alert"
                      className="rounded-[var(--radius-button)] border border-red-200 bg-red-50 p-3 text-xs text-red-800"
                    >
                      {apiError}
                    </div>
                  )}

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-text)]">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        {...register('patientName')}
                        placeholder="e.g. Rahul Sharma"
                        className="mt-1.5 w-full rounded-[var(--radius-button)] border border-black/15 bg-white px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                      />
                      {errors.patientName && (
                        <p className="mt-1 text-xs text-red-600">{errors.patientName.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-text)]">
                        Phone Number *
                      </label>
                      <input
                        type="tel"
                        {...register('phone')}
                        placeholder="e.g. +91 98765 43210"
                        className="mt-1.5 w-full rounded-[var(--radius-button)] border border-black/15 bg-white px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                      />
                      {errors.phone && (
                        <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
                      )}
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-text)]">
                        Email Address (Optional)
                      </label>
                      <input
                        type="email"
                        {...register('email')}
                        placeholder="name@example.com"
                        className="mt-1.5 w-full rounded-[var(--radius-button)] border border-black/15 bg-white px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                      />
                      {errors.email && (
                        <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-text)]">
                        Service of Interest
                      </label>
                      <select
                        {...register('requestedServiceId')}
                        className="mt-1.5 w-full rounded-[var(--radius-button)] border border-black/15 bg-white px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                      >
                        <option value="">General Consultation / Check-up</option>
                        {services.map((service) => (
                          <option key={service.id} value={service.id}>
                            {service.name} ({service.category})
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-text)]">
                        Preferred Date
                      </label>
                      <input
                        type="date"
                        min={todayIso}
                        {...register('preferredDate')}
                        className="mt-1.5 w-full rounded-[var(--radius-button)] border border-black/15 bg-white px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                      />
                      {errors.preferredDate && (
                        <p className="mt-1 text-xs text-red-600">{errors.preferredDate.message}</p>
                      )}
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-text)]">
                        Preferred Time of Day
                      </label>
                      <select
                        {...register('preferredTime')}
                        className="mt-1.5 w-full rounded-[var(--radius-button)] border border-black/15 bg-white px-3.5 py-2.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                      >
                        {TIME_SLOTS.map((slot) => (
                          <option key={slot} value={slot}>
                            {slot}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-text)]">
                      Notes or Dental Concerns (Optional)
                    </label>
                    <textarea
                      rows={3}
                      {...register('message')}
                      placeholder="Share any sensitivities, toothache location, or questions for the doctor..."
                      className="mt-1.5 w-full rounded-[var(--radius-button)] border border-black/15 bg-white p-3.5 text-sm text-[var(--color-text)] outline-none focus:border-[var(--color-primary)]"
                    />
                    {errors.message && (
                      <p className="mt-1 text-xs text-red-600">{errors.message.message}</p>
                    )}
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-[var(--radius-button)] bg-[var(--color-primary)] py-3.5 font-semibold !text-white shadow-xs transition hover:opacity-90 active:scale-98 disabled:opacity-50"
                    >
                      {isSubmitting ? 'Submitting Request...' : 'Send Appointment Request'}
                    </button>
                    <p className="mt-2.5 text-center text-2xs text-[var(--color-muted-text)]">
                      By submitting, you agree to receive a phone call or SMS from our clinic
                      regarding this appointment request.
                    </p>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
