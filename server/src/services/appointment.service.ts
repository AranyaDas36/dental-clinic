import {
  adminAppointmentUpdateSchema,
  publicAppointmentCreateSchema,
  type AppointmentStatus,
  type PublicAppointmentCreate,
} from '@dental/shared';
import { Types } from 'mongoose';
import { AppointmentRequestModel } from '../models/AppointmentRequest.js';
import { ServiceModel } from '../models/Service.js';
import { AppError } from '../middleware/error-handler.js';

function serializeAdmin(doc: {
  _id: { toString(): string };
  patientName: string;
  phone: string;
  email?: string | null;
  requestedServiceId?: { toString(): string } | null;
  requestedServiceName?: string | null;
  preferredDate?: string | null;
  preferredTime?: string | null;
  message?: string;
  status: string;
  adminNotes?: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}) {
  return {
    id: doc._id.toString(),
    patientName: doc.patientName,
    phone: doc.phone,
    email: doc.email ?? null,
    requestedServiceId: doc.requestedServiceId ? String(doc.requestedServiceId) : null,
    requestedServiceName: doc.requestedServiceName ?? null,
    preferredDate: doc.preferredDate ?? null,
    preferredTime: doc.preferredTime ?? null,
    message: doc.message ?? '',
    status: doc.status,
    adminNotes: doc.adminNotes ?? null,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
  };
}

export async function createPublicAppointment(input: PublicAppointmentCreate) {
  const data = publicAppointmentCreateSchema.parse(input);

  let requestedServiceName: string | null = null;
  const requestedServiceId: string | null = data.requestedServiceId ?? null;

  if (requestedServiceId) {
    const service = await ServiceModel.findOne({
      _id: requestedServiceId,
      isPublished: true,
    });
    if (!service) {
      throw new AppError(422, 'INVALID_SERVICE', 'Requested service is not available');
    }
    requestedServiceName = service.name;
  }

  const created = await AppointmentRequestModel.create({
    patientName: data.patientName,
    phone: data.phone,
    email: data.email ?? null,
    requestedServiceId,
    requestedServiceName,
    preferredDate: data.preferredDate ?? null,
    preferredTime: data.preferredTime ?? null,
    message: data.message ?? '',
    status: 'pending',
    adminNotes: null,
  });

  return {
    id: created._id.toString(),
    status: 'pending' as const,
    message: 'Appointment request received. The clinic will confirm manually.',
  };
}

export async function listAdminAppointments(
  page: number,
  pageSize: number,
  status?: AppointmentStatus,
) {
  const filter = status ? { status } : {};
  const [items, total] = await Promise.all([
    AppointmentRequestModel.find(filter)
      .select('+adminNotes')
      .sort({ createdAt: -1 })
      .skip((page - 1) * pageSize)
      .limit(pageSize),
    AppointmentRequestModel.countDocuments(filter),
  ]);
  return { items: items.map(serializeAdmin), total };
}

export async function getAdminAppointment(id: string) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Invalid appointment id');
  }
  const item = await AppointmentRequestModel.findById(id).select('+adminNotes');
  if (!item) {
    throw new AppError(404, 'NOT_FOUND', 'Appointment request not found');
  }
  return serializeAdmin(item);
}

export async function updateAdminAppointment(id: string, body: unknown) {
  if (!Types.ObjectId.isValid(id)) {
    throw new AppError(422, 'VALIDATION_ERROR', 'Invalid appointment id');
  }
  const input = adminAppointmentUpdateSchema.parse(body);
  const item = await AppointmentRequestModel.findById(id).select('+adminNotes');
  if (!item) {
    throw new AppError(404, 'NOT_FOUND', 'Appointment request not found');
  }

  if (input.status !== undefined) item.status = input.status;
  if (input.adminNotes !== undefined) item.adminNotes = input.adminNotes;
  await item.save();
  return serializeAdmin(item);
}
