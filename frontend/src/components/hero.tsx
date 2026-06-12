import { useEffect, useRef } from 'react';
import { ASSETS } from '../utils/assets';
import '../style/hero.css';

export default function Hero() {
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleVideoReady = () => {
    (window as any).__heroVideoReady = true;
    window.dispatchEvent(new CustomEvent('hero-video-ready'));
  };

  useEffect(() => {
    const video = videoRef.current;
    if (video && video.readyState >= 3) {
      handleVideoReady();
    }
  }, []);

  return (
    <section className="hero-section" id="hero" style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>

      <video
        ref={videoRef}
        src={ASSETS.heroVideo}
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
      />
      
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