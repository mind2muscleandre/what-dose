/**
 * Predefined supplement stacks for different goals and categories
 * Updated based on Master Supplement Database with Green/Blue/Red evidence levels
 * All supplements in English
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
    sedentary?: number
    moderate?: number
    active?: number
    veryActive?: number
  }
  // Experience level variations
  experienceLevels?: {
    beginner?: number
    intermediate?: number
    advanced?: number
    biohacker?: number
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
 * Applied to ALL users first. Acts as the safety net.
 */
export const basicHealthStack: PredefinedStack = {
  id: 'basic_health',
  nameKey: 'basicHealthStack',
  descriptionKey: 'basicHealthStackDescription',
  category: 'basic_health',
  supplements: [
    {
      supplementName: 'Vitamin D3',
      scheduleBlock: 'Morning',
      dosage: 2500, // <75kg: 2500 IU, >75kg: 4000 IU
      dosagePerKg: 33, // ~33 IU per kg
      alternatives: ['Vitamin D']
    },
    {
      supplementName: 'Omega-3',
      scheduleBlock: 'Dinner',
      dosage: 2000, // <75kg: 2g, >75kg: 3g Fish Oil
      dosagePerKg: 27, // ~27mg per kg
      alternatives: ['Fish Oil', 'EPA', 'DHA', 'Omega-3 (EPA/DHA)']
    },
    {
      supplementName: 'Multivitamin',
      scheduleBlock: 'Morning',
      dosage: 1, // 1 Daily tablet
      gender: 'female', // With Iron for menstruating women
      alternatives: ['Multivitamin Complex', 'Multivitamin/Mineral']
    },
    {
      supplementName: 'Multivitamin',
      scheduleBlock: 'Morning',
      dosage: 1, // 1 Daily tablet (No Iron)
      gender: 'male', // No Iron for men/post-menopausal
      alternatives: ['Multivitamin Complex', 'Multivitamin/Mineral']
    },
    {
      supplementName: 'Magnesium Bisglycinate',
      scheduleBlock: 'Bedtime',
      dosage: 300, // 200-400 mg
      dosagePerKg: 4, // ~4mg per kg
      minAge: 30, // Stress / 30+
      alternatives: ['Magnesium', 'Magnesium Glycinate', 'Magnesium Bisglycinate']
    },
    {
      supplementName: 'Vitamin K2',
      scheduleBlock: 'Morning',
      dosage: 100, // 90-100 mcg (MK-7)
      minAge: 40, // Age 40+
      alternatives: ['K2', 'MK-7', 'Menaquinone']
    }
  ]
}

/**
 * Fitness & Performance Stacks
 * 4 Subcategories: Strength & Power, Muscle Growth, Endurance & Cardio, Recovery
 */
