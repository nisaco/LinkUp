import express from 'express';
import {
  createBooking,
  verifyBookingPayment,
  getUserBookings,
  updateBookingStatus,
} from '../controllers/bookingController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/', protect, authorizeRoles('client'), createBooking);
router.post('/verify', protect, verifyBookingPayment);
router.get('/', protect, getUserBookings);
router.put('/:id/status', protect, authorizeRoles('artisan'), updateBookingStatus);

export default router;
