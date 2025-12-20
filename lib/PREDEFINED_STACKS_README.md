# Predefined Stacks System

## Översikt

Detta system använder färdiga, välbeprövade supplement-stacks istället för generisk stack-generering. Stacks anpassas automatiskt baserat på användarens ålder, kön, vikt, aktivitetsnivå och erfarenhetsnivå.

## Struktur

### Basic Health Stack
Grundläggande tillskott för alla:
- **Vitamin D**: 2000 IU (anpassas efter vikt: ~33 IU/kg)
- **Omega-3**: 1000mg (anpassas efter vikt och aktivitet)
- **Magnesium**: 400mg (anpassas efter vikt och aktivitet)
- **Zinc**: 15mg (prioriteras för män, anpassas efter vikt)
- **Iron**: 18mg (prioriteras för kvinnor, anpassas efter vikt)

### Fitness Stacks

#### Hypertrophy Stack
- **Creatine**: 5g (anpassas efter vikt: 0.08g/kg)
- **EAA**: 10g (anpassas efter vikt och aktivitet: 0.15g/kg)
- **Whey Protein**: 25g (anpassas efter vikt och aktivitet: 0.4g/kg)
- **Beta-Alanine**: 3g

**Experience Level Variations:**
- **Beginner**: Lägre doser (Creatine 3g, EAA 8g, Protein 20g)
- **Intermediate**: Standard doser
- **Advanced**: Högre doser (EAA 12g, Protein 30g) + HMB
- **Biohacker**: Högsta doser (EAA 15g, Protein 35g) + HMB + Boron

#### Strength Stack
- Creatine, Beta-Alanine, Caffeine, Citrulline Malate

#### Endurance Stack
- Beetroot, Beta-Alanine, CoQ10, Caffeine

#### Recovery Stack
- EAA, Magnesium, Curcumin, Omega-3

### Cognitive Stacks

#### Focus Stack
- Caffeine, L-Theanine, ALCAR, Bacopa Monnieri

#### Memory Stack
- Bacopa Monnieri, ALCAR, Lion's Mane, Omega-3

#### Productivity Stack
- Caffeine, L-Theanine, Rhodiola, B-Complex

#### Mood Stack (NYTT)
- Ashwagandha, 5-HTP, Omega-3, Magnesium

### Longevity Stacks

#### Anti-Aging Stack
- NMN, Resveratrol, Quercetin, Fisetin

#### Healthspan Stack
- CoQ10, Alpha Lipoic Acid, Omega-3, Vitamin D

#### Energy Stack (NYTT)
- CoQ10, ALCAR, Alpha Lipoic Acid, B-Complex

#### Longevity Optimization Stack (NYTT)
- NMN, Resveratrol, Quercetin, Fisetin, Omega-3

### Sleep Stacks

#### Sleep Quality Stack
- Magnesium, Melatonin (max 65 år), Glycine, Ashwagandha

#### Deep Sleep Stack
- 5-HTP, Magnesium, GABA, L-Theanine

#### Sleep Duration Stack (NYTT)
- Melatonin, Magnesium, Glycine, Valerian Root

#### Falling Asleep Stack (NYTT)
- Melatonin (1mg), Magnesium, L-Theanine, Chamomile

## Anpassningslogik

### 1. Vikt-baserad Dosering
Många tillskott anpassas efter kroppsvikt:
- **Creatine**: 0.08g per kg (5g för 60kg person)
- **EAA**: 0.15g per kg (10g för 60kg person)
- **Whey Protein**: 0.4g per kg (25g för 60kg person)
- **Caffeine**: 3.5mg per kg (250mg för 70kg person)
- **Vitamin D**: 33 IU per kg (2000 IU för 60kg person)
- **Omega-3**: 17mg per kg (1000mg för 60kg person)
- **Magnesium**: 6.5mg per kg (400mg för 60kg person)

### 2. Aktivitetsnivå Multiplikatorer
Vissa tillskott justeras baserat på aktivitetsnivå:
- **Sedentary**: 0.8x (mindre aktiv = mindre behov)
- **Moderate**: 1.0x (standard)
- **Active**: 1.2-1.4x (mer aktiv = mer behov)
- **Very Active**: 1.5-2.0x (mycket aktiv = mycket mer behov)

**Exempel:**
- EAA för very active: 10g × 1.5 = 15g
- Whey Protein för very active: 25g × 1.6 = 40g

### 3. Experience Level Variations
Olika stacks för olika erfarenhetsnivåer:

**Beginner:**
- Lägre doser för säkerhet
- Färre tillskott
- Fokus på grundläggande

**Intermediate:**
- Standard doser
- Välbeprövade kombinationer

**Advanced:**
- Högre doser
- Ytterligare tillskott (t.ex. HMB)
- Mer avancerade protokoll

**Biohacker:**
- Högsta doser
- Maximal stack
- Avancerade tillskott (t.ex. Boron)

### 4. Ålder och Kön
- **Ålder**: Vissa tillskott har åldersbegränsningar (t.ex. Melatonin max 65 år)
- **Kön**: Zinc prioriteras för män, Iron för kvinnor

## Användning

### I Onboarding
```typescript
const { success, created, errors } = await generateStackFromPredefined({
  userId: user.id,
  stacks: predefinedStacks,
  age: 30,
  gender: 'male',
  weight: 75, // kg
  activityLevel: 'active',
  experienceLevel: 'intermediate',
  includeBasicHealth: true
})
```

### Lägga till Nya Stacks
1. Lägg till stack i rätt kategori (fitnessStacks, cognitiveStacks, etc.)
2. Definiera supplements med doser
3. Lägg till vikt/aktivitet/experience-anpassningar om relevant
4. Lägg till översättningar i `translations.ts`

### Lägga till Experience Variations
```typescript
experienceVariations: {
  beginner: [/* lägre doser, färre tillskott */],
  intermediate: [/* standard */],
  advanced: [/* högre doser, fler tillskott */],
  biohacker: [/* maximal stack */]
}
```

## Fördelar

1. **Konsistens**: Alla användare får välbeprövade kombinationer
2. **Säkerhet**: Dosering baserad på vikt och aktivitet
3. **Personalisering**: Anpassas efter ålder, kön, vikt, aktivitet, erfarenhet
4. **Vetenskapligt**: Baserat på forskning och best practices
5. **Flexibilitet**: Användare kan fortfarande skapa egna stacks från databasen
