import { Schema, model, type HydratedDocument, type InferSchemaType, type Types } from 'mongoose';

const appointmentRequestSchema = new Schema(
  {
    patientName: { type: String, required: true, maxlength: 120, trim: true },
    phone: { type: String, required: true, maxlength: 40 },
    email: { type: String, default: null, maxlength: 254 },
    requestedServiceId: { type: Schema.Types.ObjectId, ref: 'Service', default: null },
    requestedServiceName: { type: String, default: null, maxlength: 120 },
    preferredDate: { type: String, default: null, maxlength: 32 },
    preferredTime: { type: String, default: null, maxlength: 32 },
    message: { type: String, default: '', maxlength: 1000 },
    status: {
      type: String,
      enum: ['pending', 'contacted', 'confirmed', 'completed', 'cancelled'],
      required: true,
      default: 'pending',
    },
    adminNotes: { type: String, default: null, maxlength: 4000, select: false },
  },
  { timestamps: true },
);

appointmentRequestSchema.index({ status: 1, createdAt: -1 });
appointmentRequestSchema.index({ createdAt: -1 });

export type AppointmentRequest = InferSchemaType<typeof appointmentRequestSchema> & {
  _id: Types.ObjectId;
};
export type AppointmentRequestDocument = HydratedDocument<AppointmentRequest>;

export const AppointmentRequestModel = model('AppointmentRequest', appointmentRequestSchema);
