# Deployment Guide - Vercel

This guide explains how to deploy the EduAssess Platform to Vercel.

## Prerequisites

- GitHub account
- Vercel account (sign up at [vercel.com](https://vercel.com))
- Supabase project set up (see SUPABASE_SETUP.md)

## Method 1: Deploy via Vercel Dashboard (Recommended)

### Step 1: Push Code to GitHub

1. **Initialize Git** (if not already done)
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Phase 1 complete"
   ```

2. **Create GitHub Repository**
   - Go to GitHub and create a new repository
   - Follow instructions to push your code:
   ```bash
   git remote add origin https://github.com/yourusername/edu-assessment-platform.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Import Project to Vercel

1. **Log in to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Sign Up" or "Log In"
   - Connect your GitHub account

2. **Import Repository**
   - Click "Add New..." → "Project"
   - Select your GitHub repository
   - Click "Import"

### Step 3: Configure Project

1. **Project Settings**
   - **Framework Preset**: Vite
   - **Root Directory**: `./` (keep default)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

2. **Environment Variables**
   Click "Environment Variables" and add:
   
   | Name | Value |
   |------|-------|
   | `VITE_SUPABASE_URL` | Your Supabase project URL |
   | `VITE_SUPABASE_ANON_KEY` | Your Supabase anon key |
   | `VITE_APP_NAME` | EduAssess Platform |
   | `VITE_APP_URL` | https://your-project.vercel.app |

3. **Deploy**
   - Click "Deploy"
   - Wait for build to complete (1-2 minutes)

### Step 4: Configure Custom Domain (Optional)

1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Method 2: Deploy via Vercel CLI

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Login to Vercel

```bash
vercel login
```

### Step 3: Deploy

```bash
# From your project directory
vercel

# Follow the prompts:
# - Set up and deploy? Y
# - Which scope? Select your account
# - Link to existing project? N
# - What's your project's name? edu-assessment-platform
# - In which directory is your code located? ./
```

### Step 4: Set Environment Variables

```bash
vercel env add VITE_SUPABASE_URL
# Paste your Supabase URL

vercel env add VITE_SUPABASE_ANON_KEY
# Paste your Supabase anon key

vercel env add VITE_APP_NAME
# Enter: EduAssess Platform

vercel env add VITE_APP_URL
# Enter: your production URL
```

### Step 5: Deploy to Production

```bash
vercel --prod
```

## Post-Deployment Configuration

### 1. Update Supabase Redirect URLs

After deployment, update your Supabase authentication settings:

1. Go to your Supabase project
2. Navigate to **Authentication** > **URL Configuration**
3. Add your Vercel URL to **Redirect URLs**:
   ```
   https://your-project.vercel.app/**
   ```

### 2. Update Social OAuth Redirect URLs

For Google and Microsoft OAuth:

**Google Cloud Console**:
- Add authorized redirect URI: `https://your-project.supabase.co/auth/v1/callback`
- Add authorized JavaScript origin: `https://your-project.vercel.app`

**Microsoft Azure**:
- Add redirect URI in your app registration
- Format: `https://your-project.supabase.co/auth/v1/callback`

### 3. Configure CORS (if needed)

If you encounter CORS issues:
1. Go to Supabase dashboard
2. Navigate to **Settings** > **API**
3. Add your Vercel domain to allowed origins

## Continuous Deployment

Vercel automatically deploys:
- **Production**: When you push to `main` branch
- **Preview**: For all other branches and pull requests

### Deployment Workflow

```bash
# Make changes
git add .
git commit -m "Your commit message"
git push

# Vercel automatically builds and deploys!
```

## Environment Management

### Development
```bash
# Local development uses .env file
npm run dev
```

### Production
Environment variables are managed in Vercel dashboard or CLI

### Preview Deployments
Each pull request gets its own preview URL

## Monitoring and Analytics

### 1. Vercel Analytics (Free)

1. Go to your project in Vercel
2. Click "Analytics" tab
3. View real-time metrics:
   - Page views
   - Performance scores
   - Web Vitals

### 2. Speed Insights

Vercel provides automatic speed insights for your deployment

### 3. Logs

View deployment and runtime logs:
1. Go to your project
2. Click "Deployments"
3. Click on a deployment
4. View "Build Logs" and "Runtime Logs"

## Troubleshooting

### Build Failures

**Issue**: Build fails with module not found
- **Solution**: Ensure all dependencies are in `package.json`
- Run `npm install` locally first

**Issue**: Environment variables not working
- **Solution**: 
  - Check variable names match exactly (including `VITE_` prefix)
  - Redeploy after adding variables

### Runtime Errors

**Issue**: 404 on page refresh
- **Solution**: Vercel automatically handles this for SPAs, but ensure `vercel.json` is configured if needed

**Issue**: API calls failing
- **Solution**: Check CORS settings in Supabase

### Performance Issues

**Issue**: Slow initial load
- **Solution**: 
  - Implement code splitting
  - Optimize images
  - Enable Vercel Edge Caching

## Cost Optimization

### Vercel Free Tier Limits
- 100GB bandwidth/month
- Unlimited deployments
- Unlimited preview deployments
- Community support

### When to Upgrade
Consider upgrading to Pro ($20/month) when:
- Bandwidth exceeds 100GB/month
- Need advanced analytics
- Require password protection
- Need priority support

## Rollback Strategy

If a deployment has issues:

1. **Via Dashboard**:
   - Go to "Deployments"
   - Find previous working deployment
   - Click "..." → "Promote to Production"

2. **Via CLI**:
   ```bash
   vercel rollback
   ```

## Best Practices

1. **Always test locally** before pushing
2. **Use preview deployments** for testing features
3. **Monitor analytics** regularly
4. **Set up GitHub branch protection** for production
5. **Use semantic versioning** for releases
6. **Keep dependencies updated**

## Production Checklist

Before launching:

- [ ] All environment variables configured
- [ ] Supabase redirect URLs updated
- [ ] OAuth providers configured
- [ ] Custom domain configured (if applicable)
- [ ] Analytics enabled
- [ ] Error tracking set up
- [ ] Performance tested
- [ ] Mobile responsiveness verified
- [ ] Cross-browser testing completed
- [ ] SEO metadata added

## Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vite Deployment Guide](https://vitejs.dev/guide/static-deploy.html)
- [Vercel CLI Reference](https://vercel.com/docs/cli)

## Support

- Vercel Status: [vercel-status.com](https://www.vercel-status.com/)
- Vercel Support: support@vercel.com
- Community: [vercel.com/community](https://vercel.com/community)
