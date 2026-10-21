import { z } from 'zod';
import { objectIdStringSchema, urlPathSchema } from './common.js';
import { sectionSchema } from './sections.js';
import { DEFAULT_THEME, themeSchema } from './theme.js';

export const WEBSITE_SCHEMA_VERSION = 1 as const;

export const navigationItemSchema = z.object({
  id: z.string().min(1).max(64),
  label: z.string().min(1).max(80),
  href: urlPathSchema,
  visible: z.boolean(),
});

export const dentistProfileSchema = z.object({
  name: z.string().min(1).max(120),
  title: z.string().max(120),
  bio: z.string().max(4000),
  portraitMediaId: objectIdStringSchema.nullable(),
  qualifications: z.array(z.string().min(1).max(200)).max(20),
  specializations: z.array(z.string().min(1).max(120)).max(20),
});

export const openingHoursDaySchema = z.object({
  day: z.enum(['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']),
  closed: z.boolean(),
  open: z.string().max(16).nullable(),
  close: z.string().max(16).nullable(),
});

export const contactInfoSchema = z.object({
  phone: z.string().min(1).max(40),
  email: z.string().email().max(254),
  whatsapp: z.string().max(40).nullable(),
  addressLine1: z.string().min(1).max(200),
  addressLine2: z.string().max(200).nullable(),
  city: z.string().min(1).max(100),
  state: z.string().min(1).max(100),
  postalCode: z.string().min(1).max(20),
  country: z.string().min(1).max(100),
});

export const clinicSchema = z.object({
  name: z.string().min(1).max(160),
  tagline: z.string().max(240),
  logoMediaId: objectIdStringSchema.nullable(),
  faviconMediaId: objectIdStringSchema.nullable(),
  dentist: dentistProfileSchema,
  contact: contactInfoSchema,
  openingHours: z.array(openingHoursDaySchema).length(7),
});

export const footerSchema = z.object({
  aboutText: z.string().max(500),
  policyLinks: z
    .array(
      z.object({
        label: z.string().min(1).max(80),
        href: urlPathSchema,
      }),
    )
    .max(10),
  socialLinks: z
    .array(
      z.object({
        label: z.string().min(1).max(40),
        href: z.string().url().max(500),
      }),
    )
    .max(10),
});

export const seoSchema = z.object({
  title: z.string().min(1).max(70),
  description: z.string().min(1).max(180),
  socialImageMediaId: objectIdStringSchema.nullable(),
  canonicalPath: z.string().min(1).max(200).default('/'),
});

export const websiteSnapshotSchema = z.object({
  schemaVersion: z.literal(WEBSITE_SCHEMA_VERSION),
  theme: themeSchema,
  navigation: z.array(navigationItemSchema).max(20),
  sections: z.array(sectionSchema).min(1).max(30),
  footer: footerSchema,
  seo: seoSchema,
});

export type WebsiteSnapshot = z.infer<typeof websiteSnapshotSchema>;
export type ClinicInfo = z.infer<typeof clinicSchema>;
export type NavigationItem = z.infer<typeof navigationItemSchema>;

export const DEFAULT_CLINIC: ClinicInfo = {
  name: 'Placeholder Dental Clinic',
  tagline: 'Calm, careful dentistry for your family — demo content',
  logoMediaId: null,
  faviconMediaId: null,
  dentist: {
    name: 'Dr. Placeholder Name',
    title: 'General Dentist (demo)',
    bio: 'This is placeholder biography text for development. Replace with verified qualifications and experience before publishing.',
    portraitMediaId: null,
    qualifications: ['[Placeholder] BDS — replace with verified credential'],
    specializations: ['General dentistry (placeholder)'],
  },
  contact: {
    phone: '+91 00000 00000',
    email: 'hello@example.com',
    whatsapp: null,
    addressLine1: '123 Demo Street',
    addressLine2: null,
    city: 'Your City',
    state: 'Your State',
    postalCode: '000000',
    country: 'India',
  },
  openingHours: [
    { day: 'monday', closed: false, open: '10:00', close: '19:00' },
    { day: 'tuesday', closed: false, open: '10:00', close: '19:00' },
    { day: 'wednesday', closed: false, open: '10:00', close: '19:00' },
    { day: 'thursday', closed: false, open: '10:00', close: '19:00' },
    { day: 'friday', closed: false, open: '10:00', close: '19:00' },
    { day: 'saturday', closed: false, open: '10:00', close: '14:00' },
    { day: 'sunday', closed: true, open: null, close: null },
  ],
};

