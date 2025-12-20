-- ==========================================
-- SQL Script to Update Uncategorized Supplements
-- ==========================================
-- This script updates supplements that are missing category_ids
-- Run this after reviewing the output from categorize-all-supplements.ts
-- 
-- Usage:
--   1. Run: npx tsx scripts/categorize-all-supplements.ts
--   2. Review the suggested categories
--   3. Update this file with the correct categories
--   4. Run this SQL script in Supabase SQL Editor
-- ==========================================

-- Example updates (replace with actual IDs and categories from script output):
-- UPDATE supplements SET category_ids = ARRAY[1, 2] WHERE id = 123; -- Example supplement
-- UPDATE supplements SET category_ids = ARRAY[4] WHERE id = 456; -- Another example

-- TODO: Add actual UPDATE statements here based on categorize-all-supplements.ts output

-- ==========================================
-- Verification Queries
-- ==========================================

-- Check for supplements without categories
SELECT 
  id, 
  name_en, 
  category_ids,
  is_base_health,
  is_parent
FROM supplements 
WHERE category_ids IS NULL 
   OR array_length(category_ids, 1) IS NULL
ORDER BY name_en;

-- Count supplements per category
SELECT 
  unnest(category_ids) as category_id,
  COUNT(*) as count
FROM supplements
WHERE category_ids IS NOT NULL
GROUP BY unnest(category_ids)
ORDER BY category_id;

-- Show supplements that might need multiple categories
SELECT 
  id,
  name_en,
  category_ids,
  CASE 
    WHEN array_length(category_ids, 1) = 1 THEN 'Single category'
    WHEN array_length(category_ids, 1) > 1 THEN 'Multiple categories'
    ELSE 'No categories'
  END as category_status
FROM supplements
ORDER BY array_length(category_ids, 1) NULLS LAST, name_en;
