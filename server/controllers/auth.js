import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import { validationResult } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Register new user
export const register = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Return the first validation error message
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const { fullName, email, password } = req.body;

        // Check for missing fields
        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields (fullName, email, password) are required.'
            });
        }

        // Check for valid email format
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        // Check for password strength
        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters.'
            });
        }

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered.'
            });
        }

        const user = await User.create({
            fullName,
            email,
            password
        });

        sendTokenResponse(user, 201, res);
    } catch (err) {
        next(err);
    }
};

// Authenticate user and return token
export const login = async (req, res, next) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Return the first validation error message
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const { email, password } = req.body;

        // Check for missing fields
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please register first.'
            });
        }

        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password.'
            });
        }

        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

// Get current user profile
export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id);
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

// Helper: Generate token and send response
const sendTokenResponse = (user, statusCode, res) => {
    const token = user.generateAuthToken();

    res.status(statusCode).json({
        success: true,
        token,
        user: {
            id: user._id,
            fullName: user.fullName,
            email: user.email,
            role: user.role
        }
    });
};

export const googleLogin = async (req, res, next) => {
    try {
        const { credential } = req.body;
        if (!credential) {
            return res.status(400).json({ success: false, message: 'No credential provided.' });
        }
        // Verify Google token
        const ticket = await client.verifyIdToken({
            idToken: credential,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = payload.email;
        const fullName = payload.name;
        if (!email) {
            return res.status(400).json({ success: false, message: 'Google account has no email.' });
        }
        let user = await User.findOne({ email });
        if (!user) {
            user = await User.create({
                fullName,
                email,
                password: Math.random().toString(36).slice(-8) // random password
            });
        }
        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
}; 