-- ==========================================
-- ADD VITAMIN D3 TO DATABASE
-- ==========================================
-- Quick fix: Add Vitamin D3 if it's missing
-- ==========================================

-- Check if Vitamin D3 already exists
SELECT 
  id,
  name_en,
  name_sv,
  is_parent,
  i18n_key
FROM supplements
WHERE name_en ILIKE '%vitamin d3%'
   OR name_en = 'Vitamin D3';

-- Add Vitamin D3 if it doesn't exist
INSERT INTO supplements (
  name_en,
  name_sv,
  research_status,
  regulatory_status,
  dosing_base_val,
  dosing_max_val,
  unit,
  dosing_notes,
  bioavailability_notes,
  interaction_risk_text,
  interaction_risk_level,
  is_base_health,
  category_ids,
  is_parent,
  i18n_key,
  scaling_algorithm,
  scaling_base_dose,
  scaling_safe_min,
  scaling_safe_max
)
SELECT 
  'Vitamin D3',
  'Vitamin D3',
  'Green',
  'Supplement',
  2000,
  4000,
  'IU',
  'Target blood levels: 75-125 nmol/L. Winter supplementation is critical.',
  'Fat-soluble - must be taken with dietary fat.',
  'Toxicity risk at chronic doses >10,000 IU/day.',
  'Low',
  TRUE,
  ARRAY[1, 2, 5, 8, 9], -- Health, Muscle, Stress, Anti-Aging, Joints
  TRUE,
  'supplements.vit_d3',
  'linear_weight',
  2000,
  1000,
  4000
WHERE NOT EXISTS (
  SELECT 1 FROM supplements 
  WHERE name_en = 'Vitamin D3'
     OR (name_en ILIKE '%vitamin d3%' AND is_parent = true)
);

-- Verify it was added
SELECT 
  id,
  name_en,
  name_sv,
  is_parent,
  i18n_key,
  scaling_algorithm,
  scaling_base_dose,
  scaling_safe_min,
  scaling_safe_max,
  is_base_health
FROM supplements
WHERE name_en = 'Vitamin D3'
   OR (name_en ILIKE '%vitamin d3%' AND is_parent = true);
