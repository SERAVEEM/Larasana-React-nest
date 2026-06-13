interface StickyBuyBarProps {
  productName: string;
  productPrice: string;
  onBuyNow: () => void;
}

export default function StickyBuyBar({
  productName,
  productPrice,
  onBuyNow
}: StickyBuyBarProps) {
  return (
    <div className="pd-sticky-buy-bar">
      <div className="pd-sticky-buy-info">
        <span className="pd-sticky-buy-name">{productName}</span>
        <span className="pd-sticky-buy-price">{productPrice}</span>
      </div>
      <button 
        className="pd-sticky-buy-button"
        onClick={onBuyNow}
      >
        Buy Now
      </button>
    </div>
  );
}
