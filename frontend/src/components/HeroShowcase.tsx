import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import farLeftImg from '../assets/images/product/far left.png';
import leftImg from '../assets/images/product/left.png';
import midImg from '../assets/images/product/MID.png';
import rightImg from '../assets/images/product/right.png';
import farRightImg from '../assets/images/product/far right.png';
import { client } from '../api/client';
import '../style/HeroShowcase.css';




const CARDS = [
  { id: 'card-1', image: farLeftImg, gradient: null, alt: 'Look 1', size: 'sm', position: 'far-left', name: 'Noir Enchanted Vest', price: '$400', rating: '5.0' },
  { id: 'card-2', image: leftImg, gradient: null, alt: 'Look 2', size: 'md', position: 'left', name: 'Noir Enchanted Vest', price: '$400', rating: '5.0' },
  { id: 'card-3', image: midImg, gradient: null, alt: 'Center look', size: 'lg', position: 'center', name: 'Noir Enchanted Vest', price: '$250', rating: '4.5' },
  { id: 'card-4', image: rightImg, gradient: null, alt: 'Look 4', size: 'md', position: 'right', name: 'Anchronic Vest', price: '$260', rating: '4.5' },
  { id: 'card-5', image: farRightImg, gradient: null, alt: 'Look 5', size: 'sm', position: 'far-right', name: 'Noir Enchanted Vest', price: '$250', rating: '4.5' },
];

const GRID_ITEMS: Array<{
  id: string;
  image: string;
  name: string;
  price: string;
  rating: string;
  empty?: boolean;
}> = [
    { id: 'grid-1', image: farLeftImg, name: 'Noir Enchanted Vest', price: '$400', rating: '5.0' },
    { id: 'grid-2', image: leftImg, name: 'Noir Enchanted Vest', price: '$400', rating: '5.0' },
    { id: 'grid-3', image: midImg, name: 'Noir Enchanted Vest', price: '$250', rating: '4.5' },
    { id: 'grid-4', image: rightImg, name: 'Anchronic Vest', price: '$260', rating: '4.5' },
    { id: 'grid-5', image: farRightImg, name: 'Noir Enchanted Vest', price: '$250', rating: '4.5' },
  ];

