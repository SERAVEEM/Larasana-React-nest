import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useProductDetail } from '../hooks/useProductDetail';
import ImageCarousel from '../components/Product/ImageCarousel';
import ProductInfo from '../components/Product/ProductInfo';
import DetailCards from '../components/Product/DetailCards';
import StickyBuyBar from '../components/Product/StickyBuyBar';
import '../style/ProductDetail.css';

const slideVariants = {
  enter: (direction: 'next' | 'prev') => ({
    x: direction === 'next' ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: 'next' | 'prev') => ({
    x: direction === 'next' ? -60 : 60,
    opacity: 0,
  }),
};

export default function ProductDetailPage() {
  const navigate = useNavigate();
  const {
    product,
    loading,
    isInitialLoad,
    activeImageIndex,
    setActiveImageIndex,
    selectedSize,
    setSelectedSize,
    isLiked,
    direction,
    showStickyBuyBar,
    handlePrevProduct,
    handleNextProduct,
    handleBack,
    handleLikeToggle
  } = useProductDetail();

  if (isInitialLoad) {
    return (
      <div className="pd-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '1.2rem', color: '#666', fontFamily: "'Inter', sans-serif" }}>Loading Product Details...</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pd-wrapper" style={{ textAlign: 'center', padding: '10rem 2rem' }}>
        <h2 style={{ fontSize: '1.75rem', fontWeight: 600, color: '#333', marginBottom: '1rem' }}>Product Not Found</h2>
        <button className="pd-buy-button" style={{ maxWidth: '200px', margin: '0 auto' }} onClick={() => navigate('/')}>Back to Catalog</button>
      </div>
    );
  }

  const handleBuyNow = () => {
    navigate('/checkout', { state: { productId: product.id, selectedSize } });
  };

  return (
    <div className="pd-wrapper">
      <div className="pd-header-space" />
      <div className="pd-container">
        
        {/* Back Button */}
        <button className="pd-back-button" onClick={handleBack} aria-label="Go back">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        {loading && (
          <div className="pd-loading-bar-container">
            <div className="pd-loading-bar-shimmer" />
          </div>
        )}

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={product.id}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{
              x: { type: 'spring', stiffness: 300, damping: 32 },
              opacity: { duration: 0.25 }
            }}
            className="pd-content-grid"
            style={{
              opacity: loading ? 0.6 : 1,
              filter: loading ? 'blur(1px)' : 'none',
              transition: 'opacity 0.3s ease, filter 0.3s ease',
              pointerEvents: loading ? 'none' : 'auto'
            }}
          >
            {/* Left Column: Image Slideshow */}
            <ImageCarousel
              images={product.images}
              activeImageIndex={activeImageIndex}
              setActiveImageIndex={setActiveImageIndex}
              handlePrevProduct={handlePrevProduct}
              handleNextProduct={handleNextProduct}
              productName={product.name}
            />

            {/* Right Column: Info Details */}
            <div className="pd-info-column">
              <ProductInfo
                product={product}
                selectedSize={selectedSize}
                setSelectedSize={setSelectedSize}
                isLiked={isLiked}
                handleLikeToggle={handleLikeToggle}
                onBuyNow={handleBuyNow}
              />

              <DetailCards
                productName={product.name}
                qrCode={product.qrCode}
                weaver={product.weaver}
              />
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {showStickyBuyBar && (
        <StickyBuyBar
          productName={product.name}
          productPrice={product.price}
          onBuyNow={handleBuyNow}
        />
      )}
    </div>
  );
}
