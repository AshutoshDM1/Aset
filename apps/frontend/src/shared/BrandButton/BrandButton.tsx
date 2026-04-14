import { cn } from '@/lib/utils';
import { Link } from 'react-router';

interface BrandButtonProps {
  className?: string;
  label?: string;
  to?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

const BrandButton = ({
  className,
  to,
  label = 'Button',
  onClick,
  children,
}: BrandButtonProps) => {
  return to ? (
    <Link to={to}>
      <button
        className={cn(
          'text-sm text-primary-foreground bg-linear-to-b from-black via-black to-[#1f1f1fe1]  hover:bg-primary/70  rounded-4xl px-4 py-2.5 font-semibold shadow-[0_3px_14px_rgba(0,0,0,0.03)] shadow-[#0000009c] text-shadow-xs text-shadow-[#ffffff80]',
          'ring-1 ring-black/90 hover:ring-black/70',
          'dark:bg-linear-to-b dark:from-white dark:via-white dark:to-[#f1f1f1e1] dark:text-black dark:hover:bg-white/70',
          'transition-colors duration-300 ease-in-out cursor-pointer',
          className,
        )}
        onClick={onClick}
      >
        {label}
        {children}
      </button>
    </Link>
  ) : (
    <button
      className={cn(
        'text-sm text-primary-foreground bg-linear-to-b from-black via-black to-[#1f1f1fe1]  hover:bg-primary/70  rounded-4xl px-4 py-2.5 font-semibold shadow-[0_3px_14px_rgba(0,0,0,0.03)] shadow-[#0000009c] text-shadow-xs text-shadow-[#ffffff80]',
        'ring-1 ring-black/90 hover:ring-black/70',
        'dark:bg-linear-to-b dark:from-white dark:via-white dark:to-[#f1f1f1e1] dark:text-black dark:hover:bg-white/70',
        'transition-colors duration-300 ease-in-out cursor-pointer',
        className,
      )}
      onClick={onClick}
    >
      {label}
      {children}
    </button>
  );
};

export default BrandButton;
