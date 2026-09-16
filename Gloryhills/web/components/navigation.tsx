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

  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <header className={`site-header ${open ? 'menu-open' : ''}`}>
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
          width={61}
          height={36}
          priority
        />
      </Link>

      <button
        className={`menu-toggle ${open ? 'active' : ''}`}
        ref={button}
        aria-expanded={open}
        aria-controls="main-menu"
        aria-label={open ? 'Close Menu' : 'Open Menu'}
        onClick={() => setOpen(!open)}
      >
        <span className="hamburger-box">
          <span className="hamburger-inner" />
        </span>
      </button>

      <nav id="main-menu" aria-label="Main navigation" className={open ? 'nav open' : 'nav'}>
        <div className="nav-links-inner">
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
          <Link className="button small nav-give-btn" href="/give" onClick={() => setOpen(false)}>
            Give ↗
          </Link>
        </div>

        <div className="nav-mobile-footer">
          <div className="nav-gathering-card">
            <span className="gathering-dot" />
            <div>
              <strong>Sunday Gathering · 8:00 AM</strong>
              <p>Ojodu Berger Headquarters</p>
            </div>
          </div>
          <div className="nav-mobile-links">
            <a href="https://www.youtube.com/@gloryhillscommunitychurch" target="_blank" rel="noreferrer">
              YouTube ↗
            </a>
            <a href="https://www.instagram.com/gloryhillchurch/" target="_blank" rel="noreferrer">
              Instagram ↗
            </a>
            <Link href="/plan-your-visit" onClick={() => setOpen(false)}>
              Plan a visit ↗
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}
