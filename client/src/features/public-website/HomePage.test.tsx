import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_CLINIC } from '@dental/shared';
import { HomePage } from './HomePage';

afterEach(() => {
  document.documentElement.classList.remove('clinic-home-pending');
});

const { mockSnapshot } = vi.hoisted(() => {
  return {
    mockSnapshot: {
      schemaVersion: 1 as const,
      theme: {
        colors: {
          primary: '#5F7A6A',
          secondary: '#3D5A5B',
          accent: '#C4A484',
          background: '#F7F4EF',
          surface: '#FFFFFF',
          text: '#2C2C2C',
          mutedText: '#5C5C5C',
        },
        fonts: {
          heading: 'Fraunces' as const,
          body: 'Source Sans 3' as const,
        },
        buttonStyle: 'solid' as const,
        cornerRadiusPx: 10,
        cardRadiusPx: 16,
        cardShadow: 'sm' as const,
        contentWidth: 'default' as const,
        sectionSpacing: 'comfortable' as const,
      },
      navigation: [
        { id: 'nav-services', label: 'Services', href: '#services', visible: true },
        { id: 'nav-dentist', label: 'Dentist', href: '#dentist', visible: true },
        { id: 'nav-reviews', label: 'Reviews', href: '#reviews', visible: true },
        { id: 'nav-contact', label: 'Contact', href: '#contact', visible: true },
      ],
      sections: [
        {
          id: 'section-header',
          type: 'header' as const,
          enabled: true,
          layoutVariant: 'simple',
          settings: { showLogo: true, showCta: true, cta: { label: 'Book', href: '#appointment' } },
        },
        {
          id: 'section-hero',
          type: 'hero' as const,
          enabled: true,
          layoutVariant: 'split',
          settings: {
            headline: 'Gentle dental care in a calm clinic setting',
            subtitle: 'Welcoming new patients for complete dental care',
            imageMediaId: null,
            primaryCta: { label: 'Request appointment', href: '#appointment' },
          },
        },
        {
          id: 'section-trust',
          type: 'trust' as const,
          enabled: true,
          layoutVariant: 'row',
          settings: {
            heading: 'Clinic Highlights',
            items: [{ label: 'Location', detail: 'Main Street' }],
          },
        },
        {
          id: 'section-services',
          type: 'services' as const,
          enabled: true,
          layoutVariant: 'cards',
          settings: {
            heading: 'Services & pricing',
            description: 'Transparent pricing list',
            showPricing: true,
            featuredOnly: false,
          },
        },
        {
          id: 'section-dentist',
          type: 'dentist' as const,
          enabled: true,
          layoutVariant: 'portraitLeft',
          settings: {
            heading: 'Meet your dentist',
            showQualifications: true,
            showSpecializations: true,
          },
        },
        {
          id: 'section-reviews',
          type: 'reviews' as const,
          enabled: true,
          layoutVariant: 'cards',
          settings: {
            heading: 'Patient feedback',
            description: 'Approved reviews only',
            allowPublicSubmission: true,
          },
        },
        {
          id: 'section-appointment',
          type: 'appointment' as const,
          enabled: true,
          layoutVariant: 'split',
          settings: {
            heading: 'Request an appointment',
            description: 'Clinic confirms manually',
            successMessage: 'Thank you!',
          },
        },
        {
          id: 'section-contact',
          type: 'contact' as const,
          enabled: true,
          layoutVariant: 'split',
          settings: {
            heading: 'Contact & hours',
            showMap: false,
            showWhatsApp: true,
            mapEmbedUrl: null,
          },
        },
        {
          id: 'section-footer',
          type: 'footer' as const,
          enabled: true,
          layoutVariant: 'simple',
          settings: {
            showPolicies: true,
            showSocial: false,
            copyrightText: '© Demo Clinic',
          },
        },
      ],
      footer: {
        aboutText: 'Demo clinic footer',
        policyLinks: [{ label: 'Privacy', href: '/privacy' }],
        socialLinks: [],
      },
      seo: {
        title: 'Demo Dental Clinic',
        description: 'Comprehensive dental care in a calm setting',
        socialImageMediaId: null,
        canonicalPath: '/',
      },
    },
  };
});

vi.mock('@/api/public', () => ({
  fetchPublicWebsite: vi.fn().mockResolvedValue({
    clinic: DEFAULT_CLINIC,
    snapshot: mockSnapshot,
    version: 1,
    publishedAt: new Date().toISOString(),
  }),
  fetchPublicServices: vi.fn().mockResolvedValue({
    items: [
      {
        id: 'srv-1',
        name: 'Comprehensive Check-up',
        slug: 'comprehensive-checkup',
        shortDescription: 'Full oral exam and gentle clean',
        description: 'Complete diagnostic check-up',
        category: 'General',
        priceType: 'starting_at',
        price: null,
        minPrice: 500,
        maxPrice: null,
        currency: 'INR',
        imageMediaId: null,
        isFeatured: true,
        isPublished: true,
        displayOrder: 1,
        seoTitle: null,
        seoDescription: null,
      },
    ],
  }),
  fetchPublicReviews: vi.fn().mockResolvedValue({
    items: [
      {
        id: 'rev-1',
        displayName: 'Aarav K.',
        rating: 5,
        message: 'Very gentle and thorough examination. Clinic feels very calm.',
        adminResponse: 'Thank you Aarav, we appreciate your trust.',
        createdAt: new Date().toISOString(),
      },
    ],
  }),
  submitPublicAppointment: vi.fn(),
  submitPublicReview: vi.fn(),
}));

function renderWithQuery(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(<QueryClientProvider client={queryClient}>{ui}</QueryClientProvider>);
}

describe('HomePage', () => {
  it('renders published clinic branding, navigation, and hero headline', async () => {
    renderWithQuery(<HomePage />);

    const brandLinks = await screen.findAllByText(DEFAULT_CLINIC.name);
    expect(brandLinks.length).toBeGreaterThan(0);
    expect(
      screen.getByRole('heading', {
        name: /Dr\. Kalyan Das.*Dentist in Lalpur, Chakdah/i,
      }),
    ).toBeInTheDocument();
    expect(document.querySelector('.hero-illustration')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByText('Clinic Highlights')).not.toBeInTheDocument();
  });

  it('renders published services with INR pricing', async () => {
    renderWithQuery(<HomePage />);

    expect(
      await screen.findByRole('heading', { name: 'Comprehensive Check-up' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Starting from')).toBeInTheDocument();
    expect(screen.getByText('₹500')).toBeInTheDocument();
  });

  it('renders approved patient reviews and clinic response', async () => {
    renderWithQuery(<HomePage />);

    expect(await screen.findByText('Aarav K.')).toBeInTheDocument();
    const reviewQuotes = await screen.findAllByText(/Very gentle and thorough examination/i);
    expect(reviewQuotes.length).toBeGreaterThan(0);
    expect(screen.getByText(/Thank you Aarav, we appreciate your trust./i)).toBeInTheDocument();
  });

  it('renders appointment request form', async () => {
    renderWithQuery(<HomePage />);

    expect(
      await screen.findByRole('heading', { name: 'Request Consultation' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Appointment Request/i })).toBeInTheDocument();
  });
});
