import Navbar from '@/shared/Navbar/Navbar';
import Footer from '@/shared/Footer/Footer';
import ScrollSmoother from '@/shared/SmoothScroll/SmoothScroll';
import PricingFold from '@/pages/Home/Folds/Pricing/Pricing';
import Section from '@/shared/Section/Section';

const PricingPage = () => {
  return (
    <ScrollSmoother>
      <div className="font-raleway bg-background min-h-screen text-foreground flex flex-col justify-between">
        <div className="bg-linear-to-b from-white via-violet-300/30 to-white dark:from-black dark:via-indigo-950/40 dark:to-zinc-950 pb-16 grow flex flex-col">
          <Navbar />
          <Section className="py-10">
            <PricingFold />
          </Section>
        </div>
        <Footer />
      </div>
    </ScrollSmoother>
  );
};

export default PricingPage;
