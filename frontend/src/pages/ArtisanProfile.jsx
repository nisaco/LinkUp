import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import api from '../utils/api';

const StarRating = ({ rating, interactive = false, onRate }) => (
  <div className="flex gap-1">
    {[1,2,3,4,5].map(s => (
      <svg key={s}
        onClick={() => interactive && onRate(s)}
        className={`w-5 h-5 transition ${interactive ? 'cursor-pointer hover:scale-110' : ''} ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
  </div>
);

const ArtisanProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem('user') || 'null');

  const [artisan, setArtisan]     = useState(null);
  const [reviews, setReviews]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [booking, setBooking]     = useState({ service: '', scheduledAt: '', price: '' });
  const [submitting, setSubmitting] = useState(false);
  const [tab, setTab]             = useState('about');

  useEffect(() => {
    const load = async () => {
      try {
        const [pRes, rRes] = await Promise.all([
          api.get(`/artisans/profile/${id}`),
          api.get(`/reviews/artisan/${id}`),
        ]);
        setArtisan(pRes.data);
        setReviews(rRes.data);
        setBooking(prev => ({ ...prev, price: pRes.data.rate || '' }));
      } catch { toast.error('Failed to load profile'); }
      finally { setLoading(false); }
    };
    load();
  }, [id]);

  const handleBook = async (e) => {
    e.preventDefault();
    if (!currentUser) { navigate('/login'); return; }
    setSubmitting(true);
    try {
      const res = await api.post('/bookings', {
        artisan: id,
        service: booking.service,
        price: Number(booking.price),
        scheduledAt: booking.scheduledAt,
      });
      toast.success('Booking created! Redirecting to payment...');
      setTimeout(() => { window.location.href = res.data.paymentLink; }, 1200);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!artisan) return <div className="min-h-screen pt-24 text-center text-gray-400">Artisan not found</div>;

  const user     = artisan.user || {};
  const initials = (user.name || '?').split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">

      {/* Profile header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            {user.profilePic
              ? <img src={user.profilePic} className="w-24 h-24 rounded-3xl object-cover" alt={user.name} />
              : <div className="w-24 h-24 rounded-3xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-3xl font-black text-blue-700 dark:text-blue-300">{initials}</div>
            }
            <div className="flex-1">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-2xl font-black text-gray-900 dark:text-white">{user.name}</h1>
                {artisan.verified && <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-3 py-1 rounded-full font-bold">✓ Verified</span>}
                <span className={`text-xs px-3 py-1 rounded-full font-bold ${artisan.availability ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'bg-gray-100 dark:bg-gray-800 text-gray-500'}`}>
                  {artisan.availability ? 'Available' : 'Unavailable'}
                </span>
              </div>
              <p className="text-blue-600 dark:text-blue-400 font-semibold mb-3">{artisan.skills?.join(' · ')}</p>
              <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  ⭐ {artisan.rating?.toFixed(1) || '0.0'} ({artisan.reviewCount || 0} reviews)
                </span>
                {artisan.location && <span>📍 {artisan.location}</span>}
                <span className="text-gray-900 dark:text-white font-bold text-base">GHS {artisan.rate}/hr</span>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 mt-8 border-b border-gray-100 dark:border-gray-800">
            {['about', 'reviews', 'book'].map(t => (
              <button key={t} onClick={() => setTab(t)}
                className={`pb-3 text-sm font-bold capitalize transition border-b-2 ${tab === t ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}>
                {t === 'book' ? 'Book Now' : t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="max-w-5xl mx-auto px-6 py-10">

        {tab === 'about' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-6">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
                <h2 className="font-bold text-gray-900 dark:text-white mb-3">About</h2>
                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">{artisan.bio || 'No bio provided.'}</p>
              </div>
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
                <h2 className="font-bold text-gray-900 dark:text-white mb-3">Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {artisan.skills?.map(s => (
                    <span key={s} className="bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 px-3 py-1.5 rounded-xl text-sm font-medium">{s}</span>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
                <h2 className="font-bold text-gray-900 dark:text-white mb-4">Availability</h2>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
                    <span key={d} className={`text-xs px-2.5 py-1.5 rounded-lg font-semibold ${artisan.workingDays?.includes(d) ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-400'}`}>{d}</span>
                  ))}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {artisan.workingHours?.start} – {artisan.workingHours?.end}
                </p>
              </div>
              <button onClick={() => setTab('book')}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition hover:scale-105 shadow-lg">
                Book This Artisan
              </button>
            </div>
          </motion.div>
        )}

        {tab === 'reviews' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4 max-w-2xl">
            {reviews.length === 0
              ? <div className="text-center py-16 text-gray-400">
                  <p className="text-4xl mb-3">💬</p>
                  <p className="font-semibold">No reviews yet</p>
                </div>
              : reviews.map(r => (
                <div key={r._id} className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-sm font-bold text-blue-700 dark:text-blue-300">
                      {r.client?.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 dark:text-white text-sm">{r.client?.name}</p>
                      <p className="text-xs text-gray-400">{new Date(r.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="ml-auto"><StarRating rating={r.rating} /></div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{r.comment}</p>
                </div>
              ))
            }
          </motion.div>
        )}

        {tab === 'book' && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-lg">
            <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-black text-gray-900 dark:text-white mb-6">Book {user.name}</h2>
              <form onSubmit={handleBook} className="flex flex-col gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Service Description</label>
                  <input value={booking.service} onChange={e => setBooking(p => ({...p, service: e.target.value}))}
                    placeholder="e.g. Fix kitchen sink leak" required
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Scheduled Date & Time</label>
                  <input type="datetime-local" value={booking.scheduledAt}
                    onChange={e => setBooking(p => ({...p, scheduledAt: e.target.value}))} required
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">Agreed Price (GHS)</label>
                  <input type="number" min="1" value={booking.price}
                    onChange={e => setBooking(p => ({...p, price: e.target.value}))} required
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                  <p className="text-xs text-gray-400 mt-1">Artisan's rate: GHS {artisan.rate}/hr</p>
                </div>
                <button type="submit" disabled={submitting}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition hover:scale-105 shadow-lg disabled:opacity-50 mt-2">
                  {submitting ? 'Creating Booking...' : 'Book & Pay with Paystack'}
                </button>
              </form>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default ArtisanProfile;