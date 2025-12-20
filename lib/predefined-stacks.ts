/**
 * Predefined supplement stacks for different goals and categories
 * These stacks can be customized based on age and gender
 */

export interface StackSupplement {
  supplementName: string // Must match name_en in database
  scheduleBlock: 'Morning' | 'Lunch' | 'Pre-Workout' | 'Post-Workout' | 'Dinner' | 'Bedtime'
  dosage?: number // Base dosage (can be adjusted by weight/activity)
  // Age/gender conditions
  minAge?: number
  maxAge?: number
  gender?: 'male' | 'female' | 'all'
  // Alternative supplements if primary not found
  alternatives?: string[]
  // Weight-based dosage adjustment (per kg bodyweight)
  dosagePerKg?: number // e.g., 0.03 = 30mg per kg
  // Activity level multipliers
  activityMultipliers?: {
    sedentary?: number // 0.8x for sedentary
    moderate?: number // 1.0x for moderate (default)
    active?: number // 1.2x for active
    veryActive?: number // 1.5x for very active
  }
  // Experience level variations
  experienceLevels?: {
    beginner?: number // Lower dose for beginners
    intermediate?: number // Standard dose
    advanced?: number // Higher dose for advanced
    biohacker?: number // Highest dose for biohackers
  }
}

export interface PredefinedStack {
  id: string
  nameKey: string // Translation key
  descriptionKey: string // Translation key
  category: 'basic_health' | 'fitness' | 'cognitive' | 'longevity' | 'sleep'
  subcategory?: string // For subcategory-specific stacks
  supplements: StackSupplement[]
  // Conditions for when this stack should be available
  minAge?: number
  maxAge?: number
  gender?: 'male' | 'female' | 'all'
  // Experience level variations (different stacks for different levels)
  experienceVariations?: {
    beginner?: StackSupplement[]
    intermediate?: StackSupplement[]
    advanced?: StackSupplement[]
    biohacker?: StackSupplement[]
  }
}

/**
 * Basic Health Stack - Essential supplements for everyone
 * Can be added on top of goal-specific stacks
 */
export const basicHealthStack: PredefinedStack = {
  id: 'basic_health',
  nameKey: 'basicHealthStack',
  descriptionKey: 'basicHealthStackDescription',
  category: 'basic_health',
  supplements: [
    {
      supplementName: 'Vitamin D',
      scheduleBlock: 'Morning',
      dosage: 2000, // 2000 IU base
      // Weight-based: ~30-40 IU per kg (2000 IU for ~60kg person)
      dosagePerKg: 33,
      // Age-based adjustments
      minAge: 0,
      maxAge: 70, // Higher doses may be needed for older adults
      alternatives: ['Vitamin D3']
    },
    {
      supplementName: 'Omega-3',
      scheduleBlock: 'Dinner',
      dosage: 1000, // 1000mg EPA+DHA base
      // Weight-based: ~15-20mg per kg
      dosagePerKg: 17,
      // Activity-based: more active = more inflammation = more omega-3
      activityMultipliers: {
        sedentary: 0.8,
        moderate: 1.0,
        active: 1.2,
        veryActive: 1.5,
      },
      alternatives: ['Fish Oil', 'EPA', 'DHA']
    },
    {
      supplementName: 'Magnesium',
      scheduleBlock: 'Bedtime',
      dosage: 400, // 400mg base
      // Weight-based: ~6-7mg per kg
      dosagePerKg: 6.5,
      // Activity-based: more active = more magnesium needed
      activityMultipliers: {
        sedentary: 0.8,
        moderate: 1.0,
        active: 1.2,
        veryActive: 1.4,
      },
      alternatives: ['Magnesium Glycinate', 'Magnesium Citrate']
    },
    {
      supplementName: 'Zinc',
      scheduleBlock: 'Morning',
      dosage: 15, // 15mg base
      // Weight-based: ~0.25mg per kg
      dosagePerKg: 0.25,
      gender: 'male', // Higher priority for men
      alternatives: ['Zinc Picolinate', 'Zinc Citrate']
    },
    {
      supplementName: 'Iron',
      scheduleBlock: 'Morning',
      dosage: 18, // 18mg base
      // Weight-based: ~0.3mg per kg
      dosagePerKg: 0.3,
      gender: 'female', // Higher priority for women
      alternatives: ['Iron Bisglycinate', 'Ferrous Sulfate']
    }
  ]
}

