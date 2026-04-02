import Payment from '../models/Payment.js';
import Booking from '../models/Booking.js';
import Notification from '../models/Notification.js';
import { initializePayment, verifyPayment } from '../utils/paystack.js';

// POST /api/payments/initiate — used by PaystackCheckout component
export const initiatePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ message: 'Booking not found' });

    if (booking.paymentStatus === 'paid')
      return res.status(400).json({ message: 'Booking already paid' });

    const paymentData = await initializePayment(req.user.email, booking.price);

    // Upsert payment record — avoid duplicates if user retries
    await Payment.findOneAndUpdate(
      { booking: bookingId },
      { amount: booking.price, paystackRef: paymentData.reference, status: 'pending' },
      { upsert: true, new: true }
    );

    res.json({
      paymentLink: paymentData.authorization_url,
      reference:   paymentData.reference,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/payments/verify — called from PaymentCallback page
export const verifyBookingPayment = async (req, res) => {
  try {
    const { reference } = req.body;

    const paymentRecord = await Payment.findOne({ paystackRef: reference });
    if (!paymentRecord)
      return res.status(404).json({ message: 'Payment record not found' });

    if (paymentRecord.status === 'success')
      return res.json({ message: 'Already verified', alreadyPaid: true });

    const result = await verifyPayment(reference);

    if (result.status === 'success') {
      paymentRecord.status = 'success';
      await paymentRecord.save();

      const booking = await Booking.findById(paymentRecord.booking);
      booking.paymentStatus = 'paid';
      await booking.save();

      // Notify artisan that payment was received
      await Notification.create({
        user:    booking.artisan,
        type:    'payment',
        message: `Payment of GHS ${booking.price} received for "${booking.service}"`,
        link:    '/artisan-dashboard',
      });

      res.json({ message: 'Payment verified successfully', booking });
    } else {
      paymentRecord.status = 'failed';
      await paymentRecord.save();
      res.status(400).json({ message: 'Payment failed or was cancelled' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payments/my — client's payment history
export const getMyPayments = async (req, res) => {
  try {
    // Find bookings belonging to this user, then get their payments
    const bookings = await Booking.find({ client: req.user._id }).select('_id');
    const bookingIds = bookings.map(b => b._id);

    const payments = await Payment.find({ booking: { $in: bookingIds } })
      .populate({
        path: 'booking',
        populate: [
          { path: 'artisan', select: 'name profilePic' },
        ],
      })
      .sort({ createdAt: -1 });

    res.json(payments);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/payments/earnings — artisan's earnings summary
export const getMyEarnings = async (req, res) => {
  try {
    const bookings = await Booking.find({ artisan: req.user._id }).select('_id price');
    const bookingIds = bookings.map(b => b._id);

    const payments = await Payment.find({
      booking: { $in: bookingIds },
      status: 'success',
    }).populate('booking', 'service price client scheduledAt');

    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);

    res.json({ totalEarnings, payments });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
