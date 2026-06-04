import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';

export default function Hamburger() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('larasana_auth_token'));
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const menuItems = [
    { name: 'Home', path: '/' },
    { name: 'Product', path: '/#hero-showcase' },
    { name: 'About Us', path: '/aboutus' },
    { name: 'Story', path: '/Story' },
    { name: 'Impact', path: '/Impact' },
  ];

  const handleLogout = () => {
    localStorage.removeItem('larasana_auth_token');
    setIsLoggedIn(false);
    setIsOpen(false);
    navigate('/login');
  };

  return (
    <>
      <button
        className="hamburger-btn"
        onClick={() => setIsOpen(true)}
        aria-label="Open menu"
        id="hamburger-trigger"
      >
        <span className="hamburger-btn__line1" />
        <span className="hamburger-btn__line2" />
        <span className="hamburger-btn__line3" />
      </button>


      {createPortal(
        <>
          <div
            className={`hamburger-overlay__backdrop${isOpen ? ' hamburger-overlay__backdrop--visible' : ''}`}
            onClick={() => setIsOpen(false)}
          />

          <div className={`hamburger-overlay${isOpen ? ' hamburger-overlay--open' : ''}`}>
            <button
              className="hamburger-overlay__close"
              onClick={() => setIsOpen(false)}
              aria-label="Close menu"
              id="hamburger-close"
            >
              <svg viewBox="0 0 24 24">
                <line x1="4" y1="4" x2="20" y2="20" />
                <line x1="20" y1="4" x2="4" y2="20" />
              </svg>
            </button>

            <nav className="hamburger-overlay__links">
              {menuItems.map((item) => (
                <Link
                  key={item.name}
                  className="hamburger-overlay__link"
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {isLoggedIn ? (
                <>
                  <Link
                    className="hamburger-overlay__link"
                    to="/my-orders"
                    onClick={() => setIsOpen(false)}
                  >
                    My Orders
                  </Link>
                  <button
                    className="hamburger-overlay__link hamburger-logout-btn"
                    onClick={handleLogout}
                    style={{
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      fontFamily: 'inherit',
                      cursor: 'pointer',
                      width: '100%',
                      padding: 0
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link
                  className="hamburger-overlay__link"
                  to="/login"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
              )}
            </nav>
          </div>
        </>,
        document.body
      )}
    </>
  );
}