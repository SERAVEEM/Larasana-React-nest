import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import firstImg from '../assets/images/product/first.png';
import secondImg from '../assets/images/product/second.png';
import thirdImg from '../assets/images/product/third.png';
import fourthImg from '../assets/images/product/fourth.png';
import fifthImg from '../assets/images/product/fifth.png';
import '../style/HeroShowcase.css';

const CARDS = [
  { id: 'card-1', image: firstImg, gradient: null, alt: 'Look 1', size: 'sm', position: 'far-left', name: 'Noir Enchanted Vest', price: '$250', rating: '4.5' },
  { id: 'card-2', image: secondImg, gradient: null, alt: 'Look 2', size: 'md', position: 'left', name: 'Anchronic Vest', price: '$260', rating: '4.5' },
  { id: 'card-3', image: thirdImg, gradient: null, alt: 'Center look', size: 'lg', position: 'center', name: 'Noir Enchanted Vest', price: '$400', rating: '5.0' },
  { id: 'card-4', image: fourthImg, gradient: null, alt: 'Look 4', size: 'md', position: 'right', name: 'Larasana Signature', price: '$350', rating: '4.8' },
  { id: 'card-5', image: fifthImg, gradient: null, alt: 'Look 5', size: 'sm', position: 'far-right', name: 'Tenun Classic', price: '$200', rating: '4.2' },
];

const GRID_ITEMS = [
  { id: 'grid-1', image: firstImg, name: 'Noir Enchanted Vest', price: '$250', rating: '4.5' },
  { id: 'grid-2', image: secondImg, name: 'Anchronic Vest', price: '$260', rating: '4.5' },
  { id: 'grid-3', image: thirdImg, name: 'Noir Enchanted Vest', price: '$400', rating: '5.0' },
  { id: 'grid-4', image: fourthImg, name: 'Larasana Signature', price: '$350', rating: '4.8' },
  { id: 'grid-5', image: fifthImg, name: 'Tenun Classic', price: '$200', rating: '4.2' },
];

export default function HeroShowcase() {
  const [hasScrolledIntoView, setHasScrolledIntoView] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);
  const whiteBgRef = useRef<HTMLDivElement>(null);

  // Animate the background box opacity as the white section enters the viewport
  // Starts fading when white space hits the bottom of the screen (100%), 
  // fully fades out when it reaches the center (50%)
  // 1. Fades out the background box as the white section comes up from bottom (100%) to center (50%)
  const { scrollYProgress: fadeProgress } = useScroll({
    target: whiteBgRef,
    offset: ["start 100%", "start 50%"]
  });
  const bgOpacity = useTransform(fadeProgress, [0, 1], [1, 0]);

  const gridOpacity = useTransform(fadeProgress, [0, 1], [0, 1]);
  const gridY = useTransform(fadeProgress, [0, 1], [50, 0]);


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
    <section ref={sectionRef} className="hs-super-wrapper" id="hero-showcase">
      {/* Black Background Section */}
      <div className="hs-bg-black">
        <motion.p
          className="hs-description"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          Larasana is where tradition meets tomorrow. We transform Lombok's tenun into modern classics —<br />
          crafted with soul, designed for today. Every piece is a celebration of heritage, reimagined with grace and style.
        </motion.p>

        <motion.h2
          className="hs-headline"
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
        >
          MADE TO BREAK<br />THROUGH
        </motion.h2>
      </div>

      {/* White Background Section */}
      <div className="hs-bg-white" ref={whiteBgRef}>
        <motion.div
          className="hs-product-grid"
          style={{ opacity: gridOpacity, y: gridY }}
        >
          {GRID_ITEMS.map((item) => (
            <div key={item.id} className={`hs-grid-item ${item.empty ? 'empty' : ''}`}>
              {!item.empty && (
                <>
                  <img src={item.image} alt={item.name} className="hs-grid-item-img" />

                  <div className="hs-grid-heart">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2400/svg">
                      <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
                    </svg>
                  </div>

                  <div className="hs-grid-info">
                    <div className="hs-grid-info-top">
                      <h3 className="hs-grid-title">{item.name}</h3>
                      <span className="hs-grid-price">{item.price}</span>
                    </div>
                    <div className="hs-grid-rating">
                      ★ {item.rating}
                    </div>
                  </div>
                </>
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* Sticky Card Container */}
      <div className="hs-sticky-layer">
        <motion.div
          className={`CardFrame ${hasScrolledIntoView ? 'is-mounted' : 'is-initial'}`}
        >
          {CARDS.map((card) => (
            <div
              key={card.id}
              className={`hs-card ${card.position} ${card.size}`}
            >
              <motion.div
                className="hs-card-bg"
                style={{
                  opacity: bgOpacity,
                  ...(card.gradient ? { background: card.gradient } : {})
                }}
              />
              {card.position === 'center' && (
                <motion.div
                  className="hs-card-shadow"
                  style={{ opacity: bgOpacity }}
                />
              )}
              {card.image ? (
                <img src={card.image} alt={card.alt} className="hs-card-img" style={{ position: 'relative', zIndex: 1 }} />
              ) : (
                <div className="hs-card-img placeholder" style={{ position: 'relative', zIndex: 1 }} />
              )}
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}