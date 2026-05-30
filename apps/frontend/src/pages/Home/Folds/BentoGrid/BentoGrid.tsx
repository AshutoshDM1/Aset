import React from 'react';
import SectionHeading from '@/shared/SectionHeading/SectionHeading';
import {
  RealTimeVitalsCard,
  GlobalStatusCard,
  PerformanceCard,
  SystemEvolutionCard,
  GeminiBatteryCard,
  IntegrationPartnersCard,
} from './BentoCards';

const BentoGrid: React.FC = () => {
  return (
    <section className="select-none">
      {/* Centered Heading */}
      <SectionHeading
        badge="Analytics"
        title="Comprehensive System Vitals"
        description="Monitor system scaling, automated integration latency, and LLM orchestration metrics in one sleek, real-time control console."
        align="center"
      />

      {/* Responsive Bento Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mt-14 ">
        {/* Row 1, Card 1: Platform Vitals Donut */}
        <div className="lg:col-span-1 flex">
          <RealTimeVitalsCard />
        </div>

        {/* Row 1, Card 2: Timezone Clocks Radar Status */}
        <div className="lg:col-span-2 flex">
          <GlobalStatusCard />
        </div>

        {/* Row 2, Card 3: Performance Line Splines */}
        <div className="lg:col-span-1 flex">
          <PerformanceCard />
        </div>

        {/* Row 2, Card 4: Evolution Bar Columns */}
        <div className="lg:col-span-1 flex">
          <SystemEvolutionCard />
        </div>

        {/* Row 2, Card 5: Right mini stack (Battery and Sync) */}
        <div className="lg:col-span-1 flex flex-col gap-6 lg:gap-8">
          <GeminiBatteryCard />
          <IntegrationPartnersCard />
        </div>
      </div>
    </section>
  );
};

export default BentoGrid;
export { BentoGrid };
