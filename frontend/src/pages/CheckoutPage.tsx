import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { PRODUCT_DETAILS } from './ProductDetailPage';
import '../style/Checkout.css';

interface Address {
  id: string;
  label: string;
  name: string;
  street: string;
  district: string;
  city: string;
  province: string;
  postalCode: string;
  country: string;
}

interface ShippingOption {
  id: string;
  name: string;
  price: number;
  eta: string;
  logo: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  logoText: string;
  description: string;
}

const ADDRESS_BOOK: Address[] = [
  {
    id: 'addr-1',
    label: 'Home',
    name: 'Alvin Cihuy',
    street: 'Jalan Sandang No D5B, RT 1/RW 11',
    district: 'Palmerah',
    city: 'West Jakarta',
    province: 'DKI Jakarta',
    postalCode: '11480',
    country: 'ID'
  },
  {
    id: 'addr-2',
    label: 'Office',
    name: 'Alvin Cihuy',
    street: 'Equity Tower 32nd Fl, SCBD Lot 9',
    district: 'Senayan',
    city: 'South Jakarta',
    province: 'DKI Jakarta',
    postalCode: '12190',
    country: 'ID'
  }
];

const SHIPPING_OPTIONS: ShippingOption[] = [
  {
    id: 'ship-1',
    name: 'JNE Express',
    price: 15.00,
    eta: '2-3 business days',
    logo: 'JNE'
  },
  {
    id: 'ship-2',
    name: 'DHL Express',
    price: 30.00,
    eta: '1-2 business days',
    logo: 'DHL'
  },
  {
    id: 'ship-3',
    name: 'Standard Shipping',
    price: 8.00,
    eta: '5-7 business days',
    logo: 'STD'
  }
];

