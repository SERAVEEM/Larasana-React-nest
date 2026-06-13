import { useEffect, useRef, useState } from 'react';
import { ASSETS } from '../utils/assets';
import '../style/hero.css';

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const handleVideoReady = () => {
    (window as any).__heroVideoReady = true;
    window.dispatchEvent(new CustomEvent('hero-video-ready'));
  };

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  useEffect(() => {
    if (isMobile) {
      // If mobile, bypass video wait and tell splash screen we are ready instantly
      handleVideoReady();
    } else {
      const video = videoRef.current;
      if (video && video.readyState >= 3) {
        handleVideoReady();
      }
    }
  }, [isMobile]);

  return (
    <section className="hero-section" id="hero" style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>

      {!isMobile ? (
        <video
          ref={videoRef}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          onCanPlay={handleVideoReady}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            zIndex: 1
          }}
        >
          <source src={ASSETS.heroVideoWebm} type="video/webm" />
          <source src={ASSETS.heroVideoMp4} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: '#111',
            backgroundImage: `url(${ASSETS.story.larasana})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            zIndex: 1,
            opacity: 0.85
          }}
        />
      )}
      
      <div 
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundColor: 'white',
          mixBlendMode: 'screen',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2
        }}
      >
        <h1 
          className="hero-section__title"
          style={{
            fontFamily: "'Linotype Didot Bold', 'GFS Didot', serif",
            fontSize: 'clamp(3.5rem, 15vw, 16rem)',
            fontWeight: 'bold',
            color: 'black',
            margin: 0,
            transform: 'scaleY(1.1)',
            transformOrigin: 'center'
          }}
        >
          LARASANA
        </h1>
      </div>

      {/* Scroll down indicator */}
      <div className="hero-section__scroll-down" style={{ zIndex: 3 }}>
        <svg viewBox="0 0 24 24">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </section>
  );
}