/**
 * Fitness & Performance Stacks
 */
export const fitnessStacks: Record<string, PredefinedStack> = {
  hypertrophy: {
    id: 'fitness_hypertrophy',
    nameKey: 'hypertrophyStack',
    descriptionKey: 'hypertrophyStackDescription',
    category: 'fitness',
    subcategory: 'hypertrophy',
    // Experience level variations
    experienceVariations: {
      beginner: [
        {
          supplementName: 'Creatine',
          scheduleBlock: 'Pre-Workout',
          dosage: 3000, // Lower for beginners
          dosagePerKg: 0.05,
        },
        {
          supplementName: 'EAA',
          scheduleBlock: 'Pre-Workout',
          dosage: 8000, // Lower for beginners
          dosagePerKg: 0.12,
          activityMultipliers: { moderate: 1.0, active: 1.2 },
          alternatives: ['Essential Amino Acids', 'BCAA']
        },
        {
          supplementName: 'Whey Protein',
          scheduleBlock: 'Post-Workout',
          dosage: 20000, // 20g for beginners
          dosagePerKg: 0.33,
          alternatives: ['Protein Powder']
        }
      ],
      intermediate: [
        {
          supplementName: 'Creatine',
          scheduleBlock: 'Pre-Workout',
          dosage: 5000,
          dosagePerKg: 0.08,
        },
        {
          supplementName: 'EAA',
          scheduleBlock: 'Pre-Workout',
          dosage: 10000,
          dosagePerKg: 0.15,
          activityMultipliers: { moderate: 1.0, active: 1.2, veryActive: 1.5 },
          alternatives: ['Essential Amino Acids', 'BCAA']
        },
        {
          supplementName: 'Whey Protein',
          scheduleBlock: 'Post-Workout',
          dosage: 25000,
          dosagePerKg: 0.4,
          activityMultipliers: { moderate: 1.0, active: 1.3, veryActive: 1.6 },
          alternatives: ['Protein Powder', 'Casein Protein']
        },
        {
          supplementName: 'Beta-Alanine',
          scheduleBlock: 'Pre-Workout',
          dosage: 3000,
          alternatives: ['Beta Alanine']
        }
      ],
      advanced: [
        {
          supplementName: 'Creatine',
          scheduleBlock: 'Pre-Workout',
          dosage: 5000,
          dosagePerKg: 0.08,
        },
        {
          supplementName: 'EAA',
          scheduleBlock: 'Pre-Workout',
          dosage: 12000, // Higher for advanced
          dosagePerKg: 0.18,
          activityMultipliers: { moderate: 1.0, active: 1.3, veryActive: 1.6 },
          alternatives: ['Essential Amino Acids', 'BCAA']
        },
        {
          supplementName: 'Whey Protein',
          scheduleBlock: 'Post-Workout',
          dosage: 30000, // 30g for advanced
          dosagePerKg: 0.5,
          activityMultipliers: { moderate: 1.0, active: 1.4, veryActive: 1.8 },
          alternatives: ['Protein Powder', 'Casein Protein']
        },
        {
          supplementName: 'Beta-Alanine',
          scheduleBlock: 'Pre-Workout',
          dosage: 4000, // Higher for advanced
          alternatives: ['Beta Alanine']
        },
        {
          supplementName: 'HMB',
          scheduleBlock: 'Post-Workout',
          dosage: 3000, // 3g
          alternatives: ['Beta-Hydroxy Beta-Methylbutyrate']
        }
      ],
      biohacker: [
        {
          supplementName: 'Creatine',
          scheduleBlock: 'Pre-Workout',
          dosage: 5000,
          dosagePerKg: 0.08,
        },
        {
          supplementName: 'EAA',
          scheduleBlock: 'Pre-Workout',
          dosage: 15000, // Highest for biohackers
          dosagePerKg: 0.2,
          activityMultipliers: { moderate: 1.0, active: 1.4, veryActive: 1.8 },
          alternatives: ['Essential Amino Acids', 'BCAA']
        },
        {
          supplementName: 'Whey Protein',
          scheduleBlock: 'Post-Workout',
          dosage: 35000, // 35g for biohackers
          dosagePerKg: 0.6,
          activityMultipliers: { moderate: 1.0, active: 1.5, veryActive: 2.0 },
          alternatives: ['Protein Powder', 'Casein Protein']
        },
        {
          supplementName: 'Beta-Alanine',
          scheduleBlock: 'Pre-Workout',
          dosage: 5000, // Highest for biohackers
          alternatives: ['Beta Alanine']
        },
        {
          supplementName: 'HMB',
          scheduleBlock: 'Post-Workout',
          dosage: 3000,
          alternatives: ['Beta-Hydroxy Beta-Methylbutyrate']
        },
        {
          supplementName: 'Boron',
          scheduleBlock: 'Morning',
          dosage: 6, // 6mg
        }
      ]
    },
    // Default supplements (fallback - used if experience level not specified)
    supplements: [
      {
        supplementName: 'Creatine',
        scheduleBlock: 'Pre-Workout',
        dosage: 5000, // 5g base
        dosagePerKg: 0.08,
        experienceLevels: {
          beginner: 3000,
          intermediate: 5000,
          advanced: 5000,
          biohacker: 5000,
        }
      },
      {
        supplementName: 'EAA',
        scheduleBlock: 'Pre-Workout',
        dosage: 10000, // 10g base
        dosagePerKg: 0.15,
        activityMultipliers: {
          sedentary: 0.5,
          moderate: 1.0,
          active: 1.2,
          veryActive: 1.5,
        },
        alternatives: ['Essential Amino Acids', 'BCAA']
      },
      {
        supplementName: 'Whey Protein',
        scheduleBlock: 'Post-Workout',
        dosage: 25000, // 25g base
        dosagePerKg: 0.4,
        activityMultipliers: {
          sedentary: 0.6,
          moderate: 1.0,
          active: 1.3,
          veryActive: 1.6,
        },
        alternatives: ['Protein Powder', 'Casein Protein']
      },
      {
        supplementName: 'Beta-Alanine',
        scheduleBlock: 'Pre-Workout',
        dosage: 3000, // 3g
        alternatives: ['Beta Alanine']
      }
    ]
  },
  strength: {
    id: 'fitness_strength',
    nameKey: 'strengthStack',
    descriptionKey: 'strengthStackDescription',
    category: 'fitness',
    subcategory: 'strength',
    supplements: [
      {
        supplementName: 'Creatine',
        scheduleBlock: 'Pre-Workout',
        dosage: 5000,
      },
      {
        supplementName: 'Beta-Alanine',
        scheduleBlock: 'Pre-Workout',
        dosage: 3000,
      },
      {
        supplementName: 'Caffeine',
        scheduleBlock: 'Pre-Workout',
        dosage: 250, // 250mg base
        // Weight-based: 3-4mg per kg bodyweight
        dosagePerKg: 0.0035, // 3.5mg per kg
        // Experience level variations (tolerance)
        experienceLevels: {
          beginner: 200, // Lower for beginners
          intermediate: 250, // Standard
          advanced: 300, // Higher tolerance
          biohacker: 300, // Higher tolerance
        },
        alternatives: ['Caffeine Anhydrous']
      },
      {
        supplementName: 'Citrulline Malate',
        scheduleBlock: 'Pre-Workout',
        dosage: 6000, // 6g
      }
    ]
  },
  endurance: {
    id: 'fitness_endurance',
    nameKey: 'enduranceStack',
    descriptionKey: 'enduranceStackDescription',
    category: 'fitness',
    subcategory: 'endurance',
    supplements: [
      {
        supplementName: 'Beetroot',
        scheduleBlock: 'Pre-Workout',
        dosage: 5000, // 5g
        alternatives: ['Beet Root Juice Concentrate']
      },
      {
        supplementName: 'Beta-Alanine',
        scheduleBlock: 'Pre-Workout',
        dosage: 3000,
      },
      {
        supplementName: 'CoQ10',
        scheduleBlock: 'Morning',
        dosage: 200, // 200mg
      },
      {
        supplementName: 'Caffeine',
        scheduleBlock: 'Pre-Workout',
        dosage: 200,
      }
    ]
  },
  recovery: {
    id: 'fitness_recovery',
    nameKey: 'recoveryStack',
    descriptionKey: 'recoveryStackDescription',
    category: 'fitness',
    subcategory: 'recovery',
    supplements: [
      {
        supplementName: 'EAA',
        scheduleBlock: 'Post-Workout',
        dosage: 10000,
      },
      {
        supplementName: 'Magnesium',
        scheduleBlock: 'Bedtime',
        dosage: 400,
      },
      {
        supplementName: 'Curcumin',
        scheduleBlock: 'Dinner',
        dosage: 1000, // 1g
        alternatives: ['Turmeric']
      },
      {
        supplementName: 'Omega-3',
        scheduleBlock: 'Dinner',
        dosage: 2000,
      }
    ]
  }
}

