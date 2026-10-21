import { z } from 'zod';
import { objectIdStringSchema } from './common.js';

export const APPOINTMENT_STATUSES = [
  'pending',
  'contacted',
  'confirmed',
  'completed',
  'cancelled',
] as const;

export type AppointmentStatus = (typeof APPOINTMENT_STATUSES)[number];

export const publicAppointmentCreateSchema = z.object({
  patientName: z.string().min(1).max(120),
  phone: z.string().min(7).max(40),
  email: z.string().email().max(254).optional(),
  requestedServiceId: objectIdStringSchema.nullable().optional(),
  preferredDate: z.string().date().nullable().optional(),
  preferredTime: z.string().max(32).nullable().optional(),
  message: z.string().max(1000).optional(),
});

export const adminAppointmentUpdateSchema = z.object({
  status: z.enum(APPOINTMENT_STATUSES).optional(),
  adminNotes: z.string().max(4000).nullable().optional(),
});

export type PublicAppointmentCreate = z.infer<typeof publicAppointmentCreateSchema>;
