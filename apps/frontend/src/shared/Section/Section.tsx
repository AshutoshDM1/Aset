import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  id?: string;
}

const Section = ({ children, className, id }: SectionProps) => {
  return (
    <section
      id={id}
      className={cn('max-w-7xl mx-auto px-4 sm:px-6', className)}
    >
      {children}
    </section>
  );
};

export default Section;