export const fitnessStacks: Record<string, PredefinedStack> = {
  strength: {
    id: 'fitness_strength',
    nameKey: 'strengthStack',
    descriptionKey: 'strengthStackDescription',
    category: 'fitness',
    subcategory: 'strength',
    experienceVariations: {
      beginner: [
        {
          supplementName: 'Creatine Monohydrate',
          scheduleBlock: 'Pre-Workout',
          dosage: 5000, // 5g daily
          alternatives: ['Creatine']
        }
      ],
      intermediate: [
        {
          supplementName: 'Creatine Monohydrate',
          scheduleBlock: 'Pre-Workout',
          dosage: 5000,
          alternatives: ['Creatine']
        },
        {
          supplementName: 'Alpha-GPC',
          scheduleBlock: 'Pre-Workout',
          dosage: 450, // 300-600mg, using 450mg
          alternatives: ['Alpha GPC', 'Choline']
        }
      ],
      advanced: [
        {
          supplementName: 'Creatine Monohydrate',
          scheduleBlock: 'Pre-Workout',
          dosage: 5000,
          alternatives: ['Creatine']
        },
        {
          supplementName: 'Alpha-GPC',
          scheduleBlock: 'Pre-Workout',
          dosage: 450,
          alternatives: ['Alpha GPC', 'Choline']
        },
        {
          supplementName: 'Beta-Alanine',
          scheduleBlock: 'Pre-Workout',
          dosage: 4000, // 3-5g, using 4g
          alternatives: ['Beta Alanine']
        }
      ],
      biohacker: [
        {
          supplementName: 'Creatine Monohydrate',
          scheduleBlock: 'Pre-Workout',
          dosage: 5000,
          alternatives: ['Creatine']
        },
        {
          supplementName: 'Alpha-GPC',
          scheduleBlock: 'Pre-Workout',
          dosage: 450,
          alternatives: ['Alpha GPC', 'Choline']
        },
        {
          supplementName: 'Beta-Alanine',
          scheduleBlock: 'Pre-Workout',
          dosage: 5000, // 3-5g, using 5g
          alternatives: ['Beta Alanine']
        },
        {
          supplementName: 'Turkesterone',
          scheduleBlock: 'Morning',
          dosage: 500, // 500mg - Cycle 8wks ON / 4 OFF
          alternatives: ['Turkesterone Extract']
        }
      ]
    },
    supplements: [
      {
        supplementName: 'Creatine Monohydrate',
        scheduleBlock: 'Pre-Workout',
        dosage: 5000,
        alternatives: ['Creatine']
      }
    ]
  },
  hypertrophy: {
    id: 'fitness_hypertrophy',
    nameKey: 'hypertrophyStack',
    descriptionKey: 'hypertrophyStackDescription',
    category: 'fitness',
    subcategory: 'hypertrophy',
    experienceVariations: {
      beginner: [
        {
          supplementName: 'Whey Protein',
          scheduleBlock: 'Post-Workout',
          dosage: 25000, // 25-30g
          alternatives: ['Pea Protein', 'Protein Powder']
        }
      ],
      intermediate: [
        {
          supplementName: 'Whey Protein',
          scheduleBlock: 'Post-Workout',
          dosage: 25000,
          alternatives: ['Pea Protein', 'Protein Powder']
        },
        {
          supplementName: 'Creatine Monohydrate',
          scheduleBlock: 'Pre-Workout',
          dosage: 5000, // 5g daily
          alternatives: ['Creatine']
        }
      ],
      advanced: [
        {
          supplementName: 'Whey Protein',
          scheduleBlock: 'Post-Workout',
          dosage: 25000,
          alternatives: ['Pea Protein', 'Protein Powder']
        },
        {
          supplementName: 'Creatine Monohydrate',
          scheduleBlock: 'Pre-Workout',
          dosage: 5000,
          alternatives: ['Creatine']
        },
        {
          supplementName: 'HMB',
          scheduleBlock: 'Post-Workout',
          dosage: 3000, // 3g daily - Best during diets
          alternatives: ['Beta-Hydroxy Beta-Methylbutyrate']
        }
      ],
      biohacker: [
        {
          supplementName: 'Whey Protein',
          scheduleBlock: 'Post-Workout',
          dosage: 25000,
          alternatives: ['Pea Protein', 'Protein Powder']
        },
        {
          supplementName: 'Creatine Monohydrate',
          scheduleBlock: 'Pre-Workout',
          dosage: 5000,
          alternatives: ['Creatine']
        },
        {
          supplementName: 'HMB',
          scheduleBlock: 'Post-Workout',
          dosage: 3000,
          alternatives: ['Beta-Hydroxy Beta-Methylbutyrate']
        },
        {
          supplementName: 'Phosphatidic Acid',
          scheduleBlock: 'Pre-Workout',
          dosage: 750, // 750mg - mTOR activation
          alternatives: ['PA']
        }
      ]
    },
    supplements: [
      {
        supplementName: 'Whey Protein',
        scheduleBlock: 'Post-Workout',
        dosage: 25000,
        alternatives: ['Pea Protein', 'Protein Powder']
      }
    ]
  },
  endurance: {
    id: 'fitness_endurance',
    nameKey: 'enduranceStack',
    descriptionKey: 'enduranceStackDescription',
    category: 'fitness',
    subcategory: 'endurance',
    experienceVariations: {
      beginner: [
        {
          supplementName: 'Electrolytes',
          scheduleBlock: 'Pre-Workout',
          dosage: 1, // Na/K/Mg mix - Essential for long sessions
          alternatives: ['Electrolyte Mix', 'Sodium', 'Potassium', 'Magnesium']
        }
      ],
      intermediate: [
        {
          supplementName: 'Electrolytes',
          scheduleBlock: 'Pre-Workout',
          dosage: 1,
          alternatives: ['Electrolyte Mix', 'Sodium', 'Potassium', 'Magnesium']
        },
        {
          supplementName: 'Beetroot Extract',
          scheduleBlock: 'Pre-Workout',
          dosage: 500, // 500mg Nitrates - Take 60-90m pre-workout
          alternatives: ['Beetroot', 'Beet Root Juice Concentrate']
        }
      ],
      advanced: [
        {
          supplementName: 'Electrolytes',
          scheduleBlock: 'Pre-Workout',
          dosage: 1,
          alternatives: ['Electrolyte Mix', 'Sodium', 'Potassium', 'Magnesium']
        },
        {
          supplementName: 'Beetroot Extract',
          scheduleBlock: 'Pre-Workout',
          dosage: 500,
          alternatives: ['Beetroot', 'Beet Root Juice Concentrate']
        },
        {
          supplementName: 'Cordyceps',
          scheduleBlock: 'Pre-Workout',
          dosage: 1000, // 1000mg (CS-4) - Cycle 5 days ON / 2 OFF
          alternatives: ['Cordyceps CS-4', 'Cordyceps Sinensis']
        }
      ],
      biohacker: [
        {
          supplementName: 'Electrolytes',
          scheduleBlock: 'Pre-Workout',
          dosage: 1,
          alternatives: ['Electrolyte Mix', 'Sodium', 'Potassium', 'Magnesium']
        },
        {
          supplementName: 'Beetroot Extract',
          scheduleBlock: 'Pre-Workout',
          dosage: 500,
          alternatives: ['Beetroot', 'Beet Root Juice Concentrate']
        },
        {
          supplementName: 'Cordyceps',
          scheduleBlock: 'Pre-Workout',
          dosage: 1000,
          alternatives: ['Cordyceps CS-4', 'Cordyceps Sinensis']
        },
        {
          supplementName: 'PeakO2 Blend',
          scheduleBlock: 'Pre-Workout',
          dosage: 2000, // 2g daily - Experimental adaptogen
          alternatives: ['Peak O2']
        }
      ]
    },
    supplements: [
      {
        supplementName: 'Electrolytes',
        scheduleBlock: 'Pre-Workout',
        dosage: 1,
        alternatives: ['Electrolyte Mix']
      }
    ]
  },
  recovery: {
    id: 'fitness_recovery',
    nameKey: 'recoveryStack',
    descriptionKey: 'recoveryStackDescription',
    category: 'fitness',
    subcategory: 'recovery',
    experienceVariations: {
      beginner: [
        {
          supplementName: 'Magnesium Bisglycinate',
          scheduleBlock: 'Bedtime',
          dosage: 300, // 300mg - Take at night
          alternatives: ['Magnesium', 'Magnesium Glycinate']
        }
      ],
      intermediate: [
        {
          supplementName: 'Magnesium Bisglycinate',
          scheduleBlock: 'Bedtime',
          dosage: 300,
          alternatives: ['Magnesium', 'Magnesium Glycinate']
        },
        {
          supplementName: 'Tart Cherry Extract',
          scheduleBlock: 'Dinner',
          dosage: 500, // 500mg - Good for intensive blocks
          alternatives: ['Tart Cherry', 'Cherry Extract']
        }
      ],
      advanced: [
        {
          supplementName: 'Magnesium Bisglycinate',
          scheduleBlock: 'Bedtime',
          dosage: 300,
          alternatives: ['Magnesium', 'Magnesium Glycinate']
        },
        {
          supplementName: 'Tart Cherry Extract',
          scheduleBlock: 'Dinner',
          dosage: 500,
          alternatives: ['Tart Cherry', 'Cherry Extract']
        },
        {
          supplementName: 'Curcumin',
          scheduleBlock: 'Dinner',
          dosage: 500, // 500mg (BCM-95) - Take with fat/pepper
          alternatives: ['Turmeric', 'Curcumin BCM-95']
        }
      ],
      biohacker: [
        {
          supplementName: 'Magnesium Bisglycinate',
          scheduleBlock: 'Bedtime',
          dosage: 300,
          alternatives: ['Magnesium', 'Magnesium Glycinate']
        },
        {
          supplementName: 'Tart Cherry Extract',
          scheduleBlock: 'Dinner',
          dosage: 500,
          alternatives: ['Tart Cherry', 'Cherry Extract']
        },
        {
          supplementName: 'Curcumin',
          scheduleBlock: 'Dinner',
          dosage: 500,
          alternatives: ['Turmeric', 'Curcumin BCM-95']
        },
        {
          supplementName: 'UC-II',
          scheduleBlock: 'Morning',
          dosage: 40, // 40mg + 300mg Boswellia - Joint/Cartilage repair
          alternatives: ['Undenatured Type II Collagen', 'UC2']
        },
        {
          supplementName: 'Boswellia',
          scheduleBlock: 'Morning',
          dosage: 300,
          alternatives: ['Boswellia Serrata']
        }
      ]
    },
    supplements: [
      {
        supplementName: 'Magnesium Bisglycinate',
        scheduleBlock: 'Bedtime',
        dosage: 300,
        alternatives: ['Magnesium', 'Magnesium Glycinate']
      }
    ]
  }
}

