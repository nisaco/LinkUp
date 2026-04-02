// src/pages/ProfileSetup.jsx
import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { toast } from 'react-toastify';

const daysOfWeek = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"];

const ProfileSetup = () => {
  const [form, setForm] = useState({
    skill: '',
    bio: '',
    workingDays: [],
    workingHours: { start: '09:00', end: '17:00' },
  });
  const [loading, setLoading] = useState(false);

  // Fetch existing artisan profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/artisan/profile');
        if(res.data){
          setForm(res.data);
        }
      } catch(err) {
        console.error(err);
      }
    }
    fetchProfile();
  }, []);

  const toggleDay = (day) => {
    setForm(prev => ({
      ...prev,
      workingDays: prev.workingDays.includes(day)
        ? prev.workingDays.filter(d => d !== day)
        : [...prev.workingDays, day]
    }));
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleTimeChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, workingHours: { ...prev.workingHours, [name]: value } }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/artisan/profile', form);
      toast.success('Profile & availability updated!');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 px-4">
      <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-900 p-8 rounded-3xl shadow-xl w-full max-w-lg flex flex-col gap-4">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white text-center">Set Up Your Profile</h2>
        
        <input
          type="text"
          name="skill"
          placeholder="Your Skill (e.g., Plumbing)"
          value={form.skill}
          onChange={handleChange}
          className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition"
          required
        />
        <textarea
          name="bio"
          placeholder="Short Bio"
          value={form.bio}
          onChange={handleChange}
          className="px-4 py-3 rounded-xl border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white transition"
          required
        ></textarea>

        <div className="flex flex-col gap-2">
          <p className="font-bold text-gray-700 dark:text-gray-300">Select Working Days:</p>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map(day => (
              <button
                type="button"
                key={day}
                onClick={() => toggleDay(day)}
                className={`px-3 py-1 rounded-xl border ${
                  form.workingDays.includes(day)
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white border-gray-300 dark:border-gray-700'
                }`}
              >
                {day}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div className="flex flex-col">
            <label className="text-gray-700 dark:text-gray-300 font-bold">Start Hour</label>
            <input
              type="time"
              name="start"
              value={form.workingHours.start}
              onChange={handleTimeChange}
              className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
          <div className="flex flex-col">
            <label className="text-gray-700 dark:text-gray-300 font-bold">End Hour</label>
            <input
              type="time"
              name="end"
              value={form.workingHours.end}
              onChange={handleTimeChange}
              className="px-3 py-2 rounded-xl border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          className="bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl font-bold shadow-lg transition hover:scale-105"
        >
          {loading ? 'Saving...' : 'Save Profile & Availability'}
        </button>
      </form>
    </div>
  );
};

export default ProfileSetup;
