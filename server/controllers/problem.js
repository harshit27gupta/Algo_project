import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import { StatusCodes } from 'http-status-codes';
import ErrorResponse from '../utils/errorResponse.js';
import mongoose from 'mongoose';

// Create a new problem
export const createProblem = async (req, res) => {
    const { title, description, difficulty, categories, timeLimit, memoryLimit, publicTestCases, hiddenTestCases, isPremium } = req.body;

    // Check if problem with same title exists
    const existingProblem = await Problem.findOne({ title });
    if (existingProblem) {
        throw new ErrorResponse('Problem with this title already exists', StatusCodes.BAD_REQUEST);
    }

    // Validate that at least one category is provided
    if (!categories || categories.length === 0) {
        throw new ErrorResponse('At least one category is required', StatusCodes.BAD_REQUEST);
    }

    const problem = await Problem.create({
        title,
        description,
        difficulty,
        categories,
        timeLimit,
        memoryLimit,
        publicTestCases,
        hiddenTestCases,
        isPremium,
        author: req.user.id
    });

    res.status(StatusCodes.CREATED).json({
        success: true,
        data: problem
    });
};

// Get all problems with user status
export const getAllProblems = async (req, res) => {
    try {
        // Get all published problems
        const problems = await Problem.find({ isPublished: true })
            .populate('author', 'fullName');

        // If user is authenticated, get their submission status for each problem
        let problemsWithStatus = problems;
        
        if (req.user) {
            const problemIds = problems.map(p => p._id);
            
            // Get user's submission status for all problems
            const userSubmissions = await Submission.aggregate([
                {
                    $match: {
                        user: new mongoose.Types.ObjectId(req.user.id),
                        problem: { $in: problemIds }
                    }
                },
                {
                    $group: {
                        _id: '$problem',
                        hasAccepted: {
                            $max: {
                                $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0]
                            }
                        },
                        hasAttempted: { $sum: 1 },
                        latestStatus: { $first: '$status' }
                    }
                }
            ]);

            // Create a map of problem status
            const statusMap = {};
            userSubmissions.forEach(sub => {
                statusMap[sub._id.toString()] = {
                    hasAccepted: sub.hasAccepted === 1,
                    hasAttempted: sub.hasAttempted > 0,
                    latestStatus: sub.latestStatus
                };
            });

            // Add status to each problem
            problemsWithStatus = problems.map(problem => {
                const problemStatus = statusMap[problem._id.toString()];
                let userStatus = 'unsolved';
                
                if (problemStatus) {
                    if (problemStatus.hasAccepted) {
                        userStatus = 'solved';
                    } else if (problemStatus.hasAttempted) {
                        userStatus = 'attempted';
                    }
                }

                return {
                    ...problem.toObject(),
                    userStatus
                };
            });
        } else {
            // For unauthenticated users, add default status
            problemsWithStatus = problems.map(problem => ({
                ...problem.toObject(),
                userStatus: 'unsolved'
            }));
        }

        res.status(StatusCodes.OK).json({
            success: true,
            data: problemsWithStatus
        });
    } catch (error) {
        console.error('Error fetching problems:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to fetch problems'
        });
    }
};

// Get user's problem status
export const getUserProblemStatus = async (req, res) => {
    try {
        const { problemId } = req.params;
        
        if (!req.user) {
            return res.status(StatusCodes.OK).json({
                success: true,
                data: { status: 'unsolved' }
            });
        }

        const statusResult = await Submission.getUserProblemStatus(req.user.id, problemId);
        
        let status = 'unsolved';
        if (statusResult.length > 0) {
            const result = statusResult[0];
            if (result.hasAccepted) {
                status = 'solved';
            } else if (result.hasAttempted) {
                status = 'attempted';
            }
        }

        res.status(StatusCodes.OK).json({
            success: true,
            data: { status }
        });
    } catch (error) {
        console.error('Error fetching user problem status:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to fetch problem status'
        });
    }
};

// Get single problem by ID
export const getProblem = async (req, res) => {
    const { id } = req.params;

    const problem = await Problem.findById(id)
        .populate('author', 'fullName');

    if (!problem) {
        throw new ErrorResponse(`Problem with id ${id} not found`, StatusCodes.NOT_FOUND);
    }

    // If problem is not published and user is not the author or admin
    if (!problem.isPublished && 
        problem.author._id.toString() !== req.user.id && 
        req.user.role !== 'admin') {
        throw new ErrorResponse('Not authorized to access this problem', StatusCodes.UNAUTHORIZED);
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: problem
    });
};

