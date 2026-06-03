import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import weaverImg from '../assets/images/product/weaver_portrait.png';

import { client } from '../api/client';
import '../style/ProductDetail.css';

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('XL');
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (!id) return;
    let active = true;
    setLoading(true);

    // Resolve string IDs to numbers for database integration compatibility
    let apiId = id;
    if (id.startsWith('grid-')) {
      apiId = id.replace('grid-', '');
    } else if (id.startsWith('p')) {
      apiId = id.replace('p', '');
    }

    client.get(`/products/${apiId}`)
      .then((res) => {
        if (active) {
          const p = res.data;
          const formattedPrice = '$' + Number(p.price).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
          const sizeList = p.sizes ? (typeof p.sizes === 'string' ? JSON.parse(p.sizes) : p.sizes) : ['S', 'M', 'L', 'XL', 'XXL'];
          const imageList = p.images && p.images.length > 0
            ? p.images.map((img: any) => img.url)
            : [p.thumbnailUrl || '/images/product/far left.png'];

          setProduct({
            id: p.id.toString(),
            name: p.name,
            price: formattedPrice,
            description: p.description,
            images: imageList,
            sizes: sizeList,
            qrCode: p.qrCodeUrl || '/images/product/authenticity_qr.png',
            weaver: {
              name: p.weaverName || 'Yulia Andirtia',
              bio: p.weaverBio || 'Crafted by Yulia Andirtia from the edge of Lombok, this vest carries fragments of ancestral memory through every woven thread. Inspired by volcanic landscapes, island folklore, and starlit nights, this piece reflects the harmony between timeless heritage and contemporary elegance.',
              image: p.weaverImageUrl || weaverImg
            }
          });
          setActiveImageIndex(0);
          if (sizeList.length > 0) {
            setSelectedSize(sizeList[0]);
          }
          setLoading(false);
        }
      })
      .catch((err) => {
        console.error('Failed to fetch product details:', err);
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [id]);

  const handlePrevImage = () => {
    if (!product) return;
    setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!product) return;
    setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const handleBack = () => {
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
  };

  if (loading) {
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

        <div className="pd-content-grid">
          
          {/* Left Column: Image Slideshow */}
          <div className="pd-gallery-column">
            <div className="pd-carousel-container">
              <button className="pd-carousel-arrow arrow-left" onClick={handlePrevImage} aria-label="Previous image">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>

              <div className="pd-image-wrapper">
                <AnimatePresence mode="wait">
                  <motion.img
                    key={activeImageIndex}
                    src={product.images[activeImageIndex]}
                    alt={`${product.name} look ${activeImageIndex + 1}`}
                    className="pd-active-img"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  />
                </AnimatePresence>
              </div>

              <button className="pd-carousel-arrow arrow-right" onClick={handleNextImage} aria-label="Next image">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>

              {/* Dots Indicator */}
              <div className="pd-carousel-dots">
                {product.images.map((_img: string, idx: number) => (
                  <span
                    key={idx}
                    className={`pd-carousel-dot ${idx === activeImageIndex ? 'active' : ''}`}
                    onClick={() => setActiveImageIndex(idx)}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Info Details */}
          <div className="pd-info-column">
            <div className="pd-title-row">
              <h1 className="pd-product-name">{product.name}</h1>
              <span className="pd-product-price">{product.price}</span>
            </div>

            <p className="pd-product-description">{product.description}</p>

            {/* Size Selector */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="pd-size-section">
                <h2 className="pd-section-title">Select Size</h2>
                <div className="pd-size-grid">
                  {product.sizes.map((size: string) => (
                    <button
                      key={size}
                      className={`pd-size-badge ${selectedSize === size ? 'active' : ''}`}
                      onClick={() => setSelectedSize(size)}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* More Details Cards */}
            <div className="pd-more-details-section">
              <h2 className="pd-section-title">More About {product.name}</h2>
              
              <div className="pd-details-cards">
                
                {/* Card 1: Authenticity QR */}
                <div className="pd-detail-card">
                  <div className="pd-card-media qr-media">
                    <img src={product.qrCode} alt="Verify Authenticity" className="pd-qr-img" />
                  </div>
                  <div className="pd-card-content">
                    <h3 className="pd-card-title">Verify Authenticity</h3>
                    <p className="pd-card-desc">
                      Scan the authenticity code to discover the origin, craftsmanship, and story behind the {product.name}. Each piece is handcrafted in limited quantities, preserving the soul of Lombok's weaving tradition and the identity of its artisan.
                    </p>
                  </div>
                </div>

                {/* Card 2: Weaver Info */}
                <div className="pd-detail-card">
                  <div className="pd-card-media weaver-media">
                    <img src={product.weaver.image} alt={product.weaver.name} className="pd-weaver-img" />
                  </div>
                  <div className="pd-card-content">
                    <h3 className="pd-card-title">About The Weaver</h3>
                    <p className="pd-card-desc">{product.weaver.bio}</p>
                  </div>
                </div>

              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="pd-action-row">
              <button 
                className="pd-buy-button"
                onClick={() => navigate('/checkout', { state: { productId: product.id, selectedSize } })}
              >
                Buy Now
              </button>
              
              <button 
                className={`pd-like-button ${isLiked ? 'active' : ''}`} 
                onClick={() => setIsLiked(!isLiked)}
                aria-label="Add to favorites"
              >
                <svg viewBox="0 0 24 24" width="24" height="24" fill={isLiked ? '#C2A353' : 'none'} stroke={isLiked ? '#C2A353' : '#C2A353'} strokeWidth="2">
                  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                </svg>
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
