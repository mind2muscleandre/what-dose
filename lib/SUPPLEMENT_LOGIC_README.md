# Supplement Recommendation Engine

This document describes the supplement recommendation engine that generates personalized stacks based on user profiles.

## Overview

The system consists of two main components:

1. **Basic Health Stack (Foundation)**: Based on Avatar (Age/Gender) and Weight
2. **Goal Stack**: Based on Category + Subcategory + Level

## Database Schema

Run `schema_supplement_logic.sql` to extend the supplements table with:

- `i18n_key`: Translation key (e.g., `supplements.vit_d3`)
- `scaling_algorithm`: `linear_weight`, `gender_split`, or `fixed`
- `scaling_base_dose`: Base dose for calculations
- `scaling_safe_min` / `scaling_safe_max`: Safety bounds
- `scaling_gender_male` / `scaling_gender_female`: Gender-specific doses
- `contraindications`: Array of contraindication flags (e.g., `['SSRI', 'Blood Thinners']`)
- `cycling_required`: Boolean for cycling requirements
- `cycling_instruction_key`: i18n key for cycling instructions

The `profiles` table is extended with:
- `health_conditions`: Array of user's health conditions/medications

## Evidence Levels

We use the existing `research_status` field:
- **Green** = Level A (Strong evidence) - Safe to scale
- **Blue** = Level B (Moderate evidence) - Safe ranges
- **Red** = Level C (Experimental) - Fixed dose only, requires warnings, only shown to Biohacker level users

## Dosage Calculation Algorithms

### 1. `linear_weight`
Formula: `calculated_dose = base_dose * (user_weight / 75.0)`
- Clamps result between `safe_min` and `safe_max`
- Used for: Vitamin D3, Omega-3, Electrolytes

### 2. `gender_split`
Returns specific fixed dosage based on biological sex:
- Uses `scaling_gender_male` or `scaling_gender_female`
- Used for: Multivitamins, Magnesium, Zinc

### 3. `fixed`
No scaling. Returns `base_dose`.
- Used for: Nootropics, Ashwagandha, Experimental supplements

## Avatar Rules

### Iron Requirements
- **Women 20-50**: Require Iron (unless post-menopausal)
- **Men & Women 50+**: NO Iron

### Age-Based Additions
- **Age 40+**: Add CoQ10 and K2

### Weight Scaling
Applies to: Vitamin D3, Omega-3, Creatine, etc.

## Safety Filtering

1. **Contraindications**: If a user has "SSRI" in their `health_conditions`, supplements with `contraindications: ['SSRI']` are automatically filtered out (e.g., 5-HTP, SAM-e).

2. **Evidence Level Filtering**: Red (Experimental) supplements are only shown to users with `experience_level = 'biohacker'`.

## Usage

### Building a Stack

```typescript
import { buildUserStack, saveStackToDatabase } from './lib/stack-builder'

const profile = {
  id: userId,
  age: 35,
  weight_kg: 75,
  gender: 'male',
  experience_level: 'intermediate',
  health_conditions: null,
  selected_goals: ['fitness']
}

const result = await buildUserStack(
  userId,
  profile,
  'fitness',      // goalCategory
  'strength',     // goalSubcategory
  'intermediate'  // goalLevel
)

if (result.success) {
  // Save to database
  const allItems = [...result.basicHealthStack, ...result.goalStack]
  await saveStackToDatabase(userId, allItems)
}
```

### Calculating Dosage

```typescript
import { calculateDosageFromSupplement } from './lib/dosage-calculator'

const dosageResult = calculateDosageFromSupplement(
  supplement,      // Database supplement row
  userWeight,      // 75 kg
  'male'           // Gender
)

// Returns: { calculatedDose: 2000, unit: 'IU', algorithm: 'linear_weight', wasClamped: false }
```

### Getting Translations

```typescript
import { getSupplementName, getSupplementEffect } from './lib/supplement-translations'

const name = getSupplementName(
  supplement.i18n_key,  // 'supplements.vit_d3'
  'en',                  // Language
  supplement.name_en,    // Fallback
  supplement.name_sv     // Fallback
)
```

## Translation Keys

Add supplement translations to `lib/translations.ts` following this structure:

```typescript
supplements: {
  vit_d3: {
    name: "Vitamin D3",
    effect: "Immune & Mood Support",
    why_dosage: "Adjusted for your body weight to ensure optimal absorption."
  },
  turkesterone: {
    name: "Turkesterone",
    warning: "Experimental supplement. Limited human data available."
  }
}
```

Or use the helper functions in `lib/supplement-translations.ts` which include example translations.

## Integration with Existing System

This system works alongside the existing `predefined-stacks.ts` system. You can:

1. Use the new `StackBuilder` for automatic stack generation based on user profile
2. Continue using `generateStackFromPredefined` for predefined stack templates
3. Users can still manually add supplements to their stack

The new system provides:
- Automatic dosage calculation based on weight/gender
- Safety filtering (contraindications)
- Evidence-based recommendations
- Avatar-based foundation stack
