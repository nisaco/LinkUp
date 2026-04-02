import Booking from '../models/Booking.js';
import Payment from '../models/Payment.js';
import Notification from '../models/Notification.js';
import { initializePayment, verifyPayment } from '../utils/paystack.js';

// POST /api/bookings — client creates a booking
export const createBooking = async (req, res) => {
  try {
    const { artisan, service, price, scheduledAt } = req.body;
    if (!artisan || !service || !price)
      return res.status(400).json({ message: 'Missing required fields' });

    const booking = await Booking.create({
      client: req.user._id,
      artisan, service, price, scheduledAt,
    });

    // Init Paystack payment (amount in pesewas = GHS * 100)
    const paymentData = await initializePayment(req.user.email, price);

    await Payment.create({
      booking: booking._id,
      amount: price,
      paystackRef: paymentData.reference,
    });

    // Notify the artisan
    await Notification.create({
      user: artisan,
      type: 'booking',
      message: `New booking request for "${service}"`,
      link: '/artisan-dashboard',
    });

    res.status(201).json({ booking, paymentLink: paymentData.authorization_url });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/bookings/verify — Paystack callback
export const verifyBookingPayment = async (req, res) => {
  try {
    const { reference } = req.body;
    const paymentRecord = await Payment.findOne({ paystackRef: reference });
    if (!paymentRecord) return res.status(404).json({ message: 'Payment not found' });

    const result = await verifyPayment(reference);

    if (result.status === 'success') {
      paymentRecord.status = 'success';
      await paymentRecord.save();

      const booking = await Booking.findById(paymentRecord.booking);
      booking.paymentStatus = 'paid';
      await booking.save();

      res.json({ message: 'Payment verified', booking });
    } else {
      paymentRecord.status = 'failed';
      await paymentRecord.save();
      res.status(400).json({ message: 'Payment failed' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/bookings — returns bookings for the logged-in user (client or artisan)
export const getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({
      $or: [{ client: req.user._id }, { artisan: req.user._id }],
    })
      .populate('client',  'name email profilePic')
      .populate('artisan', 'name email profilePic')
      .sort({ createdAt: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/bookings/:id/status — artisan updates booking status
export const updateBookingStatus = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: 'Booking not found' });

    if (booking.artisan.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Not authorized' });

    booking.status = req.body.status;
    await booking.save();

    // Notify the client
    await Notification.create({
      user: booking.client,
      type: 'booking',
      message: `Your booking for "${booking.service}" is now ${booking.status}`,
      link: '/my-bookings',
    });

    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};