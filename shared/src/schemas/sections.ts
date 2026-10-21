import { z } from 'zod';
import { SECTION_LAYOUT_VARIANTS } from '../constants/sections.js';
import { objectIdStringSchema } from './common.js';

const ctaSchema = z.object({
  label: z.string().min(1).max(80),
  href: z.string().min(1).max(500),
});

const baseSectionSchema = z.object({
  id: z.string().min(1).max(64),
  enabled: z.boolean(),
});

export const headerSectionSchema = baseSectionSchema.extend({
  type: z.literal('header'),
  layoutVariant: z.enum(SECTION_LAYOUT_VARIANTS.header),
  settings: z.object({
    showLogo: z.boolean(),
    showCta: z.boolean(),
    cta: ctaSchema.optional(),
  }),
});

export const heroSectionSchema = baseSectionSchema.extend({
  type: z.literal('hero'),
  layoutVariant: z.enum(SECTION_LAYOUT_VARIANTS.hero),
  settings: z.object({
    headline: z.string().min(1).max(160),
    subtitle: z.string().max(400),
    imageMediaId: objectIdStringSchema.nullable(),
    primaryCta: ctaSchema,
    secondaryCta: ctaSchema.optional(),
  }),
});

export const trustSectionSchema = baseSectionSchema.extend({
  type: z.literal('trust'),
  layoutVariant: z.enum(SECTION_LAYOUT_VARIANTS.trust),
  settings: z.object({
    heading: z.string().max(120),
    items: z
      .array(
        z.object({
          label: z.string().min(1).max(80),
          detail: z.string().max(160),
        }),
      )
      .max(8),
  }),
});

export const servicesSectionSchema = baseSectionSchema.extend({
  type: z.literal('services'),
  layoutVariant: z.enum(SECTION_LAYOUT_VARIANTS.services),
  settings: z.object({
    heading: z.string().min(1).max(120),
    description: z.string().max(400),
    showPricing: z.boolean(),
    featuredOnly: z.boolean(),
  }),
});

export const dentistSectionSchema = baseSectionSchema.extend({
  type: z.literal('dentist'),
  layoutVariant: z.enum(SECTION_LAYOUT_VARIANTS.dentist),
  settings: z.object({
    heading: z.string().min(1).max(120),
    showQualifications: z.boolean(),
    showSpecializations: z.boolean(),
  }),
});

export const whyChooseUsSectionSchema = baseSectionSchema.extend({
  type: z.literal('whyChooseUs'),
  layoutVariant: z.enum(SECTION_LAYOUT_VARIANTS.whyChooseUs),
  settings: z.object({
    heading: z.string().min(1).max(120),
    description: z.string().max(400),
    items: z
      .array(
        z.object({
          title: z.string().min(1).max(100),
          description: z.string().max(300),
        }),
      )
      .max(8),
  }),
});

export const reviewsSectionSchema = baseSectionSchema.extend({
  type: z.literal('reviews'),
  layoutVariant: z.enum(SECTION_LAYOUT_VARIANTS.reviews),
  settings: z.object({
    heading: z.string().min(1).max(120),
    description: z.string().max(400),
    allowPublicSubmission: z.boolean(),
  }),
});

export const gallerySectionSchema = baseSectionSchema.extend({
  type: z.literal('gallery'),
  layoutVariant: z.enum(SECTION_LAYOUT_VARIANTS.gallery),
  settings: z.object({
    heading: z.string().min(1).max(120),
    description: z.string().max(400),
    mediaIds: z.array(objectIdStringSchema).max(40),
  }),
});

export const appointmentSectionSchema = baseSectionSchema.extend({
  type: z.literal('appointment'),
  layoutVariant: z.enum(SECTION_LAYOUT_VARIANTS.appointment),
  settings: z.object({
    heading: z.string().min(1).max(120),
    description: z.string().max(500),
    successMessage: z.string().min(1).max(300),
  }),
});

export const contactSectionSchema = baseSectionSchema.extend({
  type: z.literal('contact'),
  layoutVariant: z.enum(SECTION_LAYOUT_VARIANTS.contact),
  settings: z.object({
    heading: z.string().min(1).max(120),
    showMap: z.boolean(),
    showWhatsApp: z.boolean(),
    mapEmbedUrl: z.string().max(1000).nullable(),
  }),
});

export const footerSectionSchema = baseSectionSchema.extend({
  type: z.literal('footer'),
  layoutVariant: z.enum(SECTION_LAYOUT_VARIANTS.footer),
  settings: z.object({
    showPolicies: z.boolean(),
    showSocial: z.boolean(),
    copyrightText: z.string().max(200),
  }),
});

export const sectionSchema = z.discriminatedUnion('type', [
  headerSectionSchema,
  heroSectionSchema,
  trustSectionSchema,
  servicesSectionSchema,
  dentistSectionSchema,
  whyChooseUsSectionSchema,
  reviewsSectionSchema,
  gallerySectionSchema,
  appointmentSectionSchema,
  contactSectionSchema,
  footerSectionSchema,
]);

export type WebsiteSection = z.infer<typeof sectionSchema>;
