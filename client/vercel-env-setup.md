# Vercel Environment Variables Setup

## Required Environment Variables

Add these in your Vercel project settings (NOT in local .env files):

```
VITE_API_URL=https://your-ec2-domain.com/api/v1
VITE_GOOGLE_CLIENT_ID=your-google-client-id
```

## How to Add Environment Variables in Vercel:

1. Go to your Vercel project dashboard
2. Click on "Settings" tab
3. Go to "Environment Variables" section
4. Add each variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-ec2-domain.com/api/v1`
   - **Environment**: Production, Preview, Development
5. Repeat for `VITE_GOOGLE_CLIENT_ID`

## Important Notes:
- **DO NOT** create local `.env` files for production
- All environment variables will be managed through Vercel dashboard
- Replace `your-ec2-domain.com` with your actual EC2 domain
- Make sure your EC2 instance is accessible via HTTPS
- The `VITE_` prefix is required for Vite to expose the variable to your app
- After adding variables, redeploy your project for changes to take effect 