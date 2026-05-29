import Footer from '@/shared/Footer/Footer';
import Navbar from '@/shared/Navbar/Navbar';
import Section from '@/shared/Section/Sectiont';
import Herosection from './Folds/Herosection/Herosection';
import UnlimitedIntegrations from './Folds/UnlimitedIntegrations/UnlimitedIntegrations';
import Workflow from './Folds/Workflow/Workflow';

const Home = () => {
  return (
    <>
      <div className="bg-linear-to-b from-white via-violet-300/70 to-white dark:from-black dark:via-violet-900/70 dark:to-violet-900 pb-20">
        <Navbar />
        <Section>
          <Herosection />
        </Section>
      </div>
      <Section className="pt-10 md:pt-20">
        <UnlimitedIntegrations />
      </Section>
      <Section className="pt-10 md:pt-20">
        <Workflow />
      </Section>
      <Footer />
    </>
  );
};

export default Home;
