import { useEffect, useState } from 'react';
import '../style/SplashScreen.css';

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [slideUp, setSlideUp] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Lock scrolling on document body and html (Lenis) while splash screen is active
    document.body.style.overflow = 'hidden';
    document.documentElement.classList.add('lenis-stopped');

    const handleLoad = () => {
      setIsLoaded(true);
    };

    // Check if document is already loaded
    if (document.readyState === 'complete') {
      setIsLoaded(true);
    } else {
      window.addEventListener('load', handleLoad);
    }

    // Fallback safety timer to guarantee the splash screen unmounts and unlocks page interaction (5s max)
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

  useEffect(() => {
    if (isLoaded) {
      // Ensure the splash screen is visible for a minimum of 1.5s so the animation plays smoothly
      const minDurationTimer = setTimeout(() => {
        setSlideUp(true);
      }, 1500);

      return () => clearTimeout(minDurationTimer);
    }
  }, [isLoaded]);

  const handleTransitionEnd = (e: React.TransitionEvent<HTMLDivElement>) => {
    // Unmount once the slide-up transform (or opacity for reduced motion) finishes
    if (e.propertyName === 'transform' || e.propertyName === 'opacity') {
      onComplete();
    }
  };

  return (
    <div 
      className={`splash-screen ${slideUp ? 'splash-screen--slide-up' : ''}`}
      onTransitionEnd={handleTransitionEnd}
      aria-hidden="true"
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
