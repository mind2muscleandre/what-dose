# 🧪 Supplement Logic System - Testing Guide

## Steg 1: Verifiera Databasschema

### 1.1 Kör SQL Verification Script
1. Öppna Supabase Dashboard → SQL Editor
2. Kopiera innehållet från `scripts/verify-supplement-logic.sql`
3. Kör scriptet
4. Verifiera att alla kontroller visar ✅

**Förväntat resultat:**
- ✅ `scaling_algorithm_type` enum exists
- ✅ Alla kolumner finns i `supplements` tabellen
- ✅ `health_conditions` kolumn finns i `profiles` tabellen
- ✅ Index är skapade

### 1.2 Populate Example Data (Om inte redan gjort)
1. Kör `scripts/populate-example-supplements.sql` i Supabase SQL Editor
2. Detta uppdaterar vanliga tillskott med scaling algorithms

---

## Steg 2: Testa Dosage Calculators

### 2.1 Linear Weight Algorithm
**Test i Supabase SQL Editor eller via app:**

1. Hitta ett supplement med `scaling_algorithm = 'linear_weight'` (t.ex. Vitamin D3)
2. Kontrollera att det har:
   - `scaling_base_dose` (t.ex. 2000)
   - `scaling_safe_min` (t.ex. 1000)
   - `scaling_safe_max` (t.ex. 4000)

**Test Cases:**
- **Användare 50kg**: Förväntat: ~1333 IU (2000 * 50/75)
- **Användare 75kg**: Förväntat: 2000 IU (base dose)
- **Användare 100kg**: Förväntat: ~2667 IU (2000 * 100/75)
- **Användare utan vikt**: Förväntat: 2000 IU (fallback till base)

### 2.2 Gender Split Algorithm
**Test med Magnesium:**
1. Hitta Magnesium med `scaling_algorithm = 'gender_split'`
2. Kontrollera `scaling_gender_male` och `scaling_gender_female`

**Test Cases:**
- **Man**: Ska få `scaling_gender_male` dos (t.ex. 420mg)
- **Kvinna**: Ska få `scaling_gender_female` dos (t.ex. 320mg)
- **Inget kön**: Ska få `scaling_base_dose` (fallback)

### 2.3 Fixed Algorithm
**Test med Ashwagandha:**
1. Hitta supplement med `scaling_algorithm = 'fixed'`
2. Kontrollera att dosering alltid är samma oavsett vikt/kön

---

## Steg 3: Testa Basic Health Stack Generation

### 3.1 Test Avatar Rules

**Test Case 1: Kvinna, 30 år, 65kg**
1. Skapa testprofil eller använd befintlig
2. Sätt: `age = 30`, `gender = 'female'`, `weight_kg = 65`
3. Generera stack
4. Verifiera att Basic Health Stack inkluderar:
   - ✅ Vitamin D3 (linear_weight, ska vara ~1733 IU för 65kg)
   - ✅ Omega-3 (linear_weight)
   - ✅ Magnesium (gender_split, ska vara 320mg för kvinna)
   - ✅ Zinc (gender_split)
   - ✅ Iron (kvinna 20-50 år)

**Test Case 2: Man, 25 år, 80kg**
1. Sätt: `age = 25`, `gender = 'male'`, `weight_kg = 80`
2. Generera stack
3. Verifiera:
   - ✅ Iron INTE ingår (man)
   - ✅ Magnesium ska vara 420mg (man)

**Test Case 3: Användare 45 år**
1. Sätt: `age = 45`
2. Generera stack
3. Verifiera:
   - ✅ CoQ10 ingår (age 40+)
   - ✅ K2 ingår (age 40+)

**Test Case 4: Användare 55 år**
1. Sätt: `age = 55`
2. Generera stack
3. Verifiera:
   - ✅ Iron INTE ingår (age 50+)

---

## Steg 4: Testa Goal Stack Generation

