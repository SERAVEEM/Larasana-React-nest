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
  const [isVideoReady, setIsVideoReady] = useState(() => {
    if (window.location.pathname !== '/') return true;
    const win = window as unknown as { __heroVideoReady?: boolean };
    return !!win.__heroVideoReady;
  });

  // Video loading validation (only on homepage)
  useEffect(() => {
    if (window.location.pathname !== '/') return;

    const handleVideoReady = () => {
      setIsVideoReady(true);
    };

    window.addEventListener('hero-video-ready', handleVideoReady);

    // Safety timeout: 3.5s max wait to prevent blocking user on slow connection
    const safetyTimer = setTimeout(() => {
      setIsVideoReady(true);
    }, 3500);

    return () => {
      window.removeEventListener('hero-video-ready', handleVideoReady);
      clearTimeout(safetyTimer);
    };
  }, []);

  // 1. Font loading validation
  useEffect(() => {
    let active = true;

    const checkFonts = async () => {
      if (document.fonts) {
        try {
          // Wait for any pending font loads to finish
          await document.fonts.ready;
        } catch (e) {
          console.warn("Font loading failed, proceeding with fallback fonts:", e);
        }
      }
      if (active) {
        setIsFontReady(true);
      }
    };

    checkFonts();

    // 1-second safety fallback (font-display:swap prevents invisible text anyway)
    const fontTimer = setTimeout(() => {
      if (active) setIsFontReady(true);
    }, 1000);

    return () => {
      active = false;
      clearTimeout(fontTimer);
    };
  }, []);

  // 2. Page load tracking (video check removed — video loads after splash)
  useEffect(() => {
    // Lock scrolling on document body and html (Lenis) while splash screen is active
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('lenis-stopped');

    const checkReady = () => {
      if (document.readyState === 'complete') {
        setIsLoaded(true);
      }
    };

    const handleLoad = () => {
      checkReady();
    };

    // Check if document is already loaded
    if (document.readyState === 'complete') {
      checkReady();
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Fallback safety timer: 5s to prevent getting stuck
    const fallbackTimer = setTimeout(() => {
      setIsLoaded(true);
    }, 5000);

    return () => {
      window.removeEventListener('load', handleLoad);
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
      }, 2000); // 4s to let the entrance and shimmer animations play fully

      return () => clearTimeout(timer);
    }
  }, [isFontReady]);

  // 4. Coordinate transition sequence: slide up only when everything is loaded, fonts ready, min time elapsed, and video is ready
  useEffect(() => {
    if (isLoaded && isFontReady && minTimeElapsed && isVideoReady) {
      setSlideUp(true);

      // Fallback safety timer: ensure onComplete is called even if onTransitionEnd fails to fire
      const timer = setTimeout(() => {
        onComplete();
      }, 1500); // 1.2s transition + 300ms buffer
      return () => clearTimeout(timer);
    }
  }, [isLoaded, isFontReady, minTimeElapsed, isVideoReady, onComplete]);

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
        <h1 className="splash-screen__logo">
          Larasana
        </h1>
        

      </div>
    </div>
  );
}
