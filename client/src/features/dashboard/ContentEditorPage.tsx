import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchAdminMedia, fetchWebsiteDraft, updateWebsiteDraft } from '@/api/admin';
import type { ClinicInfo, WebsiteSection, WebsiteSnapshot } from '@dental/shared';

export function ContentEditorPage() {
  const queryClient = useQueryClient();
  const [clinic, setClinic] = useState<ClinicInfo | null>(null);
  const [sections, setSections] = useState<WebsiteSection[]>([]);
  const [seo, setSeo] = useState<WebsiteSnapshot['seo'] | null>(null);
  const [footer, setFooter] = useState<WebsiteSnapshot['footer'] | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'clinic' | 'dentist' | 'sections'>('clinic');

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'website', 'draft'],
    queryFn: fetchWebsiteDraft,
  });

  const mediaQuery = useQuery({
    queryKey: ['admin', 'media'],
    queryFn: () => fetchAdminMedia({ pageSize: 100 }),
  });

  const mediaItems = mediaQuery.data?.items ?? [];

  useEffect(() => {
    if (data) {
      setClinic(data.clinic);
      setSections([...data.draft.sections]);
      setSeo(data.draft.seo);
      setFooter(data.draft.footer);
    }
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!data || !clinic || !seo || !footer) return;
      return updateWebsiteDraft({
        expectedDraftVersion: data.draftVersion,
        clinic,
        draft: {
          ...data.draft,
          sections,
          seo,
          footer,
        },
      });
    },
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      setFeedback(`Draft saved successfully (v${res?.draftVersion})`);
      setTimeout(() => setFeedback(null), 4000);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to save draft';
      setFeedback(`Save error: ${msg}`);
    },
  });

  if (isLoading || !clinic) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl bg-white border border-stone-200">
        <div className="text-center">
          <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-emerald-800 border-t-transparent" />
          <p className="mt-2 text-xs text-stone-500">Loading clinic content draft...</p>
        </div>
      </div>
    );
  }

  function handleMoveSection(index: number, direction: 'up' | 'down') {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= sections.length) return;

    const newSections = [...sections];
    const current = newSections[index];
    const target = newSections[targetIndex];
    if (!current || !target) return;
    newSections[index] = target;
    newSections[targetIndex] = current;
    setSections(newSections);
  }

  function handleToggleSection(type: string) {
    setSections((prev) =>
      prev.map((sec) =>
        sec.type === type ? ({ ...sec, enabled: !sec.enabled } as WebsiteSection) : sec,
      ),
    );
  }

  function updateOpeningHours(
    day: ClinicInfo['openingHours'][number]['day'],
    changes: Partial<ClinicInfo['openingHours'][number]>,
  ) {
    setClinic((current) =>
      current
        ? {
            ...current,
            openingHours: current.openingHours.map((hours) =>
              hours.day === day ? { ...hours, ...changes } : hours,
            ),
          }
        : current,
    );
  }

  function updateHeroImage(imageMediaId: string | null) {
    setSections((previous) =>
      previous.map((section) =>
        section.type === 'hero'
          ? { ...section, settings: { ...section.settings, imageMediaId } }
          : section,
      ),
    );
  }

  function updateHeroText(field: 'headline' | 'subtitle', value: string) {
    setSections((previous) =>
      previous.map((section) =>
        section.type === 'hero'
          ? { ...section, settings: { ...section.settings, [field]: value } }
          : section,
      ),
    );
  }

  function updateSectionSettings<T extends WebsiteSection['type']>(
    type: T,
    update: (section: Extract<WebsiteSection, { type: T }>) => Extract<WebsiteSection, { type: T }>,
  ) {
    setSections((previous) =>
      previous.map((section) =>
        section.type === type ? update(section as Extract<WebsiteSection, { type: T }>) : section,
      ),
    );
  }

  function toggleGalleryImage(imageMediaId: string, checked: boolean) {
    setSections((previous) =>
      previous.map((section) =>
        section.type === 'gallery'
          ? {
              ...section,
              settings: {
                ...section.settings,
                mediaIds: checked
                  ? [...new Set([...section.settings.mediaIds, imageMediaId])]
                  : section.settings.mediaIds.filter((id) => id !== imageMediaId),
              },
            }
          : section,
      ),
    );
  }

  const heroSection = sections.find(
    (section): section is Extract<WebsiteSection, { type: 'hero' }> => section.type === 'hero',
  );
  const gallerySection = sections.find(
    (section): section is Extract<WebsiteSection, { type: 'gallery' }> =>
      section.type === 'gallery',
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-xl font-bold text-stone-900">Clinic Content &amp; Sections</h2>
          <p className="text-xs text-stone-500">
            Edit clinic contact information, dentist bio &amp; credentials, and reorder public page
            sections.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {feedback && (
            <span className="text-xs font-medium text-emerald-800 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
              {feedback}
            </span>
          )}
          <button
            type="button"
            disabled={saveMutation.isPending}
            onClick={() => saveMutation.mutate()}
            className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700 transition disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving Draft...' : 'Save Draft Changes'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-stone-200 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab('clinic')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'clinic'
              ? 'bg-emerald-800 text-white'
              : 'text-stone-600 hover:bg-white hover:text-stone-900'
          }`}
        >
          🏥 Clinic Profile &amp; Contact
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('dentist')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'dentist'
              ? 'bg-emerald-800 text-white'
              : 'text-stone-600 hover:bg-white hover:text-stone-900'
          }`}
        >
          👨‍⚕️ Dentist Information
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('sections')}
          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
            activeTab === 'sections'
              ? 'bg-emerald-800 text-white'
              : 'text-stone-600 hover:bg-white hover:text-stone-900'
          }`}
        >
          📑 Section Order &amp; Visibility
        </button>
      </div>

      {/* Tab: Clinic Details */}
      {activeTab === 'clinic' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-5">
          <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-2">
            General Clinic Information
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700">Clinic Name</label>
              <input
                type="text"
                value={clinic.name}
                onChange={(e) => setClinic({ ...clinic, name: e.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">
                Tagline / Mission
              </label>
              <input
                type="text"
                value={clinic.tagline}
                onChange={(e) => setClinic({ ...clinic, tagline: e.target.value })}
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">Primary Phone</label>
              <input
                type="text"
                value={clinic.contact.phone}
                onChange={(e) =>
                  setClinic({
                    ...clinic,
                    contact: { ...clinic.contact, phone: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">WhatsApp Number</label>
              <input
                type="text"
                value={clinic.contact.whatsapp || ''}
                onChange={(e) =>
                  setClinic({
                    ...clinic,
                    contact: { ...clinic.contact, whatsapp: e.target.value || null },
                  })
                }
                placeholder="+91 98765 43210"
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">Contact Email</label>
              <input
                type="email"
                value={clinic.contact.email}
                onChange={(e) =>
                  setClinic({
                    ...clinic,
                    contact: { ...clinic.contact, email: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">City &amp; State</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="text"
                  placeholder="City"
                  value={clinic.contact.city}
                  onChange={(e) =>
                    setClinic({
                      ...clinic,
                      contact: { ...clinic.contact, city: e.target.value },
                    })
                  }
                  className="w-1/2 rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
                <input
                  type="text"
                  placeholder="State"
                  value={clinic.contact.state}
                  onChange={(e) =>
                    setClinic({
                      ...clinic,
                      contact: { ...clinic.contact, state: e.target.value },
                    })
                  }
                  className="w-1/2 rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700">Street Address</label>
              <input
                type="text"
                value={clinic.contact.addressLine1}
                onChange={(e) =>
                  setClinic({
                    ...clinic,
                    contact: { ...clinic.contact, addressLine1: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">
                Postal Code (optional)
              </label>
              <input
                type="text"
                value={clinic.contact.postalCode}
                onChange={(e) =>
                  setClinic({
                    ...clinic,
                    contact: { ...clinic.contact, postalCode: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700">Clinic Logo</label>
              <select
                value={clinic.logoMediaId ?? ''}
                onChange={(e) => setClinic({ ...clinic, logoMediaId: e.target.value || null })}
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs"
              >
                <option value="">No logo selected</option>
                {mediaItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.altText || item.publicId}
                  </option>
                ))}
              </select>
              {mediaQuery.isError && (
                <p className="mt-1 text-xs text-red-700">Unable to load the media library.</p>
              )}
            </div>
          </div>

          <div className="space-y-4 border-t border-stone-100 pt-5">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Clinic Operating Hours</h3>
              <p className="mt-1 text-xs text-stone-500">
                Set confirmed opening times. This schedule is shown on the public website after
                publishing.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {clinic.openingHours.map((hours) => (
                <div
                  key={hours.day}
                  className="grid grid-cols-[1fr_auto] items-center gap-3 rounded-xl border border-stone-200 p-3"
                >
                  <span className="text-xs font-semibold capitalize text-stone-800">
                    {hours.day}
                  </span>
                  <label className="flex items-center gap-2 text-xs text-stone-600">
                    <input
                      type="checkbox"
                      checked={hours.closed}
                      onChange={(e) =>
                        updateOpeningHours(hours.day, {
                          closed: e.target.checked,
                          open: e.target.checked ? null : hours.open,
                          close: e.target.checked ? null : hours.close,
                        })
                      }
                    />
                    Closed
                  </label>
                  {!hours.closed && (
                    <div className="col-span-2 grid grid-cols-2 gap-3">
                      <label className="text-xs text-stone-600">
                        Opens
                        <input
                          type="time"
                          required
                          value={hours.open ?? ''}
                          onChange={(e) =>
                            updateOpeningHours(hours.day, { open: e.target.value || null })
                          }
                          className="mt-1 w-full rounded-lg border border-stone-300 p-2"
                        />
                      </label>
                      <label className="text-xs text-stone-600">
                        Closes
                        <input
                          type="time"
                          required
                          value={hours.close ?? ''}
                          onChange={(e) =>
                            updateOpeningHours(hours.day, { close: e.target.value || null })
                          }
                          className="mt-1 w-full rounded-lg border border-stone-300 p-2"
                        />
                      </label>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab: Dentist Information */}
      {activeTab === 'dentist' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-5">
          <h3 className="font-bold text-stone-900 text-sm border-b border-stone-100 pb-2">
            Lead Dentist Bio &amp; Credentials
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold text-stone-700">Dentist Name</label>
              <input
                type="text"
                value={clinic.dentist.name}
                onChange={(e) =>
                  setClinic({
                    ...clinic,
                    dentist: { ...clinic.dentist, name: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">Dentist Portrait</label>
              <select
                value={clinic.dentist.portraitMediaId ?? ''}
                onChange={(e) =>
                  setClinic({
                    ...clinic,
                    dentist: { ...clinic.dentist, portraitMediaId: e.target.value || null },
                  })
                }
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs"
              >
                <option value="">No portrait selected</option>
                {mediaItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.altText || item.publicId}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">
                Professional Title
              </label>
              <input
                type="text"
                value={clinic.dentist.title}
                onChange={(e) =>
                  setClinic({
                    ...clinic,
                    dentist: { ...clinic.dentist, title: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">Qualifications</label>
              <input
                type="text"
                value={clinic.dentist.qualifications.join(', ')}
                onChange={(e) =>
                  setClinic({
                    ...clinic,
                    dentist: {
                      ...clinic.dentist,
                      qualifications: e.target.value
                        .split(',')
                        .map((q) => q.trim())
                        .filter(Boolean),
                    },
                  })
                }
                placeholder="BDS, MDS (Conservative Dentistry & Endodontics)"
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700">Specializations</label>
              <input
                type="text"
                value={clinic.dentist.specializations.join(', ')}
                onChange={(e) =>
                  setClinic({
                    ...clinic,
                    dentist: {
                      ...clinic.dentist,
                      specializations: e.target.value
                        .split(',')
                        .map((s) => s.trim())
                        .filter(Boolean),
                    },
                  })
                }
                placeholder="Root Canal Therapy, Dental Implants, Cosmetic Veneers"
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-stone-700">
                Dentist Bio / Philosophy
              </label>
              <textarea
                rows={4}
                value={clinic.dentist.bio}
                onChange={(e) =>
                  setClinic({
                    ...clinic,
                    dentist: { ...clinic.dentist, bio: e.target.value },
                  })
                }
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab: Section Order & Visibility */}
      {activeTab === 'sections' && (
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-stone-100 pb-3">
            <div>
              <h3 className="font-bold text-stone-900 text-sm">Public Website Sections</h3>
              <p className="text-xs text-stone-500">
                Turn sections on or off, and arrange the flow of your public dental website.
              </p>
            </div>
          </div>

          <div className="space-y-2">
            {sections.map((sec, idx) => (
              <div
                key={`${sec.type}-${idx}`}
                className="flex items-center justify-between rounded-xl border border-stone-200 bg-stone-50/50 p-3 hover:bg-white transition"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-stone-200 text-[11px] font-bold text-stone-700">
                    {idx + 1}
                  </span>
                  <div>
                    <p className="text-xs font-bold text-stone-800 capitalize">
                      {sec.type.replace(/-/g, ' ')} Section
                    </p>
                    <p className="text-[10px] text-stone-400 font-mono">type: {sec.type}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    disabled={idx === 0}
                    onClick={() => handleMoveSection(idx, 'up')}
                    className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-bold text-stone-600 hover:bg-stone-100 disabled:opacity-30"
                    title="Move section up"
                  >
                    ↑
                  </button>
                  <button
                    type="button"
                    disabled={idx === sections.length - 1}
                    onClick={() => handleMoveSection(idx, 'down')}
                    className="rounded-lg border border-stone-200 bg-white px-2.5 py-1 text-xs font-bold text-stone-600 hover:bg-stone-100 disabled:opacity-30"
                    title="Move section down"
                  >
                    ↓
                  </button>
                  <button
                    type="button"
                    onClick={() => handleToggleSection(sec.type)}
                    className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                      sec.enabled
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-stone-200 text-stone-600 hover:bg-stone-300'
                    }`}
                  >
                    {sec.enabled ? '✓ Visible' : '✗ Hidden'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {heroSection && (
            <div className="space-y-3 border-t border-stone-100 pt-4">
              <h3 className="text-xs font-semibold text-stone-700">Hero Content</h3>
              <label className="block text-xs text-stone-600">
                Headline
                <input
                  type="text"
                  maxLength={160}
                  value={heroSection.settings.headline}
                  onChange={(e) => updateHeroText('headline', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs"
                />
              </label>
              <label className="block text-xs text-stone-600">
                Supporting text
                <textarea
                  rows={3}
                  maxLength={400}
                  value={heroSection.settings.subtitle}
                  onChange={(e) => updateHeroText('subtitle', e.target.value)}
                  className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs"
                />
              </label>
              <label className="block text-xs font-semibold text-stone-700">Hero Image</label>
              <select
                value={heroSection.settings.imageMediaId ?? ''}
                onChange={(e) => updateHeroImage(e.target.value || null)}
                className="w-full rounded-xl border border-stone-300 p-2.5 text-xs"
              >
                <option value="">No hero image</option>
                {mediaItems.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.altText || item.publicId}
                  </option>
                ))}
              </select>
            </div>
          )}

          {sections.map((section) => {
            if (section.type === 'trust') {
              return (
                <div key={section.id} className="space-y-3 border-t border-stone-100 pt-4">
                  <h3 className="text-xs font-semibold text-stone-700">Clinic Highlights</h3>
                  <label className="block text-xs text-stone-600">
                    Section heading
                    <input
                      value={section.settings.heading}
                      onChange={(e) =>
                        updateSectionSettings('trust', (current) => ({
                          ...current,
                          settings: { ...current.settings, heading: e.target.value },
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs"
                    />
                  </label>
                  {section.settings.items.map((item, index) => (
                    <div key={`${section.id}-${index}`} className="grid gap-2 sm:grid-cols-2">
                      <input
                        aria-label={`Highlight ${index + 1} label`}
                        value={item.label}
                        onChange={(e) =>
                          updateSectionSettings('trust', (current) => ({
                            ...current,
                            settings: {
                              ...current.settings,
                              items: current.settings.items.map((entry, itemIndex) =>
                                itemIndex === index ? { ...entry, label: e.target.value } : entry,
                              ),
                            },
                          }))
                        }
                        className="rounded-xl border border-stone-300 p-2.5 text-xs"
                      />
                      <div className="flex gap-2">
                        <input
                          aria-label={`Highlight ${index + 1} detail`}
                          value={item.detail}
                          onChange={(e) =>
                            updateSectionSettings('trust', (current) => ({
                              ...current,
                              settings: {
                                ...current.settings,
                                items: current.settings.items.map((entry, itemIndex) =>
                                  itemIndex === index
                                    ? { ...entry, detail: e.target.value }
                                    : entry,
                                ),
                              },
                            }))
                          }
                          className="min-w-0 flex-1 rounded-xl border border-stone-300 p-2.5 text-xs"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            updateSectionSettings('trust', (current) => ({
                              ...current,
                              settings: {
                                ...current.settings,
                                items: current.settings.items.filter(
                                  (_entry, itemIndex) => itemIndex !== index,
                                ),
                              },
                            }))
                          }
                          className="rounded-lg border border-stone-200 px-3 text-xs text-stone-600"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            }

            if (section.type === 'whyChooseUs') {
              return (
                <div key={section.id} className="space-y-3 border-t border-stone-100 pt-4">
                  <h3 className="text-xs font-semibold text-stone-700">Why Choose Us Content</h3>
                  <label className="block text-xs text-stone-600">
                    Section description
                    <textarea
                      rows={2}
                      value={section.settings.description}
                      onChange={(e) =>
                        updateSectionSettings('whyChooseUs', (current) => ({
                          ...current,
                          settings: { ...current.settings, description: e.target.value },
                        }))
                      }
                      className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs"
                    />
                  </label>
                  {section.settings.items.map((item, index) => (
                    <div
                      key={`${section.id}-${index}`}
                      className="space-y-2 rounded-xl border border-stone-200 p-3"
                    >
                      <input
                        aria-label={`Reason ${index + 1} title`}
                        value={item.title}
                        onChange={(e) =>
                          updateSectionSettings('whyChooseUs', (current) => ({
                            ...current,
                            settings: {
                              ...current.settings,
                              items: current.settings.items.map((entry, itemIndex) =>
                                itemIndex === index ? { ...entry, title: e.target.value } : entry,
                              ),
                            },
                          }))
                        }
                        className="w-full rounded-xl border border-stone-300 p-2.5 text-xs"
                      />
                      <textarea
                        aria-label={`Reason ${index + 1} description`}
                        rows={2}
                        value={item.description}
                        onChange={(e) =>
                          updateSectionSettings('whyChooseUs', (current) => ({
                            ...current,
                            settings: {
                              ...current.settings,
                              items: current.settings.items.map((entry, itemIndex) =>
                                itemIndex === index
                                  ? { ...entry, description: e.target.value }
                                  : entry,
                              ),
                            },
                          }))
                        }
                        className="w-full rounded-xl border border-stone-300 p-2.5 text-xs"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          updateSectionSettings('whyChooseUs', (current) => ({
                            ...current,
                            settings: {
                              ...current.settings,
                              items: current.settings.items.filter(
                                (_entry, itemIndex) => itemIndex !== index,
                              ),
                            },
                          }))
                        }
                        className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs text-stone-600"
                      >
                        Remove this reason
                      </button>
                    </div>
                  ))}
                </div>
              );
            }

            return null;
          })}

          {footer && seo && (
            <div className="grid gap-5 border-t border-stone-100 pt-4 lg:grid-cols-2">
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-stone-700">Footer Content</h3>
                <label className="block text-xs text-stone-600">
                  About the clinic (optional)
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={footer.aboutText}
                    onChange={(e) => setFooter({ ...footer, aboutText: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs"
                  />
                </label>
                <label className="block text-xs text-stone-600">
                  Copyright text (optional)
                  <input
                    maxLength={200}
                    value={
                      sections.find((section) => section.type === 'footer')?.settings
                        .copyrightText ?? ''
                    }
                    onChange={(e) =>
                      updateSectionSettings('footer', (current) => ({
                        ...current,
                        settings: { ...current.settings, copyrightText: e.target.value },
                      }))
                    }
                    className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs"
                  />
                </label>
              </div>
              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-stone-700">Search Preview</h3>
                <label className="block text-xs text-stone-600">
                  Page title
                  <input
                    maxLength={70}
                    value={seo.title}
                    onChange={(e) => setSeo({ ...seo, title: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs"
                  />
                </label>
                <label className="block text-xs text-stone-600">
                  Search description
                  <textarea
                    rows={3}
                    maxLength={180}
                    value={seo.description}
                    onChange={(e) => setSeo({ ...seo, description: e.target.value })}
                    className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs"
                  />
                </label>
              </div>
            </div>
          )}

          {gallerySection && (
            <div className="space-y-3 border-t border-stone-100 pt-4">
              <div>
                <h3 className="text-xs font-semibold text-stone-700">Gallery Images</h3>
                <p className="mt-1 text-xs text-stone-500">
                  Select the uploaded photos to show publicly.
                </p>
              </div>
              {mediaItems.length === 0 ? (
                <p className="text-xs text-stone-500">
                  Upload images in the Media Library before selecting them here.
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {mediaItems.map((item) => {
                    const selected = gallerySection.settings.mediaIds.includes(item.id);
                    return (
                      <label
                        key={item.id}
                        className="flex items-center gap-3 rounded-lg border border-stone-200 p-2"
                      >
                        <input
                          type="checkbox"
                          checked={selected}
                          onChange={(e) => toggleGalleryImage(item.id, e.target.checked)}
                        />
                        <img
                          src={item.secureUrl}
                          alt=""
                          className="h-10 w-14 rounded object-cover"
                        />
                        <span className="truncate text-xs text-stone-700">
                          {item.altText || item.publicId}
                        </span>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
