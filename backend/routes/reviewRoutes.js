import express from 'express';
import {
  createReview,
  getArtisanReviews,
  getBookingReview,
} from '../controllers/reviewController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/',                         protect, authorizeRoles('client'), createReview);
router.get('/artisan/:artisanId',        getArtisanReviews);
router.get('/booking/:bookingId',        protect, getBookingReview);

export default router;