/**
 * Cognitive Focus Stacks
 * 4 Subcategories: Focus & Conc., Memory & Learning, Mood & Well-being, Productivity
 */
export const cognitiveStacks: Record<string, PredefinedStack> = {
  focus: {
    id: 'cognitive_focus',
    nameKey: 'focusStack',
    descriptionKey: 'focusStackDescription',
    category: 'cognitive',
    subcategory: 'focus',
    experienceVariations: {
      beginner: [
        {
          supplementName: 'Caffeine',
          scheduleBlock: 'Morning',
          dosage: 100, // 100mg + 200mg L-Theanine
          alternatives: ['Caffeine Anhydrous']
        },
        {
          supplementName: 'L-Theanine',
          scheduleBlock: 'Morning',
          dosage: 200, // "Flow state", Alertness - Cut off 2 PM
          alternatives: ['Theanine']
        }
      ],
      intermediate: [
        {
          supplementName: 'Caffeine',
          scheduleBlock: 'Morning',
          dosage: 100,
          alternatives: ['Caffeine Anhydrous']
        },
        {
          supplementName: 'L-Theanine',
          scheduleBlock: 'Morning',
          dosage: 200,
          alternatives: ['Theanine']
        },
        {
          supplementName: 'L-Tyrosine',
          scheduleBlock: 'Morning',
          dosage: 1000, // 1000mg - Empty stomach (morning)
          alternatives: ['Tyrosine']
        }
      ],
      advanced: [
        {
          supplementName: 'Caffeine',
          scheduleBlock: 'Morning',
          dosage: 100,
          alternatives: ['Caffeine Anhydrous']
        },
        {
          supplementName: 'L-Theanine',
          scheduleBlock: 'Morning',
          dosage: 200,
          alternatives: ['Theanine']
        },
        {
          supplementName: 'L-Tyrosine',
          scheduleBlock: 'Morning',
          dosage: 1000,
          alternatives: ['Tyrosine']
        },
        {
          supplementName: 'Alpha-GPC',
          scheduleBlock: 'Morning',
          dosage: 300, // 300mg - Cycle 5 days ON / 2 OFF
          alternatives: ['Alpha GPC', 'Choline']
        }
      ],
      biohacker: [
        {
          supplementName: 'Caffeine',
          scheduleBlock: 'Morning',
          dosage: 100,
          alternatives: ['Caffeine Anhydrous']
        },
        {
          supplementName: 'L-Theanine',
          scheduleBlock: 'Morning',
          dosage: 200,
          alternatives: ['Theanine']
        },
        {
          supplementName: 'L-Tyrosine',
          scheduleBlock: 'Morning',
          dosage: 1000,
          alternatives: ['Tyrosine']
        },
        {
          supplementName: 'Alpha-GPC',
          scheduleBlock: 'Morning',
          dosage: 300,
          alternatives: ['Alpha GPC', 'Choline']
        },
        {
          supplementName: 'Huperzine A',
          scheduleBlock: 'Morning',
          dosage: 200, // 200 mcg - Strict Cycle: Max 3x/week
          alternatives: ['Huperzine']
        }
      ]
    },
    supplements: [
      {
        supplementName: 'Caffeine',
        scheduleBlock: 'Morning',
        dosage: 100,
        alternatives: ['Caffeine Anhydrous']
      },
      {
        supplementName: 'L-Theanine',
        scheduleBlock: 'Morning',
        dosage: 200,
        alternatives: ['Theanine']
      }
    ]
  },
  memory: {
    id: 'cognitive_memory',
    nameKey: 'memoryStack',
    descriptionKey: 'memoryStackDescription',
    category: 'cognitive',
    subcategory: 'memory',
    experienceVariations: {
      beginner: [
        {
          supplementName: 'Omega-3',
          scheduleBlock: 'Dinner',
          dosage: 1000, // 1000mg DHA - Daily essential
          alternatives: ['Fish Oil', 'DHA', 'Omega-3 (EPA/DHA)']
        }
      ],
      intermediate: [
        {
          supplementName: 'Omega-3',
          scheduleBlock: 'Dinner',
          dosage: 1000,
          alternatives: ['Fish Oil', 'DHA', 'Omega-3 (EPA/DHA)']
        },
        {
          supplementName: 'Bacopa Monnieri',
          scheduleBlock: 'Morning',
          dosage: 300, // 300mg - Takes 4-6 weeks to work
          alternatives: ['Bacopa']
        }
      ],
      advanced: [
        {
          supplementName: 'Omega-3',
          scheduleBlock: 'Dinner',
          dosage: 1000,
          alternatives: ['Fish Oil', 'DHA', 'Omega-3 (EPA/DHA)']
        },
        {
          supplementName: 'Bacopa Monnieri',
          scheduleBlock: 'Morning',
          dosage: 300,
          alternatives: ['Bacopa']
        },
        {
          supplementName: 'Lion\'s Mane',
          scheduleBlock: 'Morning',
          dosage: 1000, // 1000mg (8:1) - Ensure dual-extract
          alternatives: ['Lions Mane', 'Hericium Erinaceus']
        }
      ],
      biohacker: [
        {
          supplementName: 'Omega-3',
          scheduleBlock: 'Dinner',
          dosage: 1000,
          alternatives: ['Fish Oil', 'DHA', 'Omega-3 (EPA/DHA)']
        },
        {
          supplementName: 'Bacopa Monnieri',
          scheduleBlock: 'Morning',
          dosage: 300,
          alternatives: ['Bacopa']
        },
        {
          supplementName: 'Lion\'s Mane',
          scheduleBlock: 'Morning',
          dosage: 1000,
          alternatives: ['Lions Mane', 'Hericium Erinaceus']
        },
        {
          supplementName: 'Phosphatidylserine',
          scheduleBlock: 'Morning',
          dosage: 300, // 300mg - Also lowers cortisol
          alternatives: ['PS']
        }
      ]
    },
    supplements: [
      {
        supplementName: 'Omega-3',
        scheduleBlock: 'Dinner',
        dosage: 1000,
        alternatives: ['Fish Oil', 'DHA']
      }
    ]
  },
  mood: {
    id: 'cognitive_mood',
    nameKey: 'moodStack',
    descriptionKey: 'moodStackDescription',
    category: 'cognitive',
    subcategory: 'mood',
    experienceVariations: {
      beginner: [
        {
          supplementName: 'Vitamin D3',
          scheduleBlock: 'Morning',
          dosage: 4000, // Max Safe Dose - Foundation for mood
          alternatives: ['Vitamin D']
        }
      ],
      intermediate: [
        {
          supplementName: 'Vitamin D3',
          scheduleBlock: 'Morning',
          dosage: 4000,
          alternatives: ['Vitamin D']
        },
        {
          supplementName: 'Saffron Extract',
          scheduleBlock: 'Morning',
          dosage: 30, // 30mg - Natural mood lifter
          alternatives: ['Saffron']
        }
      ],
      advanced: [
        {
          supplementName: 'Vitamin D3',
          scheduleBlock: 'Morning',
          dosage: 4000,
          alternatives: ['Vitamin D']
        },
        {
          supplementName: 'Saffron Extract',
          scheduleBlock: 'Morning',
          dosage: 30,
          alternatives: ['Saffron']
        },
        {
          supplementName: 'Ashwagandha',
          scheduleBlock: 'Morning',
          dosage: 450, // 300-600mg - Cycle: Break every 8 wks
          alternatives: ['Ashwagandha Extract']
        }
      ],
      biohacker: [
        {
          supplementName: 'Vitamin D3',
          scheduleBlock: 'Morning',
          dosage: 4000,
          alternatives: ['Vitamin D']
        },
        {
          supplementName: 'Saffron Extract',
          scheduleBlock: 'Morning',
          dosage: 30,
          alternatives: ['Saffron']
        },
        {
          supplementName: 'Ashwagandha',
          scheduleBlock: 'Morning',
          dosage: 450,
          alternatives: ['Ashwagandha Extract']
        },
        {
          supplementName: 'SAM-e',
          scheduleBlock: 'Morning',
          dosage: 400, // 400mg - CONTRAINDICATION: No SSRIs
          alternatives: ['S-Adenosylmethionine', 'SAMe']
        }
      ]
    },
    supplements: [
      {
        supplementName: 'Vitamin D3',
        scheduleBlock: 'Morning',
        dosage: 4000,
        alternatives: ['Vitamin D']
      }
    ]
  },
  productivity: {
    id: 'cognitive_productivity',
    nameKey: 'productivityStack',
    descriptionKey: 'productivityStackDescription',
    category: 'cognitive',
    subcategory: 'productivity',
    experienceVariations: {
      beginner: [
        {
          supplementName: 'B-Complex',
          scheduleBlock: 'Morning',
          dosage: 50, // Standard - Methylated - Fuel for neurotransmitters
          alternatives: ['B Vitamins', 'B-Complex Vitamins']
        }
      ],
      intermediate: [
        {
          supplementName: 'B-Complex',
          scheduleBlock: 'Morning',
          dosage: 50,
          alternatives: ['B Vitamins', 'B-Complex Vitamins']
        },
        {
          supplementName: 'Rhodiola Rosea',
          scheduleBlock: 'Morning',
          dosage: 300, // 300mg - Standardized to 3% Rosavins
          alternatives: ['Rhodiola']
        }
      ],
      advanced: [
        {
          supplementName: 'B-Complex',
          scheduleBlock: 'Morning',
          dosage: 50,
          alternatives: ['B Vitamins', 'B-Complex Vitamins']
        },
        {
          supplementName: 'Rhodiola Rosea',
          scheduleBlock: 'Morning',
          dosage: 300,
          alternatives: ['Rhodiola']
        },
        {
          supplementName: 'ALCAR',
          scheduleBlock: 'Morning',
          dosage: 500, // 500mg - Good for morning fog
          alternatives: ['Acetyl-L-Carnitine']
        }
      ],
      biohacker: [
        {
          supplementName: 'B-Complex',
          scheduleBlock: 'Morning',
          dosage: 50,
          alternatives: ['B Vitamins', 'B-Complex Vitamins']
        },
        {
          supplementName: 'Rhodiola Rosea',
          scheduleBlock: 'Morning',
          dosage: 300,
          alternatives: ['Rhodiola']
        },
        {
          supplementName: 'ALCAR',
          scheduleBlock: 'Morning',
          dosage: 500,
          alternatives: ['Acetyl-L-Carnitine']
        },
        {
          supplementName: 'Teacrine',
          scheduleBlock: 'Morning',
          dosage: 100, // 100mg - No crash (unlike caffeine)
          alternatives: ['Dynamine', 'Teacrine/Dynamine']
        }
      ]
    },
    supplements: [
      {
        supplementName: 'B-Complex',
        scheduleBlock: 'Morning',
        dosage: 50,
        alternatives: ['B Vitamins', 'B-Complex Vitamins']
      }
    ]
  }
}

