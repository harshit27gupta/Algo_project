import User from '../models/User.js';
import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import mongoose from 'mongoose';
import { StatusCodes } from 'http-status-codes';
import ErrorResponse from '../utils/errorResponse.js';
import bcrypt from 'bcryptjs';

// Get user profile
export const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        
        if (!user) {
            throw new ErrorResponse('User not found', StatusCodes.NOT_FOUND);
        }

        res.status(StatusCodes.OK).json({
            success: true,
            data: user
        });
    } catch (error) {
        console.error('Error fetching user profile:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to fetch user profile'
        });
    }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
    try {
        const { fullName, email, currentPassword, newPassword } = req.body;
        
        const user = await User.findById(req.user.id);
        
        if (!user) {
            throw new ErrorResponse('User not found', StatusCodes.NOT_FOUND);
        }

        // Update basic info
        if (fullName) {
            user.fullName = fullName;
        }

        if (email && email !== user.email) {
            // Check if email is already taken
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                throw new ErrorResponse('Email already in use', StatusCodes.BAD_REQUEST);
            }
            user.email = email;
        }

        // Update password if provided
        if (newPassword) {
            if (!currentPassword) {
                throw new ErrorResponse('Current password is required to change password', StatusCodes.BAD_REQUEST);
            }

            const isMatch = await user.comparePassword(currentPassword);
            if (!isMatch) {
                throw new ErrorResponse('Current password is incorrect', StatusCodes.BAD_REQUEST);
            }

            user.password = newPassword;
        }

        await user.save();

        // Return user without password
        const updatedUser = await User.findById(user._id).select('-password');

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Profile updated successfully',
            data: updatedUser
        });
    } catch (error) {
        console.error('Error updating user profile:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to update profile'
        });
    }
};

// Get user submission history with filtering
export const getUserSubmissions = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            status, 
            language, 
            startDate, 
            endDate,
            sortBy = 'submittedAt',
            sortOrder = 'desc'
        } = req.query;

        // Build filter query
        const filterQuery = { user: req.user.id };
        
        if (status && status !== 'all') {
            filterQuery.status = status;
        }
        
        if (language && language !== 'all') {
            filterQuery.language = language;
        }
        
        if (startDate || endDate) {
            filterQuery.submittedAt = {};
            if (startDate) {
                filterQuery.submittedAt.$gte = new Date(startDate);
            }
            if (endDate) {
                filterQuery.submittedAt.$lte = new Date(endDate);
            }
        }

        // Calculate skip value for pagination
        const skip = (page - 1) * limit;

        // Build sort object
        const sortObject = {};
        sortObject[sortBy] = sortOrder === 'desc' ? -1 : 1;

        // Get submissions with pagination
        const submissions = await Submission.find(filterQuery)
            .populate('problem', 'title difficulty categories rating')
            .sort(sortObject)
            .skip(skip)
            .limit(Number(limit));

        // Get total count for pagination
        const total = await Submission.countDocuments(filterQuery);

        // Get user statistics
        const userStats = await Submission.getUserStats(req.user.id);

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                submissions,
                pagination: {
                    total,
                    page: Number(page),
                    pages: Math.ceil(total / limit),
                    limit: Number(limit)
                },
                statistics: userStats[0] || {
                    totalProblems: 0,
                    solvedProblems: 0,
                    totalSubmissions: 0
                }
            }
        });
    } catch (error) {
        console.error('Error fetching user submissions:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to fetch submissions'
        });
    }
};

// Get user statistics
export const getUserStats = async (req, res) => {
    try {
        const userStats = await Submission.getUserStats(req.user.id);
        
        // Get difficulty-wise statistics
        const difficultyStats = await Submission.aggregate([
            {
                $match: { user: new mongoose.Types.ObjectId(req.user.id) }
            },
            {
                $lookup: {
                    from: 'problems',
                    localField: 'problem',
                    foreignField: '_id',
                    as: 'problemData'
                }
            },
            {
                $unwind: '$problemData'
            },
            {
                $group: {
                    _id: '$problemData.difficulty',
                    totalAttempted: { $sum: 1 },
                    solved: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        // Get category-wise statistics
        const categoryStats = await Submission.aggregate([
            {
                $match: { user: new mongoose.Types.ObjectId(req.user.id) }
            },
            {
                $lookup: {
                    from: 'problems',
                    localField: 'problem',
                    foreignField: '_id',
                    as: 'problemData'
                }
            },
            {
                $unwind: '$problemData'
            },
            {
                $unwind: '$problemData.categories'
            },
            {
                $group: {
                    _id: '$problemData.categories',
                    totalAttempted: { $sum: 1 },
                    solved: {
                        $sum: {
                            $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0]
                        }
                    }
                }
            }
        ]);

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                overall: userStats[0] || {
                    totalProblems: 0,
                    solvedProblems: 0,
                    totalSubmissions: 0
                },
                difficultyStats,
                categoryStats
            }
        });
    } catch (error) {
        console.error('Error fetching user statistics:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to fetch statistics'
        });
    }
};

// Get user's solved problems
export const getSolvedProblems = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const skip = (page - 1) * limit;

        // Get problems that user has solved
        const solvedProblems = await Submission.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(req.user.id),
                    status: 'accepted'
                }
            },
            {
                $group: {
                    _id: '$problem',
                    firstSolvedAt: { $min: '$submittedAt' },
                    bestSubmission: { $first: '$$ROOT' }
                }
            },
            {
                $lookup: {
                    from: 'problems',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'problemData'
                }
            },
            {
                $unwind: '$problemData'
            },
            {
                $sort: { firstSolvedAt: -1 }
            },
            {
                $skip: skip
            },
            {
                $limit: Number(limit)
            }
        ]);

        // Get total count
        const total = await Submission.aggregate([
            {
                $match: {
                    user: new mongoose.Types.ObjectId(req.user.id),
                    status: 'accepted'
                }
            },
            {
                $group: {
                    _id: '$problem'
                }
            },
            {
                $count: 'total'
            }
        ]);

        res.status(StatusCodes.OK).json({
            success: true,
            data: {
                solvedProblems,
                pagination: {
                    total: total[0]?.total || 0,
                    page: Number(page),
                    pages: Math.ceil((total[0]?.total || 0) / limit),
                    limit: Number(limit)
                }
            }
        });
    } catch (error) {
        console.error('Error fetching solved problems:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to fetch solved problems'
        });
    }
}; 