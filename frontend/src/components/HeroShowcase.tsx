import { useState, useEffect, useRef } from 'react';
import firstImg from '../assets/images/product/first.png';
import '../style/HeroShowcase.css';

const CARDS = [
  { id: 'card-1', image: null, gradient: 'linear-gradient(160deg, #b0bec5 0%, #78909c 100%)', alt: 'Look 1', size: 'sm', position: 'far-left' },
  { id: 'card-2', image: null, gradient: 'linear-gradient(160deg, #546e7a 0%, #37474f 100%)', alt: 'Look 2', size: 'md', position: 'left' },
  { id: 'card-3', image: firstImg, gradient: null, alt: 'Center look', size: 'lg', position: 'center' },
  { id: 'card-4', image: null, gradient: 'linear-gradient(160deg, #455a64 0%, #263238 100%)', alt: 'Look 4', size: 'md', position: 'right' },
  { id: 'card-5', image: null, gradient: 'linear-gradient(160deg, #90a4ae 0%, #607d8b 100%)', alt: 'Look 5', size: 'sm', position: 'far-right' },
];

export default function HeroShowcase() {
  const [hasScrolledIntoView, setHasScrolledIntoView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Set up the Intersection Observer
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If the section enters the viewport...
        if (entry.isIntersecting) {
          setHasScrolledIntoView(true);
          
          // Stop observing once it has animated so it doesn't repeat every scroll
          if (sectionRef.current) {
            observer.unobserve(sectionRef.current);
          }
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.3, // Triggers when 30% of the section is visible on screen
      }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    // Cleanup observer on unmount
    return () => {
      if (sectionRef.current) {
        observer.unobserve(sectionRef.current);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="hs-section" id="hero-showcase">
      {/* 1. Attach the ref to the main section */}
      <p className="hs-description">
        Larasana is where tradition meets tomorrow. We transform Lombok's tenun into modern classics —<br />
        crafted with soul, designed for today. Every piece is a celebration of heritage, reimagined with grace and style.
      </p>

      <h2 className="hs-headline">
        MADE TO BREAK<br />THROUGH
      </h2>

      {/* 2. Use the scroll state to trigger the existing CSS classes */}
      <div className={`CardFrame ${hasScrolledIntoView ? 'is-mounted' : 'is-initial'}`}>
        {CARDS.map((card) => (
          <div 
            key={card.id} 
            className={`hs-card ${card.position} ${card.size}`}
            style={{ background: card.gradient || undefined }}
          >
            {card.image ? (
              <img src={card.image} alt={card.alt} className="hs-card-img" />
            ) : (
              <div className="hs-card-img placeholder" />
            )}
          </div>
        ))}
      </div>
    </section>
  );
}