-- ==========================================
-- VERIFY SUPPLEMENT LOGIC SCHEMA
-- ==========================================
-- Run this after schema_supplement_logic.sql to verify everything is set up correctly
-- ==========================================

-- 1. Verify scaling_algorithm_type enum exists
SELECT 
  CASE 
    WHEN EXISTS (SELECT 1 FROM pg_type WHERE typname = 'scaling_algorithm_type')
    THEN '✅ scaling_algorithm_type enum exists'
    ELSE '❌ scaling_algorithm_type enum MISSING'
  END as enum_check;

-- 2. Verify supplements table columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'supplements'
  AND column_name IN (
    'i18n_key',
    'scaling_algorithm',
    'scaling_base_dose',
    'scaling_safe_min',
    'scaling_safe_max',
    'scaling_gender_male',
    'scaling_gender_female',
    'contraindications',
    'cycling_required',
    'cycling_instruction_key'
  )
ORDER BY column_name;

-- 3. Verify profiles table has health_conditions
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name = 'health_conditions';

-- 4. Verify indexes exist
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('supplements', 'profiles')
  AND indexname IN (
    'idx_supplements_i18n_key',
    'idx_supplements_contraindications',
    'idx_profiles_health_conditions'
  )
ORDER BY tablename, indexname;

-- 5. Check current data (sample)
SELECT 
  COUNT(*) as total_supplements,
  COUNT(i18n_key) as supplements_with_i18n_key,
  COUNT(scaling_algorithm) as supplements_with_scaling_algorithm,
  COUNT(contraindications) as supplements_with_contraindications
FROM supplements
WHERE is_parent = true;

-- 6. Show sample of supplements (first 5)
SELECT 
  id,
  name_en,
  i18n_key,
  scaling_algorithm,
  scaling_base_dose,
  research_status,
  contraindications
FROM supplements
WHERE is_parent = true
ORDER BY id
LIMIT 5;
