import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { client } from '../api/client';
import '../style/Checkout.css';
import { showAlert } from '../utils/alerts';

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
  phone: string;
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

// Unused local mock lists removed to satisfy strict ts compiler settings

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

const formatPrice = (value: number): string => {
  return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

export default function CheckoutPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve state passed from Product Detail page
  const { productId = '1', selectedSize = 'XL' } = (location.state || {}) as {
    productId?: string;
    selectedSize?: string;
  };

  type CheckoutStepState = 
    | 'loading_details'
    | 'idle'
    | 'saving_address'
    | 'submitting_checkout'
    | 'checkout_completed'
    | 'error';

  const [product, setProduct] = useState<any>(null);
  const [checkoutState, setCheckoutState] = useState<CheckoutStepState>('loading_details');
  const loading = checkoutState === 'loading_details';

  // Component States for Checkout Selection
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [selectedShippingId, setSelectedShippingId] = useState('');
  const [shippingLoading, setShippingLoading] = useState(false);
  const [shippingError, setShippingError] = useState(false);
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
    country: 'ID',
    phone: ''
  });

  const [citiesList, setCitiesList] = useState<any[]>([]);
  const [citySearchQuery, setCitySearchQuery] = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);

  useEffect(() => {
    if (newAddress.country === 'ID' && citiesList.length === 0 && showAddAddressForm) {
      client.get('/shipping/cities')
        .then(res => {
          setCitiesList(res.data || []);
        })
        .catch(err => console.error('Failed to load cities:', err));
    }
  }, [newAddress.country, citiesList.length, showAddAddressForm]);

  useEffect(() => {
    setCitySearchQuery(newAddress.city);
  }, [newAddress.city]);

  const filteredCities = useMemo(() => {
    if (!citySearchQuery) return citiesList;
    const q = citySearchQuery.toLowerCase();
    return citiesList.filter(c => 
      c.city_name.toLowerCase().includes(q) || 
      c.province.toLowerCase().includes(q)
    );
  }, [citiesList, citySearchQuery]);

  useEffect(() => {
    let active = true;
    setCheckoutState('loading_details');

    // Check auth
    const token = localStorage.getItem('larasana_auth_token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Fetch product details
    let apiId = productId;
    if (productId.startsWith('grid-')) {
      apiId = productId.replace('grid-', '');
    } else if (productId.startsWith('p')) {
      apiId = productId.replace('p', '');
    }

    client.get(`/products/${apiId}`)
      .then((res) => {
        if (active) {
          const p = res.data;
          const imageList = p.images && p.images.length > 0
            ? p.images.map((img: any) => img.url)
            : [p.thumbnailUrl || '/images/product/far left.png'];

          setProduct({
            id: p.id.toString(),
            name: p.name,
            price: Number(p.price),
            images: imageList,
          });
          setCheckoutState('idle');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch checkout product details:', err);
        if (active) {
          setProduct({
            id: productId,
            name: 'Noir Enchanted Vest',
            price: 120.00,
            images: ['/images/product/far left.png']
          });
          setCheckoutState('idle');
        }
      });

    // Fetch user addresses
    client.get('/addresses')
      .then((res) => {
        if (active && res.data && res.data.length > 0) {
          const mapped = res.data.map((addr: any) => ({
            id: String(addr.id),
            label: addr.label,
            name: addr.recipientName,
            street: addr.fullAddress,
            district: addr.district,
            city: addr.city,
            province: addr.province,
            postalCode: addr.postalCode,
            country: addr.country || 'ID',
            phone: addr.phone
          }));
          setAddresses(mapped);
          setSelectedAddressId(mapped[0].id);
        }
      })
      .catch((err) => console.error('Failed to fetch addresses:', err));

    return () => {
      active = false;
    };
  }, [productId, navigate]);

  // Fetch shipping options whenever address changes
  const fetchShipping = (addressId: string) => {
    setShippingLoading(true);
    setShippingError(false);
    const url = addressId ? `/shipping?addressId=${addressId}` : '/shipping';

    client.get(url)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const mapped = res.data.map((ship: any) => ({
            id: String(ship.id),
            name: ship.label,
            price: Number(ship.baseCost),
            eta: ship.estimatedDays,
            logo: ship.courier.toUpperCase()
          }));
          setShippingOptions(mapped);
          setSelectedShippingId(mapped[0].id);
        } else {
          // Rich fallback mock rates when backend has no API key configured
          const fallback: ShippingOption[] = [
            { id: 'mock-1', name: 'JNE Regular (REG)', price: 1.50, eta: '3-5 hari', logo: 'JNE' },
            { id: 'mock-2', name: 'JNE YES (1 Day Service)', price: 3.20, eta: '1 hari', logo: 'JNE' },
            { id: 'mock-3', name: 'POS Kilat Khusus', price: 1.20, eta: '4-7 hari', logo: 'POS' },
            { id: 'mock-4', name: 'TIKI Regular', price: 1.40, eta: '4-6 hari', logo: 'TIKI' },
          ];
          setShippingOptions(fallback);
          setSelectedShippingId(fallback[0].id);
        }
        setShippingLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch shipping methods:', err);
        setShippingError(true);
        setShippingLoading(false);
      });
  };

  useEffect(() => {
    let active = true;
    if (!active) return;
    fetchShipping(selectedAddressId);
    return () => { active = false; };
  }, [selectedAddressId]);

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || { id: '', label: 'No Address', name: '', street: 'Please add a shipping address', district: '', city: '', province: '', postalCode: '', country: 'ID', phone: '' };
  const selectedShipping = shippingOptions.find(s => s.id === selectedShippingId) || { id: '', name: 'No Carrier', price: 0, eta: '', logo: '' };
  const selectedPayment = PAYMENT_METHODS.find(p => p.id === selectedPaymentId) || PAYMENT_METHODS[0];

  const basePrice = product ? product.price : 120.00;
  const shippingFee = selectedShipping.price;
  const totalPrice = basePrice + shippingFee;

  const handleOpenModal = (modalType: 'address' | 'shipping' | 'payment') => {
    setActiveModal(modalType);
    setShowAddAddressForm(false);
  };

  const handleCloseModal = () => {
    setActiveModal(null);
  };

  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    if (checkoutState !== 'idle') return;
    if (!newAddress.label || !newAddress.name || !newAddress.street || !newAddress.phone) return;

    // Client-side phone format validation (matching backend regex)
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
    if (!phoneRegex.test(newAddress.phone)) {
      showAlert('Format nomor HP tidak valid. Gunakan format Indonesia (e.g. 081234567890).');
      return;
    }

    // Client-side street address length validation (matching backend minLength)
    if (newAddress.street.length < 10) {
      showAlert('Alamat lengkap minimal 10 karakter.');
      return;
    }

    setCheckoutState('saving_address');
    try {
      const payload = {
        label: newAddress.label,
        recipientName: newAddress.name,
        phone: newAddress.phone,
        fullAddress: newAddress.street,
        district: newAddress.district || '-',
        city: newAddress.city || '-',
        province: newAddress.province || '-',
        postalCode: newAddress.postalCode || '00000',
        country: newAddress.country || 'ID'
      };

      const res = await client.post('/addresses', payload);

      const added: Address = {
        id: String(res.data.id),
        label: res.data.label,
        name: res.data.recipientName,
        street: res.data.fullAddress,
        district: res.data.district,
        city: res.data.city,
        province: res.data.province,
        postalCode: res.data.postalCode,
        country: res.data.country || 'ID',
        phone: res.data.phone
      };

      setAddresses([...addresses, added]);
      setSelectedAddressId(added.id);
      setShowAddAddressForm(false);
      setNewAddress({ label: '', name: '', street: '', district: '', city: '', province: '', postalCode: '', country: 'ID', phone: '' });
      setCheckoutState('idle');
    } catch (err: any) {
      console.error('Failed to save address:', err);
      setCheckoutState('idle');
      const errMsg = err.response?.data?.message || 'Gagal menyimpan alamat baru';
      showAlert(Array.isArray(errMsg) ? errMsg.join('\n') : errMsg);
    }
  };

  const handleCheckout = async () => {
    if (checkoutState !== 'idle') return;
    if (!selectedAddressId) {
      showAlert('Silakan pilih atau tambahkan alamat terlebih dahulu.');
      return;
    }
    if (!selectedShippingId) {
      showAlert('Silakan pilih kurir pengiriman terlebih dahulu.');
      return;
    }

    setCheckoutState('submitting_checkout');
    try {
      // Map payment methods to backend expectations: e.g. QRIS -> 'qris'
      const payMethod = selectedPayment.name === 'QRIS' ? 'qris' : 'bank_transfer';
      const res = await client.post('/checkout', {
        items: [{ productId: Number(product.id), quantity: 1 }],
        addressId: Number(selectedAddressId),
        shippingMethodId: Number(selectedShippingId),
        paymentMethod: payMethod
      });

      setCheckoutState('checkout_completed');
      navigate('/payment', {
        state: {
          order: res.data.order,
          payment: res.data.payment,
          product: {
            id: productId,
            name: product.name,
            price: basePrice,
            image: product.images[0],
            size: selectedSize
          },
          pricing: {
            subtotal: basePrice,
            shipping: shippingFee,
            total: totalPrice
          }
        }
      });
    } catch (err: any) {
      console.error('Checkout creation failed:', err);
      setCheckoutState('idle');
      const errMsg = err.response?.data?.message || 'Gagal memproses checkout';
      showAlert(Array.isArray(errMsg) ? errMsg[0] : errMsg);
    }
  };

  const handleBack = () => {
    navigate(`/product/${productId}`);
  };

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
              {shippingLoading ? (
                <div className="co-shipping-skeleton">
                  <div className="co-skeleton-logo" />
                  <div className="co-skeleton-lines">
                    <div className="co-skeleton-line co-skeleton-line--wide" />
                    <div className="co-skeleton-line co-skeleton-line--narrow" />
                  </div>
                </div>
              ) : shippingError ? (
                <div className="co-shipping-error-card">
                  <span>Failed to load shipping rates.</span>
                  <button className="co-shipping-retry-btn" onClick={() => fetchShipping(selectedAddressId)}>
                    Retry
                  </button>
                </div>
              ) : (
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                    <span style={{ fontWeight: 700, color: '#C2A353', fontSize: '0.95rem' }}>
                      {formatPrice(selectedShipping.price)}
                    </span>
                    <div className="co-card-edit-icon" aria-hidden="true">
                      <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9" />
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                      </svg>
                    </div>
                  </div>
                </button>
              )}
              {/* Live API indicator */}
              {!shippingLoading && !shippingError && selectedShippingId && Number(selectedShippingId) >= 500 && (
                <div className="co-shipping-live-badge">⚡ Live rates from Biteship</div>
              )}
              {!shippingLoading && !shippingError && selectedShippingId && Number(selectedShippingId) >= 300 && Number(selectedShippingId) < 500 && (
                <div className="co-shipping-live-badge">⚡ Live rates from RajaOngkir</div>
              )}
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
                        <label>Recipient Phone Number</label>
                        <input 
                          type="text" 
                          required 
                          value={newAddress.phone}
                          onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                          placeholder="e.g. 08123456789"
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
                      <div className="co-form-group">
                        <label>Country</label>
                        <select 
                          value={newAddress.country}
                          onChange={(e) => setNewAddress({ ...newAddress, country: e.target.value, city: '', province: '', postalCode: '' })}
                          style={{
                            width: '100%',
                            padding: '0.8rem 1rem',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            backgroundColor: '#fff',
                            fontFamily: "'Inter', sans-serif",
                            fontSize: '0.95rem',
                            color: '#333',
                            outline: 'none',
                            transition: 'border-color 0.2s ease',
                            cursor: 'pointer',
                            marginBottom: '1rem'
                          }}
                        >
                          <option value="ID">Indonesia</option>
                          <option value="US">United States</option>
                          <option value="SG">Singapore</option>
                          <option value="MY">Malaysia</option>
                          <option value="AU">Australia</option>
                        </select>
                      </div>

                      {newAddress.country === 'ID' ? (
                        <>
                          <div className="co-form-grid">
                            <div className="co-form-group co-city-dropdown-container">
                              <label>City / Kabupaten</label>
                              <input 
                                type="text" 
                                required 
                                value={citySearchQuery}
                                onChange={(e) => {
                                  setCitySearchQuery(e.target.value);
                                  setShowCityDropdown(true);
                                }}
                                onFocus={() => setShowCityDropdown(true)}
                                onBlur={() => {
                                  setTimeout(() => setShowCityDropdown(false), 200);
                                }}
                                placeholder="Type to search city..."
                              />
                              {showCityDropdown && (
                                <ul className="co-city-dropdown-list">
                                  {filteredCities.length > 0 ? (
                                    filteredCities.slice(0, 15).map(c => (
                                      <li 
                                        key={c.city_id} 
                                        onMouseDown={() => {
                                          setNewAddress({
                                            ...newAddress,
                                            city: `${c.type} ${c.city_name}`,
                                            province: c.province,
                                            postalCode: c.postal_code
                                          });
                                          setCitySearchQuery(`${c.type} ${c.city_name}`);
                                          setShowCityDropdown(false);
                                        }}
                                      >
                                        {c.type} {c.city_name}, {c.province}
                                      </li>
                                    ))
                                  ) : (
                                    <li style={{ cursor: 'default', color: '#999' }}>No cities found</li>
                                  )}
                                </ul>
                              )}
                            </div>
                            <div className="co-form-group">
                              <label>District (Kecamatan)</label>
                              <input 
                                type="text" 
                                required 
                                value={newAddress.district}
                                onChange={(e) => setNewAddress({ ...newAddress, district: e.target.value })}
                                placeholder="District"
                              />
                            </div>
                          </div>
                          <div className="co-form-grid">
                            <div className="co-form-group">
                              <label>Province</label>
                              <input 
                                type="text" 
                                required 
                                readOnly
                                value={newAddress.province}
                                style={{ backgroundColor: '#f5f5f5', cursor: 'not-allowed' }}
                                placeholder="Auto-populated"
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
                        </>
                      ) : (
                        <>
                          <div className="co-form-grid">
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
                          </div>
                          <div className="co-form-grid">
                            <div className="co-form-group">
                              <label>Province / State</label>
                              <input 
                                type="text" 
                                required 
                                value={newAddress.province}
                                onChange={(e) => setNewAddress({ ...newAddress, province: e.target.value })}
                                placeholder="Province / State"
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
                        </>
                      )}
                      <div className="co-form-actions">
                        <button 
                          type="button" 
                          className="co-form-cancel"
                          onClick={() => setShowAddAddressForm(false)}
                        >
                          Cancel
                        </button>
                        <button 
                          type="submit" 
                          className="co-form-submit"
                          disabled={checkoutState !== 'idle'}
                          style={{
                            opacity: checkoutState !== 'idle' ? 0.7 : 1,
                            cursor: checkoutState !== 'idle' ? 'not-allowed' : 'pointer'
                          }}
                        >
                          {checkoutState === 'saving_address' ? 'Saving...' : 'Save Address'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* SHIPPING SELECTION MODAL */}
              {activeModal === 'shipping' && (
                <div className="co-modal-options-list">
                  {shippingLoading ? (
                    [1, 2, 3].map(i => (
                      <div key={i} className="co-shipping-skeleton co-shipping-skeleton--modal">
                        <div className="co-skeleton-logo" />
                        <div className="co-skeleton-lines">
                          <div className="co-skeleton-line co-skeleton-line--wide" />
                          <div className="co-skeleton-line co-skeleton-line--narrow" />
                        </div>
                      </div>
                    ))
                  ) : shippingOptions.length === 0 ? (
                    <div className="co-shipping-error-card">
                      <span>No shipping options available for this address.</span>
                      <button className="co-shipping-retry-btn" onClick={() => fetchShipping(selectedAddressId)}>Retry</button>
                    </div>
                  ) : (
                    shippingOptions.map((ship) => (
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
                              <span className="co-carrier-eta-text">
                                🕐 {ship.eta}{Number(ship.id) >= 300 ? ' · Live Rate' : ''}
                              </span>
                            </div>
                          </div>
                          <span className="co-option-price">{formatPrice(ship.price)}</span>
                        </div>
                      </button>
                    ))
                  )}
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
      <style>{`
        .co-city-dropdown-container {
          position: relative;
        }
        .co-city-dropdown-list {
          position: absolute;
          top: 100%;
          left: 0;
          right: 0;
          max-height: 200px;
          overflow-y: auto;
          background-color: #ffffff;
          border: 1px solid #ddd;
          border-radius: 8px;
          list-style: none;
          padding: 0;
          margin: 4px 0 0 0;
          z-index: 1000;
          box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        }
        .co-city-dropdown-list li {
          padding: 10px 14px;
          cursor: pointer;
          font-size: 0.9rem;
          color: #333;
          transition: background-color 0.15s ease;
          border-bottom: 1px solid #f0f0f0;
          text-align: left;
        }
        .co-city-dropdown-list li:hover {
          background-color: #f7f7f7;
        }
        .co-city-dropdown-list li:last-child {
          border-bottom: none;
        }
      `}</style>
    </div>
  );
}
