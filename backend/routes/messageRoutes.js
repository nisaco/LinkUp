import express from 'express';
import { sendMessage, getMessages, getThreads } from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/threads',       protect, getThreads);
router.post('/',              protect, sendMessage);
router.get('/:bookingId',    protect, getMessages);

export default router;