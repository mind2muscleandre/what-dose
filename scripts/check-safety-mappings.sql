-- ==========================================
-- CHECK SAFETY MAPPINGS
-- ==========================================
-- This script helps debug why Safety Warnings might not be showing
-- ==========================================

-- 1. Check if your supplements are mapped to substances
SELECT 
  s.id as supplement_id,
  s.name_en as supplement_name,
  sub.id as substance_id,
  sub.name as substance_name
FROM supplements s
LEFT JOIN supplement_substances ss ON s.id = ss.supplement_id
LEFT JOIN substances sub ON ss.substance_id = sub.id
WHERE s.name_en ILIKE '%zinc%' 
   OR s.name_en ILIKE '%magnesium%'
   OR s.name_en ILIKE '%5-htp%'
ORDER BY s.name_en, sub.name;

-- 2. Check what substances exist
SELECT id, name, substance_type FROM substances ORDER BY name;

-- 3. Check what interactions exist
SELECT 
  a.name as substance_a,
  b.name as substance_b,
  i.severity,
  i.description
FROM interactions i
JOIN substances a ON i.substance_a_id = a.id
JOIN substances b ON i.substance_b_id = b.id
ORDER BY i.severity DESC;

-- 4. Check if your stack items have supplements that are mapped
-- Replace 'YOUR_USER_ID' with your actual user ID
SELECT 
  us.id as stack_item_id,
  us.supplement_id,
  s.name_en as supplement_name,
  ss.substance_id,
  sub.name as substance_name
FROM user_stacks us
JOIN supplements s ON us.supplement_id = s.id
LEFT JOIN supplement_substances ss ON s.id = ss.supplement_id
LEFT JOIN substances sub ON ss.substance_id = sub.id
WHERE us.user_id = 'YOUR_USER_ID'  -- Replace with your user ID
  AND us.is_active = true
ORDER BY us.schedule_block, s.name_en;

