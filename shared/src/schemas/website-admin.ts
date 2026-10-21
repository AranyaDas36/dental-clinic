import { z } from 'zod';
import { clinicSchema, websiteSnapshotSchema } from './website.js';

export const websiteDraftUpdateSchema = z.object({
  expectedDraftVersion: z.number().int().min(0),
  clinic: clinicSchema,
  draft: websiteSnapshotSchema,
});

export const websitePublishSchema = z.object({
  expectedDraftVersion: z.number().int().min(0),
  changeSummary: z.string().max(500).optional(),
});

export type WebsiteDraftUpdate = z.infer<typeof websiteDraftUpdateSchema>;
export type WebsitePublishInput = z.infer<typeof websitePublishSchema>;
