import Section from '../Section/Section';
import FooterBrand from './FooterBrand';
import FooterBottom from './FooterBottom';
import FooterLinkColumn, { type FooterLink } from './FooterLinkColumn';

const quickLinks: FooterLink[] = [
  { label: 'Features', href: '#feature' },
  { label: 'Integration', href: '#integration' },
  { label: 'FAQ', href: '#faq' },
  { label: 'Workflow', href: '#workflow' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'Github', href: 'https://github.com/AshutoshDM1/Aset' },
  { label: 'Twitter', href: 'https://x.com/AshutoshDM_1' },
];

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-background">
      <Section className="px-4 sm:px-9 pt-12 pb-4 grid grid-cols-1 md:grid-cols-2 gap-12">
        <FooterBrand />
        <div className="grid grid-cols-2 gap-12 mt-12 md:mt-0">
          <FooterLinkColumn title="Features" links={quickLinks.slice(0, 3)} />
          <FooterLinkColumn title="Links" links={quickLinks.slice(3, 6)} />
        </div>
        <FooterBottom />
      </Section>
    </footer>
  );
};

export default Footer;
