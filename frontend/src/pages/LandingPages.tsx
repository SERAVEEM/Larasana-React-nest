import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import ScrollReveal from 'scrollreveal';
import Navbar from '../components/navbar';
import Hero from '../components/hero';

export default function LandingPages() {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // ===== Lenis Smooth Scrolling =====
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    function raf(time: number) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

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
      lenis.destroy();
      sr.destroy();
    };
  }, []);

  return (
    <div id="landing-page">
      <Navbar />
      <Hero />
    </div>
  );
}