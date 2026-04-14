import { HeroImage1, HeroImage2 } from '@/assets/import';
import { cn } from '@/lib/utils';
import Section from '@/shared/Section/Sectiont';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router';

const Herosection = () => {
  return (
    <>
      <div className="max-w-5xl mx-auto text-center py-28">
        <HeroBadge />
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-zinc-900 dark:text-white mb-6 leading-tight">
          Upload, organize, and share <br className="hidden md:block" />
          files without the chaos.
        </h1>
        <HeroSubheadline />
        <HeroCTA />
      </div>

      <Section>
        <div className="py-10 flex md:flex-row flex-col gap-4">
          <div className="w-full flex">
            <img
              src={HeroImage1}
              alt="Folders and files in Aset"
              className="w-full h-full rounded-2xl object-cover object-top flex-1 shadow-sm aspect-video"
            />
          </div>
          <div className="w-full md:w-[40%] flex">
            <img
              src={HeroImage2}
              alt="Uploading and organizing files"
              className="w-full h-full rounded-2xl object-cover object-top flex-1 shadow-sm aspect-9/12 sm:aspect-video"
            />
          </div>
        </div>
      </Section>
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
        <span className="text-sm pr-2">
          A lightweight cloud drive for everyday files
        </span>
      </div>
    </div>
  );
};

const HeroSubheadline = () => {
  return (
    <p className="mt-4 text-lg md:text-xl text-zinc-600 dark:text-zinc-300 font-medium">
      Drop in documents, images, and projects—keep them in folders you control.
      Share when you need to, with{' '}
      <span className="font-semibold text-zinc-900 dark:text-white">
        less clutter and fewer steps
      </span>{' '}
      than a full enterprise suite.
    </p>
  );
};

const HeroCTA = () => {
  return (
    <div className="flex justify-center mt-8">
      <Link to="/dashboard">
        <button
          className={cn(
            'text-lg text-primary-foreground bg-linear-to-b from-indigo-600 via-indigo-500 to-indigo-400  hover:bg-indigo-500/70 rounded-4xl px-4 py-2.5 font-semibold shadow-[0_3px_17px_rgba(0,0,0,0.2)] shadow-[#5E43F3] ',
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
