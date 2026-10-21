import { Schema, model, type HydratedDocument, type Types } from 'mongoose';

export interface AdminUser {
  email: string;
  passwordHash: string;
  role: 'admin';
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: Date | null;
  passwordChangedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
}

const adminUserSchema = new Schema<AdminUser>(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      maxlength: 254,
    },
    passwordHash: {
      type: String,
      required: true,
      select: false,
    },
    role: {
      type: String,
      enum: ['admin'],
      required: true,
      default: 'admin',
    },
    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
    mustChangePassword: {
      type: Boolean,
      required: true,
      default: true,
    },
    lastLoginAt: {
      type: Date,
      default: null,
    },
    passwordChangedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(_doc, ret) {
        const record = ret as Record<string, unknown>;
        delete record.passwordHash;
        return record;
      },
    },
  },
);

adminUserSchema.index({ email: 1 }, { unique: true });

export type AdminUserDocument = HydratedDocument<AdminUser> & { _id: Types.ObjectId };

export const AdminUserModel = model<AdminUser>('AdminUser', adminUserSchema);
