import axios from 'axios';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

export const initializePayment = async (email, amount) => {
  const res = await axios.post(
    'https://api.paystack.co/transaction/initialize',
    { email, amount: amount * 100 }, // kobo
    { headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` } }
  );
  return res.data.data; // includes authorization_url and reference
};

export const verifyPayment = async (reference) => {
  const res = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
    headers: { Authorization: `Bearer ${PAYSTACK_SECRET}` },
  });
  return res.data.data; // contains payment status
};
