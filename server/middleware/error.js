import ErrorResponse from '../utils/errorResponse.js';

// Centralized error handling middleware
const errorHandler = (err, req, res, next) => {
    console.log(`💥 [ERROR_HANDLER] Error occurred:`, err.message);
    console.log(`💥 [ERROR_HANDLER] Stack trace:`, err.stack);
    console.log(`💥 [ERROR_HANDLER] Request: ${req.method} ${req.url}`);
    
    let error = { ...err };
    error.message = err.message;

    // Log to console for dev
    console.error(err);

    // Handle specific error types
    if (err.name === 'CastError') {
        const message = `Resource not found`;
        error = new ErrorResponse(message, 404);
    }

    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = new ErrorResponse(message, 400);
    }

    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = new ErrorResponse(message, 400);
    }

    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || 'Server Error'
    });
};

export default errorHandler; 