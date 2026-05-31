import { useState, useEffect, type FC, type ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { createPortal } from 'react-dom';
import logo from '../assets/images/Logo.png';
import '../style/admin.css';

interface AdminLayoutProps {
  children: ReactNode;
}

const ADMIN_LINKS = [
  { name: 'Dashboard', path: '/admin' },
  { name: 'Product', path: '/admin/products' },
  { name: 'Orders', path: '/admin/orders' }
];

const AdminLayout: FC<AdminLayoutProps> = ({ children }) => {
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Determine if a link is active.
  // /admin is exact. Others can match prefix (e.g. /admin/products/new is active under Product).
  const isLinkActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="admin-page-root">
      {/* Admin Navbar */}
      <div className="navbar-wrapper">
        <nav className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`} style={{ width: '100%', maxWidth: '1400px', margin: '0 auto', gap: 'unset', justifyContent: 'space-between', padding: '0.75rem 3rem' }}>
          {/* Logo Left */}
          <div className="navbar__logo" style={{ display: 'flex', alignItems: 'center' }}>
            <Link to="/admin">
              <img src={logo} alt="Larasana Logo" style={{ height: '2.5rem', width: 'auto', objectFit: 'contain' }} />
            </Link>
          </div>

          {/* Centered Admin Menu */}
          <ul className="navbar__links" style={{ display: 'flex', gap: '5rem', listStyle: 'none', margin: 0, padding: 0 }}>
            {ADMIN_LINKS.map(link => {
              const active = isLinkActive(link.path);
              return (
                <li key={link.name}>
                  <Link
                    to={link.path}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '1rem',
                      fontWeight: active ? '700' : '400',
                      color: active ? '#000' : '#888',
                      letterSpacing: '0.02em',
                      transition: 'all 0.25s ease',
                      position: 'relative',
                      textDecoration: 'none'
                    }}
                  >
                    {link.name}
                    {active && (
                      <span
                        style={{
                          position: 'absolute',
                          bottom: '-0.4rem',
                          left: '50%',
                          transform: 'translateX(-50%)',
                          width: '4px',
                          height: '4px',
                          borderRadius: '50%',
                          backgroundColor: '#b8860b'
                        }}
                      />
                    )}
                  </Link>
                </li>
              );
            })}
          </ul>

          {/* Hamburger Right */}
          <div className="navbar__hamburger">
            <button
              className="hamburger-btn"
              onClick={() => setIsDrawerOpen(true)}
              aria-label="Open Admin Menu"
              style={{ display: 'flex' }}
            >
              <span className="hamburger-btn__line1" style={{ backgroundColor: '#000' }} />
              <span className="hamburger-btn__line2" style={{ backgroundColor: '#000' }} />
              <span className="hamburger-btn__line3" style={{ backgroundColor: '#000' }} />
            </button>
          </div>
        </nav>
      </div>

      {/* Main Content Area */}
      <main style={{ minHeight: 'calc(100vh - 120px)' }}>
        {children}
      </main>

      {/* Admin Footer */}
      <footer style={{
        borderTop: '1px solid #eaeaea',
        padding: '2rem 3rem',
        backgroundColor: '#fff',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '1rem',
        fontSize: '0.85rem',
        color: '#666',
        fontFamily: "'Inter', sans-serif"
      }}>
        <div>&copy; {new Date().getFullYear()} - Larasana Admin</div>
        <div style={{ display: 'flex', gap: '2rem' }}>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>About</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Careers</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Policy</a>
          <a href="#" style={{ color: 'inherit', textDecoration: 'none' }}>Contact</a>
        </div>
      </footer>

      {/* Mobile Drawer Navigation Portal */}
      {isDrawerOpen && createPortal(
        <>
          <div
            className="hamburger-overlay__backdrop hamburger-overlay__backdrop--visible"
            onClick={() => setIsDrawerOpen(false)}
            style={{ zIndex: 2000 }}
          />

          <div 
            className="hamburger-overlay hamburger-overlay--open"
            style={{ 
              zIndex: 2001,
              width: '280px',
              padding: '4rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              gap: '3rem'
            }}
          >
            {/* Close Button */}
            <button
              className="hamburger-overlay__close"
              onClick={() => setIsDrawerOpen(false)}
              aria-label="Close menu"
            >
              <svg viewBox="0 0 24 24" style={{ width: '1.75rem', height: '1.75rem', stroke: '#000', strokeWidth: 2 }}>
                <line x1="4" y1="4" x2="20" y2="20" />
                <line x1="20" y1="4" x2="4" y2="20" />
              </svg>
            </button>

            {/* Title / Logo in Drawer */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <img src={logo} alt="Larasana Logo" style={{ height: '2rem', width: 'auto' }} />
              <span style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, letterSpacing: '0.05em', color: '#000' }}>ADMIN</span>
            </div>

            {/* Links list */}
            <nav className="hamburger-overlay__links" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
              {ADMIN_LINKS.map((link) => {
                const active = isLinkActive(link.path);
                return (
                  <Link
                    key={link.name}
                    className="hamburger-overlay__link"
                    to={link.path}
                    onClick={() => setIsDrawerOpen(false)}
                    style={{
                      fontFamily: "'Inter', sans-serif",
                      fontSize: '1.5rem',
                      fontWeight: active ? 700 : 400,
                      color: active ? '#b8860b' : '#333',
                      textDecoration: 'none'
                    }}
                  >
                    {link.name}
                  </Link>
                );
              })}
            </nav>
          </div>
        </>,
        document.body
      )}
    </div>
  );
};

export default AdminLayout;
