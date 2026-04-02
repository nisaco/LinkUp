import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import api from '../utils/api';
import { motion } from 'framer-motion';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading]   = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { email, password });

      // Backend now returns { token, user: { _id, name, email, role, profilePic } }
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('user',  JSON.stringify(res.data.user));

      toast.success('Welcome back!');
      navigate(res.data.user.role === 'artisan' ? '/artisan-dashboard' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-900 dark:to-black px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black italic text-gray-900 dark:text-white">
            LINK<span className="text-blue-600">UP</span>
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input type="email" placeholder="Email address"
            value={email} onChange={e => setEmail(e.target.value)} required
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <input type="password" placeholder="Password"
            value={password} onChange={e => setPassword(e.target.value)} required
            className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
          />
          <button type="submit" disabled={loading}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow transition hover:scale-105 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
          No account?{' '}
          <Link to="/register" className="text-blue-600 font-semibold hover:underline">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Login;
