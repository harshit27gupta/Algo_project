# Quick Vercel Deployment Guide

## Step 1: Deploy to Vercel

1. **Connect Repository**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "New Project"
   - Import your GitHub repository
   - Set **Root Directory** to `client/`

2. **Build Settings** (Vercel should auto-detect)
   - Framework: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

## Step 2: Set Environment Variables

1. Go to your Vercel project settings
2. Add environment variables (Vercel will manage these, not local .env files):
   ```
   VITE_API_URL=https://your-ec2-domain.com/api/v1
   VITE_GOOGLE_CLIENT_ID=your-google-client-id
   ```
3. Redeploy the project for changes to take effect

## Step 3: Test Basic Functionality

1. Visit your Vercel app URL
2. Test if the app loads
3. Check browser console for any errors
4. Test a simple API call (like fetching problems)

## Step 4: Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Add your Vercel domain to OAuth settings:
   - Authorized JavaScript origins: `https://your-vercel-app.vercel.app`
   - Authorized redirect URIs: `https://your-vercel-app.vercel.app`

## Troubleshooting

### If you see CORS errors:
- Your current CORS setup should handle this
- Check that your EC2 domain is accessible
- Verify the API URL is correct

### If build fails:
- Check that all dependencies are in `package.json`
- Ensure `npm run build` works locally first

### If API calls fail:
- Verify `VITE_API_URL` is set correctly
- Check that your EC2 server is running
- Test the API endpoint directly in browser

## Next Steps (After it's working):
1. Secure CORS configuration
2. Add proper error handling
3. Optimize performance
4. Set up monitoring 