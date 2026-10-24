import { useEffect } from 'react';
import type { WebsiteSnapshot } from '@dental/shared';

interface SEOHeadProps {
  seo: WebsiteSnapshot['seo'];
  clinicName: string;
  socialImageUrl?: string | null;
  isDraftPreview?: boolean;
}

export function SEOHead({ seo, clinicName, socialImageUrl, isDraftPreview = false }: SEOHeadProps) {
  useEffect(() => {
    const fullTitle = seo.title || clinicName;

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

    setMeta('description', seo.description);
    setMeta('robots', isDraftPreview ? 'noindex, nofollow' : 'index, follow');
    setMeta('og:title', fullTitle, true);
    setMeta('og:description', seo.description, true);
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
