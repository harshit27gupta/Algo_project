import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorHandler from './middleware/error.js';
import authRoutes from './routes/auth.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();

// Debug middleware to log all requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Essential security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Apply global rate limiting middleware
app.use(apiLimiter);

// Debug log before mounting routes
console.log('Mounting auth routes...');

// Routes
app.use('/api/v1/auth', authRoutes);

// Debug log after mounting routes
console.log('Routes mounted successfully');

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log('Available routes:');
    console.log('- POST /api/v1/auth/register');
    console.log('- POST /api/v1/auth/login');
    console.log('- GET /api/v1/auth/me');
}); 