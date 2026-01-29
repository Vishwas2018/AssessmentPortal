-- Migration: Add Rich Question Content Support (FIXED)
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add new columns to questions table for rich content
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS content JSONB,
ADD COLUMN IF NOT EXISTS options_data JSONB,
ADD COLUMN IF NOT EXISTS answer_explanation JSONB,
ADD COLUMN IF NOT EXISTS hint_content JSONB,
ADD COLUMN IF NOT EXISTS difficulty TEXT DEFAULT 'medium',
ADD COLUMN IF NOT EXISTS topic TEXT,
ADD COLUMN IF NOT EXISTS skill TEXT,
ADD COLUMN IF NOT EXISTS numeric_tolerance DECIMAL,
ADD COLUMN IF NOT EXISTS question_image_url TEXT;

-- 2. Create an index for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_questions_content ON questions USING GIN (content);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_topic ON questions(topic);

-- 3. Grant permissions on questions table columns
-- (No action needed - existing table permissions apply)

-- ============================================
-- STORAGE BUCKET SETUP
-- ============================================
-- Create bucket 'question-images' manually in Supabase Dashboard:
-- 1. Go to Storage > Create new bucket
-- 2. Name: question-images
-- 3. Public: Yes (for easy access)
-- 4. Add policy for public read access

-- ============================================
-- OPTIONAL: Question stats view (FIXED VERSION)
-- ============================================
-- This view helps track question performance
-- The key fix: use ->> operator to extract text from JSONB

DROP VIEW IF EXISTS question_stats;

CREATE VIEW question_stats AS
SELECT 
  q.id,
  q.exam_id,
  q.question_text,
  q.difficulty,
  q.topic,
  COUNT(DISTINCT ea.id) as attempt_count,
  COUNT(DISTINCT CASE 
    WHEN ea.answers IS NOT NULL 
     AND (ea.answers ->> q.id::text) = q.correct_answer 
    THEN ea.id 
  END) as correct_count,
  CASE 
    WHEN COUNT(DISTINCT ea.id) > 0 THEN
      ROUND(
        COUNT(DISTINCT CASE 
          WHEN ea.answers IS NOT NULL 
           AND (ea.answers ->> q.id::text) = q.correct_answer 
          THEN ea.id 
        END)::decimal / 
        COUNT(DISTINCT ea.id) * 100, 
        1
      )
    ELSE 0
  END as success_rate
FROM questions q
LEFT JOIN exam_attempts ea ON ea.exam_id = q.exam_id AND ea.status = 'completed'
GROUP BY q.id, q.exam_id, q.question_text, q.difficulty, q.topic;

-- Grant permissions
GRANT SELECT ON question_stats TO authenticated;

-- Add comment
COMMENT ON TABLE questions IS 'Questions table with support for rich content including images, tables, charts, and math notation';

-- ============================================
-- VERIFICATION
-- ============================================
-- Run this to verify the columns were added:
-- SELECT column_name, data_type 
-- FROM information_schema.columns 
-- WHERE table_name = 'questions' 
-- ORDER BY ordinal_position;