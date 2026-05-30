import React from 'react';
import { motion } from 'motion/react';
import SectionHeading from '@/shared/SectionHeading/SectionHeading';
import WorkflowWireframe from './WorkflowWireframe';

interface WorkflowStep {
  number: string;
  title: string;
  description: string;
}

const Workflow: React.FC = () => {
  const steps: WorkflowStep[] = [
    {
      number: '01',
      title: 'Secure upload to R2',
      description:
        'Drag and drop videos, images, or PDFs. Uploads are encrypted and stored directly in secure Cloudflare R2 object storage.',
    },
    {
      number: '02',
      title: 'Organize into nested folders',
      description:
        'Create directories, move items, and rename assets dynamically. Structure your files in a clean, clutter-free grid.',
    },
    {
      number: '03',
      title: 'Starred lists & smart sharing',
      description:
        'Instantly star key assets, view recent uploads, or securely collaborate by generating share links for your team.',
    },
  ];

  return (
    <div>
      <SectionHeading
        badge="Workflow"
        title="Organize files effortlessly"
        description="Discover how Aset simplifies cloud backups, directory organization, and secure sharing in one sleek, unified interface."
        align="center"
      />
      <div className="grid grid-cols-1 lg:grid-cols-2  gap-6  py-16 px-4">
        <div className="w-full flex flex-col items-start text-left gap-8 max-w-xl ml-auto">
          <h2 className="text-xl md:text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white leading-tight">
            Streamline your
            <span className="text-primary dark:text-white ml-2">drive</span>
          </h2>

          {/* Steps List */}
          <div className="flex flex-col gap-6 w-full ">
            {steps.map((step, index) => (
              <motion.div
                key={index}
                whileHover={{ x: 6 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="group flex gap-4 p-4 rounded-2xl "
              >
                {/* Step Number Badge */}
                <div className="size-10 shrink-0 rounded-sm bg-zinc-200/50 dark:bg-zinc-900 flex items-center justify-center text-lg font-semibold text-zinc-700 dark:text-zinc-300 ">
                  {step.number}
                </div>

                {/* Step content */}
                <div className="flex flex-col gap-1.5">
                  <h3 className="text-xl font-semibold text-zinc-900 dark:text-white ">
                    {step.title}
                  </h3>
                  <p className="text-lg font-medium  text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Right side: Mockup Canvas Screen */}
        <div className="w-full flex justify-center">
          <WorkflowWireframe />
        </div>
      </div>
    </div>
  );
};

export default Workflow;
export { Workflow };
