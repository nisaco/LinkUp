import User from '../models/User.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });

// Helper: shape a consistent user response object
const userResponse = (user, token) => ({
  token,
  user: {
    _id:        user._id,
    name:       user.name,
    email:      user.email,
    role:       user.role,
    profilePic: user.profilePic,
  },
});

// POST /api/auth/register
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Please provide all required fields' });

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'User already exists' });

    // Password is hashed by the User model pre-save hook — pass plain text
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'client',
    });

    res.status(201).json(userResponse(user, generateToken(user._id)));
  } catch (err) {
    console.error('Register error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};

// POST /api/auth/login
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    res.json(userResponse(user, generateToken(user._id)));
  } catch (err) {
    console.error('Login error:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
};