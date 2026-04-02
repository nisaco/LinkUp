import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user:    { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, required: true },
  type:    {
    type: String,
    enum: ['booking', 'payment', 'review', 'message', 'system'],
    default: 'system',
  },
  link:    { type: String, default: '' },   // optional frontend route to navigate to
  read:    { type: Boolean, default: false },
}, { timestamps: true });

export default mongoose.model('Notification', notificationSchema);