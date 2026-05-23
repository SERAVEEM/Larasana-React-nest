import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

import farLeftImg from '../assets/images/product/far left.png';
import leftImg from '../assets/images/product/left.png';
import midImg from '../assets/images/product/MID.png';
import rightImg from '../assets/images/product/right.png';
import farRightImg from '../assets/images/product/far right.png';
import qrImg from '../assets/images/product/authenticity_qr.png';
import weaverImg from '../assets/images/product/weaver_portrait.png';

import '../style/ProductDetail.css';

export const PRODUCT_DETAILS: Record<string, {
  name: string;
  price: string;
  images: string[];
  description: string;
  weaver: {
    name: string;
    bio: string;
  };
}> = {
  'grid-1': {
    name: 'Noir Enchanted Vest',
    price: '$400',
    images: [farLeftImg, leftImg, midImg, rightImg, farRightImg],
    description: "Noir Enchanted Vest by Yulia Andirtia is inspired by Lombok's culture, folklore, and starlit nights. Its luminous embroidery symbolizes strength, elegance, and the blend of heritage with modern style. More than a garment, it carries the soul and story of Lombok into today's world.",
    weaver: {
      name: 'Yulia Andirtia',
      bio: 'Crafted by Yulia Andirtia from the edge of Lombok, the Noir Enchanted Vest carries fragments of ancestral memory through every woven thread. Inspired by volcanic landscapes, island folklore, and starlit nights, this piece reflects the harmony between timeless heritage and contemporary elegance.'
    }
  },
  'grid-2': {
    name: 'Noir Enchanted Vest',
    price: '$400',
    images: [leftImg, farLeftImg, midImg, rightImg, farRightImg],
    description: "Noir Enchanted Vest by Yulia Andirtia is inspired by Lombok's culture, folklore, and starlit nights. Its luminous embroidery symbolizes strength, elegance, and the blend of heritage with modern style. More than a garment, it carries the soul and story of Lombok into today's world.",
    weaver: {
      name: 'Yulia Andirtia',
      bio: 'Crafted by Yulia Andirtia from the edge of Lombok, the Noir Enchanted Vest carries fragments of ancestral memory through every woven thread. Inspired by volcanic landscapes, island folklore, and starlit nights, this piece reflects the harmony between timeless heritage and contemporary elegance.'
    }
  },
  'grid-3': {
    name: 'Noir Enchanted Vest',
    price: '$250',
    images: [midImg, farLeftImg, leftImg, rightImg, farRightImg],
    description: "Noir Enchanted Vest by Yulia Andirtia is inspired by Lombok's culture, folklore, and starlit nights. Its luminous embroidery symbolizes strength, elegance, and the blend of heritage with modern style. More than a garment, it carries the soul and story of Lombok into today's world.",
    weaver: {
      name: 'Yulia Andirtia',
      bio: 'Crafted by Yulia Andirtia from the edge of Lombok, the Noir Enchanted Vest carries fragments of ancestral memory through every woven thread. Inspired by volcanic landscapes, island folklore, and starlit nights, this piece reflects the harmony between timeless heritage and contemporary elegance.'
    }
  },
  'grid-4': {
    name: 'Anchronic Vest',
    price: '$260',
    images: [rightImg, farLeftImg, leftImg, midImg, farRightImg],
    description: "The Anchronic Vest fuses structured lines with the rich texture of heritage Sasak tenun. Designed by Yulia Andirtia, this piece features bold geometries and high-contrast embroidery that captures the raw power of Lombok's volcanic peaks and legendary myths.",
    weaver: {
      name: 'Yulia Andirtia',
      bio: 'Crafted by Yulia Andirtia from the edge of Lombok, the Anchronic Vest carries fragments of ancestral memory through every woven thread. Inspired by volcanic landscapes, island folklore, and starlit nights, this piece reflects the harmony between timeless heritage and contemporary elegance.'
    }
  },
  'grid-5': {
    name: 'Noir Enchanted Vest',
    price: '$250',
    images: [farRightImg, farLeftImg, leftImg, midImg, rightImg],
    description: "Noir Enchanted Vest by Yulia Andirtia is inspired by Lombok's culture, folklore, and starlit nights. Its luminous embroidery symbolizes strength, elegance, and the blend of heritage with modern style. More than a garment, it carries the soul and story of Lombok into today's world.",
    weaver: {
      name: 'Yulia Andirtia',
      bio: 'Crafted by Yulia Andirtia from the edge of Lombok, the Noir Enchanted Vest carries fragments of ancestral memory through every woven thread. Inspired by volcanic landscapes, island folklore, and starlit nights, this piece reflects the harmony between timeless heritage and contemporary elegance.'
    }
  }
};

const SIZES = ['S', 'M', 'L', 'XL', 'XXL'];

export default function ProductDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const productId = id && PRODUCT_DETAILS[id] ? id : 'grid-3';
  const product = PRODUCT_DETAILS[productId];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('XL');
  const [isLiked, setIsLiked] = useState(false);

  // Reset states on product change
  useEffect(() => {
    setActiveImageIndex(0);
    setSelectedSize('XL');
    setIsLiked(false);
  }, [productId]);

  const handlePrevImage = () => {
    setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1));
  };

  const handleBack = () => {
    // If there is history, navigate back, otherwise go home
    if (window.history.state && window.history.state.idx > 0) {
      navigate(-1);
    } else {
      navigate('/');
    }
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
                {product.images.map((_, idx) => (
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
            <div className="pd-size-section">
              <h2 className="pd-section-title">Select Size</h2>
              <div className="pd-size-grid">
                {SIZES.map((size) => (
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

            {/* More Details Cards */}
            <div className="pd-more-details-section">
              <h2 className="pd-section-title">More About {product.name}</h2>
              
              <div className="pd-details-cards">
                
                {/* Card 1: Authenticity QR */}
                <div className="pd-detail-card">
                  <div className="pd-card-media qr-media">
                    <img src={qrImg} alt="Authenticity QR Code" className="pd-qr-img" />
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
                    <img src={weaverImg} alt={product.weaver.name} className="pd-weaver-img" />
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
                onClick={() => navigate('/checkout', { state: { productId, selectedSize } })}
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
