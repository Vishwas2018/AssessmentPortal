-- ============================================
-- Migration: Create user_subscriptions table for Stripe integration
-- Run this in your Supabase SQL Editor
-- ============================================

-- Create the user_subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan_id TEXT NOT NULL DEFAULT 'free',
  status TEXT NOT NULL DEFAULT 'free',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Ensure one subscription per user
  UNIQUE(user_id),
  -- Index for faster lookups
  UNIQUE(stripe_customer_id),
  UNIQUE(stripe_subscription_id)
);

-- Add comments for documentation
COMMENT ON TABLE user_subscriptions IS 'Stores user subscription information synced from Stripe';
COMMENT ON COLUMN user_subscriptions.plan_id IS 'Plan identifier: free, monthly, yearly';
COMMENT ON COLUMN user_subscriptions.status IS 'Subscription status: free, active, trialing, past_due, canceled, unpaid';

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_status ON user_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_customer ON user_subscriptions(stripe_customer_id);

-- Enable Row Level Security
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Users can view their own subscription
CREATE POLICY "Users can view own subscription"
  ON user_subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own subscription (for initial creation)
CREATE POLICY "Users can insert own subscription"
  ON user_subscriptions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Only service role can update subscriptions (via Edge Functions)
-- This prevents users from modifying their own subscription status
CREATE POLICY "Service role can update subscriptions"
  ON user_subscriptions
  FOR UPDATE
  USING (auth.role() = 'service_role');

-- Service role can also insert (for webhook handling)
CREATE POLICY "Service role can insert subscriptions"
  ON user_subscriptions
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

-- ============================================
-- FUNCTION: Update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION update_subscription_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS trigger_update_subscription_timestamp ON user_subscriptions;
CREATE TRIGGER trigger_update_subscription_timestamp
  BEFORE UPDATE ON user_subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION update_subscription_updated_at();

-- ============================================
-- FUNCTION: Check if user has premium access
-- ============================================

CREATE OR REPLACE FUNCTION has_premium_access(user_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
  sub_status TEXT;
BEGIN
  SELECT status INTO sub_status
  FROM user_subscriptions
  WHERE user_id = user_uuid;
  
  RETURN sub_status IN ('active', 'trialing');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- OPTIONAL: Add is_free column to exams table if not exists
-- ============================================

DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'exams' AND column_name = 'is_free'
  ) THEN
    ALTER TABLE exams ADD COLUMN is_free BOOLEAN DEFAULT FALSE;
    COMMENT ON COLUMN exams.is_free IS 'Whether this exam is available to free users';
    
    -- Mark some exams as free (adjust as needed)
    UPDATE exams SET is_free = TRUE WHERE id IN (
      SELECT id FROM exams ORDER BY created_at LIMIT 5
    );
  END IF;
END $$;

-- ============================================
-- Verify the table was created
-- ============================================

SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'user_subscriptions'
ORDER BY ordinal_position;