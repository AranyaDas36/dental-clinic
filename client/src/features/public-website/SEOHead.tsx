import { useEffect } from 'react';
import type { WebsiteSnapshot } from '@dental/shared';

interface SEOHeadProps {
  seo: WebsiteSnapshot['seo'];
  clinicName: string;
  socialImageUrl?: string | null;
  isDraftPreview?: boolean;
}

const DEFAULT_SEO_TITLE = 'Chakdaha Dental Clinic | Dr. Kalyan Das, Chakdaha';
const DEFAULT_SEO_DESCRIPTION =
  'Chakdaha Dental Clinic in Chakdaha, West Bengal offers root canal treatment (RCT). Meet Dr. Kalyan Das (BDS), see clinic hours and contact details, and request an appointment.';

export function SEOHead({ seo, clinicName, socialImageUrl, isDraftPreview = false }: SEOHeadProps) {
  useEffect(() => {
    const candidateTitle = seo.title.trim();
    const fullTitle =
      candidateTitle.length > 0 &&
      candidateTitle.length <= 60 &&
      !/https?:\/\//i.test(candidateTitle)
        ? candidateTitle
        : clinicName === 'Chakdaha Dental Clinic'
          ? DEFAULT_SEO_TITLE
          : clinicName;
    const description =
      /https?:\/\//i.test(seo.description) || /placeholder|demo/i.test(seo.description)
        ? DEFAULT_SEO_DESCRIPTION
        : seo.description;

    document.title = isDraftPreview ? `[PREVIEW] ${fullTitle}` : fullTitle;

    function setMeta(name: string, content: string, isProperty = false) {
      const attr = isProperty ? 'property' : 'name';
      let element = document.querySelector(`meta[${attr}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attr, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content);
    }

    setMeta('description', description);
    setMeta('robots', isDraftPreview ? 'noindex, nofollow' : 'index, follow');
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', description, true);
    setMeta('og:type', 'website', true);
    if (socialImageUrl) {
      setMeta('og:image', socialImageUrl, true);
    } else {
      document.querySelector('meta[property="og:image"]')?.remove();
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', window.location.origin + (seo.canonicalPath || '/'));
  }, [seo, clinicName, socialImageUrl, isDraftPreview]);

  return null;
}
