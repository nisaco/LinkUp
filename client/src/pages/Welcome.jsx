// src/pages/Welcome.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const Welcome = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-blue-200 dark:from-gray-900 dark:to-black flex flex-col justify-center items-center px-6 md:px-20">
      
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 1 }}
        className="text-center max-w-3xl"
      >
        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight">
          Find the <span className="text-blue-600">Best Artisans</span> for Your Projects
        </h1>
        <p className="mt-6 text-lg md:text-xl text-gray-700 dark:text-gray-300">
          Hire verified freelance artisans quickly and safely. 
          Manage bookings, payments, and communicate directly — all in one place.
        </p>

        <div className="mt-8 flex flex-col md:flex-row gap-4 justify-center">
          <Link 
            to="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform transition hover:scale-105"
          >
            Get Started
          </Link>
          <Link 
            to="/login"
            className="bg-white hover:bg-gray-100 dark:bg-gray-800 dark:hover:bg-gray-700 text-blue-600 font-bold py-3 px-8 rounded-xl shadow-lg transform transition hover:scale-105"
          >
            Login
          </Link>
        </div>
      </motion.div>

      {/* Illustration Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }} 
        animate={{ opacity: 1, scale: 1 }} 
        transition={{ duration: 1, delay: 0.5 }}
        className="mt-16 w-full flex justify-center"
      >
        <img 
          src="https://images.unsplash.com/photo-1581091215366-34d25f1d27b8?auto=format&fit=crop&w=1000&q=80"
          alt="Artisan working"
          className="rounded-3xl shadow-2xl max-w-full md:max-w-3xl"
        />
      </motion.div>

      {/* Footer Call-to-Action */}
      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ delay: 1 }}
        className="mt-16 text-center"
      >
        <p className="text-gray-600 dark:text-gray-400">
          Already know who to hire? <Link to="/login" className="text-blue-600 font-bold hover:underline">Login here</Link>
        </p>
      </motion.div>
    </div>
  );
};

export default Welcome;
