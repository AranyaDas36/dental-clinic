import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import type { PublicServiceItem } from '@/api/public';
import { AppointmentSection } from './sections/AppointmentSection';
import { formatPrice, ServicesSection } from './sections/ServicesSection';

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

const settings = {
  heading: 'Services & pricing',
  description: 'Published services appear here. Prices are managed in the admin dashboard.',
  showPricing: true,
  featuredOnly: false,
};

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

describe('ServicesSection', () => {
  it('shows visitor-friendly content and the expanded root canal treatment name', () => {
    render(
      <ServicesSection
        services={[
          service({
            name: 'RCT',
            category: 'General Dentistry',
            shortDescription: 'Treatment for an infected or damaged tooth.',
            priceType: 'starting_at',
            price: null,
            minPrice: 2500,
          }),
        ]}
        settings={settings}
      />,
    );

    expect(
      screen.getByRole('heading', { name: 'Root Canal Treatment (RCT)' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Transparent pricing for every treatment, with no hidden costs.'))
      .toBeInTheDocument();
    expect(screen.queryByText(/managed in the admin dashboard/i)).not.toBeInTheDocument();
    expect(screen.getByText('Starting from')).toBeInTheDocument();
    expect(screen.getByText('₹2,500')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Book now: Root Canal Treatment (RCT)' })).toHaveAttribute(
      'href',
      '#appointment',
    );
    expect(screen.queryByRole('group', { name: 'Filter services by category' })).not.toBeInTheDocument();
  });

  it('filters services by their data-driven categories and preserves the booking callback', () => {
    const onSelectService = vi.fn();
    const generalService = service({
      id: 'general-service',
      name: 'Dental check-up',
      category: 'General Dentistry',
    });
    const cosmeticService = service({
      id: 'cosmetic-service',
      name: 'Teeth whitening',
      category: 'Cosmetic',
    });

    render(
      <ServicesSection
        services={[generalService, cosmeticService]}
        settings={settings}
        onSelectService={onSelectService}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'Cosmetic' }));
    expect(screen.getByRole('heading', { name: 'Teeth whitening' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Dental check-up' })).not.toBeInTheDocument();
    fireEvent.click(screen.getByRole('link', { name: 'Book now: Teeth whitening' }));
    expect(onSelectService).toHaveBeenCalledWith(cosmeticService);
  });

  it('shows service skeleton cards while data is loading', () => {
    render(<ServicesSection services={[]} settings={settings} isLoading />);

    expect(screen.getByRole('status', { name: 'Loading services' })).toHaveAttribute(
      'aria-busy',
      'true',
    );
    expect(screen.queryByText('No treatments are listed in this category yet.')).not.toBeInTheDocument();
  });
});

describe('AppointmentSection', () => {
  it('updates the selected treatment when a service is chosen after the form mounts', async () => {
    const props = {
      services: [service({ id: 'selected-service', name: 'Root Canal Treatment (RCT)' })],
      settings: {
        heading: 'Request an appointment',
        description: 'Contact the clinic to request an appointment.',
        successMessage: 'Thank you.',
      },
    };
    const { rerender, container } = render(<AppointmentSection {...props} />);

    rerender(<AppointmentSection {...props} preselectedServiceId="selected-service" />);

    await waitFor(() => {
      expect(container.querySelector('select')).toHaveValue('selected-service');
    });
  });
});
