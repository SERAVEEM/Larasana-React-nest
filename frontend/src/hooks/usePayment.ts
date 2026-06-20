import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ServiceContainer } from '../core/di/ServiceContainer';
import { CheckoutService } from '../core/services/CheckoutService';
import { IDR_PER_USD } from '../core/config/currency';
import { showAlert } from '../utils/alerts';
import { client } from '../api/client';
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
      const idrValue = value * IDR_PER_USD;
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

  // Real-time payment status monitoring via Server-Sent Events (SSE) with Polling Fallback
  useEffect(() => {
    if (!orderDetails.order?.id || paymentState === 'success' || paymentState === 'expired') return;

    const controller = new AbortController();
    const token = localStorage.getItem('larasana_auth_token');
    const clientKey = String(client.defaults.headers['x-larasana-client-key'] || '');
    const baseUrl = client.defaults.baseURL || 'http://localhost:3000/api/v1';

    let fallbackInterval: ReturnType<typeof setInterval> | null = null;

    const connectSse = async () => {
      try {
        const response = await fetch(`${baseUrl}/checkout/payment-status/${orderDetails.order.id}/stream`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'x-larasana-client-key': clientKey,
            'Accept': 'text/event-stream'
          },
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`SSE failed with status: ${response.status}`);
        }

        const reader = response.body?.getReader();
        if (!reader) return;

        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() || '';

          for (const line of lines) {
            if (line.startsWith('data:')) {
              try {
                const jsonStr = line.slice(5).trim();
                const eventData = JSON.parse(jsonStr);
                const status = eventData.status;

                if (status === 'paid' || status === 'processing') {
                  setPaymentState('success');
                  navigate('/payment-success', {
                    state: {
                      orderId: orderDetails.order.orderCode,
                      amountPaid: totalAmount,
                      productName: orderDetails.product.name
                    }
                  });
                  return;
                }
              } catch (e) {
                // Ignore parse errors on partial messages
              }
            }
          }
        }
      } catch (err: any) {
        if (err.name !== 'AbortError') {
          console.warn('SSE payment stream connection failed, falling back to 3s polling:', err);
          
          fallbackInterval = setInterval(() => {
            checkoutService.getPaymentStatus(orderDetails.order.id)
              .then((res) => {
                if (res.paymentStatus === 'paid' || res.orderStatus === 'processing') {
                  if (fallbackInterval) clearInterval(fallbackInterval);
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
              .catch((pollErr) => {
                console.error('Polling fallback error:', pollErr);
              });
          }, 3000);
        }
      }
    };

    connectSse();

    return () => {
      controller.abort();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
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