/**
 * Cognitive Focus Stacks
 */
export const cognitiveStacks: Record<string, PredefinedStack> = {
  focus: {
    id: 'cognitive_focus',
    nameKey: 'focusStack',
    descriptionKey: 'focusStackDescription',
    category: 'cognitive',
    subcategory: 'focus',
    supplements: [
      {
        supplementName: 'Caffeine',
        scheduleBlock: 'Morning',
        dosage: 200,
      },
      {
        supplementName: 'L-Theanine',
        scheduleBlock: 'Morning',
        dosage: 200, // 200mg
      },
      {
        supplementName: 'ALCAR',
        scheduleBlock: 'Morning',
        dosage: 1000, // 1g
        alternatives: ['Acetyl-L-Carnitine']
      },
      {
        supplementName: 'Bacopa Monnieri',
        scheduleBlock: 'Morning',
        dosage: 300, // 300mg
      }
    ]
  },
  memory: {
    id: 'cognitive_memory',
    nameKey: 'memoryStack',
    descriptionKey: 'memoryStackDescription',
    category: 'cognitive',
    subcategory: 'memory',
    supplements: [
      {
        supplementName: 'Bacopa Monnieri',
        scheduleBlock: 'Morning',
        dosage: 300,
      },
      {
        supplementName: 'ALCAR',
        scheduleBlock: 'Morning',
        dosage: 1000,
      },
      {
        supplementName: 'Lion\'s Mane',
        scheduleBlock: 'Morning',
        dosage: 1000,
        alternatives: ['Lions Mane']
      },
      {
        supplementName: 'Omega-3',
        scheduleBlock: 'Dinner',
        dosage: 2000,
      }
    ]
  },
  productivity: {
    id: 'cognitive_productivity',
    nameKey: 'productivityStack',
    descriptionKey: 'productivityStackDescription',
    category: 'cognitive',
    subcategory: 'productivity',
    supplements: [
      {
        supplementName: 'Caffeine',
        scheduleBlock: 'Morning',
        dosage: 200,
      },
      {
        supplementName: 'L-Theanine',
        scheduleBlock: 'Morning',
        dosage: 200,
      },
      {
        supplementName: 'Rhodiola',
        scheduleBlock: 'Morning',
        dosage: 400, // 400mg
      },
      {
        supplementName: 'B-Complex',
        scheduleBlock: 'Morning',
        dosage: 50, // 50mg B-Complex (standard dose, typically 1 tablet)
        alternatives: ['B Vitamins', 'B-Complex Vitamins']
      }
    ]
  },
  mood: {
    id: 'cognitive_mood',
    nameKey: 'moodStack',
    descriptionKey: 'moodStackDescription',
    category: 'cognitive',
    subcategory: 'mood',
    supplements: [
      {
        supplementName: 'Ashwagandha',
        scheduleBlock: 'Morning',
        dosage: 600, // 600mg
      },
      {
        supplementName: '5-HTP',
        scheduleBlock: 'Bedtime',
        dosage: 200, // 200mg
      },
      {
        supplementName: 'Omega-3',
        scheduleBlock: 'Dinner',
        dosage: 2000, // 2g
      },
      {
        supplementName: 'Magnesium',
        scheduleBlock: 'Bedtime',
        dosage: 400,
      }
    ]
  }
}

