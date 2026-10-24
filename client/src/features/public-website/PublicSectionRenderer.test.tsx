import { render, screen } from '@testing-library/react';
import { createDefaultWebsiteSnapshot, DEFAULT_CLINIC } from '@dental/shared';
import { describe, expect, it } from 'vitest';
import { PublicSectionRenderer } from './PublicSectionRenderer';

describe('PublicSectionRenderer', () => {
  it('uses the first visible gallery image as the dentist portrait when none is assigned', () => {
    const galleryImageId = '507f1f77bcf86cd799439011';
    const snapshot = createDefaultWebsiteSnapshot();
    snapshot.sections = snapshot.sections.map((section) =>
      section.type === 'gallery'
        ? {
            ...section,
            enabled: true,
            settings: { ...section.settings, mediaIds: [galleryImageId] },
          }
        : section,
    );

    render(
      <PublicSectionRenderer
        snapshot={snapshot}
        clinic={{
          ...DEFAULT_CLINIC,
          dentist: { ...DEFAULT_CLINIC.dentist, portraitMediaId: null },
        }}
        media={{
          [galleryImageId]: {
            url: 'https://example.com/dentist-at-clinic.jpg',
            altText: 'Dentist at clinic',
            caption: '',
          },
        }}
        services={[]}
        reviews={[]}
      />,
    );

    const portraitImages = screen.getAllByRole('img', { name: 'Dentist at clinic' });
    expect(portraitImages).toHaveLength(2);
    portraitImages.forEach((image) =>
      expect(image).toHaveAttribute('src', 'https://example.com/dentist-at-clinic.jpg'),
    );
  });
});
