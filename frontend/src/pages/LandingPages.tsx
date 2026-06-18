import { useEffect } from 'react';
import Hero from '../components/hero';

export default function LandingPages() {
  useEffect(() => {
    // Dynamically import ScrollReveal to keep it out of the critical bundle
    let sr: any;
    let cancelled = false;

    import('scrollreveal').then((mod) => {
      if (cancelled) return;
      const ScrollReveal = mod.default;

      sr = ScrollReveal({
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
    });

    // Cleanup
    return () => {
      cancelled = true;
      if (sr) sr.destroy();
    };
  }, []);

  return (
    <div id="landing-page">
      <Hero />
    </div>
  );
}