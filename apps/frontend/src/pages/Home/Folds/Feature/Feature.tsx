import React, { useState } from 'react';
import { motion } from 'motion/react';
import SectionHeading from '@/shared/SectionHeading/SectionHeading';
import {
  CloudVaultIcon,
  FolderOrganizerIcon,
  SmartSharingIcon,
} from './FeatureIcons';
import FadeIn from '@/shared/FadeIn/FadeIn';

interface FeatureItem {
  title: string;
  description: string;
  image: string;
  icon: React.ComponentType<{ hovered: boolean }>;
  badge: string;
}

const Feature: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features: FeatureItem[] = [
    {
      title: 'Fast Cloud Upload',
      description:
        'Upload folders, assets, or media straight into private Cloudflare R2 object storage.',
      image: '/feature/image1.png',
      icon: CloudVaultIcon,
      badge: 'Zero Latency',
    },
    {
      title: 'Organize Your Files',
      description:
        'Structure files in an infinitely nested directory tree. Create folders, move items dynamically.',
      image: '/feature/image2.png',
      icon: FolderOrganizerIcon,
      badge: 'Dynamic Trees',
    },
    {
      title: 'Smart Sharing',
      description:
        'Star key assets, view recent actions, and share files and folders with others.',
      image: '/feature/image3.png',
      icon: SmartSharingIcon,
      badge: 'Smart Sharing',
    },
  ];

  return (
    <section className="py-20 px-4 max-w-7xl mx-auto">
      {/* Centered Heading */}
      <SectionHeading
        badge="Features"
        title="Raw Performance. Sealed Security."
        description="Experience the raw performance of Cloudflare direct-to-bucket transfers, tied to an interactive file organizer and smart team gates."
        align="center"
      />

      <FadeIn direction="up">
        {/* 3-Column Premium Responsive Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-14 ">
          {features.map((feature, index) => {
            return (
              <motion.div
                key={index}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="group relative flex flex-col items-center text-center p-8 border rounded-3xl bg-white/60 dark:bg-zinc-950/40 border-zinc-200/80 dark:border-zinc-800/80 hover:border-primary/25 dark:hover:border-primary/45 transition-all duration-350 shadow-sm hover:shadow-md cursor-pointer select-none"
                whileHover={{ y: -5 }}
                transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              >
                {/* Feature Badge */}
                <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/5 dark:bg-primary/10 px-2 py-0.5 rounded-full mb-3 border border-primary/10">
                  {feature.badge}
                </span>
                {/* Dynamic Animated Floating Icon */}
                <div className="mb-5 transition-transform duration-300 group-hover:scale-[1.03]">
                  <img
                    src={feature.image}
                    alt={feature.title}
                    className="size-60 object-contain rounded-2xl "
                  />
                </div>
                {/* Feature Details */}
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>
                <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 mt-2.5 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </FadeIn>
    </section>
  );
};

export default Feature;
export { Feature };