export function createDefaultWebsiteSnapshot(): WebsiteSnapshot {
  return {
    schemaVersion: WEBSITE_SCHEMA_VERSION,
    theme: DEFAULT_THEME,
    navigation: [
      { id: 'nav-services', label: 'Services', href: '#services', visible: true },
      { id: 'nav-dentist', label: 'Dentist', href: '#dentist', visible: true },
      { id: 'nav-reviews', label: 'Reviews', href: '#reviews', visible: true },
      { id: 'nav-contact', label: 'Contact', href: '#contact', visible: true },
      { id: 'nav-appointments', label: 'Book', href: '#appointment', visible: true },
    ],
    sections: [
      {
        id: 'section-header',
        type: 'header',
        enabled: true,
        layoutVariant: 'simple',
        settings: {
          showLogo: true,
          showCta: true,
          cta: { label: 'Request appointment', href: '#appointment' },
        },
      },
      {
        id: 'section-hero',
        type: 'hero',
        enabled: true,
        layoutVariant: 'split',
        settings: {
          headline: 'Gentle dental care in a calm clinic setting',
          subtitle:
            'Placeholder demo site. Replace this copy, imagery, and credentials before going live.',
          imageMediaId: null,
          primaryCta: { label: 'Request appointment', href: '#appointment' },
          secondaryCta: { label: 'View services', href: '#services' },
        },
      },
      {
        id: 'section-trust',
        type: 'trust',
        enabled: true,
        layoutVariant: 'row',
        settings: {
          heading: 'Clinic information',
          items: [
            { label: 'Hours', detail: 'Mon–Fri 10:00–19:00 (placeholder)' },
            { label: 'Location', detail: 'Your City, India (placeholder)' },
            { label: 'Languages', detail: 'Replace with verified info' },
          ],
        },
      },
      {
        id: 'section-services',
        type: 'services',
        enabled: true,
        layoutVariant: 'cards',
        settings: {
          heading: 'Services & pricing',
          description: 'Published services appear here. Prices are managed in the admin dashboard.',
          showPricing: true,
          featuredOnly: false,
        },
      },
      {
        id: 'section-dentist',
        type: 'dentist',
        enabled: true,
        layoutVariant: 'portraitLeft',
        settings: {
          heading: 'Meet the dentist',
          showQualifications: true,
          showSpecializations: true,
        },
      },
      {
        id: 'section-why',
        type: 'whyChooseUs',
        enabled: true,
        layoutVariant: 'grid',
        settings: {
          heading: 'Why visit us',
          description: 'Placeholder reasons — edit in the admin dashboard.',
          items: [
            {
              title: 'Calm environment',
              description: 'Placeholder: describe the clinic atmosphere.',
            },
            {
              title: 'Clear communication',
              description: 'Placeholder: describe how treatment options are explained.',
            },
            {
              title: 'Family-friendly care',
              description: 'Placeholder: describe patient focus areas.',
            },
          ],
        },
      },
      {
        id: 'section-reviews',
        type: 'reviews',
        enabled: true,
        layoutVariant: 'cards',
        settings: {
          heading: 'Patient feedback',
          description: 'Only moderated, approved reviews are shown publicly.',
          allowPublicSubmission: true,
        },
      },
      {
        id: 'section-gallery',
        type: 'gallery',
        enabled: true,
        layoutVariant: 'grid',
        settings: {
          heading: 'Clinic gallery',
          description: 'Upload clinic photographs from the media manager.',
          mediaIds: [],
        },
      },
      {
        id: 'section-appointment',
        type: 'appointment',
        enabled: true,
        layoutVariant: 'split',
        settings: {
          heading: 'Request an appointment',
          description:
            'Submit a request and the clinic will confirm manually. This is not an online booking engine.',
          successMessage: 'Thank you. We will contact you to confirm your appointment.',
        },
      },
      {
        id: 'section-contact',
        type: 'contact',
        enabled: true,
        layoutVariant: 'split',
        settings: {
          heading: 'Contact & hours',
          showMap: true,
          showWhatsApp: true,
          mapEmbedUrl: null,
        },
      },
      {
        id: 'section-footer',
        type: 'footer',
        enabled: true,
        layoutVariant: 'simple',
        settings: {
          showPolicies: true,
          showSocial: true,
          copyrightText: '© Placeholder Dental Clinic — demo content',
        },
      },
    ],
    footer: {
      aboutText: 'Placeholder footer text for the dental clinic website demo.',
      policyLinks: [
        { label: 'Privacy', href: '/privacy' },
        { label: 'Terms', href: '/terms' },
      ],
      socialLinks: [],
    },
    seo: {
      title: 'Placeholder Dental Clinic',
      description:
        'Demo dental clinic website. Replace SEO title, description, and social image before publishing.',
      socialImageMediaId: null,
      canonicalPath: '/',
    },
  };
}
