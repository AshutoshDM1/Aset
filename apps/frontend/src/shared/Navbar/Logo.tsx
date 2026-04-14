import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
}

const Logo = ({ className }: LogoProps) => {
  return (
    <div
      className={cn('flex items-center justify-center w-10 h-10', className)}
    >
      <img
        src="/favicon.svg"
        alt="Aset"
        className="size-full object-contain invert-0 brightness-0 dark:invert-0 dark:brightness-200"
      />
    </div>
  );
};

export default Logo;
