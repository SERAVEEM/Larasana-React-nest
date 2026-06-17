import { useEffect, useState } from 'react';
import '../style/SplashScreen.css';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [slideUp, setSlideUp] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isFontReady, setIsFontReady] = useState(false);
  const [minTimeElapsed, setMinTimeElapsed] = useState(false);

  // 1. Font loading validation
  useEffect(() => {
    let active = true;

    const checkFonts = async () => {
      if (document.fonts) {
        try {
          // Attempt to load the brand custom fonts and fallback serif
          await Promise.all([
            document.fonts.load("bold 72px 'Linotype Didot Bold'"),
            document.fonts.load("72px 'GFS Didot'")
          ]);
        } catch (e) {
          console.warn("Font loading failed, proceeding with fallback fonts:", e);
        }
      }
      if (active) {
        setIsFontReady(true);
      }
    };

    checkFonts();

    // 3-second safety fallback for font loading
    const fontTimer = setTimeout(() => {
      if (active) setIsFontReady(true);
    }, 3000);

    return () => {
      active = false;
      clearTimeout(fontTimer);
    };
  }, []);

  // 2. Page and video download progress tracking
  useEffect(() => {
    // Lock scrolling on document body and html (Lenis) while splash screen is active
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('lenis-stopped');

    const checkReady = () => {
      const isPageLoaded = document.readyState === 'complete';
      const isVideoReady = window.location.pathname !== '/' || (window as any).__heroVideoReady;
      
      if (isPageLoaded && isVideoReady) {
        setIsLoaded(true);
      }
    };

    const handleLoad = () => {
      checkReady();
    };

    const handleVideoReady = () => {
      setIsLoaded(true);
    };

    // Check if document is already loaded
    if (document.readyState === 'complete') {
      checkReady();
    } else {
      window.addEventListener('load', handleLoad);
    }

    window.addEventListener('hero-video-ready', handleVideoReady);

    // Fallback safety timer: 60s on homepage for video, 5s on other pages
    const timeoutDuration = window.location.pathname === '/' ? 60000 : 5000;
    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true);
    }, timeoutDuration);

    return () => {
      window.removeEventListener('load', handleLoad);
      window.removeEventListener('hero-video-ready', handleVideoReady);
      clearTimeout(fallbackTimer);
      document.body.style.overflow = '';
      document.documentElement.classList.remove('lenis-stopped');
    };
  }, []);

  // 3. Start minimum display timer once the entrance animation starts (fonts are ready)
  useEffect(() => {
    if (isFontReady) {
      const timer = setTimeout(() => {
        setMinTimeElapsed(true);
      }, 4000); // 4s to let the entrance and shimmer animations play fully

      return () => clearTimeout(timer);
    }
  }, [isFontReady]);

  // 4. Coordinate transition sequence: slide up only when everything is loaded AND the minimum animation time has elapsed
  useEffect(() => {
    if (isLoaded && isFontReady && minTimeElapsed) {
      setSlideUp(true);
    }
  }, [isLoaded, isFontReady, minTimeElapsed]);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && (e.propertyName === 'transform' || e.propertyName === 'opacity')) {
      onComplete();
    }
  };

  return (
    <div 
      className={`splash-screen ${slideUp ? 'splash-screen--slide-up' : ''} ${isFontReady ? 'splash-screen--ready' : ''}`}
      onTransitionEnd={handleTransitionEnd}
      aria-hidden={slideUp}
    >
      <div className="splash-screen__content">
        <svg viewBox="0 0 1000 200" className="splash-screen__svg" style={{ width: '95vw', maxWidth: '900px' }}>
          <defs>
            <linearGradient id="shimmer" x1="-100%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#222222" />
              <stop offset="25%" stopColor="#555555" />
              <stop offset="50%" stopColor="#ffffff" />
              <stop offset="75%" stopColor="#555555" />
              <stop offset="100%" stopColor="#222222" />
              <animate attributeName="x1" from="-100%" to="100%" dur="2s" repeatCount="indefinite" />
              <animate attributeName="x2" from="0%" to="200%" dur="2s" repeatCount="indefinite" />
            </linearGradient>
          </defs>
          <text 
            x="50%" 
            y="50%" 
            textAnchor="middle" 
            dominantBaseline="central" 
            fill="url(#shimmer)" 
            style={{
              fontFamily: "'Linotype Didot Bold', 'GFS Didot', serif",
              fontSize: '72px',
              fontWeight: 'bold',
              letterSpacing: '0.25em',
              textTransform: 'uppercase'
            }}
          >
            Larasana
          </text>
        </svg>
        

      </div>
    </div>
  );
}
