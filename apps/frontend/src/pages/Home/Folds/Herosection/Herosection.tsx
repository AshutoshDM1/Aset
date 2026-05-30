import { HeroImageLight, HeroImageDark } from '@/assets/import';
import ShinyText from '@/components/ShinyText';
import SplitText from '@/components/SplitText';
import { useTheme } from '@/components/theme-provider';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router';
import { motion } from 'motion/react';

const Herosection = () => {
  const { theme } = useTheme();

  // Stably resolve light/dark themes, including system preference updates
  const [resolvedTheme, setResolvedTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const getSystemTheme = () =>
      window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';

    if (theme === 'system') {
      setResolvedTheme(getSystemTheme());

      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => {
        setResolvedTheme(getSystemTheme());
      };

      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      setResolvedTheme(theme);
    }
  }, [theme]);

  return (
    <>
      <div className="max-w-5xl mx-auto text-center py-14 md:py-28">
        <HeroBadge />
        <h1 className="text-3xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6 leading-tight">
          <SplitText
            text="Upload, organize, and share"
            delay={30}
            duration={1.15}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
          <br className="hidden md:block" />
          <SplitText
            text="files without the chaos."
            delay={30}
            animationDelay={1250}
            duration={1.15}
            ease="power3.out"
            splitType="chars"
            from={{ opacity: 0, y: 40 }}
            to={{ opacity: 1, y: 0 }}
            threshold={0.1}
            rootMargin="-100px"
            textAlign="center"
          />
        </h1>
        <HeroSubheadline />
        <HeroCTA />
      </div>

      <div className="py-10 flex md:flex-row flex-col gap-4">
        <div className="w-full flex overflow-hidden rounded-4xl shadow-lg">
          <img
            src={resolvedTheme === 'dark' ? HeroImageDark : HeroImageLight}
            alt="Folders and files in Aset"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </>
  );
};

export default Herosection;

const HeroBadge = () => {
  return (
    <div className="flex justify-center mb-6 select-none">
      <div className="bg-secondary text-secondary-foreground px-1.5 py-1.5 rounded-full shadow flex items-center gap-2">
        <span className="flex items-center gap-2 px-3 py-1 rounded-full bg-secondary-foreground text-secondary text-xs font-semibold ">
          New
        </span>
        <span className="pr-2 text-xs md:text-sm font-semibold">
          <ShinyText
            text="✨  A lightweight cloud drive"
            speed={2}
            delay={0}
            color="#ffffff"
            shineColor="#a4a4fc"
            spread={120}
            direction="left"
            yoyo={false}
            pauseOnHover={false}
            disabled={false}
          />
        </span>
      </div>
    </div>
  );
};

const HeroSubheadline = () => {
  return (
    <div className="overflow-hidden h-fit">
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.7, duration: 0.8, ease: 'easeOut' }}
        className="mt-4 text-sm md:text-xl text-zinc-600 dark:text-zinc-300 font-medium"
      >
        Drop in documents, images, and projects—keep them in folders you
        control. Share when you need to, with{' '}
        <span className="font-semibold text-zinc-900 dark:text-white">
          less clutter and fewer steps
        </span>{' '}
        than a full enterprise suite.
      </motion.p>
    </div>
  );
};

const HeroCTA = () => {
  return (
    <div className="flex justify-center mt-8">
      <Link to="/dashboard">
        <button
          className={cn(
            'text-sm md:text-lg text-primary-foreground bg-linear-to-b from-indigo-600 via-indigo-500 to-indigo-400  hover:bg-indigo-500/70 rounded-4xl px-4 py-2.5 font-semibold shadow-[0_3px_17px_rgba(0,0,0,0.2)] shadow-[#5E43F3] ',
            'ring-1 ring-indigo-600/90 hover:ring-indigo-500/70',
            'transition-colors duration-300 ease-in-out cursor-pointer text-white',
            'flex items-center gap-2',
          )}
        >
          <span className="font-semibold">
            Get Started <span>• It&apos;s free</span>
          </span>
          <span className="bg-white flex items-center justify-center rounded-full w-8 h-8 ml-2 shadow-md">
            <ArrowRight className="size-4 text-black" />
          </span>
        </button>
      </Link>
    </div>
  );
};
