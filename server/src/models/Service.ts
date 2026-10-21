import { Schema, model, type HydratedDocument, type InferSchemaType, type Types } from 'mongoose';

const serviceSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 120, trim: true },
    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 80,
    },
    shortDescription: { type: String, required: true, maxlength: 240 },
    description: { type: String, default: '', maxlength: 5000 },
    category: { type: String, required: true, maxlength: 80 },
    priceType: {
      type: String,
      enum: ['fixed', 'starting_at', 'range', 'quote'],
      required: true,
    },
    price: { type: Number, default: null },
    minPrice: { type: Number, default: null },
    maxPrice: { type: Number, default: null },
    currency: { type: String, enum: ['INR'], required: true, default: 'INR' },
    imageMediaId: { type: Schema.Types.ObjectId, ref: 'MediaAsset', default: null },
    isFeatured: { type: Boolean, required: true, default: false },
    isPublished: { type: Boolean, required: true, default: false },
    displayOrder: { type: Number, required: true, default: 0 },
    seoTitle: { type: String, default: null, maxlength: 70 },
    seoDescription: { type: String, default: null, maxlength: 180 },
  },
  { timestamps: true },
);

serviceSchema.index({ slug: 1 }, { unique: true });
serviceSchema.index({ isPublished: 1, displayOrder: 1, createdAt: -1 });
serviceSchema.index({ category: 1, isPublished: 1 });

export type Service = InferSchemaType<typeof serviceSchema> & { _id: Types.ObjectId };
export type ServiceDocument = HydratedDocument<Service>;

export const ServiceModel = model('Service', serviceSchema);
