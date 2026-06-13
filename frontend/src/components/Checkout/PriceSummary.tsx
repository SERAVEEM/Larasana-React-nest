interface PriceSummaryProps {
  productName: string;
  basePrice: number;
  shippingFee: number;
  totalPrice: number;
  formatPrice: (value: number) => string;
}

export default function PriceSummary({
  productName,
  basePrice,
  shippingFee,
  totalPrice,
  formatPrice
}: PriceSummaryProps) {
  return (
    <div className="co-price-summary">
      <div className="co-price-row">
        <span className="co-price-label">Product {productName}</span>
        <span className="co-price-val">{formatPrice(basePrice)}</span>
      </div>
      <div className="co-price-row">
        <span className="co-price-label">Shipping</span>
        <span className="co-price-val">{formatPrice(shippingFee)}</span>
      </div>
      <div className="co-price-total-row">
        <span className="co-total-label">Total Price</span>
        <span className="co-total-val">{formatPrice(totalPrice)}</span>
      </div>
    </div>
  );
}
