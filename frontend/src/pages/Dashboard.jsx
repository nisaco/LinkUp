import React, { useEffect, useState, useCallback } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../utils/api';

const SKILLS = ['All','Plumbing','Electrical','Carpentry','Painting','Cleaning','AC Repair','Tech Repair','Auto Mechanic'];

const StarRating = ({ rating }) => (
  <span className="flex items-center gap-1">
    {[1,2,3,4,5].map(s => (
      <svg key={s} className={`w-3.5 h-3.5 ${s <= Math.round(rating) ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        fill="currentColor" viewBox="0 0 20 20">
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
      </svg>
    ))}
    <span className="text-xs text-gray-500 ml-1">({rating?.toFixed(1) || '0.0'})</span>
  </span>
);

const ArtisanCard = ({ artisan }) => {
  const user    = artisan.user || {};
  const initials = (user.name || '?').split(' ').map(n => n[0]).join('').toUpperCase();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 hover:shadow-xl hover:border-blue-200 dark:hover:border-blue-700 transition-all group"
    >
      <div className="flex items-start gap-4 mb-4">
        {user.profilePic
          ? <img src={user.profilePic} alt={user.name} className="w-14 h-14 rounded-2xl object-cover flex-shrink-0" />
          : <div className="w-14 h-14 rounded-2xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-700 dark:text-blue-300 font-black text-lg flex-shrink-0">{initials}</div>
        }
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-bold text-gray-900 dark:text-white truncate">{user.name}</h3>
            {artisan.verified && (
              <span className="text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-2 py-0.5 rounded-full font-semibold">Verified</span>
            )}
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400 font-medium mt-0.5">
            {artisan.skills?.slice(0,2).join(' · ')}
          </p>
        </div>
      </div>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2 leading-relaxed">
        {artisan.bio || 'No bio provided.'}
      </p>

      <div className="flex items-center justify-between mb-4">
        <StarRating rating={artisan.rating} />
        <span className="text-xs text-gray-400">{artisan.reviewCount || 0} reviews</span>
      </div>

      <div className="flex items-center justify-between">
        <div>
          <span className="text-lg font-black text-gray-900 dark:text-white">GHS {artisan.rate || '—'}</span>
          <span className="text-xs text-gray-400">/hr</span>
        </div>
        <Link to={`/artisan/${artisan.user?._id}`}
          className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition hover:scale-105">
          View Profile
        </Link>
      </div>

      {artisan.location && (
        <p className="text-xs text-gray-400 mt-3 flex items-center gap-1">
          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
          </svg>
          {artisan.location}
        </p>
      )}
    </motion.div>
  );
};

const SkeletonCard = () => (
  <div className="bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 p-6 animate-pulse">
    <div className="flex gap-4 mb-4">
      <div className="w-14 h-14 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
      <div className="flex-1 space-y-2">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
      </div>
    </div>
    <div className="space-y-2 mb-4">
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/5" />
    </div>
    <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded-xl" />
  </div>
);

const Dashboard = () => {
  const [searchParams] = useSearchParams();
  const [artisans, setArtisans] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [search, setSearch]     = useState(searchParams.get('search') || '');
  const [skill, setSkill]       = useState('All');
  const [location, setLocation] = useState('');

  const fetchArtisans = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (search)            params.search   = search;
      if (skill !== 'All')  params.skill    = skill;
      if (location)          params.location = location;
      const res = await api.get('/artisans', { params });
      setArtisans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search, skill, location]);

  useEffect(() => { fetchArtisans(); }, [fetchArtisans]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 pt-20">

      {/* Search header */}
      <div className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-2xl font-black text-gray-900 dark:text-white mb-6">Find an Artisan</h1>
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
              </svg>
              <input value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search skills, bio..."
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
            <input value={location} onChange={e => setLocation(e.target.value)}
              placeholder="Location (e.g. Accra)"
              className="md:w-52 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
            <select value={skill} onChange={e => setSkill(e.target.value)}
              className="md:w-44 px-4 py-3 rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-none">
              {SKILLS.map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          {/* Skill pills */}
          <div className="flex flex-wrap gap-2 mt-4">
            {SKILLS.map(s => (
              <button key={s} onClick={() => setSkill(s)}
                className={`text-sm px-4 py-1.5 rounded-full font-medium transition ${skill === s ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                {s}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-5xl mx-auto px-6 py-10">
        {!loading && (
          <p className="text-sm text-gray-400 mb-6">
            {artisans.length} artisan{artisans.length !== 1 ? 's' : ''} found
          </p>
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading
            ? Array(6).fill(0).map((_,i) => <SkeletonCard key={i} />)
            : artisans.length > 0
              ? artisans.map(a => <ArtisanCard key={a._id} artisan={a} />)
              : (
                <div className="col-span-full text-center py-20">
                  <p className="text-5xl mb-4">🔍</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">No artisans found</p>
                  <p className="text-gray-400 mt-2">Try a different skill or location</p>
                </div>
              )
          }
        </div>
      </div>
    </div>
  );
};

export default Dashboard;