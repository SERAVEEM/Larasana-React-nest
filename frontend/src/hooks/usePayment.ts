import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ServiceContainer } from '../core/di/ServiceContainer';
import { CheckoutService } from '../core/services/CheckoutService';
import { showAlert } from '../utils/alerts';
import type { OrderDetails, PaymentState } from '../types/payment';

export function usePayment() {
  const location = useLocation();
  const navigate = useNavigate();

  const checkoutService = ServiceContainer.resolve<CheckoutService>('CheckoutService');

  const orderDetails = (location.state as OrderDetails) || ({
    product: {
      id: '1',
      name: 'Noir Enchanted Vest',
      price: 120.00,
      image: '',
      size: 'XL'
    },
    pricing: {
      subtotal: 120.00,
      shipping: 2.00,
      total: 122.00
    },
    order: {
      id: 1,
      orderCode: 'LRS-20260603-9999',
      totalAmount: 122.00,
      status: 'pending'
    },
    payment: {
      id: 1,
      method: 'qris',
      amount: 122.00,
      status: 'pending',
      paymentUrl: '',
      qrImageUrl: '',
      vaNumber: '',
      expiryTime: new Date(Date.now() + 900000).toISOString()
    }
  } as OrderDetails);

  const currency = orderDetails.payment?.currency || 'USD';

  const formatPrice = (value: number): string => {
    if (currency === 'IDR') {
      const idrValue = value * 15000;
      return 'Rp ' + idrValue.toLocaleString('id-ID', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }
    return '$' + value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const totalAmount = orderDetails.pricing.total;

  const [timeLeft, setTimeLeft] = useState(900);
  const [paymentState, setPaymentState] = useState<PaymentState>('idle');

  // Set timeLeft based on actual backend expiryTime (cap at 15 minutes)
  useEffect(() => {
    if (orderDetails.payment?.expiryTime) {
      const expiry = new Date(orderDetails.payment.expiryTime).getTime();
      const diff = Math.max(0, Math.floor((expiry - Date.now()) / 1000));
      const capped = Math.min(diff, 900);
      setTimeLeft(capped);
      if (diff <= 0) {
        setPaymentState('expired');
      } else if (paymentState !== 'verifying' && paymentState !== 'success') {
        setPaymentState('idle');
      }
    }
  }, [orderDetails]);

  // Background countdown timer
  useEffect(() => {
    if (paymentState === 'expired' || paymentState === 'success') return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setPaymentState('expired');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [paymentState]);

  // Background payment status polling every 3 seconds
  useEffect(() => {
    if (!orderDetails.order?.id || paymentState === 'success' || paymentState === 'expired') return;

    const interval = setInterval(() => {
      checkoutService.getPaymentStatus(orderDetails.order.id)
        .then((res) => {
          if (res.paymentStatus === 'paid' || res.orderStatus === 'processing') {
            clearInterval(interval);
            setPaymentState('success');
            navigate('/payment-success', {
              state: {
                orderId: orderDetails.order.orderCode,
                amountPaid: totalAmount,
                productName: orderDetails.product.name
              }
            });
          }
        })
        .catch((err) => {
          console.error('Failed to poll payment status:', err);
        });
    }, 3000);

    return () => clearInterval(interval);
  }, [orderDetails, navigate, totalAmount, paymentState, checkoutService]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleBuyNow = async () => {
    if (!orderDetails.order?.id || paymentState !== 'idle') return;
    setPaymentState('verifying');

    try {
      const res = await checkoutService.getPaymentStatus(orderDetails.order.id);
      if (res.paymentStatus === 'paid' || res.orderStatus === 'processing') {
        setPaymentState('success');
        navigate('/payment-success', {
          state: {
            orderId: orderDetails.order.orderCode,
            amountPaid: totalAmount,
            productName: orderDetails.product.name
          }
        });
      } else {
        setPaymentState('idle');
        showAlert('Pembayaran belum kami terima. Silakan selesaikan pembayaran Anda di e-wallet atau bank Anda.');
      }
    } catch (err) {
      console.error('Manual check failed:', err);
      setPaymentState('idle');
      showAlert('Gagal mengecek status pembayaran.');
    }
  };

  const handleSimulateSuccess = () => {
    if (paymentState !== 'idle') return;
    setPaymentState('success');
    navigate('/payment-success', {
      state: {
        orderId: orderDetails.order?.orderCode || 'DEV-MOCK',
        amountPaid: totalAmount,
        productName: orderDetails.product?.name || 'Curated Piece'
      }
    });
  };

  const handleBack = () => {
    if (paymentState === 'verifying' || paymentState === 'success') return;
    navigate('/checkout', { state: { productId: orderDetails.product.id, selectedSize: orderDetails.product.size } });
  };

  const isTransitioning = paymentState === 'verifying' || paymentState === 'success';

  return {
    orderDetails,
    timeLeft,
    paymentState,
    totalAmount,
    isTransitioning,
    formatPrice,
    formatTime,
    handleBuyNow,
    handleSimulateSuccess,
    handleBack
  };
}
