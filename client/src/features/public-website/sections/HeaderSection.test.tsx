import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { DEFAULT_CLINIC } from '@dental/shared';
import { HeaderSection } from './HeaderSection';

describe('HeaderSection', () => {
  it('keeps appointment navigation without rendering a separate header CTA', () => {
    render(
      <HeaderSection
        clinic={DEFAULT_CLINIC}
        media={{}}
        navigation={[
          { id: 'services', label: 'Services', href: '#services', visible: true },
          { id: 'book', label: 'Book', href: '#appointment', visible: true },
        ]}
        settings={{ showLogo: true }}
      />,
    );

    expect(screen.getByRole('link', { name: 'Book' })).toHaveAttribute('href', '#appointment');
    expect(screen.queryByRole('link', { name: 'Request appointment' })).not.toBeInTheDocument();
  });
});
