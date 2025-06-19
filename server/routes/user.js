import express from 'express';
import { body } from 'express-validator';
import {
    getUserProfile,
    updateUserProfile,
    getUserSubmissions,
    getUserStats,
    getSolvedProblems
} from '../controllers/user.js';
import { authenticateUser } from '../middleware/auth.js';

const router = express.Router();

// All routes require authentication
router.use(authenticateUser);

// Input validation rules
const updateProfileValidation = [
    body('fullName')
        .optional()
        .isLength({ min: 2, max: 50 })
        .withMessage('Name must be between 2 and 50 characters'),
    body('email')
        .optional()
        .isEmail()
        .withMessage('Please provide a valid email'),
    body('newPassword')
        .optional()
        .isLength({ min: 6 })
        .withMessage('New password must be at least 6 characters')
];

// User profile routes
router.get('/profile', getUserProfile);
router.patch('/profile', updateProfileValidation, updateUserProfile);

// User statistics and history
router.get('/stats', getUserStats);
router.get('/submissions', getUserSubmissions);
router.get('/solved', getSolvedProblems);

export default router; 