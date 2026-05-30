import React, { useState } from 'react';
import { motion } from 'motion/react';
import SectionHeading from '@/shared/SectionHeading/SectionHeading';
import {
  CloudVaultIcon,
  FolderOrganizerIcon,
  SmartSharingIcon,
} from './FeatureIcons';

interface FeatureItem {
  title: string;
  description: string;
  icon: React.ComponentType<{ hovered: boolean }>;
  badge: string;
}

const Feature: React.FC = () => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const features: FeatureItem[] = [
    {
      title: 'Direct-to-R2 Cloud Vault',
      description:
        'Upload folders, assets, or media straight into private Cloudflare R2 object storage. Bypass middleman servers to eliminate latencies and secure payloads client-side.',
      icon: CloudVaultIcon,
      badge: 'Zero Latency',
    },
    {
      title: 'Dynamic File Organizer',
      description:
        'Structure files in an infinitely nested directory tree. Create folders, move items dynamically, and rename files instantly in a clutter-free dashboard.',
      icon: FolderOrganizerIcon,
      badge: 'Dynamic Trees',
    },
    {
      title: 'Smart Sharing &Starred Lists',
      description:
        'Instantly star key assets, view recent actions, and generate secure collaboration share-gates with customizable access levels for your team.',
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

      {/* 3-Column Premium Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 mt-14 max-w-5xl mx-auto">
        {features.map((feature, index) => {
          const IconComponent = feature.icon;
          const isHovered = hoveredIndex === index;

          return (
            <motion.div
              key={index}
              onMouseEnter={() => setHoveredIndex(index)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="group relative flex flex-col items-start text-left p-6 border-dashed border bg-white/60 dark:bg-zinc-950/40 border-zinc-300 dark:border-zinc-800/80 hover:border-primary/45 dark:hover:border-primary/45 transition-all duration-350 shadow-2xs hover:shadow-md cursor-pointer select-none"
              whileHover={{ y: -5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
            >
              {/* Card Radial Underglow in dark mode */}
              <div className="absolute inset-0 bg-radial-[circle_at_center,rgba(124,58,237,0.015),transparent_65%] dark:bg-radial-[circle_at_center,rgba(124,58,237,0.03),transparent_60%] pointer-events-none rounded-3xl" />

              {/* Dynamic Animated Floating Icon */}
              <div className="mb-5 transition-transform duration-300 group-hover:scale-[1.03]">
                <IconComponent hovered={isHovered} />
              </div>

              {/* Feature Badge */}
              <span className="text-[10px] uppercase tracking-wider font-extrabold text-primary bg-primary/5 dark:bg-primary/10 px-2 py-0.5 rounded-full mb-3 border border-primary/10">
                {feature.badge}
              </span>

              {/* Feature Details */}
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 tracking-tight leading-tight group-hover:text-primary transition-colors duration-300">
                {feature.title}
              </h3>

              <p className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 mt-2.5 leading-relaxed">
                {feature.description}
              </p>

              {/* Decorative Corner Light Pulsing Ring */}
              <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex size-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40 opacity-75" />
                <span className="relative inline-flex rounded-full size-1.5 bg-primary/70" />
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
};

export default Feature;
export { Feature };
