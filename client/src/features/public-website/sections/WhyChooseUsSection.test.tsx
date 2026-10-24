import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { WhyChooseUsSection } from './WhyChooseUsSection';

const settings = {
  heading: 'Why visit us',
  description: 'A comfortable place to care for your smile.',
  items: [
    { title: 'Thoughtful care', description: 'Support tailored to your needs.' },
    { title: 'A welcoming space', description: 'A calm setting for every visit.' },
  ],
};

describe('WhyChooseUsSection', () => {
  it('renders the editorial feature cards and their content', () => {
    const { container } = render(<WhyChooseUsSection settings={settings} />);

    expect(screen.getByRole('heading', { name: /Why visit us/ })).toBeInTheDocument();
    expect(screen.getByText('A comfortable place to care for your smile.')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Thoughtful care' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'A welcoming space' })).toBeInTheDocument();
    expect(container.querySelectorAll('.why-visit-card')).toHaveLength(2);
    expect(container.querySelector('.why-visit-section')).toBeInTheDocument();
    expect(container.querySelector('.why-visit-heading')).toBeInTheDocument();
    expect(container.querySelector('.why-visit-icon')).toBeInTheDocument();
  });

  it('keeps the list layout available', () => {
    const { container } = render(<WhyChooseUsSection settings={settings} layoutVariant="list" />);

    expect(container.querySelectorAll('.why-visit-list-item')).toHaveLength(2);
    expect(container.querySelectorAll('.why-visit-card')).toHaveLength(0);
  });
});
