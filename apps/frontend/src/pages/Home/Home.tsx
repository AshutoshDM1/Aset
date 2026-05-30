import Footer from '@/shared/Footer/Footer';
import Navbar from '@/shared/Navbar/Navbar';
import Section from '@/shared/Section/Section';
import Herosection from './Folds/Herosection/Herosection';
import UnlimitedIntegrations from './Folds/UnlimitedIntegrations/UnlimitedIntegrations';
import Feature from './Folds/Feature/Feature';
import Workflow from './Folds/Workflow/Workflow';
import BentoGrid from './Folds/BentoGrid/BentoGrid';
import CTA from './Folds/CTA/CTA';
import Faq from './Folds/Faq/Faq';

const Home = () => {
  return (
    <>
      <div className="bg-linear-to-b from-white via-violet-300/70 to-white dark:from-black dark:via-violet-900/70 dark:to-violet-900 pb-5">
        <Navbar />
        <Section>
          <Herosection />
        </Section>
      </div>
      <Section className="pt-10 md:pt-32">
        <UnlimitedIntegrations />
      </Section>
      <Section className="pt-10 md:pt-32">
        <Feature />
      </Section>
      <Section className="pt-10 md:pt-32">
        <Workflow />
      </Section>
      <Section className="pt-10 md:pt-32">
        <BentoGrid />
      </Section>
      <Section className="pt-10 md:pt-32 pb-16">
        <Faq />
      </Section>
      <Section className="py-10">
        <CTA />
      </Section>
      <Footer />
    </>
  );
};

export default Home;
