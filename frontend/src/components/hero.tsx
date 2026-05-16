import v2 from '../assets/video/v2 - Trim.mp4';

import { useRef, useEffect } from 'react';

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;

    const draw = () => {
      if (video.readyState >= 2) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      }
      animationId = requestAnimationFrame(draw);
    };

    video.addEventListener('play', () => {
      draw();
    });

    // If video is paused, try to play it explicitly
    if (video.paused) {
      video.play().catch(console.error);
    } else {
      draw();
    }

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <section className="hero-section" id="hero">
    
      <video
        ref={videoRef}
        src={v2}
        autoPlay
        muted
        loop
        playsInline
        style={{
          position: 'absolute',
          opacity: 0,
          width: '1px',
          height: '1px',
          pointerEvents: 'none'
        }}
      />

      {/* Canvas that captures video frames — used as text background */}
      <canvas ref={canvasRef} className="hero-section__canvas" />

     
      <div className="hero-section__mask">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <mask id="text-mask">
     
              <rect width="100%" height="100%" fill="white" />
              <text
                x="50%"
                y="50%"
                textAnchor="middle"
                dominantBaseline="central"
                fill="black"
                style={{
                  fontFamily: "'Linotype Didot Bold', 'GFS Didot', serif",
                  fontSize: '16rem',
                  fontWeight:'bold',
                  letterSpacing: 0,
                  transform: 'scaleY(1.1)',
                  transformOrigin: 'center'
                }}
              >
                LARASANA
              </text>
            </mask>
          </defs>
          <rect
            width="100%"
            height="100%"
            fill="white"
            mask="url(#text-mask)"
          />
        </svg>
      </div>

      {/* Scroll down indicator */}
      <div className="hero-section__scroll-down">
        <svg viewBox="0 0 24 24">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </div>
    </section>
  );
}