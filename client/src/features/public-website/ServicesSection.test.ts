import { describe, expect, it } from 'vitest';
import type { PublicServiceItem } from '@/api/public';
import { formatPrice } from './sections/ServicesSection';

function service(overrides: Partial<PublicServiceItem> = {}): PublicServiceItem {
  return {
    id: 'service-1',
    name: 'Dental service',
    slug: 'dental-service',
    shortDescription: 'Service summary',
    description: '',
    category: 'General',
    priceType: 'fixed',
    price: 2000,
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
    ...overrides,
  };
}

describe('formatPrice', () => {
  it('formats fixed prices with Indian grouping', () => {
    expect(formatPrice(service({ price: 200000 }))).toBe('₹2,00,000');
  });

  it('formats price ranges', () => {
    expect(
      formatPrice(service({ priceType: 'range', price: null, minPrice: 1000, maxPrice: 2000 })),
    ).toBe('₹1,000 – ₹2,000');
  });

  it('uses a contact message for price-on-request services', () => {
    expect(
      formatPrice(service({ priceType: 'quote', price: null, minPrice: null, maxPrice: null })),
    ).toBe('Contact for pricing');
  });

  it('does not render malformed or contradictory price values', () => {
    expect(formatPrice(service({ price: Number.NaN }))).toBe('Contact for pricing');
    expect(
      formatPrice(service({ priceType: 'range', price: null, minPrice: 2000, maxPrice: 1000 })),
    ).toBe('Contact for pricing');
  });
});
