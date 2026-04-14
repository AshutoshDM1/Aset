import { ThemeToggle } from '@/components/theme-toggle';

const FooterBottom = () => {
  return (
    <div className="mt-12 flex items-center justify-between border-t border-border pt-6 pb-2">
      <p className="text-sm text-muted-foreground">
        &copy; {new Date().getFullYear()} Aset. All rights reserved.
      </p>
      <ThemeToggle className="fixed bottom-4 right-4" />
    </div>
  );
};

export default FooterBottom;
