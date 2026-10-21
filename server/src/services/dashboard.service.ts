import { AppointmentRequestModel } from '../models/AppointmentRequest.js';
import { ReviewModel } from '../models/Review.js';
import { getWebsiteStatus } from './website.service.js';

export async function getDashboardOverview() {
  const [pendingAppointments, pendingReviews, recentAppointments, website] = await Promise.all([
    AppointmentRequestModel.countDocuments({ status: 'pending' }),
    ReviewModel.countDocuments({ status: 'pending' }),
    AppointmentRequestModel.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('patientName status preferredDate createdAt requestedServiceName'),
    getWebsiteStatus(),
  ]);

  return {
    pendingAppointmentRequests: pendingAppointments,
    pendingReviews,
    recentAppointmentRequests: recentAppointments.map((item) => ({
      id: item._id.toString(),
      patientName: item.patientName,
      status: item.status,
      preferredDate: item.preferredDate,
      requestedServiceName: item.requestedServiceName,
      createdAt: item.createdAt,
    })),
    website,
    shortcuts: [
      { label: 'Website editor', href: '/admin/website' },
      { label: 'Theme customizer', href: '/admin/theme' },
      { label: 'Services', href: '/admin/services' },
      { label: 'Reviews', href: '/admin/reviews' },
      { label: 'Appointments', href: '/admin/appointments' },
      { label: 'Media', href: '/admin/media' },
    ],
  };
}