/**
 * Longevity Stacks
 */
export const longevityStacks: Record<string, PredefinedStack> = {
  antiAging: {
    id: 'longevity_antiaging',
    nameKey: 'antiAgingStack',
    descriptionKey: 'antiAgingStackDescription',
    category: 'longevity',
    subcategory: 'antiAging',
    supplements: [
      {
        supplementName: 'NMN',
        scheduleBlock: 'Morning',
        dosage: 500, // 500mg
        alternatives: ['Nicotinamide Mononucleotide']
      },
      {
        supplementName: 'Resveratrol',
        scheduleBlock: 'Dinner',
        dosage: 250, // 250mg
      },
      {
        supplementName: 'Quercetin',
        scheduleBlock: 'Morning',
        dosage: 500,
      },
      {
        supplementName: 'Fisetin',
        scheduleBlock: 'Dinner',
        dosage: 100, // 100mg
      }
    ]
  },
  healthspan: {
    id: 'longevity_healthspan',
    nameKey: 'healthspanStack',
    descriptionKey: 'healthspanStackDescription',
    category: 'longevity',
    subcategory: 'healthspan',
    supplements: [
      {
        supplementName: 'CoQ10',
        scheduleBlock: 'Morning',
        dosage: 200,
      },
      {
        supplementName: 'Alpha Lipoic Acid',
        scheduleBlock: 'Morning',
        dosage: 600, // 600mg
      },
      {
        supplementName: 'Omega-3',
        scheduleBlock: 'Dinner',
        dosage: 2000,
      },
      {
        supplementName: 'Vitamin D',
        scheduleBlock: 'Morning',
        dosage: 2000,
      }
    ]
  },
  energy: {
    id: 'longevity_energy',
    nameKey: 'energyStack',
    descriptionKey: 'energyStackDescription',
    category: 'longevity',
    subcategory: 'energy',
    supplements: [
      {
        supplementName: 'CoQ10',
        scheduleBlock: 'Morning',
        dosage: 200,
      },
      {
        supplementName: 'ALCAR',
        scheduleBlock: 'Morning',
        dosage: 1000, // 1g
        alternatives: ['Acetyl-L-Carnitine']
      },
      {
        supplementName: 'Alpha Lipoic Acid',
        scheduleBlock: 'Morning',
        dosage: 600,
      },
      {
        supplementName: 'B-Complex',
        scheduleBlock: 'Morning',
        dosage: 50, // 50mg B-Complex (standard dose, typically 1 tablet)
        alternatives: ['B Vitamins', 'B-Complex Vitamins']
      }
    ]
  },
  longevity: {
    id: 'longevity_longevity',
    nameKey: 'longevityOptimizationStack',
    descriptionKey: 'longevityOptimizationStackDescription',
    category: 'longevity',
    subcategory: 'longevity',
    supplements: [
      {
        supplementName: 'NMN',
        scheduleBlock: 'Morning',
        dosage: 500,
        alternatives: ['Nicotinamide Mononucleotide']
      },
      {
        supplementName: 'Resveratrol',
        scheduleBlock: 'Dinner',
        dosage: 250,
      },
      {
        supplementName: 'Quercetin',
        scheduleBlock: 'Morning',
        dosage: 500,
      },
      {
        supplementName: 'Fisetin',
        scheduleBlock: 'Dinner',
        dosage: 100,
      },
      {
        supplementName: 'Omega-3',
        scheduleBlock: 'Dinner',
        dosage: 2000,
      }
    ]
  }
}

