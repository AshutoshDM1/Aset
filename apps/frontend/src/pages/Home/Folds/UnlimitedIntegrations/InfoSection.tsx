import React from 'react';
import BrandButton from '@/shared/BrandButton/BrandButton';

export const InfoSection: React.FC = () => {
  return (
    <div className="w-full flex flex-col items-center lg:items-start text-center lg:text-left lg:gap-6">
      <h2 className="text-2xl md:text-4xl font-semibold md:leading-14 text-zinc-900 dark:text-white ">
        Any file format,
        <span className="text-primary dark:text-white ml-2">
          zero limitations
        </span>
      </h2>

      <BrandButton to="/dashboard/my-files" className="mt-3 text-base px-6 ">
        Explore Aset{' '}
      </BrandButton>

      <p className="mt-4 text-zinc-600 dark:text-white max-w-lg leading-relaxed text-sm font-medium md:text-xl">
        "Aset is custom-built to handle everything you throw at it. Seamlessly
        upload, organize, and preview high-definition videos, and images
        archives."
      </p>
    </div>
  );
};
