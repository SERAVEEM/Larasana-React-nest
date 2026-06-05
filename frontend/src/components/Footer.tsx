import { Link } from 'react-router-dom';
import '../style/Footer.css';

export default function Footer() {
  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer" id="footer">
      <div className="footer-container">
        
        {/* Brand Column */}
        <div className="footer-brand">
          <div className="footer-logo">
            <Link to="/" onClick={handleScrollToTop} className="footer-logo-link">
             
              <span className="footer-logo-text">Larasana</span>
            
            </Link>
          </div>
          <p className="footer-description">
            Established in 2024, Larasana is a contemporary cultural brand rooted in Lombok’s heritage, 
            dedicated to preserving the timeless art of tenun and batik while transforming them into 
            modern expressions of fashion and art. By collaborating with local artisans and reinterpreting 
            traditional techniques through bold, innovative design, we ensure that Indonesia’s legacy 
            not only survives but thrives. Alive, relevant, and celebrated on the global stage.
          </p>
          
          <div className="footer-socials-row">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Facebook">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="Instagram">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="footer-social-btn" aria-label="LinkedIn">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
          </div>
        </div>

        {/* Explore Column */}
        <div className="footer-links-col">
          <h4 className="footer-col-title-1">Explore</h4>
          <ul className="footer-explore-links">
            <li><Link to="/Story" onClick={handleScrollToTop}>Story</Link></li>
            <li><Link to="/aboutus" onClick={handleScrollToTop}>About Us</Link></li>
            <li><Link to="/Impact" onClick={handleScrollToTop}>Impact</Link></li>
          </ul>
        </div>

        {/* Information Column */}
        <div className="footer-info-col">
          <h4 className="footer-col-title-2">Information</h4>
          <div className="footer-info-block">
            <span className="footer-info-label">WhatsApp</span>
            <a href="https://wa.me/62821333948400" target="_blank" rel="noopener noreferrer" className="footer-info-value">+62 8213 3394 8400</a>
          </div>
          <div className="footer-info-block">
            <span className="footer-info-label">Email</span>
            <a href="mailto:info@larasana.org" className="footer-info-value">@Larasana.org</a>
          </div>
          <div className="footer-info-block">
            <span className="footer-info-label">Education Information/<br />Performance</span>
            <span className="footer-info-value">+62 2283 7330</span>
          </div>
        </div>

      </div>
      
      {/* Footer Bottom Bar */}
      <div className="footer-bottom">
        <span className="footer-copyright-centered">
          Copyright &copy; 2024 LARASANA. All Rights reserved
        </span>
      </div>
    </footer>
  );
}
