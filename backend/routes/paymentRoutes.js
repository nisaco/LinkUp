import express from 'express';
import {
  initiatePayment,
  verifyBookingPayment,
  getMyPayments,
  getMyEarnings,
} from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.post('/initiate',  protect, initiatePayment);
router.post('/verify',    protect, verifyBookingPayment);
router.get('/my',         protect, authorizeRoles('client'),  getMyPayments);
router.get('/earnings',   protect, authorizeRoles('artisan'), getMyEarnings);

export default router;