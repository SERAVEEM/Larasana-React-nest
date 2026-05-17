import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const MENU_ITEMS = ['Login', 'Product', 'About Us', 'Story'];

export default function Hamburger() {
  const [isOpen, setIsOpen] = useState(false);

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
              {MENU_ITEMS.map((item) => (
                <a
                  key={item}
                  className="hamburger-overlay__link"
                  href={`#${item.toLowerCase()}`}
                  onClick={() => setIsOpen(false)}
                >
                  {item}
                </a>
              ))}
            </nav>
          </div>
        </>,
        document.body
      )}
    </>
  );
}