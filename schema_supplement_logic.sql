-- ==========================================
-- SUPPLEMENT LOGIC EXTENSIONS
-- ==========================================
-- Extends supplements table with evidence levels, scaling algorithms, and safety data
-- Run this after complete_schema.sql and schema_extensions.sql
-- ==========================================

-- 1. Add scaling algorithm enum
DO $$ BEGIN
  CREATE TYPE scaling_algorithm_type AS ENUM ('linear_weight', 'gender_split', 'fixed');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Extend supplements table with new fields
-- Note: We use existing research_status for evidence levels:
-- Green = Strong evidence (Level A), Blue = Moderate (Level B), Red = Experimental (Level C)
-- This works with existing supplements table from complete_schema.sql and schema_extensions.sql
ALTER TABLE supplements
  ADD COLUMN IF NOT EXISTS i18n_key TEXT, -- e.g., 'supplements.vit_d3'
  ADD COLUMN IF NOT EXISTS scaling_algorithm scaling_algorithm_type DEFAULT 'fixed',
  ADD COLUMN IF NOT EXISTS scaling_base_dose NUMERIC, -- Base dose for scaling calculations
  ADD COLUMN IF NOT EXISTS scaling_safe_min NUMERIC, -- Minimum safe dose
  ADD COLUMN IF NOT EXISTS scaling_safe_max NUMERIC, -- Maximum safe dose
  ADD COLUMN IF NOT EXISTS scaling_gender_male NUMERIC, -- Fixed dose for males (gender_split)
  ADD COLUMN IF NOT EXISTS scaling_gender_female NUMERIC, -- Fixed dose for females (gender_split)
  ADD COLUMN IF NOT EXISTS contraindications TEXT[], -- Array of contraindication flags (e.g., ['SSRI', 'Blood Thinners'])
  ADD COLUMN IF NOT EXISTS cycling_required BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS cycling_instruction_key TEXT; -- i18n key for cycling instructions

-- Set default values for existing rows (if columns were just added)
UPDATE supplements 
SET scaling_algorithm = 'fixed' 
WHERE scaling_algorithm IS NULL;

UPDATE supplements 
SET cycling_required = FALSE 
WHERE cycling_required IS NULL;

-- 3. Add index for i18n_key for faster lookups
CREATE INDEX IF NOT EXISTS idx_supplements_i18n_key ON supplements(i18n_key) WHERE i18n_key IS NOT NULL;

-- 4. Add index for contraindications (GIN index for array searches)
CREATE INDEX IF NOT EXISTS idx_supplements_contraindications ON supplements USING GIN(contraindications);

-- 5. Add health conditions to profiles table for contraindication filtering
-- This works with existing profiles table from complete_schema.sql
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS health_conditions TEXT[]; -- Array of conditions (e.g., ['SSRI', 'Diabetes'])

-- 6. Add index for health_conditions
CREATE INDEX IF NOT EXISTS idx_profiles_health_conditions ON profiles USING GIN(health_conditions);

-- 7. Add comments for documentation
COMMENT ON COLUMN supplements.i18n_key IS 'Translation key for supplement name and metadata (e.g., supplements.vit_d3)';
COMMENT ON COLUMN supplements.research_status IS 'Evidence level: Green (Strong/Level A), Blue (Moderate/Level B), Red (Experimental/Level C). Yellow is also available but typically not used for evidence levels.';
COMMENT ON COLUMN supplements.scaling_algorithm IS 'Algorithm for dosage calculation: linear_weight, gender_split, or fixed';
COMMENT ON COLUMN supplements.scaling_base_dose IS 'Base dose for scaling calculations (used with linear_weight)';
COMMENT ON COLUMN supplements.scaling_safe_min IS 'Minimum safe dose (clamps linear_weight calculations)';
COMMENT ON COLUMN supplements.scaling_safe_max IS 'Maximum safe dose (clamps linear_weight calculations)';
COMMENT ON COLUMN supplements.scaling_gender_male IS 'Fixed dose for males (used with gender_split algorithm)';
COMMENT ON COLUMN supplements.scaling_gender_female IS 'Fixed dose for females (used with gender_split algorithm)';
COMMENT ON COLUMN supplements.contraindications IS 'Array of contraindication flags that should exclude this supplement';
COMMENT ON COLUMN supplements.cycling_required IS 'Whether this supplement requires cycling (typically Level C)';
COMMENT ON COLUMN profiles.health_conditions IS 'Array of health conditions/medications that affect supplement recommendations';
