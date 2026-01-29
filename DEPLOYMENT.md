# 🚀 EduAssess Deployment Guide

## Pre-Deployment Checklist

Before deploying, make sure:

- [ ] All code is committed to GitHub
- [ ] `.env` file is in `.gitignore` (never commit secrets!)
- [ ] App runs locally with `npm run dev`
- [ ] App builds successfully with `npm run build`

---

## Option A: Deploy to Vercel (Recommended)

### Step 1: Push to GitHub

```bash
# If not already a git repo
git init
git add .
git commit -m "Ready for deployment"

# Create repo on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/AssessmentPortal.git
git branch -M main
git push -u origin main
```

### Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in with GitHub
2. Click **"Add New Project"**
3. Select your **AssessmentPortal** repository
4. Vercel auto-detects Vite - settings should be:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 3: Add Environment Variables

In Vercel project settings → Environment Variables, add:

| Name                     | Value                                      |
| ------------------------ | ------------------------------------------ |
| `VITE_SUPABASE_URL`      | `https://ssasvoolpzpscaafuedt.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Your anon key from Supabase                |

⚠️ **Important**: Use `VITE_` prefix for all frontend environment variables!

### Step 4: Deploy

Click **"Deploy"** - Vercel will build and deploy automatically.

Your app will be live at: `https://your-project.vercel.app`

---

## Option B: Deploy to Netlify

### Step 1: Push to GitHub (same as above)

### Step 2: Connect to Netlify

1. Go to [netlify.com](https://netlify.com) and sign in
2. Click **"Add new site"** → **"Import an existing project"**
3. Select GitHub and choose your repo
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `dist`

### Step 3: Add Environment Variables

In Site settings → Environment variables, add:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

### Step 4: Add Redirects

Create `public/_redirects` file:

```
/*    /index.html   200
```

This handles client-side routing.

---

## Post-Deployment: Update Supabase

### Add Your Production URL to Supabase

1. Go to Supabase Dashboard → Authentication → URL Configuration
2. Add your Vercel/Netlify URL to:
   - **Site URL**: `https://your-app.vercel.app`
   - **Redirect URLs**: `https://your-app.vercel.app/**`

This allows authentication to work on your deployed site.

---

## Troubleshooting

### "Page not found" on refresh

- Make sure `vercel.json` rewrites are configured
- Or add `_redirects` file for Netlify

### "Invalid API key" error

- Check environment variables are set correctly in Vercel/Netlify
- Make sure they have the `VITE_` prefix
- Redeploy after adding env vars

### Auth not working

- Add production URL to Supabase redirect URLs
- Check browser console for CORS errors

### Build fails

Run locally first:

```bash
npm run build
```

Fix any TypeScript/build errors before deploying.

---

## Quick Commands

```bash
# Test build locally
npm run build
npm run preview

# Check for TypeScript errors
npx tsc --noEmit

# Push updates (auto-deploys on Vercel)
git add .
git commit -m "Update"
git push
```

---

## Your Deployment URLs

After deployment, update this section:

- **Production**: https://_____.vercel.app
- **Supabase**: https://ssasvoolpzpscaafuedt.supabase.co
- **GitHub**: https://github.com/Vishwas2018/AssessmentPortal

🎉 **Congratulations! Your EduAssess platform is now live!**
