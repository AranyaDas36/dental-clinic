import type {
  AppointmentStatus,
  ChangePasswordInput,
  ClinicInfo,
  LoginInput,
  ReviewStatus,
  ServiceInput,
  WebsiteDraftUpdate,
  WebsitePublishInput,
  WebsiteSnapshot,
} from '@dental/shared';
import { apiRequest, updateCsrfToken } from './client';

export interface AdminUserSafe {
  id: string;
  email: string;
  role: string;
  isActive: boolean;
  mustChangePassword: boolean;
  lastLoginAt: string | Date | null;
  passwordChangedAt: string | Date | null;
  createdAt?: string | Date;
  updatedAt?: string | Date;
}

export interface DashboardOverviewData {
  pendingAppointmentRequests: number;
  pendingReviews: number;
  recentAppointmentRequests: Array<{
    id: string;
    patientName: string;
    status: AppointmentStatus;
    preferredDate: string;
    requestedServiceName: string | null;
    createdAt: string;
  }>;
  website: {
    key: string;
    hasDraftChanges: boolean;
    draftVersion: number;
    activeRevisionVersion: number | null;
    publishedAt: string | null;
    lastPublishedAt: string | null;
  };
  shortcuts: Array<{ label: string; href: string }>;
}

export interface WebsiteDraftData {
  configId: string;
  draftVersion: number;
  clinic: ClinicInfo;
  draft: WebsiteSnapshot;
  media: Record<string, { url: string; altText: string; caption: string }>;
  activeRevisionId: string | null;
  activeRevisionVersion: number | null;
}

export interface WebsiteVersionItem {
  id: string;
  version: number;
  publishedAt: string;
  changeSummary: string | null;
  publishedBy: {
    id: string;
    email: string;
  };
}

export interface AdminServiceItem {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  category: string;
  priceType: 'fixed' | 'starting_at' | 'range' | 'quote';
  price: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  currency: 'INR';
  isFeatured: boolean;
  isPublished: boolean;
  displayOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
  imageMediaId: string | null;
  imageUrl: string | null;
  imageAltText: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdminReviewItem {
  id: string;
  displayName: string;
  rating: number;
  message: string;
  status: ReviewStatus;
  adminResponse: string | null;
  createdAt: string;
  moderatedAt: string | null;
}

export interface AdminAppointmentItem {
  id: string;
  patientName: string;
  phone: string;
  email: string | null;
  preferredDate: string;
  preferredTimeSlot: string;
  requestedServiceId: string | null;
  requestedServiceName: string | null;
  notes: string | null;
  status: AppointmentStatus;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMediaItem {
  id: string;
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
  altText: string | null;
  caption: string | null;
  createdAt: string;
}

// Auth
export async function loginAdmin(
  data: LoginInput,
): Promise<{ admin: AdminUserSafe; csrfToken: string }> {
  const result = await apiRequest<{ admin: AdminUserSafe; csrfToken: string }>('/auth/login', {
    method: 'POST',
    body: data,
  });
  updateCsrfToken(result.csrfToken);
  return result;
}

export async function logoutAdmin(): Promise<{ ok: boolean; csrfToken: string }> {
  const result = await apiRequest<{ ok: boolean; csrfToken: string }>('/auth/logout', {
    method: 'POST',
  });
  updateCsrfToken(result.csrfToken);
  return result;
}

export async function fetchMe(): Promise<{ admin: AdminUserSafe }> {
  return apiRequest<{ admin: AdminUserSafe }>('/auth/me');
}

export async function changePassword(
  data: ChangePasswordInput,
): Promise<{ admin: AdminUserSafe; csrfToken: string }> {
  const result = await apiRequest<{ admin: AdminUserSafe; csrfToken: string }>(
    '/auth/change-password',
    {
      method: 'POST',
      body: data,
    },
  );
  updateCsrfToken(result.csrfToken);
  return result;
}

// Dashboard
export async function fetchDashboard(): Promise<DashboardOverviewData> {
  return apiRequest<DashboardOverviewData>('/admin/dashboard');
}

// Website Draft & Publishing
export async function fetchWebsiteDraft(): Promise<WebsiteDraftData> {
  return apiRequest<WebsiteDraftData>('/admin/website/draft');
}

export async function updateWebsiteDraft(
  data: WebsiteDraftUpdate,
): Promise<{ draftVersion: number; updatedAt: string }> {
  return apiRequest<{ draftVersion: number; updatedAt: string }>('/admin/website/draft', {
    method: 'PUT',
    body: data,
  });
}

export async function publishWebsite(
  data: WebsitePublishInput,
): Promise<{ revisionId: string; version: number; publishedAt: string }> {
  return apiRequest<{ revisionId: string; version: number; publishedAt: string }>(
    '/admin/website/publish',
    {
      method: 'POST',
      body: data,
    },
  );
}

export async function fetchWebsiteVersions(): Promise<{ items: WebsiteVersionItem[] }> {
  return apiRequest<{ items: WebsiteVersionItem[] }>('/admin/website/versions');
}

export async function restoreWebsiteVersion(
  id: string,
  expectedDraftVersion: number,
): Promise<{ draftVersion: number }> {
  return apiRequest<{ draftVersion: number }>(`/admin/website/versions/${id}/restore`, {
    method: 'POST',
    body: { expectedDraftVersion },
  });
}

// Services
export async function fetchAdminServices(params?: {
  page?: number;
  pageSize?: number;
}): Promise<{ items: AdminServiceItem[] }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiRequest<{ items: AdminServiceItem[] }>(`/admin/services${queryString}`);
}

export async function createAdminService(
  data: ServiceInput,
): Promise<{ service: AdminServiceItem }> {
  return apiRequest<{ service: AdminServiceItem }>('/admin/services', {
    method: 'POST',
    body: data,
  });
}

export async function updateAdminService(
  id: string,
  data: Partial<ServiceInput>,
): Promise<{ service: AdminServiceItem }> {
  return apiRequest<{ service: AdminServiceItem }>(`/admin/services/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

export async function deleteAdminService(id: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/admin/services/${id}`, {
    method: 'DELETE',
  });
}

// Reviews
export async function fetchAdminReviews(params?: {
  page?: number;
  pageSize?: number;
  status?: ReviewStatus;
}): Promise<{ items: AdminReviewItem[] }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));
  if (params?.status) query.set('status', params.status);
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiRequest<{ items: AdminReviewItem[] }>(`/admin/reviews${queryString}`);
}

