import React from 'react';
import { ConnectionsDiagram } from './ConnectionsDiagram';
import { InfoSection } from './InfoSection';
import SectionHeading from '@/shared/SectionHeading/SectionHeading';

const UnlimitedIntegrations: React.FC = () => {
  return (
    <>
      <div className="space-y-6 md:space-y-16">
        <SectionHeading
          badge="Integrations"
          tittle="Say goodbye to scattered assets"
          description="Aset centralizes your creative assets, making them accessible, organized, and ready to use whenever inspiration strikes."
          align="center"
        />
        <div className="grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-16">
          <ConnectionsDiagram />
          <InfoSection />
        </div>
      </div>
    </>
  );
};

export default UnlimitedIntegrations;
