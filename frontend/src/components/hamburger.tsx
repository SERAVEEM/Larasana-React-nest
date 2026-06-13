import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link, useNavigate } from 'react-router-dom';
import '../style/hamburger.css';

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

  const handleLogout = () => {
    localStorage.removeItem('larasana_auth_token');
    setIsLoggedIn(false);
    setIsOpen(false);
    navigate('/login');
  };

  const handleContactClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsOpen(false);
    const footer = document.getElementById('footer');
    if (footer) {
      setTimeout(() => {
        footer.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
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
              <Link className="hamburger-overlay__link" to="/" onClick={() => setIsOpen(false)}>
                Home
              </Link>

              <Link className="hamburger-overlay__link" to="/Story" onClick={() => setIsOpen(false)}>
                Story
              </Link>

              <Link className="hamburger-overlay__link" to="/Impact" onClick={() => setIsOpen(false)}>
                Impact
              </Link>
              
              <Link className="hamburger-overlay__link" to="/aboutus" onClick={() => setIsOpen(false)}>
                About Us
              </Link>

              <Link className="hamburger-overlay__link" to="/my-orders" onClick={() => setIsOpen(false)}>
                Order History
              </Link>

              {isLoggedIn ? (
                <button
                  className="hamburger-overlay__link hamburger-logout-btn"
                  onClick={handleLogout}
                  style={{
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    width: '100%',
                    padding: 0
                  }}
                >
                  Logout
                </button>
              ) : (
                <Link className="hamburger-overlay__link" to="/register" onClick={() => setIsOpen(false)}>
                  Register
                </Link>
              )}

              <Link className="hamburger-overlay__link" to="#footer" onClick={handleContactClick}>
                Contact Us
              </Link>
            </nav>
          </div>
        </>,
        document.body
      )}
    </>
  );
}