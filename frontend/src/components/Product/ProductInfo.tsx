import type { Product } from '../../types/product';

interface ProductInfoProps {
  product: Product;
  selectedSize: string;
  setSelectedSize: (size: string) => void;
  isLiked: boolean;
  handleLikeToggle: () => void;
  onBuyNow: () => void;
}

export default function ProductInfo({
  product,
  selectedSize,
  setSelectedSize,
  isLiked,
  handleLikeToggle,
  onBuyNow
}: ProductInfoProps) {
  return (
    <>
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

      {/* Primary Action Buttons */}
      <div className="pd-action-row">
        <button 
          className="pd-buy-button"
          onClick={onBuyNow}
        >
          Buy Now
        </button>
        
        <button 
          className={`pd-like-button ${isLiked ? 'active' : ''}`} 
          onClick={handleLikeToggle}
          aria-label="Add to favorites"
        >
          <svg viewBox="0 0 24 24" width="24" height="24" fill={isLiked ? '#C2A353' : 'none'} stroke={isLiked ? '#C2A353' : '#C2A353'} strokeWidth="2">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        </button>
      </div>
    </>
  );
}
