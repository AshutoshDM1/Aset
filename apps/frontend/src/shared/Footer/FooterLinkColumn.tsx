import { Link } from 'react-router';

export interface FooterLink {
  label: string;
  href: string;
  badge?: string;
}

export interface FooterLinkColumnProps {
  title: string;
  links: FooterLink[];
}

const FooterLinkColumn = ({ title, links }: FooterLinkColumnProps) => {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold text-zinc-900 dark:text-white">
        {title}
      </p>
      <ul className="flex flex-col gap-2.5">
        {links.map((link) => {
          const isExternal = link.href.startsWith('http');
          const baseClass =
            'text-sm text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors duration-200 flex items-center gap-2';

          return (
            <li key={link.href}>
              {isExternal ? (
                <a
                  href={link.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={baseClass}
                >
                  {link.label}
                  {link.badge && <Badge label={link.badge} />}
                </a>
              ) : (
                <Link to={link.href} className={baseClass}>
                  {link.label}
                  {link.badge && <Badge label={link.badge} />}
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

const Badge = ({ label }: { label: string }) => (
  <span className="inline-flex items-center rounded-full bg-violet-600 px-2 py-0.5 text-[10px] font-semibold text-white leading-none">
    {label}
  </span>
);

export default FooterLinkColumn;
