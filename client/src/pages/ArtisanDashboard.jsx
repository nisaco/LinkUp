import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import api from '../utils/api';

const STATUS_COLORS = {
  pending:     'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300',
  accepted:    'bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-300',
  in_progress: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  completed:   'bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-300',
};
const NEXT_STATUS = { pending: 'accepted', accepted: 'in_progress', in_progress: 'completed' };
const STATUS_LABEL = { pending: 'Accept', accepted: 'Start Job', in_progress: 'Mark Complete' };

const ArtisanDashboard = () => {
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const [bookings, setBookings]   = useState([]);
  const [earnings, setEarnings]   = useState({ totalEarnings: 0, payments: [] });
  const [loading, setLoading]     = useState(true);
  const [filter, setFilter]       = useState('all');
  const [updating, setUpdating]   = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [bRes, eRes] = await Promise.all([
          api.get('/bookings'),
          api.get('/payments/earnings'),
        ]);
        setBookings(bRes.data);
        setEarnings(eRes.data);
      } catch { toast.error('Failed to load dashboard'); }
      finally { setLoading(false); }
    };
    load();
  }, []);

  const updateStatus = async (bookingId, status) => {
    setUpdating(bookingId);
    try {
      const res = await api.put(`/bookings/${bookingId}/status`, { status });
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: res.data.status } : b));
      toast.success(`Booking marked as ${status}`);
    } catch { toast.error('Failed to update status'); }
    finally { setUpdating(null); }
  };

  const myBookings  = bookings.filter(b => b.artisan?._id === user?._id || b.artisan === user?._id);
  const filtered    = filter === 'all' ? myBookings : myBookings.filter(b => b.status === filter);
  const pending     = myBookings.filter(b => b.status === 'pending').length;
  const completed   = myBookings.filter(b => b.status === 'completed').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-black text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-gray-400 text-sm mt-0.5">Welcome back, {user?.name}</p>
          </div>
          <Link to="/profile-setup"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-5 py-2.5 rounded-2xl transition text-sm">
            Edit Profile
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
          {[
            { label: 'Total Earnings', value: `GHS ${earnings.totalEarnings.toLocaleString()}`, icon: '💰' },
            { label: 'Total Bookings', value: myBookings.length, icon: '📋' },
            { label: 'Pending',        value: pending,          icon: '⏳' },
            { label: 'Completed',      value: completed,        icon: '✅' },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5">
              <p className="text-2xl mb-2">{s.icon}</p>
              <p className="text-xl font-black text-gray-900 dark:text-white">{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Bookings */}
        <div className="flex flex-wrap gap-2 mb-6">
          {['all','pending','accepted','in_progress','completed'].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-xl text-sm font-bold capitalize transition ${filter === f ? 'bg-blue-600 text-white' : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700'}`}>
              {f.replace('_',' ')}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📭</p>
            <p className="font-semibold">No bookings in this category</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map(b => {
              const client   = b.client || {};
              const initials = (client.name || '?').split(' ').map(n=>n[0]).join('').toUpperCase();
              const next      = NEXT_STATUS[b.status];
              return (
                <motion.div key={b._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-2xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center font-bold text-blue-700 dark:text-blue-300 flex-shrink-0 text-sm">{initials}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <h3 className="font-bold text-gray-900 dark:text-white">{b.service}</h3>
                        <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${STATUS_COLORS[b.status]||''}`}>{b.status.replace('_',' ')}</span>
                        {b.paymentStatus === 'paid' && <span className="text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 px-2.5 py-1 rounded-full font-semibold">Paid</span>}
                      </div>
                      <p className="text-sm text-gray-500">Client: <span className="font-medium text-gray-700 dark:text-gray-300">{client.name}</span></p>
                      <div className="flex gap-4 mt-1.5 text-sm">
                        <span className="text-gray-400">📅 {b.scheduledAt ? new Date(b.scheduledAt).toLocaleDateString() : 'TBD'}</span>
                        <span className="font-bold text-gray-900 dark:text-white">GHS {b.price}</span>
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      <Link to={`/messages/${b._id}`}
                        className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-3 py-2 rounded-xl font-semibold hover:bg-gray-200 transition text-center">Message</Link>
                      {next && (
                        <button onClick={() => updateStatus(b._id, next)} disabled={updating === b._id}
                          className="text-xs bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl font-bold transition disabled:opacity-50">
                          {updating === b._id ? '...' : STATUS_LABEL[b.status]}
                        </button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ArtisanDashboard;