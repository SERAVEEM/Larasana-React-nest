import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from '../assets/images/Logo.png';
import Hamburger from './hamburger';

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
          <Link to="/">
            <img src={logo} alt="Larasana logo" />
          </Link>
        </div>

        <ul className="navbar__links">
          <li><Link to="/#hero-showcase">Product</Link></li>
          <li><Link to="/Story">Story</Link></li>
          <li><Link to="/Impact">Impact</Link></li>
        </ul>

        <div className="navbar__hamburger">
          <Hamburger />
        </div>
      </nav>
    </div>
  );
}