// Update problem
export const updateProblem = async (req, res) => {
    const { id } = req.params;
    const { 
        title, 
        description, 
        difficulty, 
        categories, 
        timeLimit, 
        memoryLimit, 
        publicTestCases, 
        hiddenTestCases, 
        isPremium,
        isPublished 
    } = req.body;

    const problem = await Problem.findById(id);

    if (!problem) {
        throw new ErrorResponse(`Problem with id ${id} not found`, StatusCodes.NOT_FOUND);
    }

    // Check if user is author or admin
    if (problem.author.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ErrorResponse('Not authorized to update this problem', StatusCodes.UNAUTHORIZED);
    }

    // If title is being updated, check for duplicates
    if (title && title !== problem.title) {
        const existingProblem = await Problem.findOne({ title });
        if (existingProblem) {
            throw new ErrorResponse('Problem with this title already exists', StatusCodes.BAD_REQUEST);
        }
    }

    // Validate that at least one category is provided if categories are being updated
    if (categories && categories.length === 0) {
        throw new ErrorResponse('At least one category is required', StatusCodes.BAD_REQUEST);
    }

    // Update problem
    const updatedProblem = await Problem.findByIdAndUpdate(
        id,
        {
            title,
            description,
            difficulty,
            categories,
            timeLimit,
            memoryLimit,
            publicTestCases,
            hiddenTestCases,
            isPremium,
            isPublished
        },
        { new: true, runValidators: true }
    ).populate('author', 'fullName');

    res.status(StatusCodes.OK).json({
        success: true,
        data: updatedProblem
    });
};

// Delete problem
export const deleteProblem = async (req, res) => {
    const { id } = req.params;

    const problem = await Problem.findById(id);

    if (!problem) {
        throw new ErrorResponse(`Problem with id ${id} not found`, StatusCodes.NOT_FOUND);
    }

    // Check if user is author or admin
    if (problem.author.toString() !== req.user.id && req.user.role !== 'admin') {
        throw new ErrorResponse('Not authorized to delete this problem', StatusCodes.UNAUTHORIZED);
    }

    await problem.deleteOne();

    res.status(StatusCodes.OK).json({
        success: true,
        data: {}
    });
};

// Submit solution for a problem
export const submitSolution = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, language } = req.body;

        const problem = await Problem.findById(id);

        if (!problem) {
            throw new ErrorResponse(`Problem with id ${id} not found`, StatusCodes.NOT_FOUND);
        }

        // Validate language
        const validLanguages = ['javascript', 'python', 'java', 'cpp', 'c'];
        if (!validLanguages.includes(language)) {
            throw new ErrorResponse('Invalid programming language', StatusCodes.BAD_REQUEST);
        }

        // TODO: Implement actual code execution and test case validation
        // For now, simulate a random result
        const possibleStatuses = ['accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error'];
        const status = possibleStatuses[Math.floor(Math.random() * possibleStatuses.length)];
        
        const executionTime = Math.floor(Math.random() * 1000) + 100; // 100-1100ms
        const memoryUsed = Math.floor(Math.random() * 100) + 10; // 10-110MB
        
        // Calculate test cases passed (simulate based on status)
        const totalTestCases = problem.publicTestCases.length + problem.hiddenTestCases.length;
        const testCasesPassed = status === 'accepted' ? totalTestCases : Math.floor(Math.random() * totalTestCases);

        // Create submission record
        const submission = await Submission.create({
            user: req.user.id,
            problem: id,
            code,
            language,
            status,
            executionTime,
            memoryUsed,
            testCasesPassed,
            totalTestCases
        });

        // Update problem statistics
        problem.totalSubmissions += 1;
        if (status === 'accepted') {
            problem.successfulSubmissions += 1;
        }
        await problem.save();

        res.status(StatusCodes.OK).json({
            success: true,
            message: 'Solution submitted successfully',
            data: {
                submissionId: submission._id,
                status,
                executionTime,
                memoryUsed,
                testCasesPassed,
                totalTestCases,
                successRate: Math.round((testCasesPassed / totalTestCases) * 100)
            }
        });
    } catch (error) {
        console.error('Error submitting solution:', error);
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: 'Failed to submit solution'
        });
    }
};

// Get problem statistics
export const getProblemStats = async (req, res) => {
    const stats = await Problem.aggregate([
        {
            $group: {
                _id: '$difficulty',
                count: { $sum: 1 },
                avgRating: { $avg: '$rating' },
                avgAcceptanceRate: {
                    $avg: {
                        $cond: [
                            { $eq: ['$totalSubmissions', 0] },
                            0,
                            { $multiply: [{ $divide: ['$successfulSubmissions', '$totalSubmissions'] }, 100] }
                        ]
                    }
                }
            }
        }
    ]);

    // Get category distribution
    const categoryStats = await Problem.aggregate([
        { $unwind: '$categories' },
        {
            $group: {
                _id: '$categories',
                count: { $sum: 1 }
            }
        }
    ]);

    res.status(StatusCodes.OK).json({
        success: true,
        data: {
            difficultyStats: stats,
            categoryStats
        }
    });
}; 