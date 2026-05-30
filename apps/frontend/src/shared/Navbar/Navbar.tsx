import Section from '../Section/Section';
import Logo from './Logo';
import BrandButton from '../BrandButton/BrandButton';
import { Link } from 'react-router';
import { SignInButton, SignUpButton, useUser } from '@clerk/react';

const Navbar = () => {
  const { isSignedIn } = useUser();
  const navItems = [
    {
      label: 'Features',
      href: '#feature',
    },
    {
      label: 'Integration',
      href: '#integration',
    },
    {
      label: 'FAQ',
      href: '#faq',
    },
    {
      label: 'Workflow',
      href: '#workflow',
    },
    {
      label: 'Pricing',
      href: '#pricing',
    },
  ];
  return (
    <Section className="py-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2 items-center">
          <Logo className="w-10 h-10" />
          <span className="text-2xl text-black dark:text-white font-bold mt-1.5">
            Aset
          </span>
        </div>
        <div className="hidden md:flex items-center justify-center gap-6">
          {navItems.map((item) =>
            item.href.startsWith('/') ? (
              // Internal route → React Router Link
              <Link
                className="text-base text-zinc-500 hover:text-zinc-900 transition-all dark:text-white font-semibold"
                key={item.href}
                to={item.href}
              >
                {item.label}
              </Link>
            ) : (
              // Anchor (#section) or external (http) → native <a> so the browser handles scroll
              <a
                className="text-base text-zinc-500 hover:text-zinc-900 transition-all duration-300 dark:text-white font-semibold"
                key={item.href}
                href={item.href}
              >
                {item.label}
              </a>
            ),
          )}
        </div>
        <div className="flex items-center gap-4">
          {isSignedIn ? (
            <BrandButton label="Dashboard" to="/dashboard" />
          ) : (
            <>
              <SignInButton mode="modal">
                <button className="text-sm font-semibold text-zinc-600 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white transition-colors duration-300 cursor-pointer">
                  Sign In
                </button>
              </SignInButton>
              <SignUpButton mode="modal">
                <BrandButton label="Sign Up" />
              </SignUpButton>
            </>
          )}
        </div>
      </div>
    </Section>
  );
};

export default Navbar;
