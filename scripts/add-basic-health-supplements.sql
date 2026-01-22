-- ==========================================
-- ADD BASIC HEALTH SUPPLEMENTS
-- ==========================================
-- This script adds the essential supplements needed for Basic Health Stack
-- Run this if supplements are missing from the database
-- ==========================================

-- 1. Add Vitamin D3
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

-- 2. Add Omega-3 (EPA/DHA) if missing
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
  'Omega-3 (EPA/DHA)',
  'Omega-3 (EPA/DHA)',
  'Green',
  'Supplement',
  2000,
  4000,
  'mg',
  'Measure total EPA+DHA. Higher dose (3-4g) required for inflammation control.',
  'Take with a fatty meal. Triglyceride form is superior to Ethyl Ester.',
  'May thin blood at doses >3g/day.',
  'Medium',
  TRUE,
  ARRAY[1, 4, 5, 6, 8, 9], -- Health, Focus, Stress, Metabolic, Anti-Aging, Joints
  TRUE,
  'supplements.omega_3',
  'linear_weight',
  1000,
  500,
  3000
WHERE NOT EXISTS (
  SELECT 1 FROM supplements 
  WHERE name_en ILIKE '%omega-3%' 
     OR name_en ILIKE '%omega 3%'
     OR name_en ILIKE '%fish oil%'
);

-- 3. Add Magnesium Glycinate if missing
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
  scaling_gender_male,
  scaling_gender_female,
  scaling_safe_min,
  scaling_safe_max
)
SELECT 
  'Magnesium Glycinate',
  'Magnesium (Glycinat)',
  'Green',
  'Supplement',
  400,
  600,
  'mg',
  'Glycinate form for sleep/anxiety. Dose refers to elemental Magnesium.',
  'High bioavailability. Take in the evening.',
  'Loose stools at high doses. Competes with Zinc/Calcium absorption.',
  'Low',
  TRUE,
  ARRAY[1, 5, 7, 9], -- Health, Stress, Sleep, Joints
  TRUE,
  'supplements.magnesium',
  'gender_split',
  400,
  420,
  320,
  200,
  600
WHERE NOT EXISTS (
  SELECT 1 FROM supplements 
  WHERE name_en ILIKE '%magnesium%'
);

-- 4. Add Zinc if missing
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
  scaling_gender_male,
  scaling_gender_female,
  scaling_safe_min,
  scaling_safe_max
)
SELECT 
  'Zinc',
  'Zink',
  'Green',
  'Supplement',
  15,
  40,
  'mg',
  'Picolinate form has best bioavailability. Take on empty stomach.',
  'Best absorbed on empty stomach. Can cause nausea if taken without food.',
  'High doses (>40mg) can cause copper deficiency. Take with copper if supplementing long-term.',
  'Low',
  TRUE,
  ARRAY[1, 2, 4], -- Health, Muscle, Focus
  TRUE,
  'supplements.zinc',
  'gender_split',
  15,
  15,
  12,
  8,
  40
WHERE NOT EXISTS (
  SELECT 1 FROM supplements 
  WHERE name_en ILIKE '%zinc%'
);

-- 5. Add Iron (Bisglycinate) if missing
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
  'Iron Bisglycinate',
  'Järn Bisglycinat',
  'Green',
  'Supplement',
  18,
  45,
  'mg',
  'Recommended for women of childbearing age. Take with Vitamin C for better absorption.',
  'Bisglycinate form is gentler on stomach than ferrous sulfate.',
  'Do not take with calcium or coffee. Can cause constipation.',
  'Low',
  TRUE,
  ARRAY[1], -- Health
  TRUE,
  'supplements.iron',
  'fixed',
  18,
  8,
  45
WHERE NOT EXISTS (
  SELECT 1 FROM supplements 
  WHERE name_en ILIKE '%iron%'
);

-- 6. Add CoQ10 if missing
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
  'CoQ10',
  'CoQ10',
  'Green',
  'Supplement',
  200,
  400,
  'mg',
  'Recommended for age 40+ to support mitochondrial function. Take with fat.',
  'Ubiquinol form is better absorbed than ubiquinone.',
  'May interact with blood thinners. Generally safe.',
  'Low',
  FALSE,
  ARRAY[1, 8], -- Health, Anti-Aging
  TRUE,
  'supplements.coq10',
  'fixed',
  200,
  100,
  400
WHERE NOT EXISTS (
  SELECT 1 FROM supplements 
  WHERE (name_en ILIKE '%coq10%' 
     OR name_en ILIKE '%coenzyme q10%'
     OR name_en ILIKE '%ubiquinone%')
);

-- 7. Add Vitamin K2 (MK-7) if missing
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
  'Vitamin K2 (MK-7)',
  'K-vitamin (K2)',
  'Green',
  'Supplement',
  100,
  200,
  'mcg',
  'Recommended for age 40+ to work synergistically with Vitamin D3.',
  'MK-7 form has longer half-life than MK-4.',
  'Do not take with blood thinners (warfarin).',
  'Medium',
  FALSE,
  ARRAY[1, 8], -- Health, Anti-Aging
  TRUE,
  'supplements.vit_k2',
  'fixed',
  100,
  45,
  200
WHERE NOT EXISTS (
  SELECT 1 FROM supplements 
  WHERE (name_en ILIKE '%vitamin k2%' 
     OR name_en ILIKE '%k2%'
     OR name_en ILIKE '%menaquinone%')
);

-- 8. Verify what was added
SELECT 
  id,
  name_en,
  name_sv,
  is_parent,
  i18n_key,
  scaling_algorithm,
  scaling_base_dose,
  is_base_health
FROM supplements
WHERE name_en IN (
  'Vitamin D3',
  'Omega-3 (EPA/DHA)',
  'Magnesium Glycinate',
  'Zinc',
  'Iron Bisglycinate',
  'CoQ10',
  'Vitamin K2 (MK-7)'
)
ORDER BY name_en;
