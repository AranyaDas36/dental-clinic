import { render } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { SEOHead } from './SEOHead';

const fallbackTitle = 'Chakdaha Dental Clinic | Dr. Kalyan Das, Chakdaha';
const fallbackDescription =
  'Chakdaha Dental Clinic in Chakdaha, West Bengal offers root canal treatment (RCT). Meet Dr. Kalyan Das (BDS), see clinic hours and contact details, and request an appointment.';

afterEach(() => {
  document.head
    .querySelectorAll('meta[name="description"], meta[name="robots"], link[rel="canonical"]')
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
      `${window.location.origin}/`,
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

    expect(document.title).toBe('[PREVIEW] Chakdaha Dental Clinic');
    expect(document.querySelector('meta[name="description"]')).toHaveAttribute(
      'content',
      'Contact Chakdaha Dental Clinic to request an appointment.',
    );
    expect(document.querySelector('meta[name="robots"]')).toHaveAttribute(
      'content',
      'noindex, nofollow',
    );
  });
});
