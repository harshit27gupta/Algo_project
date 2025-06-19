import mongoose from 'mongoose';

const submissionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'User is required']
    },
    problem: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Problem',
        required: [true, 'Problem is required']
    },
    code: {
        type: String,
        required: [true, 'Code is required'],
        maxlength: [50000, 'Code cannot exceed 50,000 characters']
    },
    language: {
        type: String,
        required: [true, 'Language is required'],
        enum: ['javascript', 'python', 'java', 'cpp', 'c'],
        lowercase: true
    },
    status: {
        type: String,
        enum: ['accepted', 'wrong_answer', 'time_limit_exceeded', 'memory_limit_exceeded', 'runtime_error', 'compilation_error'],
        required: [true, 'Status is required'],
        default: 'wrong_answer'
    },
    executionTime: {
        type: Number, // in milliseconds
        default: 0,
        min: [0, 'Execution time cannot be negative']
    },
    memoryUsed: {
        type: Number, // in MB
        default: 0,
        min: [0, 'Memory usage cannot be negative']
    },
    testCasesPassed: {
        type: Number,
        default: 0,
        min: [0, 'Test cases passed cannot be negative']
    },
    totalTestCases: {
        type: Number,
        default: 0,
        min: [0, 'Total test cases cannot be negative']
    },
    errorMessage: {
        type: String,
        maxlength: [1000, 'Error message cannot exceed 1000 characters']
    },
    submittedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true // Automatically manage createdAt and updatedAt
});

// Indexes for better query performance
submissionSchema.index({ user: 1, problem: 1 });
submissionSchema.index({ user: 1, status: 1 });
submissionSchema.index({ problem: 1, status: 1 });
submissionSchema.index({ user: 1, submittedAt: -1 });
submissionSchema.index({ problem: 1, submittedAt: -1 });

// Virtual for success rate
submissionSchema.virtual('successRate').get(function() {
    if (this.totalTestCases === 0) return 0;
    return Math.round((this.testCasesPassed / this.totalTestCases) * 100);
});

// Virtual for execution time in seconds
submissionSchema.virtual('executionTimeSeconds').get(function() {
    return (this.executionTime / 1000).toFixed(3);
});

// Pre-save middleware to validate test cases
submissionSchema.pre('save', function(next) {
    if (this.testCasesPassed > this.totalTestCases) {
        return next(new Error('Test cases passed cannot exceed total test cases'));
    }
    next();
});

// Static method to get user's best submission for a problem
submissionSchema.statics.getBestSubmission = function(userId, problemId) {
    return this.findOne({
        user: userId,
        problem: problemId,
        status: 'accepted'
    }).sort({ submittedAt: 1 }); // First accepted submission
};

// Static method to get user's latest submission for a problem
submissionSchema.statics.getLatestSubmission = function(userId, problemId) {
    return this.findOne({
        user: userId,
        problem: problemId
    }).sort({ submittedAt: -1 }); // Most recent submission
};

// Static method to get user's problem status
submissionSchema.statics.getUserProblemStatus = function(userId, problemId) {
    return this.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId),
                problem: new mongoose.Types.ObjectId(problemId)
            }
        },
        {
            $group: {
                _id: null,
                hasAccepted: {
                    $max: {
                        $cond: [{ $eq: ['$status', 'accepted'] }, 1, 0]
                    }
                },
                hasAttempted: { $sum: 1 },
                latestStatus: { $first: '$status' },
                totalSubmissions: { $sum: 1 },
                bestExecutionTime: {
                    $min: {
                        $cond: [
                            { $eq: ['$status', 'accepted'] },
                            '$executionTime',
                            Number.MAX_VALUE
                        ]
                    }
                },
                bestMemoryUsed: {
                    $min: {
                        $cond: [
                            { $eq: ['$status', 'accepted'] },
                            '$memoryUsed',
                            Number.MAX_VALUE
                        ]
                    }
                }
            }
        }
    ]);
};

// Static method to get user's submission statistics
submissionSchema.statics.getUserStats = function(userId) {
    return this.aggregate([
        {
            $match: {
                user: new mongoose.Types.ObjectId(userId)
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
                totalSubmissions: { $sum: 1 },
                latestSubmission: { $first: '$$ROOT' }
            }
        },
        {
            $group: {
                _id: null,
                totalProblems: { $sum: 1 },
                solvedProblems: {
                    $sum: {
                        $cond: [{ $eq: ['$hasAccepted', 1] }, 1, 0]
                    }
                },
                totalSubmissions: { $sum: '$totalSubmissions' }
            }
        }
    ]);
};

// Static method to get problem submission statistics
submissionSchema.statics.getProblemStats = function(problemId) {
    return this.aggregate([
        {
            $match: {
                problem: new mongoose.Types.ObjectId(problemId)
            }
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
                avgExecutionTime: { $avg: '$executionTime' },
                avgMemoryUsed: { $avg: '$memoryUsed' }
            }
        }
    ]);
};

// Instance method to check if submission is successful
submissionSchema.methods.isSuccessful = function() {
    return this.status === 'accepted';
};

// Instance method to get formatted execution time
submissionSchema.methods.getFormattedExecutionTime = function() {
    if (this.executionTime < 1000) {
        return `${this.executionTime}ms`;
    }
    return `${(this.executionTime / 1000).toFixed(3)}s`;
};

// Instance method to get formatted memory usage
submissionSchema.methods.getFormattedMemoryUsage = function() {
    if (this.memoryUsed < 1024) {
        return `${this.memoryUsed}MB`;
    }
    return `${(this.memoryUsed / 1024).toFixed(2)}GB`;
};

export default mongoose.model('Submission', submissionSchema); 