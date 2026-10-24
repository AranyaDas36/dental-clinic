import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { GallerySection } from './sections/GallerySection';

describe('GallerySection', () => {
  it('renders referenced uploaded images with their saved URLs', () => {
    render(
      <GallerySection
        settings={{ heading: 'Clinic photos', description: '', mediaIds: ['media-1'] }}
        media={{
          'media-1': {
            url: 'https://res.cloudinary.com/example/image/upload/clinic.jpg',
            altText: 'Clinic reception',
            caption: 'Reception',
          },
        }}
      />,
    );

    expect(screen.getByRole('img', { name: 'Clinic reception' })).toHaveAttribute(
      'src',
      'https://res.cloudinary.com/example/image/upload/clinic.jpg',
    );
    expect(screen.getByText('Reception')).toBeInTheDocument();
  });

  it('shows a neutral message when no photos are selected', () => {
    render(
      <GallerySection
        settings={{ heading: 'Clinic photos', description: '', mediaIds: [] }}
        media={{}}
      />,
    );

    expect(screen.getByText('No clinic photographs have been added.')).toBeInTheDocument();
  });
});
