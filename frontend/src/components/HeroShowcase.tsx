import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion';
import farLeftImg from '../assets/images/product/far left.png';
import leftImg from '../assets/images/product/left.png';
import midImg from '../assets/images/product/MID.png';
import rightImg from '../assets/images/product/right.png';
import farRightImg from '../assets/images/product/far right.png';
import { ServiceContainer } from '../core/di/ServiceContainer';
import { ProductService } from '../core/services/ProductService';
import '../style/HeroShowcase.css';

const CARDS = [
  { id: 'card-1', image: farLeftImg, gradient: null, alt: 'Look 1', size: 'sm', position: 'far-left', name: 'Noir Enchanted Vest', price: '$400', rating: '5.0' },
  { id: 'card-2', image: leftImg, gradient: null, alt: 'Look 2', size: 'md', position: 'left', name: 'Noir Enchanted Vest', price: '$400', rating: '5.0' },
  { id: 'card-3', image: midImg, gradient: null, alt: 'Center look', size: 'lg', position: 'center', name: 'Noir Enchanted Vest', price: '$250', rating: '4.5' },
  { id: 'card-4', image: rightImg, gradient: null, alt: 'Look 4', size: 'md', position: 'right', name: 'Anchronic Vest', price: '$260', rating: '4.5' },
  { id: 'card-5', image: farRightImg, gradient: null, alt: 'Look 5', size: 'sm', position: 'far-right', name: 'Noir Enchanted Vest', price: '$250', rating: '4.5' },
];

const GRID_ITEMS = [
  { id: 'grid-1', image: farLeftImg, name: 'Noir Enchanted Vest', price: '$400', rating: '5.0' },
  { id: 'grid-2', image: leftImg, name: 'Noir Enchanted Vest', price: '$400', rating: '5.0' },
  { id: 'grid-3', image: midImg, name: 'Noir Enchanted Vest', price: '$250', rating: '4.5' },
  { id: 'grid-4', image: rightImg, name: 'Anchronic Vest', price: '$260', rating: '4.5' },
  { id: 'grid-5', image: farRightImg, name: 'Noir Enchanted Vest', price: '$250', rating: '4.5' },
];

