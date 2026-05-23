import v2 from '../assets/video/v2 - Trim.mp4';

export default function Hero() {
  return (
    <section className="hero-section" id="hero" style={{ position: 'relative', width: '100%', height: '100vh', overflow: 'hidden' }}>
      
      {/* Background Video */}
      <video
        src={v2}
        autoPlay
        muted
        loop
        playsInline
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

      {/* Text Mask Overlay using mix-blend-mode */}
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