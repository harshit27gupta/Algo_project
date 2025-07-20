# Forgot Password Setup Guide

## Overview
The forgot password functionality has been fully implemented with the following features:
- Email-based password reset
- Secure token generation and validation
- Frontend components for forgot password and reset password
- Backend API endpoints for handling password reset requests

## Backend Implementation

### New Files Created:
1. `server/utils/sendEmail.js` - Email service utility
2. `server/controllers/auth.js` - Updated with forgotPassword and resetPassword functions
3. `server/routes/auth.js` - Updated with new routes
4. `server/models/User.js` - Updated with reset token fields

### New Dependencies:
- `nodemailer` - For sending emails

### New API Endpoints:
- `POST /api/v1/auth/forgotpassword` - Request password reset
- `PUT /api/v1/auth/resetpassword/:resettoken` - Reset password with token

## Frontend Implementation

### New Files Created:
1. `client/src/components/auth/ResetPassword.jsx` - Reset password form
2. `client/src/services/api.js` - Updated with forgotPassword and resetPassword functions
3. `client/src/App.jsx` - Updated with new route

### Updated Files:
1. `client/src/components/auth/ForgotPassword.jsx` - Now integrated with backend
2. `client/src/components/auth/Auth.css` - Added password toggle styles

## Environment Variables Required

Add these to your `.env` file in the server directory:

```env
# Email Configuration (for password reset)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password_here
FROM_NAME=Online Judge
FROM_EMAIL=noreply@onlinejudge.com

# Frontend URL (for password reset links)
FRONTEND_URL=http://localhost:3000

```

## Gmail Setup (Recommended)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security > 2-Step Verification > App passwords
   - Generate a new app password for "Mail"
3. Use the generated password as `SMTP_PASSWORD`

## How It Works

1. **Forgot Password Request**:
   - User enters email on `/auth/forgot-password`
   - System validates email and generates reset token
   - Email is sent with reset link
   - Token expires in 10 minutes

2. **Password Reset**:
   - User clicks link in email (goes to `/reset-password/:token`)
   - User enters new password and confirmation
   - System validates token and updates password
   - User is redirected to login

## Security Features

- Reset tokens are hashed before storing in database
- Tokens expire after 10 minutes
- Tokens are invalidated after use
- Email validation and rate limiting
- Secure password requirements (minimum 6 characters)

## Testing

1. Start the server and client
2. Navigate to `/auth/forgot-password`
3. Enter a registered email address
4. Check your email for the reset link
5. Click the link and reset your password

## Troubleshooting

- Ensure all environment variables are set correctly
- Check that your email service (Gmail) allows less secure apps or use app passwords
- Verify that the frontend can reach the backend API
- Check server logs for any email sending errors 