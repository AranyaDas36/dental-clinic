import type {
  ClinicInfo,
  PublicAppointmentCreate,
  PublicReviewCreate,
  WebsiteSnapshot,
} from '@dental/shared';
import { apiRequest } from './client';

export interface PublishedWebsiteResponse {
  clinic: ClinicInfo;
  snapshot: WebsiteSnapshot;
  media: Record<string, PublicMediaItem>;
  version: number;
  publishedAt: string;
}

export interface PublicMediaItem {
  url: string;
  altText: string;
  caption: string;
}

export interface PublicServiceItem {
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
  imageMediaId: string | null;
  imageUrl: string | null;
  imageAltText: string;
  isFeatured: boolean;
  isPublished: boolean;
  displayOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
}

export interface PublicReviewItem {
  id: string;
  displayName: string;
  rating: number;
  message: string;
  adminResponse: string | null;
  createdAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  pagination?: {
    page: number;
    pageSize: number;
    total: number;
  };
}

export async function fetchPublicWebsite(): Promise<PublishedWebsiteResponse> {
  return apiRequest<PublishedWebsiteResponse>('/public/website');
}

export async function fetchPublicServices(): Promise<PaginatedResult<PublicServiceItem>> {
  return apiRequest<PaginatedResult<PublicServiceItem>>('/public/services?page=1&pageSize=100');
}

export async function fetchPublicReviews(): Promise<PaginatedResult<PublicReviewItem>> {
  return apiRequest<PaginatedResult<PublicReviewItem>>('/public/reviews?page=1&pageSize=100');
}

export async function submitPublicAppointment(
  data: PublicAppointmentCreate,
): Promise<{ id: string; status: 'pending'; message: string }> {
  return apiRequest<{ id: string; status: 'pending'; message: string }>('/public/appointments', {
    method: 'POST',
    body: data,
  });
}

export async function submitPublicReview(
  data: PublicReviewCreate,
): Promise<{ id: string; status: 'pending' }> {
  return apiRequest<{ id: string; status: 'pending' }>('/public/reviews', {
    method: 'POST',
    body: data,
  });
}
