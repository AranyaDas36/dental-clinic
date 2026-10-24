import { useEffect } from 'react';
import type { ClinicInfo, WebsiteSnapshot } from '@dental/shared';
import type { PublicServiceItem } from '@/api/public';

interface SEOHeadProps {
  seo: WebsiteSnapshot['seo'];
  clinicName: string;
  clinic?: ClinicInfo;
  services?: PublicServiceItem[];
  socialImageUrl?: string | null;
  isDraftPreview?: boolean;
}

export const CLINIC_SEO_TITLE = 'Dr. Kalyan Das | Dentist in Lalpur, Chakdah';
export const CLINIC_SEO_DESCRIPTION =
  'Dr. Kalyan Das (BDS), dentist in Lalpur, Chakdah, Nadia. Chakdaha Dental Clinic lists root canal treatment. Contact the clinic to confirm availability or request an appointment.';
export const CLINIC_HERO_HEADLINE = 'Dr. Kalyan Das — Dentist in Lalpur, Chakdah';
const CLINIC_SITE_URL = 'https://dental-clinic-zeta-vert.vercel.app';

const schemaDays: Record<ClinicInfo['openingHours'][number]['day'], string> = {
  monday: 'https://schema.org/Monday',
  tuesday: 'https://schema.org/Tuesday',
  wednesday: 'https://schema.org/Wednesday',
  thursday: 'https://schema.org/Thursday',
  friday: 'https://schema.org/Friday',
  saturday: 'https://schema.org/Saturday',
  sunday: 'https://schema.org/Sunday',
};

function createClinicStructuredData(
  clinic: ClinicInfo,
  services: PublicServiceItem[],
  imageUrl: string | null | undefined,
) {
  const address = clinic.contact;
  const openingHoursSpecification = clinic.openingHours.flatMap((hours) => {
    if (hours.closed || !hours.open || !hours.close) return [];
    return [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: schemaDays[hours.day],
        opens: hours.open,
        closes: hours.close,
      },
    ];
  });

  return {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    '@id': `${CLINIC_SITE_URL}/#clinic`,
    name: clinic.name,
    url: `${CLINIC_SITE_URL}/`,
    ...(clinic.name === 'Chakdaha Dental Clinic' && clinic.dentist.name === 'Dr. Kalyan Das'
      ? { description: CLINIC_SEO_DESCRIPTION }
      : clinic.tagline.trim()
        ? { description: clinic.tagline.trim() }
        : {}),
    ...(address.phone.trim() ? { telephone: address.phone.trim() } : {}),
    ...(imageUrl ? { image: imageUrl } : {}),
    address: {
      '@type': 'PostalAddress',
      streetAddress: [address.addressLine1, address.addressLine2]
        .filter((line): line is string => Boolean(line?.trim()))
        .join(', '),
      addressLocality: address.city,
      addressRegion: address.state,
      ...(address.postalCode.trim() ? { postalCode: address.postalCode.trim() } : {}),
      addressCountry: address.country === 'India' ? 'IN' : address.country,
    },
    ...(openingHoursSpecification.length ? { openingHoursSpecification } : {}),
    employee: {
      '@type': 'Person',
      name: clinic.dentist.name,
      ...(clinic.dentist.title.trim() ? { jobTitle: clinic.dentist.title.trim() } : {}),
      ...(clinic.dentist.qualifications.length
        ? {
            hasCredential: clinic.dentist.qualifications.map((name) => ({
              '@type': 'EducationalOccupationalCredential',
              credentialCategory: 'degree',
              name,
            })),
          }
        : {}),
    },
    ...(services.length
      ? {
          hasOfferCatalog: {
            '@type': 'OfferCatalog',
            name: 'Dental services',
            itemListElement: services.map((service) => ({
              '@type': 'Offer',
              itemOffered: {
                '@type': 'Service',
                name: service.name,
                ...(service.shortDescription || service.description
                  ? { description: service.shortDescription || service.description }
                  : {}),
              },
            })),
          },
        }
      : {}),
  };
}

export function SEOHead({
  seo,
  clinicName,
  clinic,
  services = [],
  socialImageUrl,
  isDraftPreview = false,
}: SEOHeadProps) {
  useEffect(() => {
    const candidateTitle = seo.title.trim();
    const isPrimaryClinic =
      clinicName === 'Chakdaha Dental Clinic' &&
      (!clinic || clinic.dentist.name === 'Dr. Kalyan Das');
    const fullTitle = isPrimaryClinic
      ? CLINIC_SEO_TITLE
      : candidateTitle.length > 0 &&
          candidateTitle.length <= 60 &&
          !/https?:\/\//i.test(candidateTitle)
        ? candidateTitle
        : clinicName;
    const description = isPrimaryClinic
      ? CLINIC_SEO_DESCRIPTION
      : /https?:\/\//i.test(seo.description) || /placeholder|demo/i.test(seo.description)
        ? `Contact ${clinicName} to confirm its services, location, and appointment options.`
        : seo.description;

    document.title = isDraftPreview ? `[PREVIEW] ${fullTitle}` : fullTitle;
    const canonicalUrl = isPrimaryClinic
      ? `${CLINIC_SITE_URL}/`
      : new URL(seo.canonicalPath || '/', window.location.origin).href;

    function setMeta(name: string, content: string, attribute: 'name' | 'property' = 'name') {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    }

    setMeta('description', description);
    setMeta('robots', isDraftPreview ? 'noindex, nofollow' : 'index, follow');
    setMeta('og:title', fullTitle, 'property');
    setMeta('og:description', description, 'property');
    setMeta('og:type', 'website', 'property');
    setMeta('og:site_name', clinicName, 'property');
    setMeta('og:url', canonicalUrl, 'property');
    if (socialImageUrl) {
      setMeta('og:image', socialImageUrl, 'property');
      setMeta('og:image:alt', `Dr. Kalyan Das at ${clinicName}`, 'property');
    } else {
      document.querySelector('meta[property="og:image"]')?.remove();
      document.querySelector('meta[property="og:image:alt"]')?.remove();
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    let structuredData = document.querySelector<HTMLScriptElement>(
      'script[data-clinic-structured-data]',
    );
    if (clinic && !isDraftPreview) {
      if (!structuredData) {
        structuredData = document.createElement('script');
        structuredData.type = 'application/ld+json';
        structuredData.dataset.clinicStructuredData = 'true';
        document.head.appendChild(structuredData);
      }
      structuredData.textContent = JSON.stringify(
        createClinicStructuredData(clinic, services, socialImageUrl),
      ).replace(/</g, '\\u003c');
    } else {
      structuredData?.remove();
    }
  }, [seo, clinicName, clinic, services, socialImageUrl, isDraftPreview]);

  return null;
}
