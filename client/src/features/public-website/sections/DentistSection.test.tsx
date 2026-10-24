import { render, screen } from '@testing-library/react';
import { DEFAULT_CLINIC } from '@dental/shared';
import { describe, expect, it } from 'vitest';
import { DentistSection } from './DentistSection';

describe('DentistSection', () => {
  it('renders the selected portrait from the resolved media map', () => {
    render(
      <DentistSection
        dentist={{ ...DEFAULT_CLINIC.dentist, name: 'Dr. Example', portraitMediaId: 'portrait-1' }}
        media={{
          'portrait-1': {
            url: 'https://example.com/dentist.jpg',
            altText: 'Dentist portrait',
            caption: '',
          },
        }}
        settings={{
          heading: 'Meet the dentist',
          showQualifications: true,
          showSpecializations: true,
        }}
      />,
    );

    expect(screen.getByRole('img', { name: 'Dentist portrait' })).toHaveAttribute(
      'src',
      'https://example.com/dentist.jpg',
    );
  });
});