export default function HeroShowcase() {
  const [hasScrolledIntoView, setHasScrolledIntoView] = useState(false);
  const [isEntranceDone, setIsEntranceDone] = useState(false);

  useEffect(() => {
    if (!hasScrolledIntoView) return;

    const timer = setTimeout(() => {
      setIsEntranceDone(true)
    }, 6500);

    return () => clearTimeout(timer);
  }, [hasScrolledIntoView]);
  const [gridItems, setGridItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(5);
  const sectionRef = useRef<HTMLElement>(null);
  const whiteBgRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress: fadeProgress } = useScroll({
    target: whiteBgRef,
    offset: ["start 100%", "start 50%"]
  });
  const bgOpacity = useTransform(fadeProgress, [0, 1], [1, 0]);

  const gridOpacity = useTransform(fadeProgress, [0, 1], [0, 1]);
  const gridY = useTransform(fadeProgress, [0, 1], [50, 0]);

  const itemsToRender = gridItems.length > 0 ? gridItems : GRID_ITEMS;
  const showPrevButton = currentIndex > 0;
  const showNextButton = currentIndex < itemsToRender.length - visibleCount;

  const handleNext = () => {
    if (currentIndex < itemsToRender.length - visibleCount) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Responsive visible count check
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setVisibleCount(1);
      } else if (window.innerWidth <= 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(5);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Smooth scroll mobile carousel to current index
  useEffect(() => {
    if (window.innerWidth <= 1024 && gridRef.current) {
      const card = gridRef.current.querySelector('.hs-grid-item');
      if (card) {
        const cardWidth = card.getBoundingClientRect().width;
        // Match the gap defined in CSS (1.5rem = 24px)
        const gap = 24;
        gridRef.current.scrollTo({
          left: currentIndex * (cardWidth + gap),
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex]);

  useEffect(() => {
    let active = true;
    client.get('/products')
      .then((res) => {
        if (active) {
          const rawList = res.data.data || [];
          const formatted = rawList.map((p: any) => ({
            id: `grid-${p.id}`,
            image: p.thumbnailUrl || (p.images && p.images[0]?.url) || '/images/product/far left.png',
            name: p.name,
            price: '$' + Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
            rating: p.averageRating ? Number(p.averageRating).toFixed(1) : '5.0',
          }));
          const padded = [...formatted];
          while (padded.length < 5) {
            padded.push({ id: `empty-${padded.length}`, empty: true } as any);
          }
          setGridItems(padded);
        }
      })
      .catch((err) => {
        console.error('Failed to load showcase products:', err);
      });

    const node = sectionRef.current;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setHasScrolledIntoView(true);
          if (node) {
            observer.unobserve(node);
          }
        }
      },
      {
        root: null,
        rootMargin: '0px',
        threshold: 0.3,
      }
    );

    if (node) {
      observer.observe(node);
    }

    // Cleanup observer on unmount
    return () => {
      active = false;
      if (node) {
        observer.unobserve(node);
      }
    };
  }, []);

  return (
    <section ref={sectionRef} className="hs-super-wrapper" id="hero-showcase">

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


      <div className="hs-bg-white" ref={whiteBgRef}>
        <motion.div
          className="hs-grid-carousel-container"
          style={{ opacity: gridOpacity, y: gridY }}
        >
          <button
            className="hs-carousel-btn prev"
            onClick={handlePrev}
            disabled={!showPrevButton}
            aria-label="Previous products"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>

          {/* Calculate the dynamic translation percentage based on visibleCount */}
          {(() => {
            const slidePercent = 100 / visibleCount;
            return (
              <div
                ref={gridRef}
                className="hs-product-grid"
                style={{ '--slide-transform': `-${currentIndex * slidePercent}%` } as React.CSSProperties}
              >
                {itemsToRender.map((item) => (
                  item.empty ? (
                    <div 
                      key={item.id} 
                      className="hs-grid-item empty" 
                      style={{ '--item-width': `${slidePercent}%` } as React.CSSProperties}
                    />
                  ) : (
                    <Link 
                      key={item.id} 
                      to={`/product/${item.id}`} 
                      className="hs-grid-item"
                      style={{ '--item-width': `${slidePercent}%` } as React.CSSProperties}
                    >
                      <img
                        src={item.image}
                        alt={item.name}
                        className={`hs-grid-item-img ${item.image && item.image.startsWith('http') ? 'standard-image' : ''}`}
                      />

                      <div
                        className="hs-grid-heart"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                    </Link>
                  )
                ))}
              </div>
            );
          })()}

          <button
            className="hs-carousel-btn next"
            onClick={handleNext}
            disabled={!showNextButton}
            aria-label="Next products"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </motion.div>
      </div>

      {/* Sticky Card Container */}
      <motion.div 
        className="hs-sticky-layer"
        style={{ opacity: bgOpacity }}
      >
        {/* Mobile card navigation controls */}
        <div className="hs-mobile-card-controls">
          <button 
            className="hs-mobile-card-btn prev"
            onClick={handlePrev}
            disabled={currentIndex === 0}
            aria-label="Previous card"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <button 
            className="hs-mobile-card-btn next"
            onClick={handleNext}
            disabled={currentIndex === itemsToRender.length - 1}
            aria-label="Next card"
          >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        </div>

        <motion.div
          className={`CardFrame ${hasScrolledIntoView ? 'is-mounted' : 'is-initial'} ${isEntranceDone ? 'is-ready' : ''}`}
        >
          {CARDS.map((card, index) => {
            const item = itemsToRender[index];
            const displayImage = item && !item.empty ? item.image : card.image;
            const displayAlt = item && !item.empty ? item.name : card.alt;
            const isActive = index === currentIndex;
            return (
              <div
                key={card.id}
                className={`hs-card-wrapper ${card.position} ${card.size} ${isActive ? 'is-active' : ''}`}
              >
                <motion.div
                  className="hs-card-bg-layer"
                  style={{ opacity: bgOpacity }}
                >
                  <div
                    className="hs-card-slant"
                    style={card.gradient ? { background: card.gradient } : {}}
                  />
                  <div
                    className="hs-card-main-body"
                    style={card.gradient ? { background: card.gradient } : {}}
                  />
                </motion.div>
                <div className="hs-card-img-layer">
                  {displayImage ? (
                    <img src={displayImage} alt={displayAlt} className="hs-card-img" />
                  ) : (
                    <div className="hs-card-img placeholder" />
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      </motion.div>
    </section>
  );
}