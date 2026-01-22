# Nästa Steg - Supplement Logic System

Nu när SQL-schemat är kört, här är nästa steg för att börja använda systemet:

## 1. Verifiera Installation

Kör verifieringsscriptet för att säkerställa att allt är korrekt:

```sql
-- Kör i Supabase SQL Editor
\i scripts/verify-supplement-logic.sql
```

Eller kopiera innehållet från `scripts/verify-supplement-logic.sql` och kör det.

## 2. Populera Supplement Data

Du behöver fylla i de nya fälten för dina supplements. Du kan:

### Alternativ A: Använd exempelscriptet
Kör `scripts/populate-example-supplements.sql` för att sätta exempeldata för vanliga supplements:

```sql
\i scripts/populate-example-supplements.sql
```

### Alternativ B: Uppdatera manuellt
Uppdatera supplements en i taget:

```sql
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

## 3. Integrera i Din Kod

### Exempel: Använd Stack Builder i Onboarding

```typescript
import { buildUserStack, saveStackToDatabase } from '@/lib/stack-builder'
import type { UserProfile } from '@/lib/stack-builder'

// I din onboarding-komponent
const createPersonalizedStack = async (userId: string, profileData: any) => {
  const profile: UserProfile = {
    id: userId,
    age: profileData.age,
    weight_kg: profileData.weight_kg,
    gender: profileData.gender,
    experience_level: profileData.experience_level,
    health_conditions: profileData.health_conditions || null, // e.g., ['SSRI']
    selected_goals: profileData.selected_goals
  }

  // Bygg stack baserat på användarens profil
  const result = await buildUserStack(
    userId,
    profile,
    profileData.goalCategory,      // t.ex. 'fitness'
    profileData.goalSubcategory,    // t.ex. 'strength'
    profileData.experience_level    // t.ex. 'intermediate'
  )

  if (result.success) {
    // Kombinera basic health stack och goal stack
    const allItems = [...result.basicHealthStack, ...result.goalStack]
    
    // Spara till databas
    const saveResult = await saveStackToDatabase(userId, allItems)
    
    if (saveResult.success) {
      console.log('Stack created successfully!')
      console.log('Basic Health:', result.basicHealthStack.length, 'items')
      console.log('Goal Stack:', result.goalStack.length, 'items')
    } else {
      console.error('Error saving stack:', saveResult.error)
    }
  } else {
    console.error('Errors building stack:', result.errors)
    console.warn('Warnings:', result.warnings)
  }
}
```

### Exempel: Beräkna Dosage för Ett Supplement

```typescript
import { calculateDosageFromSupplement } from '@/lib/dosage-calculator'

// Hämta supplement från databas
const { data: supplement } = await supabase
  .from('supplements')
  .select('*')
  .eq('id', supplementId)
  .single()

if (supplement) {
  // Beräkna dosering baserat på användarens vikt och kön
  const dosageResult = calculateDosageFromSupplement(
    {
      scaling_algorithm: supplement.scaling_algorithm,
      scaling_base_dose: supplement.scaling_base_dose,
      dosing_base_val: supplement.dosing_base_val,
      scaling_safe_min: supplement.scaling_safe_min,
      scaling_safe_max: supplement.scaling_safe_max,
      scaling_gender_male: supplement.scaling_gender_male,
      scaling_gender_female: supplement.scaling_gender_female,
      unit: supplement.unit
    },
    userWeight,  // t.ex. 75 kg
    userGender   // 'male' | 'female' | 'other'
  )

  if (dosageResult) {
    console.log(`Recommended dose: ${dosageResult.calculatedDose} ${dosageResult.unit}`)
    console.log(`Algorithm: ${dosageResult.algorithm}`)
  }
}
```

### Exempel: Använd Översättningar

```typescript
import { getSupplementName, getSupplementEffect } from '@/lib/supplement-translations'
import { useTranslation } from '@/lib/translations'

