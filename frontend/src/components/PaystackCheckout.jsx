// src/components/PaystackCheckout.jsx
import React from 'react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const PaystackCheckout = ({ amount, artisanId }) => {
  const publicKey = 'YOUR_PAYSTACK_PUBLIC_KEY'; // replace with your key

  const handlePay = async () => {
    try {
      const res = await api.post('/payments/initiate', { amount, artisanId });
      const { reference } = res.data;

      const handler = window.PaystackPop.setup({
        key: publicKey,
        email: JSON.parse(localStorage.getItem('user')).email,
        amount: amount * 100, // convert to kobo
        currency: 'NGN',
        ref: reference,
        callback: function (response) {
          window.location.href = `/payment/callback?reference=${response.reference}`;
        },
        onClose: function () {
          toast.info('Payment cancelled.');
        },
      });

      handler.openIframe();
    } catch (err) {
      console.error(err);
      toast.error('Payment initiation failed.');
    }
  };

  return (
    <button
      onClick={handlePay}
      className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-xl font-bold shadow-lg transition hover:scale-105"
    >
      Pay Now
    </button>
  );
};

export default PaystackCheckout;
