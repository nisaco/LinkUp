import User from '../models/User.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import bcrypt from 'bcryptjs';

// GET /api/users/me — get own profile
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/me — update name, email, profilePic
export const updateMe = async (req, res) => {
  try {
    const { name, email, profilePic } = req.body;
    const user = await User.findById(req.user._id);

    if (email && email !== user.email) {
      const taken = await User.findOne({ email });
      if (taken) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }
    if (name)       user.name       = name;
    if (profilePic) user.profilePic = profilePic;

    await user.save();
    const { password: _, ...safe } = user.toObject();
    res.json(safe);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/users/me/password — change password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: 'Both fields required' });

    const user = await User.findById(req.user._id);
    const match = await bcrypt.compare(currentPassword, user.password);
    if (!match) return res.status(400).json({ message: 'Current password is incorrect' });

    user.password = newPassword; // pre-save hook will hash it
    await user.save();
    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users/:id — public user info (used for profile pages)
export const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email profilePic role createdAt');
    if (!user) return res.status(404).json({ message: 'User not found' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/users — admin only: list all users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/users/:id — admin only
export const deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    await ArtisanProfile.findOneAndDelete({ user: req.params.id });
    res.json({ message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
