import { Schema, model, type HydratedDocument, type InferSchemaType, type Types } from 'mongoose';

const websiteRevisionSchema = new Schema(
  {
    version: { type: Number, required: true },
    schemaVersion: { type: Number, required: true },
    snapshot: { type: Schema.Types.Mixed, required: true },
    clinic: { type: Schema.Types.Mixed, required: true },
    publishedBy: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
      required: true,
    },
    publishedAt: { type: Date, required: true, default: () => new Date() },
    changeSummary: { type: String, default: null, maxlength: 500 },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

websiteRevisionSchema.index({ version: 1 }, { unique: true });
websiteRevisionSchema.index({ publishedAt: -1 });

export type WebsiteRevision = InferSchemaType<typeof websiteRevisionSchema> & {
  _id: Types.ObjectId;
};
export type WebsiteRevisionDocument = HydratedDocument<WebsiteRevision>;

export const WebsiteRevisionModel = model('WebsiteRevision', websiteRevisionSchema);