const PAYMENT_METHODS: PaymentMethod[] = [
  {
    id: 'pay-1',
    name: 'QRIS',
    logoText: 'QRIS',
    description: 'Pay instantly with QR code scanner'
  },
  {
    id: 'pay-2',
    name: 'Credit Card',
    logoText: 'CARD',
    description: 'Visa, MasterCard, or American Express'
  },
  {
    id: 'pay-3',
    name: 'Bank Transfer',
    logoText: 'BANK',
    description: 'Virtual Account transfer'
  }
];

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve state passed from Product Detail page
  const { productId = 'grid-3', selectedSize = 'XL' } = (location.state || {}) as {
    productId?: string;
    selectedSize?: string;
  };

  const product = PRODUCT_DETAILS[productId] || PRODUCT_DETAILS['grid-3'];
  const basePrice = parseFloat(product.price.replace('$', ''));

  // Component States for Checkout Selection
  const [addresses, setAddresses] = useState<Address[]>(ADDRESS_BOOK);
  const [selectedAddressId, setSelectedAddressId] = useState(ADDRESS_BOOK[0].id);
  const [selectedShippingId, setSelectedShippingId] = useState(SHIPPING_OPTIONS[0].id);
  const [selectedPaymentId, setSelectedPaymentId] = useState(PAYMENT_METHODS[0].id);

  // Modal visibility states
  const [activeModal, setActiveModal] = useState<'address' | 'shipping' | 'payment' | null>(null);

  // State for new address form
  const [showAddAddressForm, setShowAddAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id'>>({
    label: '',
    name: '',
    street: '',
    district: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'ID'
  });

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || addresses[0];
  const selectedShipping = SHIPPING_OPTIONS.find(s => s.id === selectedShippingId) || SHIPPING_OPTIONS[0];
  const selectedPayment = PAYMENT_METHODS.find(p => p.id === selectedPaymentId) || PAYMENT_METHODS[0];

  const shippingFee = selectedShipping.price;
  const totalPrice = basePrice + shippingFee;

  const handleOpenModal = (modalType: 'address' | 'shipping' | 'payment') => {
    setActiveModal(modalType);
    setShowAddAddressForm(false);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.label || !newAddress.name || !newAddress.street) return;

    const added: Address = {
      ...newAddress,
      id: `addr-${Date.now()}`
    };

    setAddresses([...addresses, added]);
    setSelectedAddressId(added.id);
    setShowAddAddressForm(false);
    setNewAddress({ label: '', name: '', street: '', district: '', city: '', province: '', postalCode: '', country: 'ID' });
  };

  const handleCheckout = () => {
    navigate('/payment', {
      state: {
        product: {
          id: productId,
          name: product.name,
          price: basePrice,
          image: product.images[0],
          size: selectedSize
        },
        address: selectedAddress,
        shipping: selectedShipping,
        payment: selectedPayment,
        pricing: {
          subtotal: basePrice,
          shipping: shippingFee,
          total: totalPrice
        }
      }
    });
  };

  const handleBack = () => {
    navigate(`/product/${productId}`);
  };

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
              <span className="co-product-price">${basePrice.toFixed(2)}</span>
            </div>

            {/* Address Selection Card */}
            <div className="co-card-section">
              <h2 className="co-section-title">Address</h2>
              <button 
                className="co-select-card" 
                onClick={() => handleOpenModal('address')}
                aria-label="Edit address"
              >
                <div className="co-card-info">
                  <div className="co-card-label-badge">{selectedAddress.label}</div>
                  <p className="co-card-text">
                    <strong>{selectedAddress.name}</strong>, {selectedAddress.street}, {selectedAddress.district}, {selectedAddress.city}, {selectedAddress.province}, {selectedAddress.country} {selectedAddress.postalCode}
                  </p>
                </div>
                <div className="co-card-edit-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Shipping Selection Card */}
            <div className="co-card-section">
              <h2 className="co-section-title">Shipping</h2>
              <button 
                className="co-select-card" 
                onClick={() => handleOpenModal('shipping')}
                aria-label="Edit shipping carrier"
              >
                <div className="co-card-info-row">
                  <div className="co-carrier-badge-wrapper">
                    <span className={`co-carrier-logo ${selectedShipping.logo.toLowerCase()}`}>
                      {selectedShipping.logo}
                    </span>
                    <div className="co-carrier-details">
                      <p className="co-carrier-name">{selectedShipping.name}</p>
                      <p className="co-carrier-eta">{selectedShipping.eta}</p>
                    </div>
                  </div>
                </div>
                <div className="co-card-edit-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Payment Method Card */}
            <div className="co-card-section">
              <h2 className="co-section-title">Payment Method</h2>
              <button 
                className="co-select-card" 
                onClick={() => handleOpenModal('payment')}
                aria-label="Edit payment method"
              >
                <div className="co-card-info-row">
                  <div className="co-payment-badge-wrapper">
                    <span className="co-payment-logo-icon">{selectedPayment.logoText}</span>
                    <div className="co-payment-details">
                      <p className="co-payment-name">{selectedPayment.name}</p>
                      <p className="co-payment-desc">{selectedPayment.description}</p>
                    </div>
                  </div>
                </div>
                <div className="co-card-edit-icon" aria-hidden="true">
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9" />
                    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                  </svg>
                </div>
              </button>
            </div>

            {/* Price Details Column */}
            <div className="co-price-summary">
              <div className="co-price-row">
                <span className="co-price-label">Product {product.name}</span>
                <span className="co-price-val">${basePrice.toFixed(2)}</span>
              </div>
              <div className="co-price-row">
                <span className="co-price-label">Shipping</span>
                <span className="co-price-val">${shippingFee.toFixed(2)}</span>
              </div>
              <div className="co-price-total-row">
                <span className="co-total-label">Total Price</span>
                <span className="co-total-val">${totalPrice.toFixed(2)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button className="co-checkout-btn" onClick={handleCheckout}>
              Checkout Now
            </button>

          </div>

        </div>
      </div>

      {/* Slide-over / Modal Overlay System */}
      {activeModal && (
        <div className="co-modal-overlay" onClick={handleCloseModal}>
          <div 
            className="co-modal-content" 
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
          >
            
            {/* Modal Header */}
            <div className="co-modal-header">
              <h3 className="co-modal-title">
                {activeModal === 'address' && 'Select Shipping Address'}
                {activeModal === 'shipping' && 'Choose Shipping Method'}
                {activeModal === 'payment' && 'Choose Payment Method'}
              </h3>
              <button className="co-modal-close" onClick={handleCloseModal} aria-label="Close modal">
                <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="co-modal-body">
              
              {/* ADDRESS SELECTION MODAL */}
              {activeModal === 'address' && (
                <div className="co-modal-address-list">
                  {!showAddAddressForm ? (
                    <>
                      {addresses.map((addr) => (
                        <button
                          key={addr.id}
                          className={`co-modal-option-card ${selectedAddressId === addr.id ? 'active' : ''}`}
                          onClick={() => {
                            setSelectedAddressId(addr.id);
                            handleCloseModal();
                          }}
                        >
                          <div className="co-option-radio">
                            <span className="co-radio-dot" />
                          </div>
                          <div className="co-option-info">
                            <span className="co-option-badge">{addr.label}</span>
                            <p className="co-option-address-text">
                              <strong>{addr.name}</strong><br />
                              {addr.street}, {addr.district}<br />
                              {addr.city}, {addr.province}, {addr.country} {addr.postalCode}
                            </p>
                          </div>
                        </button>
                      ))}
                      <button 
                        className="co-add-address-btn"
                        onClick={() => setShowAddAddressForm(true)}
                      >
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add New Address
                      </button>
                    </>
                  ) : (
                    <form onSubmit={handleAddAddress} className="co-address-form">
                      <div className="co-form-group">
                        <label>Label (e.g. Home, Office)</label>
                        <input 
                          type="text" 
                          required 
                          value={newAddress.label}
                          onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                          placeholder="e.g. Vacation House"
                        />
                      </div>
                      <div className="co-form-group">
                        <label>Recipient Name</label>
                        <input 
                          type="text" 
                          required 
                          value={newAddress.name}
                          onChange={(e) => setNewAddress({ ...newAddress, name: e.target.value })}
                          placeholder="Full Name"
                        />
                      </div>
                      <div className="co-form-group">
                        <label>Street Address</label>
                        <input 
                          type="text" 
                          required 
                          value={newAddress.street}
                          onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                          placeholder="Street name, building/apartment number"
                        />
                      </div>
                      <div className="co-form-grid">
                        <div className="co-form-group">
                          <label>District</label>
                          <input 
                            type="text" 
                            required 
                            value={newAddress.district}
                            onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                            placeholder="District"
                          />
                        </div>
                        <div className="co-form-group">
                          <label>City</label>
                          <input 
                            type="text" 
                            required 
                            value={newAddress.city}
                            onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                            placeholder="City"
                          />
                        </div>
                      </div>
                      <div className="co-form-grid">
                        <div className="co-form-group">
                          <label>Province</label>
                          <input 
                            type="text" 
                            required 
                            value={newAddress.province}
                            onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                            placeholder="Province"
                          />
                        </div>
                        <div className="co-form-group">
                          <label>Postal Code</label>
                          <input 
                            type="text" 
                            required 
                            value={newAddress.postalCode}
                            onChange={(e) => setNewAddress({ ...newAddress, postalCode: e.target.value })}
                            placeholder="Postal Code"
                          />
                        </div>
                      </div>
                      <div className="co-form-actions">
                        <button 
                          type="button" 
                          className="co-form-cancel"
                          onClick={() => setShowAddAddressForm(false)}
                        >
                          Cancel
                        </button>
                        <button type="submit" className="co-form-submit">
                          Save Address
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* SHIPPING SELECTION MODAL */}
              {activeModal === 'shipping' && (
                <div className="co-modal-options-list">
                  {SHIPPING_OPTIONS.map((ship) => (
                    <button
                      key={ship.id}
                      className={`co-modal-option-card align-center ${selectedShippingId === ship.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedShippingId(ship.id);
                        handleCloseModal();
                      }}
                    >
                      <div className="co-option-radio">
                        <span className="co-radio-dot" />
                      </div>
                      <div className="co-option-info flex-row justify-between">
                        <div className="co-option-carrier">
                          <span className={`co-carrier-logo ${ship.logo.toLowerCase()}`}>
                            {ship.logo}
                          </span>
                          <div className="co-carrier-desc-block">
                            <span className="co-carrier-name-bold">{ship.name}</span>
                            <span className="co-carrier-eta-text">{ship.eta}</span>
                          </div>
                        </div>
                        <span className="co-option-price">${ship.price.toFixed(2)}</span>
                      </div>
                    </button>
                  ))}
                </div>
              )}

              {/* PAYMENT SELECTION MODAL */}
              {activeModal === 'payment' && (
                <div className="co-modal-options-list">
                  {PAYMENT_METHODS.map((pay) => (
                    <button
                      key={pay.id}
                      className={`co-modal-option-card align-center ${selectedPaymentId === pay.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedPaymentId(pay.id);
                        handleCloseModal();
                      }}
                    >
                      <div className="co-option-radio">
                        <span className="co-radio-dot" />
                      </div>
                      <div className="co-option-info">
                        <div className="co-payment-option-block">
                          <span className="co-payment-logo-icon">{pay.logoText}</span>
                          <div className="co-payment-desc-block">
                            <span className="co-payment-name-bold">{pay.name}</span>
                            <span className="co-payment-desc-text">{pay.description}</span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}

            </div>

          </div>
        </div>
      )}
    </div>
  );
}
