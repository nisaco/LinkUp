// src/pages/MyBookings.jsx
import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const MyBookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const res = await api.get('/bookings');
      setBookings(res.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load bookings');
    }
  };

  return (
    <div className="min-h-screen px-6 py-20 bg-gray-100 dark:bg-gray-900">
      <h2 className="text-3xl font-bold mb-6 text-gray-900 dark:text-white">My Bookings</h2>
      {bookings.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">You have no bookings yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookings.map(b => (
            <div key={b._id} className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-lg">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white">{b.artisanName}</h3>
              <p className="text-gray-600 dark:text-gray-300">{b.service}</p>
              <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">{new Date(b.date).toLocaleString()}</p>
              <p className="mt-2 text-sm font-semibold text-gray-700 dark:text-gray-200">Status: {b.status}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookings;
