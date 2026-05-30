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
];

const Footer = () => {
  return (
    <footer className="bg-white dark:bg-background">
      <Section className="px-4 sm:px-6 pt-12 pb-4 grid grid-cols-1 md:grid-cols-2 gap-12">
        <FooterBrand />
        <div className="grid grid-cols-2 gap-12 mt-12 md:mt-0">
          <FooterLinkColumn
            title="Quick Links"
            links={quickLinks.slice(0, 2)}
          />
          <FooterLinkColumn
            title="Quick Links"
            links={quickLinks.slice(2, 4)}
          />
        </div>
        <FooterBottom />
      </Section>
    </footer>
  );
};

export default Footer;
