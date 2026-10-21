import { Schema, model, type HydratedDocument, type InferSchemaType, type Types } from 'mongoose';

const adminSessionSchema = new Schema(
  {
    tokenHash: {
      type: String,
      required: true,
    },
    adminUserId: {
      type: Schema.Types.ObjectId,
      ref: 'AdminUser',
      required: true,
      index: true,
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    lastSeenAt: {
      type: Date,
      required: true,
      default: () => new Date(),
    },
    absoluteExpiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

adminSessionSchema.index({ tokenHash: 1 }, { unique: true });
adminSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export type AdminSession = InferSchemaType<typeof adminSessionSchema> & {
  _id: Types.ObjectId;
};
export type AdminSessionDocument = HydratedDocument<AdminSession>;

export const AdminSessionModel = model('AdminSession', adminSessionSchema);
