import { motion, AnimatePresence } from 'framer-motion';

interface ImageCarouselProps {
  images: string[];
  activeImageIndex: number;
  setActiveImageIndex: (index: number) => void;
  handlePrevProduct: () => void;
  handleNextProduct: () => void;
  productName: string;
}

export default function ImageCarousel({
  images,
  activeImageIndex,
  setActiveImageIndex,
  handlePrevProduct,
  handleNextProduct,
  productName
}: ImageCarouselProps) {
  return (
    <div className="pd-gallery-column">
      <div className="pd-carousel-container">
        <button className="pd-carousel-arrow arrow-left" onClick={handlePrevProduct} aria-label="Previous product">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="pd-image-wrapper">
          <AnimatePresence mode="wait">
            <motion.img
              key={activeImageIndex}
              src={images[activeImageIndex]}
              alt={`${productName} look ${activeImageIndex + 1}`}
              className="pd-active-img"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            />
          </AnimatePresence>
        </div>

        <button className="pd-carousel-arrow arrow-right" onClick={handleNextProduct} aria-label="Next product">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        </button>

        {/* Dots Indicator */}
        <div className="pd-carousel-dots">
          {images.map((_img, idx) => (
            <span
              key={idx}
              className={`pd-carousel-dot ${idx === activeImageIndex ? 'active' : ''}`}
              onClick={() => setActiveImageIndex(idx)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
