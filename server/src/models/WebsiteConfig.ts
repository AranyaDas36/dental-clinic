import { Schema, model, type HydratedDocument, type InferSchemaType, type Types } from 'mongoose';

const openingHoursDaySchema = new Schema(
  {
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true,
    },
    closed: { type: Boolean, required: true },
    open: { type: String, default: null },
    close: { type: String, default: null },
  },
  { _id: false },
);

const clinicSchema = new Schema(
  {
    name: { type: String, required: true, maxlength: 160 },
    tagline: { type: String, default: '', maxlength: 240 },
    logoMediaId: { type: Schema.Types.ObjectId, ref: 'MediaAsset', default: null },
    faviconMediaId: { type: Schema.Types.ObjectId, ref: 'MediaAsset', default: null },
    dentist: {
      name: { type: String, required: true, maxlength: 120 },
      title: { type: String, default: '', maxlength: 120 },
      bio: { type: String, default: '', maxlength: 4000 },
      portraitMediaId: { type: Schema.Types.ObjectId, ref: 'MediaAsset', default: null },
      qualifications: { type: [String], default: [] },
      specializations: { type: [String], default: [] },
    },
    contact: {
      phone: { type: String, required: true, maxlength: 40 },
      email: { type: String, required: true, maxlength: 254 },
      whatsapp: { type: String, default: null, maxlength: 40 },
      addressLine1: { type: String, required: true, maxlength: 200 },
      addressLine2: { type: String, default: null, maxlength: 200 },
      city: { type: String, required: true, maxlength: 100 },
      state: { type: String, required: true, maxlength: 100 },
      postalCode: { type: String, required: true, maxlength: 20 },
      country: { type: String, required: true, maxlength: 100 },
    },
    openingHours: { type: [openingHoursDaySchema], required: true },
  },
  { _id: false },
);

const websiteConfigSchema = new Schema(
  {
    key: {
      type: String,
      required: true,
      enum: ['primary'],
      default: 'primary',
    },
    clinic: { type: clinicSchema, required: true },
    draft: { type: Schema.Types.Mixed, required: true },
    draftVersion: { type: Number, required: true, default: 0 },
    activeRevisionId: {
      type: Schema.Types.ObjectId,
      ref: 'WebsiteRevision',
      default: null,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
      default: null,
    },
  },
  { timestamps: true },
);

websiteConfigSchema.index({ key: 1 }, { unique: true });

export type WebsiteConfig = InferSchemaType<typeof websiteConfigSchema> & {
  _id: Types.ObjectId;
};
export type WebsiteConfigDocument = HydratedDocument<WebsiteConfig>;

export const WebsiteConfigModel = model('WebsiteConfig', websiteConfigSchema);
