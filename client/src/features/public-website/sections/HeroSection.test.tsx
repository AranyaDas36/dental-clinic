import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { HeroSection } from './HeroSection';

describe('HeroSection', () => {
  it('renders a decorative, theme-token-driven illustration when no hero image is selected', () => {
    const { container } = render(
      <HeroSection
        settings={{
          headline: 'A healthier smile starts here',
          subtitle: 'Thoughtful dental care.',
          imageMediaId: null,
          primaryCta: { label: 'Book a visit', href: '#appointment' },
        }}
        media={{}}
      />,
    );

    const illustration = container.querySelector('.hero-illustration');
    expect(illustration).toHaveAttribute('aria-hidden', 'true');
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(container.querySelector('.hero-paste-float')).toBeInTheDocument();
    expect(container.querySelector('.hero-mirror-float')).toBeInTheDocument();
    expect(container.querySelector('stop[stop-color*="--color-primary"]')).toBeInTheDocument();
  });

  it('shows the selected clinic image instead of the illustration', () => {
    render(
      <HeroSection
        settings={{
          headline: 'A healthier smile starts here',
          subtitle: 'Thoughtful dental care.',
          imageMediaId: 'hero-image',
          primaryCta: { label: 'Book a visit', href: '#appointment' },
        }}
        media={{
          'hero-image': {
            url: 'https://example.com/clinic.jpg',
            altText: 'Clinic interior',
            caption: '',
          },
        }}
      />,
    );

    expect(screen.getByRole('img', { name: 'Clinic interior' })).toHaveAttribute(
      'src',
      'https://example.com/clinic.jpg',
    );
    expect(document.querySelector('.hero-illustration')).not.toBeInTheDocument();
  });
});
