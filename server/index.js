import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import errorHandler from './middleware/error.js';
import { deserializeUser } from './middleware/auth.js';
import authRoutes from './routes/auth.js';
import problemRoutes from './routes/problem.js';
import userRoutes from './routes/user.js';
import { apiLimiter } from './middleware/rateLimiter.js';

const app = express();

// Essential security middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Deserialize user from token if available on any route
app.use(deserializeUser);

// Apply global rate limiting middleware
app.use(apiLimiter);

// Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/problems', problemRoutes);
app.use('/api/v1/user', userRoutes);

// Error handling middleware (must be after routes)
app.use(errorHandler);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
}); 