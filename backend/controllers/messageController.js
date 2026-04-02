import Message from '../models/Message.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';

// POST /api/messages — send a message within a booking thread
export const sendMessage = async (req, res) => {
  try {
    const { bookingId, text } = req.body;
    if (!bookingId || !text)
      return res.status(400).json({ message: 'bookingId and text are required' });

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ message: 'Booking not found' });

    // Determine receiver — the other party in the booking
    const isClient  = booking.client.toString()  === req.user._id.toString();
    const isArtisan = booking.artisan.toString() === req.user._id.toString();
    if (!isClient && !isArtisan)
      return res.status(403).json({ message: 'Not part of this booking' });

    const receiver = isClient ? booking.artisan : booking.client;

    const message = await Message.create({
      booking: bookingId,
      sender:  req.user._id,
      receiver,
      text,
    });

    // Notify receiver (only if they have no recent unread message notification)
    await Notification.create({
      user:    receiver,
      type:    'message',
      message: `New message from ${req.user.name}`,
      link:    `/messages/${bookingId}`,
    });

    const populated = await message.populate('sender', 'name profilePic');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/messages/:bookingId — get all messages for a booking thread
export const getMessages = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking)
      return res.status(404).json({ message: 'Booking not found' });

    const isParty =
      booking.client.toString()  === req.user._id.toString() ||
      booking.artisan.toString() === req.user._id.toString();
    if (!isParty)
      return res.status(403).json({ message: 'Not authorised' });

    // Mark all incoming messages as read
    await Message.updateMany(
      { booking: req.params.bookingId, receiver: req.user._id, read: false },
      { $set: { read: true } }
    );

    const messages = await Message.find({ booking: req.params.bookingId })
      .populate('sender', 'name profilePic')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/messages/threads — all booking threads for the logged-in user
export const getThreads = async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ client: req.user._id }, { artisan: req.user._id }],
    })
      .populate('client',  'name profilePic')
      .populate('artisan', 'name profilePic')
      .sort({ updatedAt: -1 });

    // Attach last message + unread count to each booking
    const threads = await Promise.all(
      bookings.map(async (b) => {
        const lastMessage = await Message.findOne({ booking: b._id })
          .sort({ createdAt: -1 })
          .select('text createdAt');
        const unread = await Message.countDocuments({
          booking: b._id, receiver: req.user._id, read: false,
        });
        return { ...b.toObject(), lastMessage, unread };
      })
    );

    res.json(threads);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};