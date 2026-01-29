-- Migration: Add Audio Support and Private Media Storage
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. Add audio_path column to questions table
ALTER TABLE questions 
ADD COLUMN IF NOT EXISTS audio_path TEXT;

-- Comment for documentation
COMMENT ON COLUMN questions.audio_path IS 'Path to pre-recorded audio file in question-media bucket (optional)';

-- 2. Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_questions_audio ON questions(audio_path) WHERE audio_path IS NOT NULL;

-- ============================================
-- STORAGE BUCKET SETUP (Run in Supabase Dashboard)
-- ============================================
-- 
-- 1. Go to Storage > Create new bucket
-- 2. Name: "question-media"  
-- 3. Public: NO (PRIVATE bucket)
-- 4. File size limit: 10MB
-- 5. Allowed MIME types: image/*, audio/*
--
-- Then add these policies:

-- Policy 1: Authenticated users can read (via signed URLs)
-- This is handled automatically by createSignedUrl() function

-- Policy 2: Only admins can upload
-- CREATE POLICY "Admins can upload media"
-- ON storage.objects FOR INSERT
-- TO authenticated
-- WITH CHECK (
--   bucket_id = 'question-media' AND
--   auth.uid() IN (SELECT user_id FROM user_subscriptions WHERE tier = 'admin')
-- );

-- ============================================
-- EXAMPLE: Question with audio and private images
-- ============================================

/*
-- Example question with rich content using private storage
INSERT INTO questions (
  exam_id,
  question_text,
  question_type,
  content,
  options,
  correct_answer,
  audio_path,
  points,
  order_index
) VALUES (
  'your-exam-id',
  'Each glass holds 250 mL. How many glasses can be filled from a 1-L container?',
  'multiple_choice',
  '[
    {
      "id": "1",
      "type": "text",
      "content": "Each glass like this holds 250 mL."
    },
    {
      "id": "2",
      "type": "image",
      "bucket": "question-media",
      "path": "year5/measurement/glass-250ml.png",
      "alt": "A glass that holds 250 mL",
      "width": 100,
      "alignment": "left"
    },
    {
      "id": "3",
      "type": "text",
      "content": "How many glasses can be completely filled from a 1-L container?",
      "style": "bold"
    }
  ]'::jsonb,
  '["2", "4", "5", "10"]'::jsonb,
  'B',
  'year5/measurement/q1-audio.mp3',
  1,
  1
);
*/

-- ============================================
-- BACKWARD COMPATIBILITY
-- ============================================
-- The system supports BOTH formats:
--
-- LEGACY (public URLs):
-- {
--   "type": "image",
--   "url": "https://example.com/image.png",
--   "alt": "Description"
-- }
--
-- NEW (private storage):
-- {
--   "type": "image",
--   "bucket": "question-media",
--   "path": "year5/diagrams/clock.svg",
--   "alt": "Description"
-- }
--
-- The renderer automatically handles both formats.

-- ============================================
-- HELPER VIEW: Questions with media stats
-- ============================================
CREATE OR REPLACE VIEW questions_media_stats AS
SELECT 
  q.id,
  q.exam_id,
  q.question_text,
  q.audio_path IS NOT NULL as has_audio,
  CASE 
    WHEN q.content IS NOT NULL THEN
      (SELECT COUNT(*) FROM jsonb_array_elements(q.content) elem WHERE elem->>'type' = 'image')
    ELSE 0
  END as image_count,
  CASE
    WHEN q.content IS NOT NULL THEN
      EXISTS(SELECT 1 FROM jsonb_array_elements(q.content) elem WHERE elem->>'bucket' IS NOT NULL)
    ELSE false
  END as uses_private_storage
FROM questions q;

GRANT SELECT ON questions_media_stats TO authenticated;

-- ============================================
-- MIGRATION SCRIPT: Convert public URLs to private storage
-- ============================================
-- Use this to migrate existing questions with public URLs to private storage
-- After uploading the images to the question-media bucket

/*
-- Example: Update a question to use private storage
UPDATE questions
SET content = jsonb_set(
  content,
  '{0}', -- Index of the image block to update
  '{"id": "1", "type": "image", "bucket": "question-media", "path": "year5/diagrams/bottle.png", "alt": "Plastic bottle", "width": 100}'::jsonb
)
WHERE id = 'question-uuid';
*/

-- ============================================
-- AUDIO FILE NAMING CONVENTION
-- ============================================
-- Recommended structure:
-- question-media/
--   ├── year3/
--   │   ├── numeracy/
--   │   │   ├── q1-audio.mp3
--   │   │   ├── q1-diagram.png
--   │   │   └── q2-audio.mp3
--   │   └── reading/
--   │       └── ...
--   ├── year5/
--   │   └── ...
--   └── year7/
--       └── ...

COMMENT ON TABLE questions IS 'Questions table with support for rich content, private media storage, and audio narration';