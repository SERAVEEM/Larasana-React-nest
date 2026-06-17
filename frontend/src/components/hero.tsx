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
    if (!video) return;

    const handleProgress = () => {
      if (video.duration && video.buffered.length > 0) {
        let maxBuffered = 0;
        for (let i = 0; i < video.buffered.length; i++) {
          const end = video.buffered.end(i);
          if (end > maxBuffered) {
            maxBuffered = end;
          }
        }
        
        const percent = Math.min(100, Math.round((maxBuffered / video.duration) * 100));
        window.dispatchEvent(new CustomEvent('hero-video-progress', { detail: { percent } }));
        
        if (percent >= 100) {
          handleVideoReady();
        }
      } else if (video.readyState >= 3) {
        window.dispatchEvent(new CustomEvent('hero-video-progress', { detail: { percent: 100 } }));
        handleVideoReady();
      }
    };

    if (video.readyState >= 3) {
      handleProgress();
    }

    video.addEventListener('progress', handleProgress);
    video.addEventListener('timeupdate', handleProgress);
    video.addEventListener('canplaythrough', handleProgress);
    video.addEventListener('loadedmetadata', handleProgress);

    // Network safety fallback: 60s to prevent getting stuck if download hangs
    const safetyTimer = setTimeout(() => {
      window.dispatchEvent(new CustomEvent('hero-video-progress', { detail: { percent: 100 } }));
      handleVideoReady();
    }, 60000);

    return () => {
      video.removeEventListener('progress', handleProgress);
      video.removeEventListener('timeupdate', handleProgress);
      video.removeEventListener('canplaythrough', handleProgress);
      video.removeEventListener('loadedmetadata', handleProgress);
      clearTimeout(safetyTimer);
    };
  }, []);

  return (
    <section className="hero-section" id="hero" style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>

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