import ArtisanProfile from '../models/ArtisanProfile.js';

// GET /api/artisans — list all artisans with optional search/filter
export const getAllArtisans = async (req, res) => {
  try {
    const { skill, location, search } = req.query;
    const filter = { availability: true };

    if (skill)    filter.skills = { $regex: skill, $options: 'i' };
    if (location) filter.location = { $regex: location, $options: 'i' };

    let query = ArtisanProfile.find(filter)
      .populate('user', 'name email profilePic')
      .sort({ rating: -1 });

    if (search) {
      query = ArtisanProfile.find({
        ...filter,
        $or: [
          { skills:   { $regex: search, $options: 'i' } },
          { location: { $regex: search, $options: 'i' } },
          { bio:      { $regex: search, $options: 'i' } },
        ],
      }).populate('user', 'name email profilePic').sort({ rating: -1 });
    }

    const artisans = await query;
    res.json(artisans);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/artisans/profile
export const createProfile = async (req, res) => {
  try {
    const existing = await ArtisanProfile.findOne({ user: req.user._id });
    if (existing) return res.status(400).json({ message: 'Profile already exists. Use PUT to update.' });

    const { skills, location, rate, bio, workingDays, workingHours } = req.body;
    const profile = await ArtisanProfile.create({
      user: req.user._id,
      skills, location, rate, bio,
      workingDays: workingDays || ['Mon','Tue','Wed','Thu','Fri'],
      workingHours: workingHours || { start: '08:00', end: '17:00' },
    });
    res.status(201).json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/artisans/profile/:id  (by user ID)
export const getProfile = async (req, res) => {
  try {
    const profile = await ArtisanProfile
      .findOne({ user: req.params.id })
      .populate('user', 'name email profilePic');
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/artisans/my-profile  (own profile)
export const getMyProfile = async (req, res) => {
  try {
    const profile = await ArtisanProfile
      .findOne({ user: req.user._id })
      .populate('user', 'name email profilePic');
    res.json(profile || {});
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/artisans/profile
export const updateProfile = async (req, res) => {
  try {
    const profile = await ArtisanProfile.findOne({ user: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profile not found' });
    Object.assign(profile, req.body);
    await profile.save();
    res.json(profile);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};