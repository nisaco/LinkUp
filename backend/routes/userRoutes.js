import express from 'express';
import {
  getMe, updateMe, changePassword,
  getUserById, getAllUsers, deleteUser,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorizeRoles } from '../middleware/roleMiddleware.js';

const router = express.Router();

// Own profile
router.get('/me',              protect, getMe);
router.put('/me',              protect, updateMe);
router.put('/me/password',    protect, changePassword);

// Admin only
router.get('/',               protect, authorizeRoles('admin'), getAllUsers);
router.delete('/:id',         protect, authorizeRoles('admin'), deleteUser);

// Public
router.get('/:id',            getUserById);

export default router;