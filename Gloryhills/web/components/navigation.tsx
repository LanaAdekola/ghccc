'use client';

import Link from 'next/link';
import Image from 'next/image';
import {useState, useRef, useEffect} from 'react';
import {usePathname} from 'next/navigation';

const links = [
  ['About', '/about-us'],
  ['Listen', '/sermons'],
  ['Gatherings', '/events'],
  ['Visit us', '/visit-us'],
];

export default function Navigation() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const path = usePathname();

  useEffect(() => {
    function key(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setOpen(false);
        button.current?.focus();
      }
    }
    document.addEventListener('keydown', key);
    return () => document.removeEventListener('keydown', key);
  }, []);

  return (
    <header className="site-header">
      <Link
        href="/"
        aria-label="Glory Hills Community Church home"
        onClick={() => setOpen(false)}
        className="brand-link"
      >
        <Image
          className="site-logo-desktop"
          src="/images/brand/logo.png"
          alt="Glory Hills Community Church"
          width={220}
          height={51}
          priority
        />
        <Image
          className="site-logo-mobile"
          src="/images/brand/logo-mark.png"
          alt="Glory Hills Community Church"
          width={48}
          height={35}
          priority
        />
      </Link>

      <button
        className={`menu-toggle ${open ? 'active' : ''}`}
        ref={button}
        aria-expanded={open}
        aria-controls="main-menu"
        aria-label={open ? 'Close menu' : 'Open menu'}
        onClick={() => setOpen(!open)}
      >
        <span className="hamburger-box">
          <span className="hamburger-inner" />
        </span>
      </button>

      <nav id="main-menu" aria-label="Main navigation" className={open ? 'nav open' : 'nav'}>
        {links.map(([label, href]) => (
          <Link
            key={href}
            href={href}
            aria-current={path === href ? 'page' : undefined}
            onClick={() => setOpen(false)}
          >
            {label}
          </Link>
        ))}
        <Link className="button small" href="/give" onClick={() => setOpen(false)}>
          Give ↗
        </Link>
      </nav>
    </header>
  );
}
