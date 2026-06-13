import { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ServiceContainer } from '../core/di/ServiceContainer';
import { CheckoutService } from '../core/services/CheckoutService';
import { ProductService } from '../core/services/ProductService';
import { Address } from '../core/domain/models/Address';
import { ShippingOption } from '../core/domain/models/ShippingOption';
import { Product } from '../core/domain/models/Product';
import { showAlert } from '../utils/alerts';
import type { CheckoutStepState } from '../types/checkout';

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

  // Resolve services from Dependency Injection Container
  const checkoutService = ServiceContainer.resolve<CheckoutService>('CheckoutService');
  const productService = ServiceContainer.resolve<ProductService>('ProductService');

  // Retrieve state passed from Product Detail page
  const { productId = '1', selectedSize = 'XL' } = (location.state || {}) as {
    productId?: string;
    selectedSize?: string;
  };

  const [product, setProduct] = useState<Product | null>(null);
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
  const [newAddress, setNewAddress] = useState<Omit<Address, 'id' | 'isIndonesian' | 'formattedRecipient' | 'fullAddressSummary' | 'isValidPhone' | 'isValidStreetAddress'>>({
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
      checkoutService.getCitiesList()
        .then(res => {
          setCitiesList(res || []);
        })
        .catch(err => console.error('Failed to load cities:', err));
    }
  }, [newAddress.country, citiesList.length, showAddAddressForm, checkoutService]);

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
    productService.getProductById(productId)
      .then((p) => {
        if (active) {
          if (p) {
            setProduct(p);
          } else {
            // Fallback product instantiation
            setProduct(new Product({
              id: productId,
              name: 'Noir Enchanted Vest',
              numericPrice: 120.00,
              image: '/images/product/far left.png'
            }));
          }
          setCheckoutState('idle');
        }
      })
      .catch((err) => {
        console.error('Failed to fetch checkout product details:', err);
        if (active) {
          setProduct(new Product({
            id: productId,
            name: 'Noir Enchanted Vest',
            numericPrice: 120.00,
            image: '/images/product/far left.png'
          }));
          setCheckoutState('idle');
        }
      });

    // Fetch user addresses
    checkoutService.getAddresses()
      .then((mapped) => {
        if (active && mapped.length > 0) {
          setAddresses(mapped);
          setSelectedAddressId(mapped[0].id);
        }
      })
      .catch((err) => console.error('Failed to fetch addresses:', err));

    return () => {
      active = false;
    };
  }, [productId, navigate, productService, checkoutService]);

  // Fetch shipping options whenever selected address changes
  const fetchShipping = (addressId: string) => {
    setShippingLoading(true);
    setShippingError(false);

    checkoutService.getShippingOptions(addressId)
      .then((mapped) => {
        if (mapped.length > 0) {
          setShippingOptions(mapped);
          setSelectedShippingId(mapped[0].id);
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

  const selectedAddress = addresses.find(a => a.id === selectedAddressId) || new Address({
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
  });

  const isIndonesian = selectedAddress.isIndonesian;

  const formatPrice = (value: number): string => {
    if (isIndonesian) {
      const idrValue = value * 15000;
      return 'Rp ' + idrValue.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const selectedShipping = shippingOptions.find(s => s.id === selectedShippingId) || new ShippingOption({ id: '', name: 'No Carrier', price: 0, eta: '', logo: '' });
  const selectedPayment = PAYMENT_METHODS.find(p => p.id === selectedPaymentId) || PAYMENT_METHODS[0];

  const basePrice = product ? product.numericPrice : 120.00;
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

    // Instantiate Address domain model to encapsulate fields and validations
    const tempAddress = new Address({
      id: '',
      label: newAddress.label,
      name: newAddress.name,
      street: newAddress.street,
      district: newAddress.district || '-',
      city: newAddress.city || '-',
      province: newAddress.province || '-',
      postalCode: newAddress.postalCode || '00000',
      country: newAddress.country || 'ID',
      phone: newAddress.phone
    });

    if (!tempAddress.label || !tempAddress.name || !tempAddress.street || !tempAddress.phone) return;

    // Validate using domain model behaviors (OOP Encapsulation)
    if (!tempAddress.isValidPhone()) {
      showAlert('Format nomor HP tidak valid. Gunakan format Indonesia (e.g. 081234567890).');
      return;
    }

    if (!tempAddress.isValidStreetAddress()) {
      showAlert('Alamat lengkap minimal 10 karakter.');
      return;
    }

    setCheckoutState('saving_address');
    try {
      const added = await checkoutService.addAddress(tempAddress);
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
    if (!product) return;

    setCheckoutState('submitting_checkout');
    try {
      const payMethod = selectedPayment.name === 'QRIS' ? 'qris' : 'bank_transfer';
      const res = await checkoutService.submitCheckout({
        items: [{ productId: Number(product.id), quantity: 1 }],
        addressId: Number(selectedAddressId),
        shippingMethodId: Number(selectedShippingId),
        paymentMethod: payMethod
      });

      setCheckoutState('checkout_completed');
      if (res.payment?.paymentUrl) {
        window.location.href = res.payment.paymentUrl;
      } else {
        navigate('/payment', {
          state: {
            order: res.order,
            payment: res.payment,
            product: {
              id: productId,
              name: product.name,
              price: basePrice,
              image: product.image,
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
