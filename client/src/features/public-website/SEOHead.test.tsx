import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { DEFAULT_CLINIC } from '@dental/shared';
import { SEOHead } from './SEOHead';

const fallbackTitle = 'Dr. Kalyan Das | Dentist in Lalpur, Chakdah';
const fallbackDescription =
  'Dr. Kalyan Das (BDS), dentist in Lalpur, Chakdah, Nadia. Chakdaha Dental Clinic lists root canal treatment. Contact the clinic to confirm availability or request an appointment.';

const publishedClinic = {
  ...DEFAULT_CLINIC,
  dentist: {
    ...DEFAULT_CLINIC.dentist,
    title: 'General Dentist',
    qualifications: ['BDS'],
  },
  contact: {
    ...DEFAULT_CLINIC.contact,
    phone: '+91 7362990567',
    addressLine1: 'Chakdaha Bus Stand, Opposite to Bank of India, 1st floor',
    addressLine2: null,
    city: 'Chakdaha',
    state: 'West Bengal',
    postalCode: '741222',
    country: 'India',
  },
  openingHours: [
    { day: 'monday' as const, closed: false, open: '10:00', close: '19:00' },
    { day: 'tuesday' as const, closed: false, open: '10:00', close: '19:00' },
    { day: 'wednesday' as const, closed: false, open: '10:00', close: '19:00' },
    { day: 'thursday' as const, closed: false, open: '10:00', close: '19:00' },
    { day: 'friday' as const, closed: false, open: '10:00', close: '19:00' },
    { day: 'saturday' as const, closed: false, open: '10:00', close: '14:00' },
    { day: 'sunday' as const, closed: true, open: null, close: null },
  ],
};

afterEach(() => {
  document.head
    .querySelectorAll(
      'meta[name], meta[property], link[rel="canonical"], script[data-clinic-structured-data]',
    )
    .forEach((element) => element.remove());
});

describe('SEOHead', () => {
  it('replaces an abruptly truncated title and URL-only description with clinic facts', () => {
    render(
      <SEOHead
        seo={{
          title: 'At Dr. Kalyan Das’s dental clinic in Lalpur, Chakdah, we focus on pers',
          description: 'Dr Kalyan Das, Chakdaha, Nadia - 741222 https://www.facebook.com/clinic',
          canonicalPath: '/',
          socialImageMediaId: null,
        }}
        clinicName="Chakdaha Dental Clinic"
      />,
    );

    expect(document.title).toBe(fallbackTitle);
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      fallbackDescription,
    );
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'index, follow',
    );
    expect(document.querySelector('link[rel="canonical"]')).toHaveAttribute(
      'href',
      'https://dental-clinic-zeta-vert.vercel.app/',
    );
  });

  it('adds verified clinic and service details as structured data', () => {
    render(
      <SEOHead
        seo={{
          title: 'Old CMS title',
          description: 'Old CMS description',
          canonicalPath: '/',
          socialImageMediaId: null,
        }}
        clinicName="Chakdaha Dental Clinic"
        clinic={publishedClinic}
        services={[
          {
            id: 'rct',
            name: 'RCT',
            slug: 'rct',
            shortDescription: 'Root Canal Treatment',
            description: 'Root Canal Treatment',
            category: 'General Dentistry',
            priceType: 'fixed',
            price: 7000,
            minPrice: null,
            maxPrice: null,
            currency: 'INR',
            imageMediaId: null,
            imageUrl: null,
            imageAltText: '',
            isFeatured: false,
            isPublished: true,
            displayOrder: 1,
            seoTitle: null,
            seoDescription: null,
          },
        ]}
        socialImageUrl="https://example.test/dentist.jpg"
      />,
    );

    const script = document.querySelector('script[data-clinic-structured-data]');
    expect(script).not.toBeNull();
    const schema = JSON.parse(script?.textContent ?? '{}');
    expect(schema['@type']).toBe('Dentist');
    expect(schema.name).toBe('Chakdaha Dental Clinic');
    expect(schema.telephone).toBe('+91 7362990567');
    expect(schema.address.addressLocality).toBe('Chakdaha');
    expect(schema.image).toBe('https://example.test/dentist.jpg');
    expect(schema.employee.hasCredential[0].name).toBe('BDS');
    expect(schema.openingHoursSpecification).toHaveLength(6);
    expect(schema.hasOfferCatalog.itemListElement[0].itemOffered.name).toBe('RCT');
    expect(document.title).toBe(fallbackTitle);
    expect(document.querySelector('meta[property="og:title"]')).toHaveAttribute(
      'content',
      fallbackTitle,
    );
  });

  it('keeps valid published metadata and marks draft previews noindex', () => {
    render(
      <SEOHead
        seo={{
          title: 'Chakdaha Dental Clinic',
          description: 'Contact Chakdaha Dental Clinic to request an appointment.',
          canonicalPath: '/',
          socialImageMediaId: null,
        }}
        clinicName="Chakdaha Dental Clinic"
        isDraftPreview
      />,
    );

    expect(document.title).toBe(`[PREVIEW] ${fallbackTitle}`);
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      fallbackDescription,
    );
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
  });
});
