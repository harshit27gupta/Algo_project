import rateLimit from 'express-rate-limit';

// Rate limit for authentication routes (login, register) - Optimized for load testing
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 1000, // Increased from 200 to 1000 attempts
    message: {
        success: false,
        error: 'Too many attempts, please try again after 15 minutes'
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    skip: (req) => {
        // Skip rate limiting for load testing (check for test header)
        return req.headers['x-test-mode'] === 'true';
    },
    handler: (req, res) => {
        console.log(`🚫 Rate limit exceeded for auth: ${req.ip}`);
        res.status(429).json({
            success: false,
            error: 'Too many attempts, please try again after 15 minutes'
        });
    }
});

// Rate limit for general API routes - Optimized for load testing
export const apiLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 500, // Increased from 100 to 500 requests per minute
    message: {
        success: false,
        error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for load testing (check for test header)
        return req.headers['x-test-mode'] === 'true';
    },
    handler: (req, res) => {
        console.log(`🚫 Rate limit exceeded for API: ${req.ip} - ${req.method} ${req.url}`);
        res.status(429).json({
            success: false,
            error: 'Too many requests, please try again later'
        });
    }
});

// Special rate limiter for load testing (very permissive)
export const testLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 2000, // Very high limit for testing
    message: {
        success: false,
        error: 'Test rate limit exceeded'
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        console.log(`🚫 Test rate limit exceeded: ${req.ip}`);
        res.status(429).json({
            success: false,
            error: 'Test rate limit exceeded'
        });
    }
}); 