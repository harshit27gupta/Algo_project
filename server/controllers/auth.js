import User from '../models/User.js';
import ErrorResponse from '../utils/errorResponse.js';
import { validationResult } from 'express-validator';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const register = async (req, res, next) => {
    try {
        const startTime = Date.now();
        
        const isTestMode = req.headers['x-test-mode'] === 'true';
        if (!isTestMode) {
            console.log(`🔐 [REGISTER] Starting registration for email: ${req.body.email}`);
        }
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.status(400).json({
                success: false,
                message: 'All fields (fullName, email, password) are required.'
            });
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address.'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters.'
            });
        }

        const existingUser = await User.existsByEmail(email);
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

        const endTime = Date.now();
        if (!isTestMode) {
            console.log(`✅ [REGISTER] User created successfully: ${user._id} - Time: ${endTime - startTime}ms`);
        }
        
        sendTokenResponse(user, 201, res);
    } catch (err) {
        console.log(`💥 [REGISTER] Error:`, err.message);
        next(err);
    }
};

export const login = async (req, res, next) => {
    try {
        const startTime = Date.now();
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                success: false,
                message: errors.array()[0].msg
            });
        }

        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required.'
            });
        }

        let user = await User.findByEmail(email).select('+password').lean();
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found. Please register first.'
            });
        }

        const isMatch = await require('bcryptjs').compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                message: 'Invalid password.'
            });
        }

        const endTime = Date.now();
        const isTestMode = req.headers['x-test-mode'] === 'true';
        if (!isTestMode) {
            console.log(`✅ [LOGIN] User logged in successfully: ${user._id} - Time: ${endTime - startTime}ms`);
        }
        
        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
};

export const getMe = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.id).lean();
        res.status(200).json({
            success: true,
            data: user
        });
    } catch (err) {
        next(err);
    }
};

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
        
        let user = await User.findByEmail(email);
        if (!user) {
            user = await User.create({
                fullName,
                email,
                password: Math.random().toString(36).slice(-8)
            });
        }
        sendTokenResponse(user, 200, res);
    } catch (err) {
        next(err);
    }
}; 