/**
 * Sleep Stacks
 */
export const sleepStacks: Record<string, PredefinedStack> = {
  quality: {
    id: 'sleep_quality',
    nameKey: 'sleepQualityStack',
    descriptionKey: 'sleepQualityStackDescription',
    category: 'sleep',
    subcategory: 'quality',
    supplements: [
      {
        supplementName: 'Magnesium',
        scheduleBlock: 'Bedtime',
        dosage: 400,
      },
      {
        supplementName: 'Melatonin',
        scheduleBlock: 'Bedtime',
        dosage: 3, // 3mg
        maxAge: 65, // Lower dose for younger
      },
      {
        supplementName: 'Glycine',
        scheduleBlock: 'Bedtime',
        dosage: 3000, // 3g
      },
      {
        supplementName: 'Ashwagandha',
        scheduleBlock: 'Bedtime',
        dosage: 600, // 600mg
      }
    ]
  },
  deepSleep: {
    id: 'sleep_deep',
    nameKey: 'deepSleepStack',
    descriptionKey: 'deepSleepStackDescription',
    category: 'sleep',
    subcategory: 'deepSleep',
    supplements: [
      {
        supplementName: '5-HTP',
        scheduleBlock: 'Bedtime',
        dosage: 200, // 200mg
      },
      {
        supplementName: 'Magnesium',
        scheduleBlock: 'Bedtime',
        dosage: 400,
      },
      {
        supplementName: 'GABA',
        scheduleBlock: 'Bedtime',
        dosage: 750, // 750mg
      },
      {
        supplementName: 'L-Theanine',
        scheduleBlock: 'Bedtime',
        dosage: 200,
      }
    ]
  },
  duration: {
    id: 'sleep_duration',
    nameKey: 'sleepDurationStack',
    descriptionKey: 'sleepDurationStackDescription',
    category: 'sleep',
    subcategory: 'duration',
    supplements: [
      {
        supplementName: 'Melatonin',
        scheduleBlock: 'Bedtime',
        dosage: 3, // 3mg
        maxAge: 65,
      },
      {
        supplementName: 'Magnesium',
        scheduleBlock: 'Bedtime',
        dosage: 400,
      },
      {
        supplementName: 'Glycine',
        scheduleBlock: 'Bedtime',
        dosage: 3000, // 3g
      },
      {
        supplementName: 'Valerian Root',
        scheduleBlock: 'Bedtime',
        dosage: 400, // 400mg
        alternatives: ['Valerian']
      }
    ]
  },
  fallingAsleep: {
    id: 'sleep_falling',
    nameKey: 'fallingAsleepStack',
    descriptionKey: 'fallingAsleepStackDescription',
    category: 'sleep',
    subcategory: 'fallingAsleep',
    supplements: [
      {
        supplementName: 'Melatonin',
        scheduleBlock: 'Bedtime',
        dosage: 1, // 1mg (lower for falling asleep)
        maxAge: 65,
      },
      {
        supplementName: 'Magnesium',
        scheduleBlock: 'Bedtime',
        dosage: 400,
      },
      {
        supplementName: 'L-Theanine',
        scheduleBlock: 'Bedtime',
        dosage: 200,
      },
      {
        supplementName: 'Chamomile',
        scheduleBlock: 'Bedtime',
        dosage: 500, // 500mg
        alternatives: ['Chamomile Extract']
      }
    ]
  }
}

