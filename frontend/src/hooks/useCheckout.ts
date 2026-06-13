import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { client } from '../api/client';
import { showAlert } from '../utils/alerts';
import type { Address, ShippingOption, CheckoutStepState } from '../types/checkout';

export const PAYMENT_METHODS = [
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

export function useCheckout() {
  const location = useLocation();
  const navigate = useNavigate();

  // Retrieve state passed from Product Detail page
  const { productId = '1', selectedSize = 'XL' } = (location.state || {}) as {
    productId?: string;
    selectedSize?: string;
  };

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

  // Load cities list if Indonesian address is selected and form is shown
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

  // Fetch product and address details on mount
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
          const mapped: Address[] = res.data.map((addr: any) => ({
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

  // Fetch shipping options whenever selected address changes
  const fetchShipping = (addressId: string) => {
    setShippingLoading(true);
    setShippingError(false);
    const url = addressId ? `/shipping?addressId=${addressId}` : '/shipping';

    client.get(url)
      .then((res) => {
        if (res.data && res.data.length > 0) {
          const mapped: ShippingOption[] = res.data.map((ship: any) => ({
            id: String(ship.id),
            name: ship.label,
            price: Number(ship.baseCost),
            eta: ship.estimatedDays,
            logo: ship.courier.toUpperCase()
          }));
          setShippingOptions(mapped);
          setSelectedShippingId(mapped[0].id);
        } else {
          // Rich fallback mock rates
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

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || {
    id: '',
    label: 'No Address',
    name: '',
    street: 'Please add a shipping address',
    district: '',
    city: '',
    province: '',
    postalCode: '',
    country: 'ID',
    phone: ''
  };

  const isIndonesian = selectedAddress?.country === 'ID';

  const formatPrice = (value: number): string => {
    if (isIndonesian) {
      const idrValue = value * 15000;
      return 'Rp ' + idrValue.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

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

    // Client-side phone format validation
    const phoneRegex = /^(\+62|62|0)8[1-9][0-9]{6,10}$/;
    if (!phoneRegex.test(newAddress.phone)) {
      showAlert('Format nomor HP tidak valid. Gunakan format Indonesia (e.g. 081234567890).');
      return;
    }

    // Client-side street address length validation
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
      const payMethod = selectedPayment.name === 'QRIS' ? 'qris' : 'bank_transfer';
      const res = await client.post('/checkout', {
        items: [{ productId: Number(product.id), quantity: 1 }],
        addressId: Number(selectedAddressId),
        shippingMethodId: Number(selectedShippingId),
        paymentMethod: payMethod
      });

      setCheckoutState('checkout_completed');
      if (res.data.payment?.paymentUrl) {
        window.location.href = res.data.payment.paymentUrl;
      } else {
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
      }
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

  return {
    productId,
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
    isIndonesian,
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
  };
}
