import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import SectionHeading from '@/shared/SectionHeading/SectionHeading';
import BrandButton from '@/shared/BrandButton/BrandButton';
import { Plus, Minus, MessageSquare, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AvatarStack } from './FaqIcons';

interface FaqItem {
  question: string;
  answer: string;
}

const FaqItemComponent: React.FC<{
  question: string;
  answer: string;
  isOpen: boolean;
  onClick: () => void;
}> = ({ question, answer, isOpen, onClick }) => {
  return (
    <motion.div
      layout
      className={cn(
        'group border border-zinc-200/80 dark:border-zinc-800/80 bg-white dark:bg-zinc-950 rounded-2xl overflow-hidden transition-all duration-300',
        isOpen
          ? 'border-violet-500/50 dark:border-violet-500/50 shadow-[0_12px_30px_rgba(124,58,237,0.06)]'
          : 'hover:border-zinc-300 dark:hover:border-zinc-700/80 hover:shadow-[0_8px_20px_rgba(0,0,0,0.02)]',
      )}
    >
      <button
        onClick={onClick}
        className="w-full flex items-center justify-between text-left p-2 md:p-4 gap-4 cursor-pointer focus:outline-hidden"
      >
        <span className="text-base md:text-lg font-semibold text-zinc-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors duration-200">
          {question}
        </span>
        <div
          className={cn(
            'size-8 rounded-full bg-zinc-100/80 dark:bg-zinc-900/80 flex items-center justify-center shrink-0 transition-all duration-300',
            isOpen
              ? 'bg-violet-100 dark:bg-violet-950/80 text-violet-600 dark:text-violet-400 rotate-180'
              : 'text-zinc-500',
          )}
        >
          {isOpen ? (
            <Minus className="size-4 shrink-0" />
          ) : (
            <Plus className="size-4 shrink-0" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="px-6 pb-6 md:px-7 md:pb-7 ">
              <p className="text-sm md:text-base font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {answer}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export const Faq: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqData: FaqItem[] = [
    {
      question: 'How fast are the file transfers in Aset?',
      answer:
        'Incredibly fast. Aset utilizes multipart direct uploads and secure edge caching, meaning uploads and downloads happen directly between your browser and Cloudflare’s global R2 network. This bypasses typical server bottlenecks, offering speeds up to 10x faster than traditional clouds.',
    },
    {
      question: 'What file formats can I store and preview?',
      answer:
        'Aset is built to handle virtually any format. It includes rich, native in-browser previews for HD videos, audio tracks, PDFs, images (including vector SVGs), ZIP archives, and even code syntax-highlighting for developers.',
    },
    {
      question: 'Is my data secure in the cloud?',
      answer:
        'Security is our top priority. Files uploaded to Aset are fully encrypted in transit and stored in highly durable, private Cloudflare R2 buckets. Access control ensures only authorized users with secure links or account credentials can access your assets.',
    },
    {
      question: 'How do nested folders work?',
      answer:
        'Aset features a dynamic drag-and-drop file explorer. You can easily create multi-level nested folders, move files, star important items, and rename directory structures. Everything updates in real-time without needing page refreshes.',
    },
    {
      question: 'Can I share assets with external clients?',
      answer:
        'Yes! You can instantly generate secure share links for both individual assets or entire folder structures. You can customize link sharing permissions so clients or external teams can easily download or view files.',
    },
  ];

  const handleToggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div>
      <div className="space-y-10 max-w-4xl mx-auto">
        {/* Left Side: Header & Support Card */}
        <SectionHeading
          badge="FAQ"
          title="Got questions? We've got answers."
          description="Discover how Aset simplifies cloud backups, directory organization, and secure sharing in one sleek, unified interface."
          align="center"
        />

        {/* Right Side: Accordion Accordions */}
        <div className="flex flex-col gap-4 w-full ">
          {faqData.map((faq, index) => (
            <FaqItemComponent
              key={index}
              question={faq.question}
              answer={faq.answer}
              isOpen={openIndex === index}
              onClick={() => handleToggle(index)}
            />
          ))}
        </div>

        <div>
          {/* Premium "Still have questions?" Card */}
          <div className="w-full bg-linear-to-b from-zinc-50 to-white dark:from-zinc-900 dark:to-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 rounded-3xl p-6 md:p-8 flex flex-col gap-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)] dark:shadow-none relative overflow-hidden group">
            {/* Ambient Background Glow on Hover */}
            <div className="absolute -right-16 -top-16 size-40 bg-violet-500/10 dark:bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/15 dark:group-hover:bg-violet-500/10 transition-colors duration-500 pointer-events-none" />

            <div className="flex items-center justify-between">
              <AvatarStack />
              {/* Active Pulse Dot Badge */}
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xs select-none">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
                </span>
                Support Online
              </span>
            </div>

            <div className="flex flex-col gap-2">
              <h3 className="text-xl font-bold text-zinc-900 dark:text-white">
                Still have questions?
              </h3>
              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Can&apos;t find what you&apos;re looking for? Chat with our team
                and get an answer in minutes. We are always ready to help!
              </p>
            </div>

            <BrandButton
              to="https://x.com/AshutoshDM_1"
              className="w-fit flex items-center justify-center gap-2 group/btn cursor-pointer py-3"
            >
              <MessageSquare className="size-4 shrink-0 transition-transform group-hover/btn:scale-110" />
              <span>Chat with Support</span>
              <ArrowRight className="size-4 shrink-0 opacity-0 -translate-x-2 group-hover/btn:opacity-100 group-hover/btn:translate-x-0 transition-all duration-300" />
            </BrandButton>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Faq;
