-- ==========================================
-- UPDATE: process_supplement_import_batch function
-- ==========================================
-- This updates the existing function to properly link variants to parents
-- and parse dosing values correctly.
-- ==========================================

CREATE OR REPLACE FUNCTION process_supplement_import_batch(batch_id UUID)
RETURNS TABLE(processed_count INTEGER, error_count INTEGER, parents_created INTEGER, variants_created INTEGER) AS $$
DECLARE
  processed_count INTEGER := 0;
  error_count INTEGER := 0;
  parents_created INTEGER := 0;
  variants_created INTEGER := 0;
  row_rec RECORD;
  parent_supplement_id BIGINT;
BEGIN
  -- First pass: Identify and create parent supplements
  FOR row_rec IN 
    SELECT id, row_data, parent_supplement_name, is_parent
    FROM supplement_import_staging 
    WHERE import_batch_id = batch_id 
      AND processed = FALSE 
      AND is_parent = TRUE
    ORDER BY row_data->>'name_en'
  LOOP
    BEGIN
      -- Insert parent supplement
      INSERT INTO supplements (
        name_sv, name_en, research_status, regulatory_status,
        dosing_base_val, dosing_max_val, unit,
        dosing_notes, bioavailability_notes, interaction_risk_text, 
        interaction_risk_level, is_base_health, category_ids, is_parent
      )
      VALUES (
        row_rec.row_data->>'name_sv',
        row_rec.row_data->>'name_en',
        COALESCE((row_rec.row_data->>'research_status')::research_status_type, 'Blue'::research_status_type),
        'Supplement'::regulatory_type,
        COALESCE((row_rec.row_data->>'dosing_base_val')::NUMERIC, NULL),
        COALESCE((row_rec.row_data->>'dosing_max_val')::NUMERIC, NULL),
        COALESCE((row_rec.row_data->>'unit')::unit_type, NULL),
        row_rec.row_data->>'description',
        row_rec.row_data->>'bioavailability',
        row_rec.row_data->>'interaction_risk',
        COALESCE((row_rec.row_data->>'interaction_risk_level')::risk_level_type, 'Low'::risk_level_type),
        COALESCE((row_rec.row_data->>'is_base_health')::BOOLEAN, FALSE),
        string_to_array(row_rec.row_data->>'category_ids', ';')::INT[],
        TRUE
      )
      ON CONFLICT DO NOTHING
      RETURNING id INTO parent_supplement_id;
      
      IF parent_supplement_id IS NULL THEN
        -- Parent already exists, fetch its ID
        SELECT id INTO parent_supplement_id 
        FROM supplements 
        WHERE name_en = row_rec.row_data->>'name_en' 
          AND parent_id IS NULL
        LIMIT 1;
      ELSE
        parents_created := parents_created + 1;
      END IF;
      
      -- Update staging record with parent_id
      UPDATE supplement_import_staging 
      SET suggested_parent_id = parent_supplement_id,
          processed = TRUE, 
          processed_at = NOW()
      WHERE id = row_rec.id;
      
      processed_count := processed_count + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE supplement_import_staging 
      SET processed = TRUE, processing_error = SQLERRM, processed_at = NOW()
      WHERE id = row_rec.id;
      error_count := error_count + 1;
    END;
  END LOOP;
  
  -- Second pass: Link variants to their parents by parent_supplement_name
  UPDATE supplement_import_staging s
  SET suggested_parent_id = p.id
  FROM supplements p
  WHERE s.import_batch_id = batch_id
    AND s.processed = FALSE
    AND s.is_parent = FALSE
    AND s.parent_supplement_name IS NOT NULL
    AND p.name_en = s.parent_supplement_name
    AND p.parent_id IS NULL
    AND p.is_parent = TRUE;
  
  -- Third pass: Create variant supplements with parent_id
  FOR row_rec IN 
    SELECT id, row_data, suggested_parent_id
    FROM supplement_import_staging 
    WHERE import_batch_id = batch_id 
      AND processed = FALSE 
      AND is_parent = FALSE
      AND suggested_parent_id IS NOT NULL
  LOOP
    BEGIN
      -- Insert variant supplement
      INSERT INTO supplements (
        parent_id, name_sv, name_en, research_status, regulatory_status,
        dosing_base_val, dosing_max_val, unit,
        dosing_notes, bioavailability_notes, interaction_risk_text, 
        interaction_risk_level, is_base_health, category_ids, is_parent
      )
      VALUES (
        row_rec.suggested_parent_id,
        row_rec.row_data->>'name_sv',
        row_rec.row_data->>'name_en',
        COALESCE((row_rec.row_data->>'research_status')::research_status_type, 'Blue'::research_status_type),
        'Supplement'::regulatory_type,
        COALESCE((row_rec.row_data->>'dosing_base_val')::NUMERIC, NULL),
        COALESCE((row_rec.row_data->>'dosing_max_val')::NUMERIC, NULL),
        COALESCE((row_rec.row_data->>'unit')::unit_type, NULL),
        row_rec.row_data->>'description',
        row_rec.row_data->>'bioavailability',
        row_rec.row_data->>'interaction_risk',
        COALESCE((row_rec.row_data->>'interaction_risk_level')::risk_level_type, 'Low'::risk_level_type),
        COALESCE((row_rec.row_data->>'is_base_health')::BOOLEAN, FALSE),
        string_to_array(row_rec.row_data->>'category_ids', ';')::INT[],
        FALSE
      );
      
      variants_created := variants_created + 1;
      
      UPDATE supplement_import_staging 
      SET processed = TRUE, processed_at = NOW()
      WHERE id = row_rec.id;
      
      processed_count := processed_count + 1;
    EXCEPTION WHEN OTHERS THEN
      UPDATE supplement_import_staging 
      SET processed = TRUE, processing_error = SQLERRM, processed_at = NOW()
      WHERE id = row_rec.id;
      error_count := error_count + 1;
    END;
  END LOOP;
  
  RETURN QUERY SELECT processed_count, error_count, parents_created, variants_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