/**
 * Longevity Stacks
 * 4 Subcategories: Anti-Aging, Healthspan, Cellular Energy, Longevity Opt.
 */
export const longevityStacks: Record<string, PredefinedStack> = {
  antiAging: {
    id: 'longevity_antiaging',
    nameKey: 'antiAgingStack',
    descriptionKey: 'antiAgingStackDescription',
    category: 'longevity',
    subcategory: 'antiAging',
    experienceVariations: {
      beginner: [
        {
          supplementName: 'Vitamin C',
          scheduleBlock: 'Morning',
          dosage: 500, // 500mg + 15mg Zinc
          alternatives: ['Ascorbic Acid']
        },
        {
          supplementName: 'Zinc',
          scheduleBlock: 'Morning',
          dosage: 15,
          alternatives: ['Zinc Picolinate']
        }
      ],
      intermediate: [
        {
          supplementName: 'Vitamin C',
          scheduleBlock: 'Morning',
          dosage: 500,
          alternatives: ['Ascorbic Acid']
        },
        {
          supplementName: 'Zinc',
          scheduleBlock: 'Morning',
          dosage: 15,
          alternatives: ['Zinc Picolinate']
        },
        {
          supplementName: 'Hydrolyzed Collagen',
          scheduleBlock: 'Morning',
          dosage: 10000, // 10g - Daily in coffee/smoothie
          alternatives: ['Collagen', 'Collagen Peptides']
        }
      ],
      advanced: [
        {
          supplementName: 'Vitamin C',
          scheduleBlock: 'Morning',
          dosage: 500,
          alternatives: ['Ascorbic Acid']
        },
        {
          supplementName: 'Zinc',
          scheduleBlock: 'Morning',
          dosage: 15,
          alternatives: ['Zinc Picolinate']
        },
        {
          supplementName: 'Hydrolyzed Collagen',
          scheduleBlock: 'Morning',
          dosage: 10000,
          alternatives: ['Collagen', 'Collagen Peptides']
        },
        {
          supplementName: 'Hyaluronic Acid',
          scheduleBlock: 'Morning',
          dosage: 100, // 100mg - Oral ingestion works well
          alternatives: ['HA']
        }
      ],
      biohacker: [
        {
          supplementName: 'Vitamin C',
          scheduleBlock: 'Morning',
          dosage: 500,
          alternatives: ['Ascorbic Acid']
        },
        {
          supplementName: 'Zinc',
          scheduleBlock: 'Morning',
          dosage: 15,
          alternatives: ['Zinc Picolinate']
        },
        {
          supplementName: 'Hydrolyzed Collagen',
          scheduleBlock: 'Morning',
          dosage: 10000,
          alternatives: ['Collagen', 'Collagen Peptides']
        },
        {
          supplementName: 'Hyaluronic Acid',
          scheduleBlock: 'Morning',
          dosage: 100,
          alternatives: ['HA']
        },
        {
          supplementName: 'Spermidine',
          scheduleBlock: 'Morning',
          dosage: 1500, // 1-2mg - Wheat germ extract usually
          alternatives: ['Spermidine Extract']
        }
      ]
    },
    supplements: [
      {
        supplementName: 'Vitamin C',
        scheduleBlock: 'Morning',
        dosage: 500,
        alternatives: ['Ascorbic Acid']
      },
      {
        supplementName: 'Zinc',
        scheduleBlock: 'Morning',
        dosage: 15,
        alternatives: ['Zinc Picolinate']
      }
    ]
  },
  healthspan: {
    id: 'longevity_healthspan',
    nameKey: 'healthspanStack',
    descriptionKey: 'healthspanStackDescription',
    category: 'longevity',
    subcategory: 'healthspan',
    experienceVariations: {
      beginner: [
        {
          supplementName: 'Omega-3',
          scheduleBlock: 'Dinner',
          dosage: 3000, // High Dose - The #1 longevity supp
          alternatives: ['Fish Oil', 'EPA', 'DHA']
        }
      ],
      intermediate: [
        {
          supplementName: 'Omega-3',
          scheduleBlock: 'Dinner',
          dosage: 3000,
          alternatives: ['Fish Oil', 'EPA', 'DHA']
        },
        {
          supplementName: 'Garlic Extract',
          scheduleBlock: 'Dinner',
          dosage: 600, // 600mg (Aged) - Heart health staple
          alternatives: ['Aged Garlic', 'Garlic']
        }
      ],
      advanced: [
        {
          supplementName: 'Omega-3',
          scheduleBlock: 'Dinner',
          dosage: 3000,
          alternatives: ['Fish Oil', 'EPA', 'DHA']
        },
        {
          supplementName: 'Garlic Extract',
          scheduleBlock: 'Dinner',
          dosage: 600,
          alternatives: ['Aged Garlic', 'Garlic']
        },
        {
          supplementName: 'Berberine',
          scheduleBlock: 'Dinner',
          dosage: 500, // 500mg (w/ meal) - Cycle: 8wks ON / 2 OFF
          alternatives: ['Berberine HCL']
        }
      ],
      biohacker: [
        {
          supplementName: 'Omega-3',
          scheduleBlock: 'Dinner',
          dosage: 3000,
          alternatives: ['Fish Oil', 'EPA', 'DHA']
        },
        {
          supplementName: 'Garlic Extract',
          scheduleBlock: 'Dinner',
          dosage: 600,
          alternatives: ['Aged Garlic', 'Garlic']
        },
        {
          supplementName: 'Berberine',
          scheduleBlock: 'Dinner',
          dosage: 500,
          alternatives: ['Berberine HCL']
        },
        {
          supplementName: 'Glutathione',
          scheduleBlock: 'Morning',
          dosage: 500, // 500mg (Liposomal) - Must be Liposomal form
          alternatives: ['Liposomal Glutathione']
        }
      ]
    },
    supplements: [
      {
        supplementName: 'Omega-3',
        scheduleBlock: 'Dinner',
        dosage: 3000,
        alternatives: ['Fish Oil', 'EPA', 'DHA']
      }
    ]
  },
  energy: {
    id: 'longevity_energy',
    nameKey: 'energyStack',
    descriptionKey: 'energyStackDescription',
    category: 'longevity',
    subcategory: 'energy',
    experienceVariations: {
      beginner: [
        {
          supplementName: 'CoQ10',
          scheduleBlock: 'Morning',
          dosage: 100, // 100mg (Ubiquinol) - Essential after age 35
          alternatives: ['Ubiquinol', 'Coenzyme Q10']
        }
      ],
      intermediate: [
        {
          supplementName: 'CoQ10',
          scheduleBlock: 'Morning',
          dosage: 100,
          alternatives: ['Ubiquinol', 'Coenzyme Q10']
        },
        {
          supplementName: 'ALCAR',
          scheduleBlock: 'Morning',
          dosage: 500, // 500mg - Mental clarity
          alternatives: ['Acetyl-L-Carnitine']
        }
      ],
      advanced: [
        {
          supplementName: 'CoQ10',
          scheduleBlock: 'Morning',
          dosage: 100,
          alternatives: ['Ubiquinol', 'Coenzyme Q10']
        },
        {
          supplementName: 'ALCAR',
          scheduleBlock: 'Morning',
          dosage: 500,
          alternatives: ['Acetyl-L-Carnitine']
        },
        {
          supplementName: 'PQQ',
          scheduleBlock: 'Morning',
          dosage: 20, // 20mg - Stacks well with CoQ10
          alternatives: ['Pyrroloquinoline Quinone']
        }
      ],
      biohacker: [
        {
          supplementName: 'CoQ10',
          scheduleBlock: 'Morning',
          dosage: 100,
          alternatives: ['Ubiquinol', 'Coenzyme Q10']
        },
        {
          supplementName: 'ALCAR',
          scheduleBlock: 'Morning',
          dosage: 500,
          alternatives: ['Acetyl-L-Carnitine']
        },
        {
          supplementName: 'PQQ',
          scheduleBlock: 'Morning',
          dosage: 20,
          alternatives: ['Pyrroloquinoline Quinone']
        },
        {
          supplementName: 'Methylene Blue',
          scheduleBlock: 'Morning',
          dosage: 5, // Low Dose (<5mg) - Caution: Pharmaceutical grade only
          alternatives: ['Methylene Blue']
        }
      ]
    },
    supplements: [
      {
        supplementName: 'CoQ10',
        scheduleBlock: 'Morning',
        dosage: 100,
        alternatives: ['Ubiquinol', 'Coenzyme Q10']
      }
    ]
  },
  longevity: {
    id: 'longevity_longevity',
    nameKey: 'longevityOptimizationStack',
    descriptionKey: 'longevityOptimizationStackDescription',
    category: 'longevity',
    subcategory: 'longevity',
    experienceVariations: {
      beginner: [
        {
          supplementName: 'Resveratrol',
          scheduleBlock: 'Dinner',
          dosage: 500, // 500mg - Take with fat
          alternatives: ['Resveratrol']
        }
      ],
      intermediate: [
        {
          supplementName: 'Resveratrol',
          scheduleBlock: 'Dinner',
          dosage: 500,
          alternatives: ['Resveratrol']
        },
        {
          supplementName: 'Quercetin',
          scheduleBlock: 'Morning',
          dosage: 500, // 500mg - Zinc Ionophore
          alternatives: ['Quercetin']
        }
      ],
      advanced: [
        {
          supplementName: 'Resveratrol',
          scheduleBlock: 'Dinner',
          dosage: 500,
          alternatives: ['Resveratrol']
        },
        {
          supplementName: 'Quercetin',
          scheduleBlock: 'Morning',
          dosage: 500,
          alternatives: ['Quercetin']
        },
        {
          supplementName: 'Fisetin',
          scheduleBlock: 'Dinner',
          dosage: 100, // 100mg - Often taken in "pulses"
          alternatives: ['Fisetin']
        }
      ],
      biohacker: [
        {
          supplementName: 'Resveratrol',
          scheduleBlock: 'Dinner',
          dosage: 500,
          alternatives: ['Resveratrol']
        },
        {
          supplementName: 'Quercetin',
          scheduleBlock: 'Morning',
          dosage: 500,
          alternatives: ['Quercetin']
        },
        {
          supplementName: 'Fisetin',
          scheduleBlock: 'Dinner',
          dosage: 100,
          alternatives: ['Fisetin']
        },
        {
          supplementName: 'NMN',
          scheduleBlock: 'Morning',
          dosage: 500, // 500mg - Expensive. Morning only.
          alternatives: ['NR', 'Nicotinamide Mononucleotide', 'Nicotinamide Riboside']
        }
      ]
    },
    supplements: [
      {
        supplementName: 'Resveratrol',
        scheduleBlock: 'Dinner',
        dosage: 500,
        alternatives: ['Resveratrol']
      }
    ]
  }
}

