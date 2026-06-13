import { useCheckout, PAYMENT_METHODS } from '../hooks/useCheckout';
import AddressSection from '../components/Checkout/AddressSection';
import ShippingSection from '../components/Checkout/ShippingSection';
import PaymentSection from '../components/Checkout/PaymentSection';
import PriceSummary from '../components/Checkout/PriceSummary';
import '../style/Checkout.css';

export default function CheckoutPage() {
  const {
    selectedSize,
    product,
    checkoutState,
    loading,
    addresses,
    selectedAddressId,
    setSelectedAddressId,
    shippingOptions,
    selectedShippingId,
    setSelectedShippingId,
    shippingLoading,
    shippingError,
    selectedPaymentId,
    setSelectedPaymentId,
    activeModal,
    handleOpenModal,
    handleCloseModal,
    showAddAddressForm,
    setShowAddAddressForm,
    newAddress,
    setNewAddress,
    citySearchQuery,
    setCitySearchQuery,
    showCityDropdown,
    setShowCityDropdown,
    filteredCities,
    selectedAddress,
    formatPrice,
    selectedShipping,
    selectedPayment,
    basePrice,
    shippingFee,
    totalPrice,
    handleAddAddress,
    handleCheckout,
    handleBack,
    fetchShipping
  } = useCheckout();

  if (loading || !product) {
    return (
      <div className="co-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ fontSize: '1.2rem', color: '#666', fontFamily: "'Inter', sans-serif" }}>Loading Checkout Details...</div>
      </div>
    );
  }

  return (
    <div className="co-wrapper">
      <div className="co-header-space" />
      <div className="co-container">
        
        {/* Back Button */}
        <button className="co-back-button" onClick={handleBack} aria-label="Go back">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>

        <div className="co-content-grid">
          
          {/* Left Column: Product Image */}
          <div className="co-image-column">
            <div className="co-image-card">
              <img 
                src={product.images[0]} 
                alt={product.name} 
                className="co-product-img" 
              />
            </div>
          </div>

          {/* Right Column: Checkout Details */}
          <div className="co-details-column">
            
            {/* Title Block */}
            <div className="co-title-row">
              <div>
                <h1 className="co-product-name">{product.name}</h1>
                <div className="co-tags-row">
                  <span className="co-tag-handmade">
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    AUTHENTIC HANDMADE
                  </span>
                  <span className="co-size-badge">{selectedSize}</span>
                </div>
              </div>
              <span className="co-product-price">{formatPrice(basePrice)}</span>
            </div>

            {/* Address Selection Card */}
            <AddressSection
              selectedAddress={selectedAddress}
              addresses={addresses}
              selectedAddressId={selectedAddressId}
              setSelectedAddressId={setSelectedAddressId}
              activeModal={activeModal}
              handleOpenModal={handleOpenModal}
              handleCloseModal={handleCloseModal}
              showAddAddressForm={showAddAddressForm}
              setShowAddAddressForm={setShowAddAddressForm}
              newAddress={newAddress}
              setNewAddress={setNewAddress}
              citySearchQuery={citySearchQuery}
              setCitySearchQuery={setCitySearchQuery}
              showCityDropdown={showCityDropdown}
              setShowCityDropdown={setShowCityDropdown}
              filteredCities={filteredCities}
              checkoutState={checkoutState}
              handleAddAddress={handleAddAddress}
            />

            {/* Shipping Selection Card */}
            <ShippingSection
              shippingLoading={shippingLoading}
              shippingError={shippingError}
              shippingOptions={shippingOptions}
              selectedShippingId={selectedShippingId}
              setSelectedShippingId={setSelectedShippingId}
              selectedShipping={selectedShipping}
              formatPrice={formatPrice}
              activeModal={activeModal}
              handleOpenModal={handleOpenModal}
              handleCloseModal={handleCloseModal}
              fetchShipping={fetchShipping}
              selectedAddressId={selectedAddressId}
            />

            {/* Payment Method Card */}
            <PaymentSection
              selectedPayment={selectedPayment}
              paymentMethods={PAYMENT_METHODS}
              selectedPaymentId={selectedPaymentId}
              setSelectedPaymentId={setSelectedPaymentId}
              activeModal={activeModal}
              handleOpenModal={handleOpenModal}
              handleCloseModal={handleCloseModal}
            />

            {/* Price Details Column */}
            <PriceSummary
              productName={product.name}
              basePrice={basePrice}
              shippingFee={shippingFee}
              totalPrice={totalPrice}
              formatPrice={formatPrice}
            />

            {/* Checkout Action Button */}
            <button 
              className="co-checkout-btn" 
              onClick={handleCheckout}
              disabled={checkoutState !== 'idle'}
              style={{
                opacity: checkoutState !== 'idle' ? 0.7 : 1,
                cursor: checkoutState !== 'idle' ? 'not-allowed' : 'pointer'
              }}
            >
              {checkoutState === 'submitting_checkout' ? 'Processing...' : 'Checkout Now'}
            </button>

          </div>

        </div>
      </div>
    </div>
  );
}
