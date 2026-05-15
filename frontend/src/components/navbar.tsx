import { useState, useEffect } from 'react';
import logo from '../assets/images/Logo.png';
import Hamburger from './hamburger';

const NAV_LINKS = [
  { label: 'Home', href: '/' },
  { label: 'Product', href: '/#hero-showcase' },
  { label: 'About Us', href: '/about' },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="navbar-wrapper">
      <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} id="navbar">
        <div className="navbar__logo">
          <a href="/">
            <img src={logo} alt="Larasana logo" />
          </a>
        </div>

        <ul className="navbar__links">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <a href={link.href}>{link.label}</a>
            </li>
          ))}
        </ul>

        <div className="navbar__hamburger">
          <Hamburger />
        </div>
      </nav>
    </div>
  );
}
