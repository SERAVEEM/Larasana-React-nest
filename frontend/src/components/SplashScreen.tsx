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
        <h1 className="splash-screen__logo">
          Larasana
        </h1>
        

      </div>
    </div>
  );
}
