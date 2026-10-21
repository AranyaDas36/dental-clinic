export const SECTION_TYPES = [
  'header',
  'hero',
  'trust',
  'services',
  'dentist',
  'whyChooseUs',
  'reviews',
  'gallery',
  'appointment',
  'contact',
  'footer',
] as const;

export type SectionType = (typeof SECTION_TYPES)[number];

export const SECTION_LAYOUT_VARIANTS = {
  header: ['simple', 'centered'],
  hero: ['split', 'overlay', 'stacked'],
  trust: ['row', 'grid'],
  services: ['cards', 'list', 'featured'],
  dentist: ['portraitLeft', 'portraitRight', 'stacked'],
  whyChooseUs: ['grid', 'list'],
  reviews: ['cards', 'carousel'],
  gallery: ['masonry', 'grid'],
  appointment: ['split', 'centered'],
  contact: ['split', 'stacked'],
  footer: ['simple', 'columns'],
} as const;

export type LayoutVariantFor<T extends SectionType> = (typeof SECTION_LAYOUT_VARIANTS)[T][number];
