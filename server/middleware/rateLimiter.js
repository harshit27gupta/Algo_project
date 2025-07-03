import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 300,
    message: {
        success: false,
        error: 'Too many attempts, please try again after 15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
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

export const apiLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 200,
    message: {
        success: false,
        error: 'Too many requests, please try again later'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
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

export const testLimiter = rateLimit({
    windowMs: 60 * 1000,
        max: 1000,
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