export default function HeroShowcase() {
  const productService = ServiceContainer.resolve<ProductService>('ProductService');
  const [hasScrolledIntoView, setHasScrolledIntoView] = useState(false);
  const [isEntranceDone, setIsEntranceDone] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth <= 768 : false);
  const [gridItems, setGridItems] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(() => {
    if (typeof window === 'undefined') return 5;
    const width = window.innerWidth;
    if (width <= 768) return 1;
    if (width <= 1024) return 2;
    return 5;
  });

  const sectionRef = useRef<HTMLElement>(null);
  const whiteBgRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  // 1. Detect device viewport and align visibleCount on resize
  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setIsMobile(width <= 768);
      if (width <= 768) {
        setVisibleCount(1);
      } else if (width <= 1024) {
        setVisibleCount(2);
      } else {
        setVisibleCount(5);
      }
    };
    
    // We already initialize the state with correct values on mount,
    // so we only need to listen for resize events.
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Entrance done observer timer
  useEffect(() => {
    if (!hasScrolledIntoView) return;
    const delay = isMobile ? 1200 : 6500;
    const timer = setTimeout(() => {
      setIsEntranceDone(true);
    }, delay);
    return () => clearTimeout(timer);
  }, [hasScrolledIntoView, isMobile]);

  // 4. Smooth scrolling carousel on desktop/tablet resize widths
  useEffect(() => {
    if (!isMobile && window.innerWidth <= 1024 && gridRef.current) {
      const card = gridRef.current.querySelector('.hs-grid-item');
      if (card) {
        const cardWidth = card.getBoundingClientRect().width;
        const gap = 24;
        gridRef.current.scrollTo({
          left: currentIndex * (cardWidth + gap),
          behavior: 'smooth'
        });
      }
    }
  }, [currentIndex, isMobile]);

  // 5. Scroll triggers
  useEffect(() => {
    let active = true;
    productService.getPublicProducts()
      .then((items) => {
        if (active) {
          const formatted = items.map((p) => ({
            id: `grid-${p.id}`,
            image: p.image || '/images/product/far left.png',
            name: p.name,
            price: p.price,
            rating: p.averageRating.toFixed(1),
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
        threshold: 0.15,
      }
    );

    if (node) {
      observer.observe(node);
    }

    return () => {
      active = false;
      if (node) {
        observer.unobserve(node);
      }
    };
  }, [productService]);

  // Scroll Progress calculations for animations
  const { scrollYProgress: fadeProgress } = useScroll({
    target: whiteBgRef,
    offset: ["start 100%", "start 50%"]
  });

  const bgOpacity = useTransform(fadeProgress, [0, 1], [1, 0]);
  const gridOpacity = useTransform(fadeProgress, [0, 1], [0, 1]);
  const gridY = useTransform(fadeProgress, [0, 1], [50, 0]);

  const itemsToRender = gridItems.length > 0 ? gridItems : GRID_ITEMS;
  const slidePercent = 100 / visibleCount;

  // Max bounds
  const maxIndex = isMobile ? itemsToRender.length - 1 : itemsToRender.length - visibleCount;
  const showPrevButton = currentIndex > 0;
  const showNextButton = currentIndex < maxIndex;

  const handleNext = () => {
    if (currentIndex < maxIndex) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  // Safe boundary bounds correction when resizing
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex >= 0 ? maxIndex : 0);
    }
  }, [maxIndex]);

  const activeItem = itemsToRender[currentIndex] || itemsToRender[0];

  // ================= MOBILE RENDERING (Phone) =================
  if (isMobile) {
    return (
      <section ref={sectionRef} className="hs-super-wrapper hs-is-mobile" id="hero-showcase">
        {/* Dark Fold */}
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

        {/* Light Fold with single product showcase details */}
        <div className="hs-bg-white" ref={whiteBgRef}>
          <motion.div
            className="hs-showcase-panel"
            style={{ opacity: gridOpacity, y: gridY }}
          >
            <div className="hs-showcase-content">
              <div className="hs-showcase-details">
                <div className="hs-showcase-indicator">
                  <span>{String(currentIndex + 1).padStart(2, '0')}</span>
                  <span className="divider">/</span>
                  <span className="total">{String(itemsToRender.length).padStart(2, '0')}</span>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -15 }}
                    transition={{ duration: 0.35, ease: "easeInOut" }}
                    className="hs-details-wrapper"
                  >
                    <div className="hs-details-header">
                      <h3 className="hs-details-title">{activeItem.name}</h3>
                      <div className="hs-details-rating">★ {activeItem.rating}</div>
                    </div>
                    <div className="hs-details-price">{activeItem.price}</div>

                    <div className="hs-details-actions">
                      <Link to={`/product/${activeItem.id}`} className="hs-details-cta">
                        Discover Piece
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                          <line x1="5" y1="12" x2="19" y2="12"></line>
                          <polyline points="12 5 19 12 12 19"></polyline>
                        </svg>
                      </Link>

                      <button
                        className="hs-details-heart"
                        aria-label="Add to wishlist"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" fill="currentColor" />
                        </svg>
                      </button>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Small next/previous navigation controls */}
                <div className="hs-nav-controls">
                  <button
                    className="hs-nav-btn prev"
                    onClick={handlePrev}
                    disabled={!showPrevButton}
                    aria-label="Previous product"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="15 18 9 12 15 6" />
                    </svg>
                  </button>
                  <button
                    className="hs-nav-btn next"
                    onClick={handleNext}
                    disabled={!showNextButton}
                    aria-label="Next product"
                  >
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <polyline points="9 18 15 12 9 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sticky Card Container - Only 1 Card Shown on Mobile */}
        <div className="hs-sticky-layer">
          <div className={`CardFrame ${hasScrolledIntoView ? 'is-mounted' : 'is-initial'} ${isEntranceDone ? 'is-ready' : ''}`}>
            <AnimatePresence mode="wait">
              <motion.div
                key={currentIndex}
                initial={{ opacity: 0, scale: 0.96, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.96, y: -20 }}
                transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
                className="hs-card-wrapper active-single-card"
              >
                <motion.div
                  className="hs-card-bg-layer"
                  style={{ opacity: bgOpacity }}
                >
                  <div className="hs-card-slant" />
                  <div className="hs-card-main-body" />
                </motion.div>
                <div className="hs-card-img-layer">
                  {activeItem.image ? (
                    <img src={activeItem.image} alt={activeItem.name} className="hs-card-img" loading="lazy" />
                  ) : (
                    <div className="hs-card-img placeholder" />
                  )}
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>
    );
  }

  // ================= DESKTOP/TABLET RENDERING (Original) =================
  return (
    <section ref={sectionRef} className="hs-super-wrapper" id="hero-showcase">
      {/* Dark Fold */}
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

      {/* Light Fold with Carousel Grid */}
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
                    loading="lazy"
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

      {/* Sticky Card Container - Fanning Stack */}
      <div className="hs-sticky-layer">
        <motion.div
          className={`CardFrame ${hasScrolledIntoView ? 'is-mounted' : 'is-initial'} ${isEntranceDone ? 'is-ready' : ''}`}
        >
          {CARDS.map((card, index) => {
            const item = itemsToRender[index];
            const displayImage = item && !item.empty ? item.image : card.image;
            const displayAlt = item && !item.empty ? item.name : card.alt;
            return (
              <div
                key={card.id}
                className={`hs-card-wrapper ${card.position} ${card.size}`}
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
                    <img src={displayImage} alt={displayAlt} className="hs-card-img" loading="lazy" />
                  ) : (
                    <div className="hs-card-img placeholder" />
                  )}
                </div>
              </div>
            );
          })}
        </motion.div>
      </div>
    </section>
  );
}