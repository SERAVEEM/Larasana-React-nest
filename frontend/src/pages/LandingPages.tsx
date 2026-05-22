import { useEffect } from 'react';
import ScrollReveal from 'scrollreveal';
import Hero from '../components/hero';

export default function LandingPages() {
  useEffect(() => {
    // ===== ScrollReveal =====
    const sr = ScrollReveal({
      origin: 'bottom',
      distance: '40px',
      duration: 800,
      delay: 200,
      easing: 'cubic-bezier(0.5, 0, 0, 1)',
      reset: false,
    });

    // Reveal elements
    sr.reveal('.hero-section__title', {
      origin: 'bottom',
      distance: '60px',
      duration: 1200,
      delay: 300,
    });

    sr.reveal('.hero-section__scroll-down', {
      origin: 'bottom',
      distance: '20px',
      duration: 800,
      delay: 800,
    });

    sr.reveal('.navbar', {
      origin: 'top',
      distance: '20px',
      duration: 800,
      delay: 100,
    });

    // Cleanup
    return () => {
      sr.destroy();
    };
  }, []);

  return (
    <div id="landing-page">
      <Hero />
    </div>
  );
}