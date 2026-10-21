import type { ClinicInfo, WebsiteSnapshot } from '@dental/shared';
import type { PublicReviewItem, PublicServiceItem } from '@/api/public';
import { HeaderSection } from './sections/HeaderSection';
import { HeroSection } from './sections/HeroSection';
import { TrustSection } from './sections/TrustSection';
import { ServicesSection } from './sections/ServicesSection';
import { DentistSection } from './sections/DentistSection';
import { WhyChooseUsSection } from './sections/WhyChooseUsSection';
import { ReviewsSection } from './sections/ReviewsSection';
import { GallerySection } from './sections/GallerySection';
import { AppointmentSection } from './sections/AppointmentSection';
import { ContactSection } from './sections/ContactSection';
import { FooterSection } from './sections/FooterSection';

interface PublicSectionRendererProps {
  snapshot: WebsiteSnapshot;
  clinic: ClinicInfo;
  services: PublicServiceItem[];
  reviews: PublicReviewItem[];
  onSelectService?: (service: PublicServiceItem) => void;
  onReviewSubmitted?: () => void;
  selectedServiceId?: string | null;
}

export function PublicSectionRenderer({
  snapshot,
  clinic,
  services,
  reviews,
  onSelectService,
  onReviewSubmitted,
  selectedServiceId,
}: PublicSectionRendererProps) {
  const headerSection = snapshot.sections.find((s) => s.type === 'header');
  const footerSection = snapshot.sections.find((s) => s.type === 'footer');
  const bodySections = snapshot.sections.filter(
    (s) => s.type !== 'header' && s.type !== 'footer' && s.enabled,
  );

  return (
    <>
      {/* Header */}
      {headerSection && headerSection.enabled && headerSection.type === 'header' && (
        <HeaderSection
          key={headerSection.id}
          clinic={clinic}
          navigation={snapshot.navigation}
          settings={headerSection.settings}
          layoutVariant={headerSection.layoutVariant}
        />
      )}

      {/* Main Content Body */}
      <main id="main-content">
        {bodySections.map((section) => {
          switch (section.type) {
            case 'hero':
              return (
                <HeroSection
                  key={section.id}
                  settings={section.settings}
                  layoutVariant={section.layoutVariant}
                />
              );

            case 'trust':
              return (
                <TrustSection
                  key={section.id}
                  settings={section.settings}
                  layoutVariant={section.layoutVariant}
                />
              );

            case 'services':
              return (
                <ServicesSection
                  key={section.id}
                  services={services}
                  settings={section.settings}
                  layoutVariant={section.layoutVariant}
                  onSelectService={onSelectService}
                />
              );

            case 'dentist':
              return (
                <DentistSection
                  key={section.id}
                  dentist={clinic.dentist}
                  settings={section.settings}
                  layoutVariant={section.layoutVariant}
                />
              );

            case 'whyChooseUs':
              return (
                <WhyChooseUsSection
                  key={section.id}
                  settings={section.settings}
                  layoutVariant={section.layoutVariant}
                />
              );

            case 'reviews':
              return (
                <ReviewsSection
                  key={section.id}
                  reviews={reviews}
                  settings={section.settings}
                  layoutVariant={section.layoutVariant}
                  onReviewSubmitted={onReviewSubmitted}
                />
              );

            case 'gallery':
              return (
                <GallerySection
                  key={section.id}
                  settings={section.settings}
                  layoutVariant={section.layoutVariant}
                />
              );

            case 'appointment':
              return (
                <AppointmentSection
                  key={section.id}
                  services={services}
                  settings={section.settings}
                  layoutVariant={section.layoutVariant}
                  preselectedServiceId={selectedServiceId}
                />
              );

            case 'contact':
              return (
                <ContactSection
                  key={section.id}
                  clinic={clinic}
                  settings={section.settings}
                  layoutVariant={section.layoutVariant}
                />
              );

            default:
              return null;
          }
        })}
      </main>

      {/* Footer */}
      {footerSection && footerSection.enabled && footerSection.type === 'footer' && (
        <FooterSection
          key={footerSection.id}
          clinic={clinic}
          footer={snapshot.footer}
          settings={footerSection.settings}
          layoutVariant={footerSection.layoutVariant}
        />
      )}
    </>
  );
}