function SupplementCard({ supplement }: { supplement: any }) {
  const { lang } = useTranslation()
  
  // Hämta översatt namn
  const name = getSupplementName(
    supplement.i18n_key,
    lang,
    supplement.name_en,
    supplement.name_sv
  )
  
  // Hämta effektbeskrivning
  const effect = getSupplementEffect(supplement.i18n_key, lang)
  
  return (
    <div>
      <h3>{name}</h3>
      {effect && <p>{effect}</p>}
    </div>
  )
}
```

## 4. Lägg till Översättningar

Lägg till supplement-översättningar i `lib/translations.ts`:

```typescript
export const translations = {
  en: {
    // ... existing translations ...
    supplements: {
      vit_d3: {
        name: "Vitamin D3",
        effect: "Immune & Mood Support",
        why_dosage: "Adjusted for your body weight to ensure optimal absorption."
      },
      omega_3: {
        name: "Omega-3",
        effect: "Heart & Brain Health",
        why_dosage: "Scaled based on your weight and activity level."
      }
      // ... more supplements ...
    }
  },
  sv: {
    // ... existing translations ...
    supplements: {
      vit_d3: {
        name: "D-vitamin (D3)",
        effect: "Stöd för immunförsvar och humör",
        why_dosage: "Justerad efter din kroppsvikt för att säkerställa optimalt upptag."
      }
      // ... more supplements ...
    }
  }
}
```

Eller använd helper-funktionerna i `lib/supplement-translations.ts` som redan har exempel.

## 5. Testa Systemet

### Test Basic Health Stack

```typescript
// Test för kvinna, 30 år, 65 kg
const testProfile: UserProfile = {
  id: 'test-user-id',
  age: 30,
  weight_kg: 65,
  gender: 'female',
  experience_level: 'intermediate',
  health_conditions: null,
  selected_goals: null
}

const result = await buildUserStack('test-user-id', testProfile)
// Bör inkludera: Vitamin D3, Omega-3, Magnesium, Zinc, Iron (kvinna 20-50)
```

### Test med Kontraindikationer

```typescript
// Test för användare med SSRI
const ssriProfile: UserProfile = {
  id: 'test-user-id',
  age: 35,
  weight_kg: 70,
  gender: 'male',
  experience_level: 'intermediate',
  health_conditions: ['SSRI'], // Viktigt!
  selected_goals: ['cognitive']
}

const result = await buildUserStack('test-user-id', ssriProfile)
// 5-HTP bör vara filtrerad bort (contraindicated with SSRI)
```

### Test Experimental Supplements

```typescript
// Test för Biohacker (ska se Red/Experimental supplements)
const biohackerProfile: UserProfile = {
  id: 'test-user-id',
  age: 40,
  weight_kg: 80,
  gender: 'male',
  experience_level: 'biohacker', // Viktigt!
  health_conditions: null,
  selected_goals: ['longevity']
}

const result = await buildUserStack('test-user-id', biohackerProfile)
// Bör inkludera Red-status supplements
```

## 6. Integration med Befintlig Kod

Systemet är designat för att fungera **tillsammans** med ditt befintliga system:

- ✅ Användare kan fortfarande lägga till supplements manuellt
- ✅ `predefined-stacks.ts` fungerar fortfarande
- ✅ `generateStackFromPredefined` fungerar fortfarande
- ✅ Nya systemet ger **automatiska, personaliserade** rekommendationer

Du kan använda båda systemen parallellt eller gradvis migrera till det nya systemet.

## 7. Checklista

- [ ] Verifierat att SQL-schemat är korrekt installerat
- [ ] Populerat minst några supplements med scaling data
- [ ] Testat `buildUserStack()` med olika profiler
- [ ] Testat kontraindikationsfiltering
- [ ] Testat evidence level filtering (Red för Biohacker)
- [ ] Lagt till översättningar för vanliga supplements
- [ ] Integrerat i onboarding-flöde
- [ ] Testat med riktiga användare

## Support

Om du stöter på problem:
1. Kolla `scripts/verify-supplement-logic.sql` för att verifiera installation
2. Se `lib/SUPPLEMENT_LOGIC_README.md` för detaljerad dokumentation
3. Se `SCHEMA_SUPPLEMENT_LOGIC_README.md` för schema-detaljer
