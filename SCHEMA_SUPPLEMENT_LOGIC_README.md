# Schema Supplement Logic - Kompatibilitetsguide

## Översikt

`schema_supplement_logic.sql` utökar de befintliga tabellerna `supplements` och `profiles` med nya kolumner för doseringslogik och säkerhetsfiltering.

## Kompatibilitet

✅ **Fungerar med befintliga tabeller:**
- `complete_schema.sql` - Skapar base-tabellerna
- `schema_extensions.sql` - Lägger till parent_id och is_parent till supplements

## Körordning

Kör SQL-filerna i denna ordning:

1. `complete_schema.sql` - Skapar base-tabeller
2. `schema_extensions.sql` - Lägger till hierarkisk sökning
3. `schema_supplement_logic.sql` - Lägger till doseringslogik ⬅️ **NY**

## Vad läggs till?

### supplements-tabellen

Nya kolumner (alla är nullable för bakåtkompatibilitet):

- `i18n_key` - Översättningsnyckel (t.ex. 'supplements.vit_d3')
- `scaling_algorithm` - 'linear_weight', 'gender_split', eller 'fixed'
- `scaling_base_dose` - Basdos för beräkningar
- `scaling_safe_min` / `scaling_safe_max` - Säkerhetsgränser
- `scaling_gender_male` / `scaling_gender_female` - Könsspecifika doser
- `contraindications` - Array av kontraindikationer (t.ex. ['SSRI'])
- `cycling_required` - Boolean för cykling
- `cycling_instruction_key` - i18n-nyckel för cyklinginstruktioner

### profiles-tabellen

Ny kolumn:
- `health_conditions` - Array av hälsotillstånd/mediciner (t.ex. ['SSRI', 'Diabetes'])

## Säkerhet

- Alla `ALTER TABLE` använder `IF NOT EXISTS` - kan köras flera gånger
- Befintliga data påverkas inte
- Nya kolumner är nullable - befintliga queries fungerar fortfarande
- Default-värden sätts automatiskt för nya kolumner

## Användning med befintlig kod

Befintlig kod som använder `supplements` och `profiles` tabellerna fungerar fortfarande:

```typescript
// Befintlig kod fungerar fortfarande
const { data } = await supabase
  .from('supplements')
  .select('id, name_en, dosing_base_val')
  .eq('is_parent', true)

// Nya fält är tillgängliga men optional
const { data } = await supabase
  .from('supplements')
  .select('id, name_en, scaling_algorithm, contraindications')
  .eq('is_parent', true)
```

## Migration av befintlig data

Efter att ha kört SQL-filen kan du gradvis fylla i nya fält:

```sql
-- Exempel: Sätt scaling_algorithm för Vitamin D3
UPDATE supplements 
SET 
  i18n_key = 'supplements.vit_d3',
  scaling_algorithm = 'linear_weight',
  scaling_base_dose = 2000,
  scaling_safe_min = 1000,
  scaling_safe_max = 4000
WHERE name_en ILIKE '%vitamin d3%' 
  AND is_parent = true;
```

## Index

Nya index skapas automatiskt:
- `idx_supplements_i18n_key` - För snabb sökning på i18n_key
- `idx_supplements_contraindications` - GIN-index för array-sökningar
- `idx_profiles_health_conditions` - GIN-index för array-sökningar

## Verifiering

Efter att ha kört SQL-filen, verifiera:

```sql
-- Kolla att kolumnerna finns
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'supplements'
  AND column_name IN ('i18n_key', 'scaling_algorithm', 'contraindications');

-- Kolla att enum-typen finns
SELECT typname FROM pg_type WHERE typname = 'scaling_algorithm_type';

-- Kolla att index finns
SELECT indexname FROM pg_indexes 
WHERE tablename = 'supplements' 
  AND indexname LIKE 'idx_supplements_%';
```
