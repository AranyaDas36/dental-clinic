import { Schema, model, type HydratedDocument, type InferSchemaType, type Types } from 'mongoose';

const reviewSchema = new Schema(
  {
    displayName: { type: String, required: true, maxlength: 80, trim: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    message: { type: String, required: true, maxlength: 1000 },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'hidden'],
      required: true,
      default: 'pending',
    },
    adminResponse: { type: String, default: null, maxlength: 1000 },
    moderatedAt: { type: Date, default: null },
    moderatedBy: { type: Schema.Types.ObjectId, ref: 'AdminUser', default: null },
  },
  { timestamps: true },
);

reviewSchema.index({ status: 1, createdAt: -1 });

export type Review = InferSchemaType<typeof reviewSchema> & { _id: Types.ObjectId };
export type ReviewDocument = HydratedDocument<Review>;

export const ReviewModel = model('Review', reviewSchema);