/**
 * Sleep Stacks
 * 4 Subcategories: Falling Asleep, Deep Sleep, Sleep Quality, Sleep Duration
 */
export const sleepStacks: Record<string, PredefinedStack> = {
  fallingAsleep: {
    id: 'sleep_falling',
    nameKey: 'fallingAsleepStack',
    descriptionKey: 'fallingAsleepStackDescription',
    category: 'sleep',
    subcategory: 'fallingAsleep',
    experienceVariations: {
      beginner: [
        {
          supplementName: 'Magnesium Bisglycinate',
          scheduleBlock: 'Bedtime',
          dosage: 300, // 300mg - The foundation of sleep
          alternatives: ['Magnesium', 'Magnesium Glycinate']
        }
      ],
      intermediate: [
        {
          supplementName: 'Magnesium Bisglycinate',
          scheduleBlock: 'Bedtime',
          dosage: 300,
          alternatives: ['Magnesium', 'Magnesium Glycinate']
        },
        {
          supplementName: 'Melatonin',
          scheduleBlock: 'Bedtime',
          dosage: 750, // 0.5 - 1mg, using 0.75mg - Keep dose LOW
          maxAge: 65,
          alternatives: ['Melatonin']
        }
      ],
      advanced: [
        {
          supplementName: 'Magnesium Bisglycinate',
          scheduleBlock: 'Bedtime',
          dosage: 300,
          alternatives: ['Magnesium', 'Magnesium Glycinate']
        },
        {
          supplementName: 'Melatonin',
          scheduleBlock: 'Bedtime',
          dosage: 750,
          maxAge: 65,
          alternatives: ['Melatonin']
        },
        {
          supplementName: 'Lemon Balm',
          scheduleBlock: 'Bedtime',
          dosage: 600, // 600mg - Good for stress
          alternatives: ['Melissa Officinalis']
        }
      ],
      biohacker: [
        {
          supplementName: 'Magnesium Bisglycinate',
          scheduleBlock: 'Bedtime',
          dosage: 300,
          alternatives: ['Magnesium', 'Magnesium Glycinate']
        },
        {
          supplementName: 'Melatonin',
          scheduleBlock: 'Bedtime',
          dosage: 750,
          maxAge: 65,
          alternatives: ['Melatonin']
        },
        {
          supplementName: 'Lemon Balm',
          scheduleBlock: 'Bedtime',
          dosage: 600,
          alternatives: ['Melissa Officinalis']
        },
        {
          supplementName: 'Oleamide',
          scheduleBlock: 'Bedtime',
          dosage: 75, // 50-100mg, using 75mg - Experimental
          alternatives: ['Oleamide']
        }
      ]
    },
    supplements: [
      {
        supplementName: 'Magnesium Bisglycinate',
        scheduleBlock: 'Bedtime',
        dosage: 300,
        alternatives: ['Magnesium', 'Magnesium Glycinate']
      }
    ]
  },
  deepSleep: {
    id: 'sleep_deep',
    nameKey: 'deepSleepStack',
    descriptionKey: 'deepSleepStackDescription',
    category: 'sleep',
    subcategory: 'deepSleep',
    experienceVariations: {
      beginner: [
        {
          supplementName: 'Zinc Picolinate',
          scheduleBlock: 'Bedtime',
          dosage: 22, // 15-30mg, using 22mg - Take away from Calcium
          alternatives: ['Zinc']
        }
      ],
      intermediate: [
        {
          supplementName: 'Zinc Picolinate',
          scheduleBlock: 'Bedtime',
          dosage: 22,
          alternatives: ['Zinc']
        },
        {
          supplementName: 'L-Theanine',
          scheduleBlock: 'Bedtime',
          dosage: 300, // 200-400mg, using 300mg - Safe to stack
          alternatives: ['Theanine']
        }
      ],
      advanced: [
        {
          supplementName: 'Zinc Picolinate',
          scheduleBlock: 'Bedtime',
          dosage: 22,
          alternatives: ['Zinc']
        },
        {
          supplementName: 'L-Theanine',
          scheduleBlock: 'Bedtime',
          dosage: 300,
          alternatives: ['Theanine']
        },
        {
          supplementName: 'Glycine',
          scheduleBlock: 'Bedtime',
          dosage: 4000, // 3-5g, using 4g - Powder form easiest
          alternatives: ['Glycine']
        }
      ],
      biohacker: [
        {
          supplementName: 'Zinc Picolinate',
          scheduleBlock: 'Bedtime',
          dosage: 22,
          alternatives: ['Zinc']
        },
        {
          supplementName: 'L-Theanine',
          scheduleBlock: 'Bedtime',
          dosage: 300,
          alternatives: ['Theanine']
        },
        {
          supplementName: 'Glycine',
          scheduleBlock: 'Bedtime',
          dosage: 4000,
          alternatives: ['Glycine']
        },
        {
          supplementName: 'Apigenin',
          scheduleBlock: 'Bedtime',
          dosage: 50, // 50mg - "Huberman Stack" item
          alternatives: ['Apigenin']
        }
      ]
    },
    supplements: [
      {
        supplementName: 'Zinc Picolinate',
        scheduleBlock: 'Bedtime',
        dosage: 22,
        alternatives: ['Zinc']
      }
    ]
  },
  quality: {
    id: 'sleep_quality',
    nameKey: 'sleepQualityStack',
    descriptionKey: 'sleepQualityStackDescription',
    category: 'sleep',
    subcategory: 'quality',
    experienceVariations: {
      beginner: [
        {
          supplementName: 'Tart Cherry',
          scheduleBlock: 'Bedtime',
          dosage: 500, // 500mg - Reduces soreness too
          alternatives: ['Tart Cherry Extract']
        }
      ],
      intermediate: [
        {
          supplementName: 'Tart Cherry',
          scheduleBlock: 'Bedtime',
          dosage: 500,
          alternatives: ['Tart Cherry Extract']
        },
        {
          supplementName: 'Taurine',
          scheduleBlock: 'Bedtime',
          dosage: 1500, // 1-2g, using 1.5g - Calms nervous system
          alternatives: ['Taurine']
        }
      ],
      advanced: [
        {
          supplementName: 'Tart Cherry',
          scheduleBlock: 'Bedtime',
          dosage: 500,
          alternatives: ['Tart Cherry Extract']
        },
        {
          supplementName: 'Taurine',
          scheduleBlock: 'Bedtime',
          dosage: 1500,
          alternatives: ['Taurine']
        },
        {
          supplementName: 'Magnesium L-Threonate',
          scheduleBlock: 'Bedtime',
          dosage: 2000, // 144mg Elemental per 2g - Crosses Blood-Brain barrier
          alternatives: ['Magtein', 'Magnesium L-Threonate']
        }
      ],
      biohacker: [
        {
          supplementName: 'Tart Cherry',
          scheduleBlock: 'Bedtime',
          dosage: 500,
          alternatives: ['Tart Cherry Extract']
        },
        {
          supplementName: 'Taurine',
          scheduleBlock: 'Bedtime',
          dosage: 1500,
          alternatives: ['Taurine']
        },
        {
          supplementName: 'Magnesium L-Threonate',
          scheduleBlock: 'Bedtime',
          dosage: 2000,
          alternatives: ['Magtein', 'Magnesium L-Threonate']
        },
        {
          supplementName: 'L-Tryptophan',
          scheduleBlock: 'Bedtime',
          dosage: 500, // 500mg - Take on empty stomach
          alternatives: ['Tryptophan']
        }
      ]
    },
    supplements: [
      {
        supplementName: 'Tart Cherry',
        scheduleBlock: 'Bedtime',
        dosage: 500,
        alternatives: ['Tart Cherry Extract']
      }
    ]
  },
  duration: {
    id: 'sleep_duration',
    nameKey: 'sleepDurationStack',
    descriptionKey: 'sleepDurationStackDescription',
    category: 'sleep',
    subcategory: 'duration',
    experienceVariations: {
      beginner: [
        {
          supplementName: 'Magnesium',
          scheduleBlock: 'Bedtime',
          dosage: 400, // Standard - Prevents cramping
          alternatives: ['Magnesium Bisglycinate', 'Magnesium Glycinate']
        }
      ],
      intermediate: [
        {
          supplementName: 'Magnesium',
          scheduleBlock: 'Bedtime',
          dosage: 400,
          alternatives: ['Magnesium Bisglycinate', 'Magnesium Glycinate']
        },
        {
          supplementName: 'Phosphatidylserine',
          scheduleBlock: 'Bedtime',
          dosage: 200, // 200mg - Prevents 3 AM waking
          alternatives: ['PS']
        }
      ],
      advanced: [
        {
          supplementName: 'Magnesium',
          scheduleBlock: 'Bedtime',
          dosage: 400,
          alternatives: ['Magnesium Bisglycinate', 'Magnesium Glycinate']
        },
        {
          supplementName: 'Phosphatidylserine',
          scheduleBlock: 'Bedtime',
          dosage: 200,
          alternatives: ['PS']
        },
        {
          supplementName: 'Inositol',
          scheduleBlock: 'Bedtime',
          dosage: 3000, // 2-4g, using 3g - Helps staying asleep
          alternatives: ['Inositol']
        }
      ],
      biohacker: [
        {
          supplementName: 'Magnesium',
          scheduleBlock: 'Bedtime',
          dosage: 400,
          alternatives: ['Magnesium Bisglycinate', 'Magnesium Glycinate']
        },
        {
          supplementName: 'Phosphatidylserine',
          scheduleBlock: 'Bedtime',
          dosage: 200,
          alternatives: ['PS']
        },
        {
          supplementName: 'Inositol',
          scheduleBlock: 'Bedtime',
          dosage: 3000,
          alternatives: ['Inositol']
        },
        {
          supplementName: 'GABA',
          scheduleBlock: 'Bedtime',
          dosage: 150, // 100-200mg, using 150mg - Only specific forms work orally
          alternatives: ['PharmaGABA', 'GABA']
        }
      ]
    },
    supplements: [
      {
        supplementName: 'Magnesium',
        scheduleBlock: 'Bedtime',
        dosage: 400,
        alternatives: ['Magnesium Bisglycinate', 'Magnesium Glycinate']
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
