import mongoose from 'mongoose';

const artisanProfileSchema = new mongoose.Schema({
  user:         { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  skills:       [{ type: String }],
  location:     { type: String, default: '' },
  rate:         { type: Number, default: 0 },          // hourly rate in GHS
  bio:          { type: String, default: '' },
  rating:       { type: Number, default: 0 },
  reviewCount:  { type: Number, default: 0 },
  verified:     { type: Boolean, default: false },
  availability: { type: Boolean, default: true },
  profilePic:   { type: String, default: '' },

  // Availability schedule
  workingDays: {
    type: [String],
    enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
  },
  workingHours: {
    start: { type: String, default: '08:00' },
    end:   { type: String, default: '17:00' },
  },
}, { timestamps: true });

export default mongoose.model('ArtisanProfile', artisanProfileSchema);
