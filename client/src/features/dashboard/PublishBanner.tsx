import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchWebsiteDraft, publishWebsite } from '@/api/admin';
import { ApiClientError } from '@/api/client';
import type { WebsiteSnapshot } from '@dental/shared';

function describeBlockedField(path: string, snapshot?: WebsiteSnapshot): string {
  if (path === 'clinic.contact.postalCode') {
    return 'Postal code: optional; leave blank if it is not known.';
  }
  const clinicFieldLabels: Record<string, string> = {
    'clinic.name': 'Clinic Profile: Clinic name',
    'clinic.tagline': 'Clinic Profile: Tagline',
    'clinic.dentist.name': 'Dentist Information: Name',
    'clinic.dentist.title': 'Dentist Information: Professional title',
    'clinic.dentist.bio': 'Dentist Information: Biography',
    'clinic.contact.phone': 'Clinic Profile: Phone number',
    'clinic.contact.email': 'Clinic Profile: Contact email',
    'clinic.contact.addressLine1': 'Clinic Profile: Street address',
    'clinic.contact.addressLine2': 'Clinic Profile: Address line 2',
    'clinic.contact.city': 'Clinic Profile: City',
    'clinic.contact.state': 'Clinic Profile: State',
    'clinic.contact.whatsapp': 'Clinic Profile: WhatsApp number',
  };
  if (clinicFieldLabels[path]) return clinicFieldLabels[path];
  if (path.startsWith('clinic.dentist.qualifications[')) {
    return 'Dentist Information: Qualification';
  }
  if (path.startsWith('clinic.dentist.specializations[')) {
    return 'Dentist Information: Specialization';
  }
  if (path.startsWith('snapshot.navigation[')) return 'Website navigation: Menu label';
  if (path === 'snapshot.footer.aboutText') return 'Footer: About the clinic';
  if (path === 'snapshot.seo.title') return 'Search Preview: Page title';
  if (path === 'snapshot.seo.description') return 'Search Preview: Search description';

  const sectionMatch = /^snapshot\.sections\[(\d+)\]\.settings\.(.+)$/.exec(path);
  if (!sectionMatch) return 'Clinic profile: review the clinic and dentist information.';
  if (!snapshot) return 'Website content: review the relevant section.';

  const section = snapshot.sections[Number(sectionMatch[1])];
  if (!section) return 'Website content: review the relevant section.';
  const fieldPath = sectionMatch[2] ?? '';
  const sectionName: Record<WebsiteSnapshot['sections'][number]['type'], string> = {
    header: 'Header',
    hero: 'Hero Content',
    trust: 'Clinic Highlights',
    services: 'Services',
    dentist: 'Dentist',
    whyChooseUs: 'Why Choose Us',
    reviews: 'Patient Reviews',
    gallery: 'Gallery',
    appointment: 'Appointment',
    contact: 'Contact',
    footer: 'Footer',
  };
  const sectionLabel = sectionName[section.type];
  const itemMatch = /^items\[(\d+)\]\.(detail|description|label|title)$/.exec(fieldPath);
  if (itemMatch && (section.type === 'trust' || section.type === 'whyChooseUs')) {
    const item = section.settings.items[Number(itemMatch[1])];
    const itemName =
      item && 'label' in item ? item.label : item && 'title' in item ? item.title : '';
    return `${sectionLabel}${itemName ? ` — ${itemName}` : ''}`;
  }
  if (fieldPath === 'description') return `${sectionLabel}: Description`;
  if (fieldPath === 'heading') return `${sectionLabel}: Section heading`;
  if (fieldPath === 'copyrightText') return 'Footer: Copyright text';
  if (fieldPath === 'headline') return 'Hero Content: Headline';
  if (fieldPath === 'subtitle') return 'Hero Content: Supporting text';
  if (fieldPath === 'successMessage') return 'Appointment: Confirmation message';
  return `${sectionLabel}: review its content`;
}

