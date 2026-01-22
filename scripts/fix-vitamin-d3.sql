-- ==========================================
-- FIX VITAMIN D3 IN DATABASE
-- ==========================================
-- This script helps identify and fix Vitamin D3 supplement issues
-- Run this if you're getting "Could not find supplement: Vitamin D3" errors
-- ==========================================

-- 1. Check if Vitamin D3 exists in database
SELECT 
  id,
  name_en,
  name_sv,
  is_parent,
  parent_id,
  i18n_key,
  scaling_algorithm,
  research_status
FROM supplements
WHERE name_en ILIKE '%vitamin d3%' 
   OR name_en ILIKE '%d3%'
   OR name_sv ILIKE '%vitamin d3%'
   OR name_sv ILIKE '%d3%'
ORDER BY is_parent DESC, id;

-- 2. If Vitamin D3 exists but is_parent = false, mark it as parent
UPDATE supplements
SET is_parent = true
WHERE (name_en ILIKE '%vitamin d3%' OR name_en ILIKE 'Vitamin D3')
  AND is_parent = false
  AND parent_id IS NULL;

-- 3. If multiple Vitamin D3 entries exist, mark the best one as parent
-- (The one with most complete data or lowest ID)
UPDATE supplements
SET is_parent = true
WHERE id = (
  SELECT id
  FROM supplements
  WHERE name_en ILIKE '%vitamin d3%' 
     OR name_en = 'Vitamin D3'
  ORDER BY 
    CASE WHEN dosing_base_val IS NOT NULL THEN 0 ELSE 1 END, -- Prefer ones with dosing info
    CASE WHEN is_base_health = true THEN 0 ELSE 1 END, -- Prefer base health supplements
    id ASC -- Prefer first one
  LIMIT 1
);

-- 4. Set other Vitamin D3 entries as children of the parent
UPDATE supplements
SET 
  is_parent = false,
  parent_id = (
    SELECT id
    FROM supplements
    WHERE name_en ILIKE '%vitamin d3%' 
       OR name_en = 'Vitamin D3'
      AND is_parent = true
    LIMIT 1
  )
WHERE (name_en ILIKE '%vitamin d3%' OR name_en = 'Vitamin D3')
  AND is_parent = false
  AND parent_id IS NULL
  AND id != (
    SELECT id
    FROM supplements
    WHERE name_en ILIKE '%vitamin d3%' 
       OR name_en = 'Vitamin D3'
      AND is_parent = true
    LIMIT 1
  );

-- 5. Set i18n_key if missing
UPDATE supplements
SET i18n_key = 'supplements.vit_d3'
WHERE (name_en ILIKE '%vitamin d3%' OR name_en = 'Vitamin D3')
  AND is_parent = true
  AND (i18n_key IS NULL OR i18n_key = '');

-- 6. Set scaling algorithm if missing
UPDATE supplements
SET 
  scaling_algorithm = 'linear_weight',
  scaling_base_dose = COALESCE(scaling_base_dose, dosing_base_val, 2000),
  scaling_safe_min = COALESCE(scaling_safe_min, 1000),
  scaling_safe_max = COALESCE(scaling_safe_max, dosing_max_val, 4000)
WHERE (name_en ILIKE '%vitamin d3%' OR name_en = 'Vitamin D3')
  AND is_parent = true
  AND scaling_algorithm IS NULL;

-- 7. Verify the fix
SELECT 
  id,
  name_en,
  name_sv,
  is_parent,
  parent_id,
  i18n_key,
  scaling_algorithm,
  scaling_base_dose,
  scaling_safe_min,
  scaling_safe_max,
  research_status
FROM supplements
WHERE name_en ILIKE '%vitamin d3%' 
   OR name_en = 'Vitamin D3'
ORDER BY is_parent DESC, id;