/**
 * Get all predefined stacks
 */
export function getAllPredefinedStacks(): PredefinedStack[] {
  return [
    basicHealthStack,
    ...Object.values(fitnessStacks),
    ...Object.values(cognitiveStacks),
    ...Object.values(longevityStacks),
    ...Object.values(sleepStacks)
  ]
}

/**
 * Get stacks for a specific category
 */
export function getStacksForCategory(category: string, subcategory?: string): PredefinedStack[] {
  const allStacks = getAllPredefinedStacks()
  
  return allStacks.filter(stack => {
    if (stack.category !== category) return false
    if (subcategory && stack.subcategory !== subcategory) return false
    return true
  })
}

/**
 * Filter supplements based on age and gender
 */
export function filterSupplementsByDemographics(
  supplements: StackSupplement[],
  age: number | null,
  gender: string | null
): StackSupplement[] {
  return supplements.filter(supplement => {
    // Age filter
    if (supplement.minAge !== undefined && age !== null && age < supplement.minAge) {
      return false
    }
    if (supplement.maxAge !== undefined && age !== null && age > supplement.maxAge) {
      return false
    }
    
    // Gender filter
    if (supplement.gender && supplement.gender !== 'all') {
      if (gender === null) return true // If gender not specified, include all
      if (supplement.gender !== gender) return false
    }
    
    return true
  })
}
