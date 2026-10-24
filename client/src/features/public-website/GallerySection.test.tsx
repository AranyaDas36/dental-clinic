import { fireEvent, render, screen, within } from '@testing-library/react';
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

  it('shows an elegant empty state when no photos are selected', () => {
    render(
      <GallerySection
        settings={{ heading: 'Clinic photos', description: '', mediaIds: [] }}
        media={{}}
      />,
    );

    expect(screen.getByRole('heading', { name: 'Clinic photos coming soon' })).toBeInTheDocument();
  });

  it('uses the clinic gallery heading and a calm empty state without upload instructions', () => {
    render(
      <GallerySection
        settings={{
          heading: 'Old heading',
          description: 'Upload clinic photographs from the media manager.',
          mediaIds: [],
        }}
        media={{}}
      />,
    );

    expect(screen.getByRole('heading', { name: 'A look inside our clinic' })).toBeInTheDocument();
    expect(screen.getByText('Our clinic')).toBeInTheDocument();
    expect(screen.getByText('Clinic photos coming soon')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Modern equipment, a clean environment, and a team that puts your comfort first.',
      ),
    ).toBeInTheDocument();
    expect(screen.queryByText(/Upload clinic photographs/)).not.toBeInTheDocument();
  });

  it('opens a keyboard-accessible lightbox and navigates between selected photos', () => {
    render(
      <GallerySection
        settings={{
          heading: 'Clinic photos',
          description: '',
          mediaIds: ['media-1', 'media-2'],
        }}
        media={{
          'media-1': {
            url: 'https://res.cloudinary.com/example/image/upload/clinic-1.jpg',
            altText: 'Reception',
            caption: 'Reception',
          },
          'media-2': {
            url: 'https://res.cloudinary.com/example/image/upload/clinic-2.jpg',
            altText: 'Treatment room',
            caption: 'Treatment room',
          },
        }}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: 'View photo: Reception' }));

    const dialog = screen.getByRole('dialog', { name: 'Clinic photo viewer' });
    expect(dialog).toBeInTheDocument();
    expect(within(dialog).getByRole('img', { name: 'Reception' })).toBeInTheDocument();
    expect(screen.getByText('1 / 2')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowRight' });
    expect(within(dialog).getByRole('img', { name: 'Treatment room' })).toBeInTheDocument();
    expect(screen.getByText('2 / 2')).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'ArrowLeft' });
    expect(within(dialog).getByRole('img', { name: 'Reception' })).toBeInTheDocument();

    fireEvent.touchStart(dialog, {
      touches: [{ identifier: 1, target: dialog, clientX: 220, clientY: 100 }],
    });
    fireEvent.touchEnd(dialog, {
      changedTouches: [{ identifier: 1, target: dialog, clientX: 120, clientY: 100 }],
    });
    expect(within(dialog).getByRole('img', { name: 'Treatment room' })).toBeInTheDocument();

    fireEvent.keyDown(window, { key: 'Escape' });
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('shows six photos initially and expands the remaining selected photos', () => {
    const mediaIds = Array.from({ length: 7 }, (_, index) => `media-${index + 1}`);
    const media = Object.fromEntries(
      mediaIds.map((id, index) => [
        id,
        {
          url: `https://res.cloudinary.com/example/image/upload/clinic-${index + 1}.jpg`,
          altText: `Clinic photo ${index + 1}`,
          caption: '',
        },
      ]),
    );

    render(
      <GallerySection
        settings={{ heading: 'Clinic photos', description: '', mediaIds }}
        media={media}
      />,
    );

    expect(screen.getAllByRole('button', { name: /^View photo:/ })).toHaveLength(6);
    fireEvent.click(screen.getByRole('button', { name: 'View all photos' }));
    expect(screen.getAllByRole('button', { name: /^View photo:/ })).toHaveLength(7);
    expect(screen.getByRole('button', { name: 'Show fewer photos' })).toBeInTheDocument();
  });
});
