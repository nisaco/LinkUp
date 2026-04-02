// src/components/Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../utils/api';

const Navbar = () => {
  const [notifications, setNotifications] = useState([]);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [unreadNotifs, setUnreadNotifs] = useState(0);
  const [unreadMessages, setUnreadMessages] = useState(0);

  const navigate = useNavigate();
  const location = useLocation();

  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (user?.token) {
      fetchNotifications();
      fetchUnreadCounts();

      const interval = setInterval(() => {
        fetchNotifications();
        fetchUnreadCounts();
      }, 30000);
      return () => clearInterval(interval);
    }
  }, [user, location.pathname]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data || []);
    } catch (err) {
      console.error('Notif Error:', err);
    }
  };

  const fetchUnreadCounts = async () => {
    try {
      const res = await api.get('/notifications/unread-count');
      setUnreadNotifs(res.data.notifications || 0);
      setUnreadMessages(res.data.messages || 0);
    } catch (err) {
      console.error('Count Error:', err);
    }
  };

  const markAllAsRead = async () => {
    try {
      await api.put('/notifications/read');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotifs(0);
    } catch (err) {
      console.error('Mark read failed:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] px-6 py-4 flex justify-between items-center bg-white/90 dark:bg-black/90 backdrop-blur-2xl border-b border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <Link to="/" className="text-2xl font-black italic tracking-tighter text-gray-900 dark:text-white">
        HIRE<span className="text-blue-600">ME</span>
      </Link>

      <div className="flex items-center gap-3 md:gap-6">
        {/* Dashboard link */}
        {user && (
          <Link
            to={user.role === 'artisan' ? '/artisan-dashboard' : '/dashboard'}
            className="hidden md:inline-block text-sm font-bold uppercase text-gray-600 hover:text-blue-600 transition-colors"
          >
            Dashboard
          </Link>
        )}

        {/* Messages */}
        {user && (
          <Link
            to="/messages"
            className="relative p-2 text-gray-700 hover:text-blue-600 transition-colors"
            title="Messages"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            {unreadMessages > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-blue-600 text-white text-[8px] font-black flex items-center justify-center rounded-full">
                {unreadMessages}
              </span>
            )}
          </Link>
        )}

        {/* Notifications */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setIsNotifOpen(!isNotifOpen);
                setIsProfileOpen(false);
                if (!isNotifOpen) markAllAsRead();
              }}
              className="p-2 text-gray-700 hover:text-blue-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {(unreadCount > 0 || unreadNotifs > 0) && (
                <span className="absolute top-0 right-0 w-4 h-4 bg-red-600 text-white text-[8px] font-black flex items-center justify-center rounded-full">
                  {unreadNotifs || unreadCount}
                </span>
              )}
            </button>

            <AnimatePresence>
              {isNotifOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-200 dark:border-gray-800 p-4 z-50"
                >
                  <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">Activity Feed</h4>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {notifications.length > 0 ? (
                      notifications.map((n) => (
                        <div key={n._id} className={`p-2 rounded-md ${n.read ? 'bg-gray-50 dark:bg-gray-800' : 'bg-blue-50 dark:bg-blue-900'}`}>
                          <p className="text-sm text-gray-700 dark:text-gray-200">{n.message}</p>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-gray-400 italic text-center">All caught up</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* Profile dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => {
                setIsProfileOpen(!isProfileOpen);
                setIsNotifOpen(false);
              }}
              className="w-10 h-10 rounded-full bg-gray-800 dark:bg-white flex items-center justify-center overflow-hidden"
            >
              <img
                src={user?.profilePic || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=000&color=fff`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </button>

            <AnimatePresence>
              {isProfileOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-900 shadow-xl rounded-xl border border-gray-200 dark:border-gray-800 p-2 z-50"
                >
                  <p className="text-xs font-bold text-gray-700 dark:text-white truncate">{user.name}</p>
                  <p className="text-[10px] font-semibold text-blue-600 uppercase">{user.role}</p>
                  <button
                    onClick={handleLogout}
                    className="mt-2 w-full text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md px-2 py-1"
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {!user && (
          <Link
            to="/login"
            className="text-sm font-bold uppercase text-gray-600 hover:text-blue-600 transition-colors"
          >
            Login
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
