# Subcategory to Supplement Mapping

## Översikt

Detta dokument beskriver hur underkategorier kopplas till specifika supplements i WhatDose-appen.

## Struktur

Mappningen finns i `lib/subcategory-supplements.ts` och definierar vilka supplements som rekommenderas för varje underkategori.

## Hur det fungerar

1. **Användaren väljer mål och underkategorier** i onboarding
2. **Systemet söker efter supplements** baserat på:
   - Först: Specifika supplement-namn från mappningen (exakt matchning)
   - Sedan: Partiell matchning av supplement-namn
   - Slutligen: Fallback till category_ids om namn inte hittas

3. **Supplements prioriteras**:
   - Subcategory-specifika supplements (högsta prioritet)
   - Base health supplements
   - Goal-specific supplements

## Lägga till nya supplements

För att lägga till ett nytt supplement till en underkategori, uppdatera `subcategorySupplementMap` i `lib/subcategory-supplements.ts`:

```typescript
{
  goalId: "fitness",          // Målet (fitness, cognitive, longevity, sleep)
  subcategoryId: "strength",  // Underkategorin
  supplementNames: ["Creatine", "Beta-Alanine"], // Supplement-namn (måste matcha name_en i databasen)
  categoryIds: [2, 3],        // Fallback category IDs
  priority: 1,                // Prioritet (högre = vald först)
}
```

## Kategorier

Nuvarande kategorier i systemet:
- 1 = Health (Base health supplements)
- 2 = Muscle
- 3 = Performance
- 4 = Focus
- 5 = Stress
- 6 = Metabolic
- 7 = Sleep
- 8 = Anti-Aging
- 9 = Joints

## Underkategorier

### Fitness & Performance
- `strength` - Strength & Power
- `hypertrophy` - Muscle Growth
- `endurance` - Endurance & Cardio
- `recovery` - Recovery

### Cognitive Focus
- `memory` - Memory & Learning
- `focus` - Focus & Concentration
- `mood` - Mood & Well-being
- `productivity` - Productivity

### Longevity
- `antiAging` - Anti-Aging
- `healthspan` - Healthspan
- `energy` - Cellular Energy
- `longevity` - Longevity Optimization

### Sleep
- `quality` - Sleep Quality
- `duration` - Sleep Duration
- `deepSleep` - Deep Sleep
- `fallingAsleep` - Falling Asleep

## Exempel

Om användaren väljer:
- Goal: Fitness & Performance
- Subcategory: Strength & Power

Systemet kommer att söka efter:
1. Creatine (exakt match)
2. Beta-Alanine (exakt match)
3. Citrulline (exakt match)
4. Betaine (exakt match)

Om dessa inte hittas, fallback till supplements med category_ids [2, 3] (Muscle, Performance).

## Koppla befintliga supplements

För att automatiskt koppla befintliga supplements i databasen till underkategorier, använd funktionerna i `lib/supplement-category-mapper.ts`:

- `getSubcategoriesForSupplement(categoryIds)` - Hitta vilka underkategorier ett supplement passar baserat på dess category_ids
- `findSupplementsForSubcategory(goalId, subcategoryId)` - Hitta alla supplements som passar en specifik underkategori
- `generateSubcategoryRecommendations()` - Generera rekommendationer för alla underkategorier baserat på databasen

### Automatisk mappning

Supplements med category_ids mappas automatiskt enligt:
- Category 2 (Muscle) → Fitness: strength, hypertrophy, recovery
- Category 3 (Performance) → Fitness: strength, endurance, recovery
- Category 4 (Focus) → Cognitive: memory, focus, productivity
- Category 5 (Stress) → Cognitive: mood
- Category 6 (Metabolic) → Longevity: energy, healthspan
- Category 7 (Sleep) → Sleep: quality, duration, deepSleep, fallingAsleep
- Category 8 (Anti-Aging) → Longevity: antiAging, longevity, healthspan
- Category 9 (Joints) → Fitness: recovery

## Uppdateringar

När nya supplements läggs till i databasen, uppdatera mappningen för att inkludera dem i relevanta underkategorier.