export function PublishBanner() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [changeSummary, setChangeSummary] = useState('');
  const [feedback, setFeedback] = useState<string | null>(null);
  const [publishError, setPublishError] = useState<string | null>(null);

  const draftQuery = useQuery({
    queryKey: ['admin', 'website', 'draft'],
    queryFn: fetchWebsiteDraft,
    refetchInterval: 15_000,
  });

  const publishMutation = useMutation({
    mutationFn: async () => {
      if (!draftQuery.data) return;
      return publishWebsite({
        expectedDraftVersion: draftQuery.data.draftVersion,
        changeSummary: changeSummary.trim() || undefined,
      });
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      queryClient.invalidateQueries({ queryKey: ['public'] });
      setIsModalOpen(false);
      setChangeSummary('');
      setFeedback(`Successfully published version ${data?.version}!`);
      setTimeout(() => setFeedback(null), 5000);
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Publish failed';
      if (err instanceof ApiClientError && err.code === 'CONTENT_NOT_READY') {
        const details = err.details as { fields?: unknown } | undefined;
        const fields = Array.isArray(details?.fields)
          ? details.fields.filter((field): field is string => typeof field === 'string')
          : [];
        setPublishError(
          fields.length > 0
            ? `Some content still looks like a template. Review these items in Clinic Content & Sections, edit or remove the text, then save your draft:\n${fields.map((field) => `• ${describeBlockedField(field, draftQuery.data?.draft)}`).join('\n')}`
            : msg,
        );
        setFeedback(null);
      } else {
        setPublishError(msg);
        setFeedback(`Error: ${msg}`);
      }
    },
  });

  const draft = draftQuery.data;
  if (!draft) return null;

  const isUpToDate =
    draft.activeRevisionVersion !== null && draft.activeRevisionVersion === draft.draftVersion;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-stone-200 bg-white px-4 py-2.5 shadow-sm">
        <div className="flex items-center gap-2.5">
          <span
            className={`h-2.5 w-2.5 rounded-full ${
              isUpToDate ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'
            }`}
          />
          <div className="text-xs">
            <span className="font-semibold text-stone-800">
              {isUpToDate ? 'Published & Up to date' : 'Unpublished Draft Changes'}
            </span>
            <span className="mx-2 text-stone-300">|</span>
            <span className="text-stone-500">
              Draft v{draft.draftVersion}{' '}
              {draft.activeRevisionVersion
                ? `(Live: v${draft.activeRevisionVersion})`
                : '(No live version)'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {feedback && (
            <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
              {feedback}
            </span>
          )}
          <a
            href="/admin/preview"
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-lg border border-stone-200 px-3 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-50 transition"
          >
            Preview Draft ↗
          </a>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="rounded-lg bg-emerald-800 px-3.5 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition"
          >
            Publish Live
          </button>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-stone-200">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 text-xl font-bold">
                🚀
              </div>
              <div>
                <h3 className="text-lg font-bold text-stone-900">Publish Website Revision</h3>
                <p className="text-xs text-stone-500">
                  Instantly publish draft v{draft.draftVersion} to the live public clinic website.
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-stone-700">
                Change Summary (Optional note for revision log)
              </label>
              <textarea
                value={changeSummary}
                onChange={(e) => setChangeSummary(e.target.value)}
                placeholder="e.g. Updated holiday hours and clinic contact phone"
                rows={3}
                className="mt-1 w-full rounded-xl border border-stone-300 p-2.5 text-xs focus:border-emerald-700 focus:outline-none focus:ring-1 focus:ring-emerald-700"
              />
            </div>

            {publishError && (
              <p
                role="alert"
                className="mt-4 max-h-48 overflow-y-auto rounded-lg bg-red-50 p-3 text-xs text-red-700"
              >
                <span className="whitespace-pre-line">{publishError}</span>
              </p>
            )}
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setPublishError(null);
                }}
                className="rounded-xl border border-stone-200 px-4 py-2 text-xs font-medium text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={publishMutation.isPending}
                onClick={() => {
                  setPublishError(null);
                  publishMutation.mutate();
                }}
                className="rounded-xl bg-emerald-800 px-4 py-2 text-xs font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
              >
                {publishMutation.isPending ? 'Publishing...' : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
