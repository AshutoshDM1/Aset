import { ThemeToggle } from '@/components/theme-toggle';

const FooterBottom = () => {
  return (
    <div className="mt-12 flex flex-col sm:flex-row sm:items-center justify-between border-t border-border pt-6 pb-2 col-span-1 md:col-span-2 gap-4">
      <div className="flex flex-wrap items-center justify-between w-full gap-x-4 gap-y-2">
        <p className="text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} Aset. All rights reserved.
        </p>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <a
            href="/llm.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            llm.txt
          </a>
          <a
            href="/robots.txt"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            robots.txt
          </a>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            sitemap.xml
          </a>
        </div>
      </div>
      <ThemeToggle className="fixed bottom-4 right-4" />
    </div>
  );
};

export default FooterBottom;
