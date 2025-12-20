# Guide: Kategorisera Alla Supplements

## Översikt

Detta guide beskriver hur man säkerställer att alla supplements i Supabase är korrekt kategoriserade och kopplade till underkategorier.

## Process

### Steg 1: Analysera Nuvarande Status

Kör scriptet för att se vilka supplements som saknar kategorier:

```bash
npx tsx scripts/categorize-all-supplements.ts
```

Detta kommer att visa:
- ✅ Supplements som redan är kategoriserade
- ⚠️ Supplements som saknar category_ids
- 📊 Statistik över kategori-distribution
- 🎯 Mapping till underkategorier
- 💾 SQL-statements för att uppdatera okategoriserade supplements

### Steg 2: Granska Förslag

Scriptet kommer att föreslå kategorier baserat på supplement-namn. Granska dessa förslag och justera vid behov.

### Steg 3: Uppdatera Okategoriserade Supplements

1. Kopiera SQL-statements från script-utdata
2. Öppna Supabase SQL Editor
3. Klistra in och kör UPDATE-statements
4. Verifiera med verifierings-queries i `update-uncategorized-supplements.sql`

### Steg 4: Verifiera

Kör verifierings-queries för att säkerställa att alla supplements är kategoriserade:

```sql
-- Hitta supplements utan kategorier
SELECT id, name_en, category_ids
FROM supplements 
WHERE category_ids IS NULL 
   OR array_length(category_ids, 1) IS NULL;
```

## Kategorier

### Category 1: Health (Base Health)
- **Beskrivning**: Grundläggande hälsosupplements som passar alla
- **Mappning till underkategorier**: 
  - Fitness: recovery
  - Cognitive: mood, productivity
  - Longevity: healthspan
  - Sleep: quality
- **Exempel**: Multivitaminer, Omega-3, Vitamin D, Magnesium (generellt)

### Category 2: Muscle
- **Beskrivning**: Supplements för muskelbyggnad och styrka
- **Mappning till underkategorier**:
  - Fitness: strength, hypertrophy, recovery
- **Exempel**: Creatine, BCAA, Whey Protein, HMB

### Category 3: Performance
- **Beskrivning**: Supplements för atletisk prestation och uthållighet
- **Mappning till underkategorier**:
  - Fitness: strength, endurance, recovery
- **Exempel**: Caffeine, Beta-Alanine, Beetroot, CoQ10

### Category 4: Focus
- **Beskrivning**: Supplements för kognitiv funktion och fokus
- **Mappning till underkategorier**:
  - Cognitive: memory, focus, productivity
- **Exempel**: Caffeine, L-Theanine, Bacopa, ALCAR

### Category 5: Stress
- **Beskrivning**: Supplements för stresshantering och humör
- **Mappning till underkategorier**:
  - Cognitive: mood
- **Exempel**: Ashwagandha, 5-HTP, Rhodiola, CBD Oil

### Category 6: Metabolic
- **Beskrivning**: Supplements för metabolism och energi
- **Mappning till underkategorier**:
  - Longevity: energy, healthspan
- **Exempel**: Berberine, Alpha-Lipoic Acid, Benfotiamine

### Category 7: Sleep
- **Beskrivning**: Supplements för sömn
- **Mappning till underkategorier**:
  - Sleep: quality, duration, deepSleep, fallingAsleep
- **Exempel**: Melatonin, Magnesium, 5-HTP, Glycine

### Category 8: Anti-Aging
- **Beskrivning**: Supplements för åldrande och longevity
- **Mappning till underkategorier**:
  - Longevity: antiAging, longevity, healthspan
- **Exempel**: NMN, Resveratrol, Quercetin, Astaxanthin

### Category 9: Joints
- **Beskrivning**: Supplements för ledhälsa
- **Mappning till underkategorier**:
  - Fitness: recovery
- **Exempel**: Glucosamine, Chondroitin, Curcumin, MSM

## Best Practices

### 1. Multi-Category Supplements
Många supplements kan tillhöra flera kategorier. Använd array med flera category_ids:
```sql
UPDATE supplements SET category_ids = ARRAY[2, 3] WHERE id = 123; -- Muscle + Performance
```

### 2. Base Health Supplements
Markera grundläggande hälsosupplements med `is_base_health = true`:
```sql
UPDATE supplements SET is_base_health = true, category_ids = ARRAY[1] WHERE id = 456;
```

### 3. Prioritering
När ett supplement passar flera kategorier:
- Lägg till alla relevanta category_ids
- Systemet kommer automatiskt att mappa till alla relevanta underkategorier

### 4. Verifiering
Efter uppdateringar, verifiera att:
- Inga supplements saknar category_ids
- Alla supplements har minst en kategori
- Multi-category supplements är korrekt mappade

## Exempel: Uppdatera ett Supplement

```sql
-- Exempel: Creatine Monohydrate
-- Detta supplement passar både Muscle (styrka) och Performance (prestation)
UPDATE supplements 
SET category_ids = ARRAY[2, 3] 
WHERE name_en = 'Creatine Monohydrate';

-- Verifiera
SELECT id, name_en, category_ids 
FROM supplements 
WHERE name_en = 'Creatine Monohydrate';
```

## Automatisk Mappning

När ett supplement har category_ids, mappas det automatiskt till underkategorier via `categoryToSubcategoryMap` i `lib/supplement-category-mapper.ts`.

Exempel:
- Supplement med `category_ids = [2, 3]` mappas automatiskt till:
  - Fitness: strength, hypertrophy, endurance, recovery

## Troubleshooting

### Problem: Supplement visas inte i rätt underkategori
**Lösning**: Kontrollera att category_ids är korrekt satta och matchar mappningen i `categoryToSubcategoryMap`

### Problem: Supplement saknar kategori helt
**Lösning**: 
1. Kör `categorize-all-supplements.ts` för att se förslag
2. Manuellt lägg till kategori baserat på supplementets funktion
3. Uppdatera i Supabase

### Problem: Supplement passar flera kategorier
**Lösning**: Det är OK! Lägg till alla relevanta category_ids i arrayen. Systemet hanterar multi-category supplements automatiskt.

## Nästa Steg

Efter att alla supplements är kategoriserade:
1. ✅ Verifiera att inga supplements saknar kategorier
2. ✅ Uppdatera `lib/subcategory-supplements.ts` med specifika supplement-namn om önskat
3. ✅ Testa stack-generering i onboarding för att se att rätt supplements väljs
