# Supabase Setup Guide

This guide walks you through setting up Supabase for the EduAssess Platform.

## 1. Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: EduAssess Platform
   - **Database Password**: (generate a strong password)
   - **Region**: Select closest to your users (e.g., Sydney for Australia)
5. Click "Create new project"

## 2. Get Your API Keys

1. In your Supabase project dashboard, go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (URL) https://ssasvoolpzpscaafuedt.supabase.co
   - **anon/public key** (anon key) sb_publishable_LirtsGK3bgmgIoZ48J0BXQ_ytOhj9nS
3. Add these to your `.env` file:
   ```env
   VITE_SUPABASE_URL=your_project_url
   VITE_SUPABASE_ANON_KEY=your_anon_key
   ```

## 3. Set Up Authentication

### Enable Email/Password Authentication
1. Go to **Authentication** > **Providers**
2. Make sure **Email** is enabled
3. Configure email templates if needed

### Enable Social Logins

#### Google OAuth
1. Go to **Authentication** > **Providers** > **Google**
2. Click **Enable**
3. Follow the instructions to create OAuth credentials in Google Cloud Console
4. Add authorized redirect URLs:
   ```
   https://your-project.supabase.co/auth/v1/callback
   ```
5. Add Client ID and Client Secret from Google

#### Microsoft OAuth
1. Go to **Authentication** > **Providers** > **Azure**
2. Click **Enable**
3. Create an app registration in Azure Portal
4. Configure redirect URI
5. Add Client ID and Client Secret

### Configure Email Templates (Optional)
1. Go to **Authentication** > **Email Templates**
2. Customize templates for:
   - Confirmation email
   - Password reset
   - Magic link

## 4. Create Database Tables

### Users Profile Table
```sql
-- Create users profile table
CREATE TABLE IF NOT EXISTS public.user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  year_level INTEGER NOT NULL,
  school_name TEXT,
  subscription_status TEXT DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium', 'trial')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policy for users to read their own profile
CREATE POLICY "Users can view own profile"
  ON public.user_profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Create policy for users to update their own profile
CREATE POLICY "Users can update own profile"
  ON public.user_profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Create policy for users to insert their own profile
CREATE POLICY "Users can insert own profile"
  ON public.user_profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

### Exam Attempts Table
```sql
-- Create exam attempts table
CREATE TABLE IF NOT EXISTS public.exam_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id TEXT NOT NULL,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'in-progress' CHECK (status IN ('in-progress', 'completed', 'abandoned')),
  score INTEGER,
  percentage DECIMAL,
  time_spent INTEGER, -- in seconds
  answers JSONB, -- Store all answers as JSON
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.exam_attempts ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own attempts
CREATE POLICY "Users can view own exam attempts"
  ON public.exam_attempts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own attempts
CREATE POLICY "Users can insert own exam attempts"
  ON public.exam_attempts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy for users to update their own attempts
CREATE POLICY "Users can update own exam attempts"
  ON public.exam_attempts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX idx_exam_attempts_user_id ON public.exam_attempts(user_id);
CREATE INDEX idx_exam_attempts_exam_id ON public.exam_attempts(exam_id);
```

### User Progress Table
```sql
-- Create user progress table for tracking overall stats
CREATE TABLE IF NOT EXISTS public.user_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  total_exams_taken INTEGER DEFAULT 0,
  total_time_spent INTEGER DEFAULT 0, -- in seconds
  average_score DECIMAL,
  strong_topics TEXT[], -- Array of topics where user performs well
  weak_topics TEXT[], -- Array of topics needing improvement
  last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

-- Create policy for users to view their own progress
CREATE POLICY "Users can view own progress"
  ON public.user_progress
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for users to update their own progress
CREATE POLICY "Users can update own progress"
  ON public.user_progress
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy for users to insert their own progress
CREATE POLICY "Users can insert own progress"
  ON public.user_progress
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

### Create Function to Auto-Update Timestamps
```sql
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers to tables
CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON public.user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exam_attempts_updated_at BEFORE UPDATE ON public.exam_attempts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_progress_updated_at BEFORE UPDATE ON public.user_progress
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## 5. Set Up Storage (Optional - for future use)

If you plan to store user-uploaded content or certificates:

1. Go to **Storage** in Supabase dashboard
2. Create a new bucket named `user-content`
3. Set appropriate policies for public/private access

## 6. Configure Security

### Set up Row Level Security (RLS)

All the tables above have RLS enabled. Key principles:
- Users can only access their own data
- All queries are automatically filtered by user ID
- No user can access another user's data

### Additional Security Settings

1. Go to **Settings** > **API**
2. Review and configure:
   - JWT expiry time
   - Refresh token expiry
   - Email confirmation required

## 7. Test Your Setup

1. Update your `.env` file with the credentials
2. Start your development server
3. Try signing up a test user
4. Verify the user appears in **Authentication** > **Users**
5. Check that a profile was created in the `user_profiles` table

## 8. Production Checklist

Before going live:

- [ ] Enable email confirmation for new signups
- [ ] Set up custom SMTP for emails (optional)
- [ ] Review and test all RLS policies
- [ ] Set up database backups
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerts
- [ ] Review security settings

## Troubleshooting

### Common Issues

**Issue**: "Invalid API key"
- **Solution**: Double-check your `.env` file has the correct keys

**Issue**: "Row Level Security policy violation"
- **Solution**: Make sure RLS policies are created correctly

**Issue**: "User not created in user_profiles table"
- **Solution**: You may need to create a database trigger or handle this in your application code

## Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Authentication Guide](https://supabase.com/docs/guides/auth)