export async function updateAdminReview(
  id: string,
  data: { status?: ReviewStatus; adminResponse?: string | null },
): Promise<{ review: AdminReviewItem }> {
  return apiRequest<{ review: AdminReviewItem }>(`/admin/reviews/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

export async function deleteAdminReview(id: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/admin/reviews/${id}`, {
    method: 'DELETE',
  });
}

// Appointments
export async function fetchAdminAppointments(params?: {
  page?: number;
  pageSize?: number;
  status?: AppointmentStatus;
}): Promise<{ items: AdminAppointmentItem[] }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));
  if (params?.status) query.set('status', params.status);
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiRequest<{ items: AdminAppointmentItem[] }>(`/admin/appointments${queryString}`);
}

export async function updateAdminAppointment(
  id: string,
  data: { status?: AppointmentStatus; adminNotes?: string | null },
): Promise<{ appointment: AdminAppointmentItem }> {
  return apiRequest<{ appointment: AdminAppointmentItem }>(`/admin/appointments/${id}`, {
    method: 'PATCH',
    body: data,
  });
}

// Media
export async function fetchAdminMedia(params?: {
  page?: number;
  pageSize?: number;
}): Promise<{ items: AdminMediaItem[] }> {
  const query = new URLSearchParams();
  if (params?.page) query.set('page', String(params.page));
  if (params?.pageSize) query.set('pageSize', String(params.pageSize));
  const queryString = query.toString() ? `?${query.toString()}` : '';
  return apiRequest<{ items: AdminMediaItem[] }>(`/admin/media${queryString}`);
}

export async function uploadAdminMedia(formData: FormData): Promise<{ media: AdminMediaItem }> {
  return apiRequest<{ media: AdminMediaItem }>('/admin/media/upload', {
    method: 'POST',
    body: formData,
  });
}

export async function deleteAdminMedia(id: string): Promise<{ ok: boolean }> {
  return apiRequest<{ ok: boolean }>(`/admin/media/${id}`, {
    method: 'DELETE',
  });
}
