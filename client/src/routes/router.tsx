import { createBrowserRouter } from 'react-router-dom';
import { PublicLayout } from '@/features/public-website/PublicLayout';
import { HomePage } from '@/features/public-website/HomePage';
import { AdminLoginPage } from '@/features/admin-auth/AdminLoginPage';
import { AdminShell } from '@/features/dashboard/AdminShell';
import { DashboardHomePage } from '@/features/dashboard/DashboardHomePage';
import { ContentEditorPage } from '@/features/dashboard/ContentEditorPage';
import { ThemeEditorPage } from '@/features/dashboard/ThemeEditorPage';
import { ServicesManagerPage } from '@/features/dashboard/ServicesManagerPage';
import { ReviewsModerationPage } from '@/features/dashboard/ReviewsModerationPage';
import { AppointmentsManagerPage } from '@/features/dashboard/AppointmentsManagerPage';
import { MediaManagerPage } from '@/features/dashboard/MediaManagerPage';
import { RevisionsHistoryPage } from '@/features/dashboard/RevisionsHistoryPage';
import { DraftPreviewPage } from '@/features/dashboard/DraftPreviewPage';
import { NotFoundPage } from '@/components/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [{ index: true, element: <HomePage /> }],
  },
  {
    path: '/admin/login',
    element: <AdminLoginPage />,
  },
  {
    path: '/admin/preview',
    element: <DraftPreviewPage />,
  },
  {
    path: '/admin',
    element: <AdminShell />,
    children: [
      { index: true, element: <DashboardHomePage /> },
      { path: 'content', element: <ContentEditorPage /> },
      { path: 'theme', element: <ThemeEditorPage /> },
      { path: 'services', element: <ServicesManagerPage /> },
      { path: 'reviews', element: <ReviewsModerationPage /> },
      { path: 'appointments', element: <AppointmentsManagerPage /> },
      { path: 'media', element: <MediaManagerPage /> },
      { path: 'revisions', element: <RevisionsHistoryPage /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
