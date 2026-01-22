-- ==========================================
-- CHECK IF SUPPLEMENT EXISTS IN DATABASE
-- ==========================================
-- Use this to debug "Could not find supplement" errors
-- Replace 'Vitamin D3' with the supplement name you're looking for
-- ==========================================

-- Search for supplement by name (case-insensitive)
SELECT 
  id,
  name_en,
  name_sv,
  is_parent,
  parent_id,
  i18n_key,
  scaling_algorithm,
  research_status,
  is_base_health,
  category_ids
FROM supplements
WHERE name_en ILIKE '%Vitamin D3%' 
   OR name_en ILIKE '%D3%'
   OR name_sv ILIKE '%Vitamin D3%'
   OR name_sv ILIKE '%D3%'
   OR name_en ILIKE '%Cholecalciferol%'
ORDER BY is_parent DESC, id;

-- Check if any supplements match common Vitamin D3 alternatives
SELECT 
  id,
  name_en,
  name_sv,
  is_parent,
  parent_id
FROM supplements
WHERE name_en ILIKE '%vitamin d%'
   OR name_sv ILIKE '%vitamin d%'
ORDER BY is_parent DESC, id;

-- Count total supplements in database
SELECT COUNT(*) as total_supplements FROM supplements;

-- Count parent supplements
SELECT COUNT(*) as parent_supplements FROM supplements WHERE is_parent = true;

-- List all supplements that are marked as base health
SELECT 
  id,
  name_en,
  is_parent,
  i18n_key
FROM supplements
WHERE is_base_health = true
ORDER BY name_en;
