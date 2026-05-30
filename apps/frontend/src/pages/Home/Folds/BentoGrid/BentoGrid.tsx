import React from 'react';
import SectionHeading from '@/shared/SectionHeading/SectionHeading';
import RealTimeVitalsCard from './BentoCards/RealTimeVitalsCard';
import GlobalStatusCard from './BentoCards/GlobalStatusCard';
import PerformanceCard from './BentoCards/PerformanceCard';
import SystemEvolutionCard from './BentoCards/SystemEvolutionCard';
import GeminiBatteryCard from './BentoCards/GeminiBatteryCard';
import ImageOptimizerCard from './BentoCards/ImageOptimizerCard';
import FadeIn from '@/shared/FadeIn/FadeIn';

const BentoGrid: React.FC = () => {
  return (
    <section className="select-none">
      {/* Centered Heading */}
      <SectionHeading
        badge="Analytics"
        title="Direct Architecture. Radical Speed."
        description="See how Aset outperforms traditional cloud drives. Bypassing heavy middleman servers delivers 10x faster direct uploads alongside a 50ms global Cloudflare Edge CDN."
        align="center"
      />
      <FadeIn direction="up">
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
            <ImageOptimizerCard />
          </div>
        </div>
      </FadeIn>
    </section>
  );
};

export default BentoGrid;
export { BentoGrid };
