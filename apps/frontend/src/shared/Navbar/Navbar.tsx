import Section from '../Section/Sectiont';
import Logo from './Logo';
import BrandButton from '../BrandButton/BrandButton';
import { Link } from 'react-router';
import { SignInButton, useUser } from '@clerk/react';

const Navbar = () => {
  const { isSignedIn } = useUser();
  const navItems = [
    {
      label: 'About',
      href: '/about',
    },
    {
      label: 'Blog',
      href: '/blog',
    },
    {
      label: 'Changelog',
      href: '/changelog',
    },
    {
      label: 'Contact',
      href: '/contact',
      target: '_blank',
    },
    {
      label: 'Power-Ups',
      href: '/power-ups',
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
            item.href.startsWith('http') ? (
              <a
                className="text-base text-zinc-500 hover:text-zinc-900 transition-all duration-300 dark:text-white font-semibold"
                key={item.href}
                href={item.href}
                target={item?.target || 'none'}
              >
                {item.label}
              </a>
            ) : (
              <Link
                className="text-base text-zinc-500 hover:text-zinc-900 transition-all  dark:text-white font-semibold"
                key={item.href}
                to={item.href}
              >
                {item.label}
              </Link>
            ),
          )}
        </div>
        <div className="flex items-center gap-2">
          {isSignedIn ? (
            <BrandButton label="Dashboard" to="/dashboard" />
          ) : (
            <SignInButton mode="modal" withSignUp>
              <BrandButton label="Sign In" />
            </SignInButton>
          )}
        </div>
      </div>
    </Section>
  );
};

export default Navbar;
