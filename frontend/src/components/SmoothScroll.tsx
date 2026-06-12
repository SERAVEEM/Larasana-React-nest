import React, { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Lenis from 'lenis';

interface SmoothScrollProps {
  children: React.ReactNode;
}

export default function SmoothScroll({ children }: SmoothScrollProps) {
  const location = useLocation();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    const lenis = new Lenis({
      duration: 2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 2,
      infinite: false,
    });

    lenisRef.current = lenis;

    let rafId: number;
    function raf(time: number) {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    }
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    if (lenisRef.current) {
      if (location.hash) {
        const timer = setTimeout(() => {
          const target = document.querySelector(location.hash);
          if (target) {
            lenisRef.current?.scrollTo(target as HTMLElement, { offset: 0, duration: 1.5 });
          }
        }, 100);
        return () => clearTimeout(timer);
      } else {

        lenisRef.current.scrollTo(0, { immediate: true });
        const timer = setTimeout(() => {
          lenisRef.current?.resize();
        }, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [location.pathname, location.hash]);

  return <>{children}</>;
}
