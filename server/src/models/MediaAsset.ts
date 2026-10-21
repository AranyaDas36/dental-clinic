import { Schema, model, type HydratedDocument, type InferSchemaType, type Types } from 'mongoose';

const mediaAssetSchema = new Schema(
  {
    provider: {
      type: String,
      enum: ['cloudinary'],
      required: true,
      default: 'cloudinary',
    },
    providerAssetId: {
      type: String,
      required: true,
    },
    publicId: {
      type: String,
      required: true,
    },
    secureUrl: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      enum: ['image'],
      required: true,
      default: 'image',
    },
    format: {
      type: String,
      required: true,
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    bytes: {
      type: Number,
      required: true,
    },
    altText: {
      type: String,
      default: '',
      maxlength: 300,
    },
    caption: {
      type: String,
      default: '',
      maxlength: 500,
    },
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
      required: true,
    },
  },
  { timestamps: true },
);

mediaAssetSchema.index({ providerAssetId: 1 }, { unique: true });
mediaAssetSchema.index({ publicId: 1 }, { unique: true });
mediaAssetSchema.index({ createdAt: -1 });

export type MediaAsset = InferSchemaType<typeof mediaAssetSchema> & { _id: Types.ObjectId };
export type MediaAssetDocument = HydratedDocument<MediaAsset>;

export const MediaAssetModel = model('MediaAsset', mediaAssetSchema);