### 4.1 Test Category + Subcategory
1. Välj goal: `fitness` → subcategory: `strength`
2. Generera stack
3. Verifiera att supplements från rätt kategori hämtas

### 4.2 Test Evidence Level Filtering
**Test Case 1: Non-Biohacker**
1. Sätt `experience_level = 'intermediate'`
2. Generera stack
3. Verifiera att Red (Experimental) supplements INTE visas

**Test Case 2: Biohacker**
1. Sätt `experience_level = 'biohacker'`
2. Generera stack
3. Verifiera att Red (Experimental) supplements VISAS

---

## Steg 5: Testa Contraindication Filtering

### 5.1 Test SSRI Contraindication
1. Lägg till `health_conditions = ['SSRI']` i profil
2. Generera stack
3. Verifiera att 5-HTP filtreras bort (om det har `contraindications = ['SSRI']`)

### 5.2 Test Blood Thinners
1. Lägg till `health_conditions = ['Blood Thinners']`
2. Generera stack
3. Verifiera att relevanta tillskott filtreras bort

---

## Steg 6: Integration Test

### 6.1 Test Full Stack Generation
1. Skapa komplett profil:
   - Age: 30
   - Gender: female
   - Weight: 65kg
   - Experience: intermediate
   - Goals: fitness → strength
   - Health conditions: null

2. Anropa `buildUserStack()` (eller via onboarding)
3. Verifiera:
   - ✅ Basic Health Stack genereras korrekt
   - ✅ Goal Stack genereras korrekt
   - ✅ Doseringar beräknas korrekt
   - ✅ Inga duplicat
   - ✅ Stack sparas till databasen

---

## Steg 7: Test i Appen

### 7.1 Via Onboarding
1. Skapa nytt konto eller "Create New Stack"
2. Gå igenom onboarding med olika kombinationer:
   - Olika vikter (50kg, 75kg, 100kg)
   - Olika kön (male, female)
   - Olika åldrar (25, 35, 45, 55)
   - Olika experience levels
   - Health conditions

3. Verifiera att genererade doseringar stämmer med algoritmerna

### 7.2 Verifiera i Stack Review
1. Efter stack genereras, gå igenom Stack Review
2. Kontrollera att doseringar visas korrekt
3. Verifiera att "Why Selected" text är korrekt

---

## Checklista för Snabb Testning

### ✅ Schema Verification
- [ ] Kör `verify-supplement-logic.sql`
- [ ] Alla kolumner finns
- [ ] Index är skapade

### ✅ Dosage Calculators
- [ ] Linear weight fungerar (testa 50kg, 75kg, 100kg)
- [ ] Gender split fungerar (testa male/female)
- [ ] Fixed fungerar

### ✅ Basic Health Stack
- [ ] Kvinna 30år får Iron
- [ ] Man får INTE Iron
- [ ] Age 40+ får CoQ10 och K2
- [ ] Age 50+ får INTE Iron

### ✅ Goal Stack
- [ ] Rätt kategori hämtas
- [ ] Red supplements filtreras för non-biohacker
- [ ] Red supplements visas för biohacker

### ✅ Contraindications
- [ ] SSRI filtrerar 5-HTP
- [ ] Health conditions fungerar

### ✅ Integration
- [ ] Full stack genereras korrekt
- [ ] Sparas till databasen
- [ ] Visas i Stack Review

---

## Tips för Testning

1. **Använd Supabase Dashboard** för att direkt se data i databasen
2. **Kontrollera console logs** när stack genereras
3. **Testa edge cases**: null values, missing data, etc.
4. **Verifiera doseringar manuellt** med formler:
   - Linear: `base * (weight / 75)`
   - Gender: `gender_male` eller `gender_female`
   - Fixed: `base_dose`

---

**Nästa steg efter testning**: Om allt fungerar, integrera `buildUserStack()` i onboarding istället för `generateStackFromPredefined()` för att använda det nya systemet.
