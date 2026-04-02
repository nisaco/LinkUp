import Review from '../models/Review.js';
import Booking from '../models/Booking.js';
import ArtisanProfile from '../models/ArtisanProfile.js';
import Notification from '../models/Notification.js';

// POST /api/reviews — client submits a review after a completed booking
export const createReview = async (req, res) => {
  try {
    const { bookingId, rating, comment } = req.body;

    const booking = await Booking.findById(bookingId);
    if (!booking)
      return res.status(404).json({ message: 'Booking not found' });

    // Only the client of this booking can review
    if (booking.client.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Only the client can leave a review' });

    if (booking.status !== 'completed')
      return res.status(400).json({ message: 'Can only review completed bookings' });

    const alreadyReviewed = await Review.findOne({ booking: bookingId });
    if (alreadyReviewed)
      return res.status(400).json({ message: 'Booking already reviewed' });

    const review = await Review.create({
      booking: bookingId,
      client:  req.user._id,
      artisan: booking.artisan,
      rating,
      comment,
    });

    // Recalculate artisan's average rating
    const allReviews = await Review.find({ artisan: booking.artisan });
    const avgRating  = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await ArtisanProfile.findOneAndUpdate(
      { user: booking.artisan },
      { rating: Math.round(avgRating * 10) / 10, reviewCount: allReviews.length }
    );

    // Notify artisan
    await Notification.create({
      user:    booking.artisan,
      type:    'review',
      message: `You received a ${rating}-star review!`,
      link:    '/artisan-dashboard',
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/artisan/:artisanId — all reviews for an artisan
export const getArtisanReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ artisan: req.params.artisanId })
      .populate('client', 'name profilePic')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/reviews/booking/:bookingId — check if booking has been reviewed
export const getBookingReview = async (req, res) => {
  try {
    const review = await Review.findOne({ booking: req.params.bookingId });
    res.json(review || null);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
