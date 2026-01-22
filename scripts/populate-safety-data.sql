-- ==========================================
-- POPULATE SAFETY DATA FOR INTERACTION WARNINGS
-- ==========================================
-- This script populates substances, supplement_substances, and interactions
-- to enable Safety Warnings functionality
-- ==========================================

-- 1. Insert common substances
-- Note: substance_type must be one of: 'medicine', 'supplement', 'herb', 'food', 'enzyme'
INSERT INTO substances (name, name_aliases, substance_type, description)
SELECT * FROM (VALUES
  ('5-HTP', ARRAY['5-hydroxytryptophan', '5HTP'], 'supplement', 'Precursor to serotonin'),
  ('SSRI', ARRAY['Selective Serotonin Reuptake Inhibitor', 'SSRIs'], 'medicine', 'Antidepressant medication class'),
  ('Magnesium', ARRAY['Mg', 'Magnesium ion'], 'supplement', 'Essential mineral'),
  ('Calcium', ARRAY['Ca', 'Calcium ion'], 'supplement', 'Essential mineral'),
  ('Zinc', ARRAY['Zn', 'Zinc ion'], 'supplement', 'Essential mineral'),
  ('Iron', ARRAY['Fe', 'Iron ion'], 'supplement', 'Essential mineral'),
  ('Vitamin D', ARRAY['D3', 'Cholecalciferol', 'Ergocalciferol'], 'supplement', 'Fat-soluble vitamin'),
  ('St. John''s Wort', ARRAY['Hypericum', 'SJW'], 'herb', 'Herbal supplement'),
  ('Warfarin', ARRAY['Coumadin'], 'medicine', 'Blood thinner medication'),
  ('Aspirin', ARRAY['Acetylsalicylic acid'], 'medicine', 'NSAID medication')
) AS v(name, name_aliases, substance_type, description)
WHERE NOT EXISTS (
  SELECT 1 FROM substances WHERE substances.name = v.name
);

-- 2. Map supplements to substances
-- Note: You'll need to adjust supplement IDs based on your actual data
-- This is an example - replace with actual supplement IDs from your database

-- Example: Map 5-HTP supplement to 5-HTP substance
INSERT INTO supplement_substances (supplement_id, substance_id)
SELECT 
  s.id,
  sub.id
FROM supplements s
CROSS JOIN substances sub
WHERE s.name_en ILIKE '%5-htp%' 
  AND s.is_parent = true
  AND sub.name = '5-HTP'
ON CONFLICT (supplement_id, substance_id) DO NOTHING;

-- Example: Map Magnesium supplements to Magnesium substance
INSERT INTO supplement_substances (supplement_id, substance_id)
SELECT 
  s.id,
  sub.id
FROM supplements s
CROSS JOIN substances sub
WHERE s.name_en ILIKE '%magnesium%' 
  AND s.is_parent = true
  AND sub.name = 'Magnesium'
ON CONFLICT (supplement_id, substance_id) DO NOTHING;

-- Example: Map Calcium supplements to Calcium substance
INSERT INTO supplement_substances (supplement_id, substance_id)
SELECT 
  s.id,
  sub.id
FROM supplements s
CROSS JOIN substances sub
WHERE s.name_en ILIKE '%calcium%' 
  AND s.is_parent = true
  AND sub.name = 'Calcium'
ON CONFLICT (supplement_id, substance_id) DO NOTHING;

-- Example: Map Zinc supplements to Zinc substance
INSERT INTO supplement_substances (supplement_id, substance_id)
SELECT 
  s.id,
  sub.id
FROM supplements s
CROSS JOIN substances sub
WHERE s.name_en ILIKE '%zinc%' 
  AND s.is_parent = true
  AND sub.name = 'Zinc'
ON CONFLICT (supplement_id, substance_id) DO NOTHING;

-- Example: Map Iron supplements to Iron substance
INSERT INTO supplement_substances (supplement_id, substance_id)
SELECT 
  s.id,
  sub.id
FROM supplements s
CROSS JOIN substances sub
WHERE s.name_en ILIKE '%iron%' 
  AND s.is_parent = true
  AND sub.name = 'Iron'
ON CONFLICT (supplement_id, substance_id) DO NOTHING;

-- Example: Map Vitamin D supplements to Vitamin D substance
INSERT INTO supplement_substances (supplement_id, substance_id)
SELECT 
  s.id,
  sub.id
FROM supplements s
CROSS JOIN substances sub
WHERE (s.name_en ILIKE '%vitamin d%' OR s.name_en ILIKE '%vitamin d3%')
  AND s.is_parent = true
  AND sub.name = 'Vitamin D'
ON CONFLICT (supplement_id, substance_id) DO NOTHING;

-- 3. Insert interactions between substances
-- Note: severity scale: 1=Very Low, 2=Low, 3=Medium, 4=High, 5=Very High

