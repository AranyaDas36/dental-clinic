import 'dotenv/config';
import path from 'node:path';
import dotenv from 'dotenv';

dotenv.config({ path: path.resolve(import.meta.dirname, '../../../.env') });
import {
  createDefaultWebsiteSnapshot,
  DEFAULT_CLINIC,
  websiteSnapshotSchema,
} from '@dental/shared';
import { loadEnvForBoot } from '../config/env.js';
import { connectDatabase, disconnectDatabase } from '../config/db.js';
import { WebsiteConfigModel } from '../models/WebsiteConfig.js';
import { ServiceModel } from '../models/Service.js';
import { ReviewModel } from '../models/Review.js';
import { publishWebsite } from '../services/website.service.js';
import { AdminUserModel } from '../models/AdminUser.js';
import { logger } from '../utils/logger.js';

async function main() {
  const env = loadEnvForBoot();
  if (env.NODE_ENV === 'production') {
    throw new Error('Demo seeding is disabled in production');
  }
  await connectDatabase();

  const admin = await AdminUserModel.findOne({ isActive: true });
  if (!admin) {
    throw new Error('Create an administrator with pnpm seed:admin before seeding demo content');
  }

  const draft = websiteSnapshotSchema.parse(createDefaultWebsiteSnapshot());

  const config = await WebsiteConfigModel.findOneAndUpdate(
    { key: 'primary' },
    {
      $set: {
        clinic: DEFAULT_CLINIC,
        draft,
        updatedBy: admin._id,
      },
      $setOnInsert: {
        key: 'primary',
        draftVersion: 0,
        activeRevisionId: null,
      },
    },
    { upsert: true, new: true },
  );

  // Ensure draftVersion is readable after upsert edge cases.
  const fresh = await WebsiteConfigModel.findById(config._id);
  if (!fresh) {
    throw new Error('Failed to load website config after seed');
  }

  await ServiceModel.deleteMany({ slug: { $in: ['placeholder-checkup', 'placeholder-cleaning'] } });
  await ServiceModel.create([
    {
      name: 'Placeholder Check-up',
      slug: 'placeholder-checkup',
      shortDescription: 'Demo service — replace with real pricing before publish.',
      description:
        'This is placeholder service content for development. Do not present as a real offer.',
      category: 'General',
      priceType: 'starting_at',
      price: null,
      minPrice: 500,
      maxPrice: null,
      currency: 'INR',
      imageMediaId: null,
      isFeatured: true,
      isPublished: true,
      displayOrder: 1,
      seoTitle: 'Placeholder Check-up',
      seoDescription: 'Demo dental service listing',
    },
    {
      name: 'Placeholder Cleaning',
      slug: 'placeholder-cleaning',
      shortDescription: 'Demo cleaning service with quote-based pricing.',
      description: 'Placeholder description for a cleaning service.',
      category: 'Hygiene',
      priceType: 'quote',
      price: null,
      minPrice: null,
      maxPrice: null,
      currency: 'INR',
      imageMediaId: null,
      isFeatured: false,
      isPublished: true,
      displayOrder: 2,
      seoTitle: null,
      seoDescription: null,
    },
  ]);

  // Clear previous demo pending review noise for idempotent local seeding.
  await ReviewModel.deleteMany({ displayName: 'Demo Patient' });
  await ReviewModel.create({
    displayName: 'Demo Patient',
    rating: 5,
    message:
      'Placeholder review awaiting moderation. Approved reviews only appear on the public site.',
    status: 'pending',
  });

  const published = await publishWebsite(admin._id.toString(), {
    expectedDraftVersion: fresh.draftVersion,
    changeSummary: 'Seeded placeholder demo content',
  });

  logger.info(
    {
      clinicName: DEFAULT_CLINIC.name,
      revisionVersion: published.version,
      note: 'All seeded content is placeholder and must be replaced before production use.',
    },
    'Demo content seeded and published',
  );

  await disconnectDatabase();
}

main().catch(async (error) => {
  logger.fatal({ err: error }, 'seed:demo failed');
  try {
    await disconnectDatabase();
  } catch {
    // ignore
  }
  process.exit(1);
});
