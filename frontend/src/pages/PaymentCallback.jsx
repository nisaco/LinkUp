// src/pages/PaymentCallback.jsx
import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { toast } from 'react-toastify';

const PaymentCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const reference = searchParams.get('reference');
    if (reference) verifyPayment(reference);
  }, []);

  const verifyPayment = async (reference) => {
    try {
      await api.post('/payments/verify', { reference });
      toast.success('Payment successful!');
      navigate('/my-bookings');
    } catch (err) {
      console.error(err);
      toast.error('Payment verification failed');
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <p className="text-gray-700 dark:text-gray-300">Verifying payment, please wait...</p>
    </div>
  );
};

export default PaymentCallback;