-- 5-HTP + SSRI interaction (HIGH RISK - Serotonin Syndrome)
INSERT INTO interactions (substance_a_id, substance_b_id, severity, mechanism, description, evidence_level, source)
SELECT 
  a.id,
  b.id,
  5, -- Very High severity
  'Serotonin reuptake inhibition + serotonin precursor',
  'Combining 5-HTP with SSRI medications can cause serotonin syndrome, a potentially life-threatening condition. Symptoms include agitation, confusion, rapid heart rate, and high blood pressure.',
  'high',
  'Medical literature'
FROM substances a, substances b
WHERE a.name = '5-HTP' AND b.name = 'SSRI'
ON CONFLICT (substance_a_id, substance_b_id) DO NOTHING;

-- Also add reverse (SSRI + 5-HTP)
INSERT INTO interactions (substance_a_id, substance_b_id, severity, mechanism, description, evidence_level, source)
SELECT 
  a.id,
  b.id,
  5,
  'Serotonin reuptake inhibition + serotonin precursor',
  'Combining SSRI medications with 5-HTP can cause serotonin syndrome, a potentially life-threatening condition.',
  'high',
  'Medical literature'
FROM substances a, substances b
WHERE a.name = 'SSRI' AND b.name = '5-HTP'
ON CONFLICT (substance_a_id, substance_b_id) DO NOTHING;

-- Magnesium + Calcium interaction (MEDIUM - Absorption competition)
INSERT INTO interactions (substance_a_id, substance_b_id, severity, mechanism, description, evidence_level, source)
SELECT 
  a.id,
  b.id,
  3, -- Medium severity
  'Mineral absorption competition',
  'Taking high doses of magnesium and calcium together can reduce absorption of both minerals. Take them at least 2 hours apart.',
  'medium',
  'Nutritional research'
FROM substances a, substances b
WHERE a.name = 'Magnesium' AND b.name = 'Calcium'
ON CONFLICT (substance_a_id, substance_b_id) DO NOTHING;

-- Zinc + Iron interaction (MEDIUM - Absorption competition)
INSERT INTO interactions (substance_a_id, substance_b_id, severity, mechanism, description, evidence_level, source)
SELECT 
  a.id,
  b.id,
  3,
  'Mineral absorption competition',
  'Zinc and iron compete for absorption. Take them at least 2 hours apart, or take zinc with meals and iron on an empty stomach.',
  'medium',
  'Nutritional research'
FROM substances a, substances b
WHERE a.name = 'Zinc' AND b.name = 'Iron'
ON CONFLICT (substance_a_id, substance_b_id) DO NOTHING;

-- Zinc + Magnesium interaction (LOW - Absorption competition)
INSERT INTO interactions (substance_a_id, substance_b_id, severity, mechanism, description, evidence_level, source)
SELECT 
  a.id,
  b.id,
  2, -- Low severity
  'Mineral absorption competition',
  'Zinc and magnesium can compete for absorption when taken together in high doses. Consider taking them 2-3 hours apart for optimal absorption.',
  'low',
  'Nutritional research'
FROM substances a, substances b
WHERE a.name = 'Zinc' AND b.name = 'Magnesium'
ON CONFLICT (substance_a_id, substance_b_id) DO NOTHING;

-- Also add reverse (Magnesium + Zinc)
INSERT INTO interactions (substance_a_id, substance_b_id, severity, mechanism, description, evidence_level, source)
SELECT 
  a.id,
  b.id,
  2,
  'Mineral absorption competition',
  'Magnesium and zinc can compete for absorption when taken together in high doses. Consider taking them 2-3 hours apart for optimal absorption.',
  'low',
  'Nutritional research'
FROM substances a, substances b
WHERE a.name = 'Magnesium' AND b.name = 'Zinc'
ON CONFLICT (substance_a_id, substance_b_id) DO NOTHING;

-- St. John's Wort + Warfarin interaction (HIGH - Blood thinning)
INSERT INTO interactions (substance_a_id, substance_b_id, severity, mechanism, description, evidence_level, source)
SELECT 
  a.id,
  b.id,
  4, -- High severity
  'CYP450 enzyme induction',
  'St. John''s Wort can reduce the effectiveness of warfarin and other blood thinners, potentially leading to blood clots.',
  'high',
  'Medical literature'
FROM substances a, substances b
WHERE a.name = 'St. John''s Wort' AND b.name = 'Warfarin'
ON CONFLICT (substance_a_id, substance_b_id) DO NOTHING;

-- ==========================================
-- VERIFICATION QUERIES
-- ==========================================

-- Check how many substances were created
SELECT COUNT(*) as substance_count FROM substances;

-- Check how many supplement-substance mappings exist
SELECT COUNT(*) as mapping_count FROM supplement_substances;

-- Check how many interactions exist
SELECT COUNT(*) as interaction_count FROM interactions;

-- View all interactions
SELECT 
  a.name as substance_a,
  b.name as substance_b,
  i.severity,
  i.description
FROM interactions i
JOIN substances a ON i.substance_a_id = a.id
JOIN substances b ON i.substance_b_id = b.id
ORDER BY i.severity DESC;

