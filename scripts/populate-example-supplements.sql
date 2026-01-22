-- ==========================================
-- POPULATE EXAMPLE SUPPLEMENTS
-- ==========================================
-- Example script to populate some common supplements with scaling logic
-- Adjust these values based on your supplement database
-- ==========================================

-- Example 1: Vitamin D3 (linear_weight scaling)
UPDATE supplements 
SET 
  i18n_key = 'supplements.vit_d3',
  scaling_algorithm = 'linear_weight',
  scaling_base_dose = 2000, -- Base dose for 75kg person
  scaling_safe_min = 1000,  -- Minimum safe dose
  scaling_safe_max = 4000,  -- Maximum safe dose
  cycling_required = false
WHERE name_en ILIKE '%vitamin d3%' 
  AND is_parent = true
  AND (i18n_key IS NULL OR i18n_key = '');

-- Example 2: Omega-3 (linear_weight scaling)
UPDATE supplements 
SET 
  i18n_key = 'supplements.omega_3',
  scaling_algorithm = 'linear_weight',
  scaling_base_dose = 1000, -- Base dose for 75kg person (EPA+DHA)
  scaling_safe_min = 500,
  scaling_safe_max = 3000,
  cycling_required = false
WHERE (name_en ILIKE '%omega-3%' OR name_en ILIKE '%omega 3%' OR name_en ILIKE '%fish oil%')
  AND is_parent = true
  AND (i18n_key IS NULL OR i18n_key = '');

-- Example 3: Magnesium (gender_split scaling)
UPDATE supplements 
SET 
  i18n_key = 'supplements.magnesium',
  scaling_algorithm = 'gender_split',
  scaling_base_dose = 400, -- Fallback if gender not specified
  scaling_gender_male = 420,  -- Slightly higher for men
  scaling_gender_female = 320, -- Lower for women
  scaling_safe_min = 200,
  scaling_safe_max = 600,
  cycling_required = false
WHERE name_en ILIKE '%magnesium%'
  AND is_parent = true
  AND (i18n_key IS NULL OR i18n_key = '');

-- Example 4: Zinc (gender_split scaling)
UPDATE supplements 
SET 
  i18n_key = 'supplements.zinc',
  scaling_algorithm = 'gender_split',
  scaling_base_dose = 15,
  scaling_gender_male = 15,  -- Standard for men
  scaling_gender_female = 12, -- Lower for women
  scaling_safe_min = 8,
  scaling_safe_max = 40,
  cycling_required = false
WHERE name_en ILIKE '%zinc%'
  AND is_parent = true
  AND (i18n_key IS NULL OR i18n_key = '');

-- Example 5: Iron (fixed dose, only for women 20-50)
UPDATE supplements 
SET 
  i18n_key = 'supplements.iron',
  scaling_algorithm = 'fixed',
  scaling_base_dose = 18,
  scaling_safe_min = 8,
  scaling_safe_max = 45,
  cycling_required = false
WHERE name_en ILIKE '%iron%'
  AND is_parent = true
  AND (i18n_key IS NULL OR i18n_key = '');

-- Example 6: CoQ10 (fixed dose, age 40+)
UPDATE supplements 
SET 
  i18n_key = 'supplements.coq10',
  scaling_algorithm = 'fixed',
  scaling_base_dose = 200,
  scaling_safe_min = 100,
  scaling_safe_max = 400,
  cycling_required = false
WHERE (name_en ILIKE '%coq10%' OR name_en ILIKE '%coenzyme q10%' OR name_en ILIKE '%ubiquinone%')
  AND is_parent = true
  AND (i18n_key IS NULL OR i18n_key = '');

-- Example 7: Vitamin K2 (fixed dose, age 40+)
UPDATE supplements 
SET 
  i18n_key = 'supplements.vit_k2',
  scaling_algorithm = 'fixed',
  scaling_base_dose = 100, -- mcg
  scaling_safe_min = 45,
  scaling_safe_max = 200,
  cycling_required = false
WHERE (name_en ILIKE '%vitamin k2%' OR name_en ILIKE '%k2%' OR name_en ILIKE '%menaquinone%')
  AND is_parent = true
  AND (i18n_key IS NULL OR i18n_key = '');

-- Example 8: 5-HTP (contraindicated with SSRI, fixed dose)
UPDATE supplements 
SET 
  i18n_key = 'supplements.5_htp',
  scaling_algorithm = 'fixed',
  scaling_base_dose = 200,
  scaling_safe_min = 50,
  scaling_safe_max = 400,
  contraindications = ARRAY['SSRI'], -- Important: contraindicated with SSRIs
  cycling_required = false
WHERE (name_en ILIKE '%5-htp%' OR name_en ILIKE '%5htp%')
  AND is_parent = true
  AND (i18n_key IS NULL OR i18n_key = '');

-- Example 9: Creatine (linear_weight scaling)
UPDATE supplements 
SET 
  i18n_key = 'supplements.creatine',
  scaling_algorithm = 'linear_weight',
  scaling_base_dose = 5000, -- 5g base for 75kg person
  scaling_safe_min = 3000,
  scaling_safe_max = 10000,
  cycling_required = false
WHERE name_en ILIKE '%creatine%'
  AND is_parent = true
  AND (i18n_key IS NULL OR i18n_key = '');

-- Example 10: Ashwagandha (fixed dose, experimental/Red status might need cycling)
UPDATE supplements 
SET 
  i18n_key = 'supplements.ashwagandha',
  scaling_algorithm = 'fixed',
  scaling_base_dose = 600,
  scaling_safe_min = 300,
  scaling_safe_max = 1200,
  cycling_required = true, -- May need cycling
  cycling_instruction_key = 'supplements.ashwagandha.cycling'
WHERE name_en ILIKE '%ashwagandha%'
  AND is_parent = true
  AND (i18n_key IS NULL OR i18n_key = '');

-- Verify updates
SELECT 
  name_en,
  i18n_key,
  scaling_algorithm,
  scaling_base_dose,
  contraindications,
  cycling_required
FROM supplements
WHERE i18n_key IS NOT NULL
ORDER BY i18n_key;
