import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

const Section = ({ children, className }: SectionProps) => {
  return (
    <section className={cn('max-w-7xl mx-auto px-4 sm:px-6', className)}>
      {children}
    </section>
  );
};

export default Section;
