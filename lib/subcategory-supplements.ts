/**
 * Mapping between subcategories and recommended supplements
 * This maps user-selected subcategories to specific supplement names or categories
 */

export interface SubcategorySupplementMapping {
  goalId: string
  subcategoryId: string
  supplementNames: string[] // Names to search for in database
  categoryIds?: number[] // Fallback to category IDs if names not found
  priority?: number // Higher priority = selected first
}

/**
 * Maps subcategories to recommended supplements
 * Supplement names should match name_en in the supplements table
 */
export const subcategorySupplementMap: SubcategorySupplementMapping[] = [
  // Fitness & Performance Subcategories
  // Based on actual supplements in database with category_ids [2, 3] (Muscle, Performance)
  {
    goalId: "fitness",
    subcategoryId: "strength",
    supplementNames: ["Creatine", "BCAA", "Boron", "Agmatine Sulfate", "Arginine Alpha-Ketoglutarate"],
    categoryIds: [2, 3], // Muscle, Performance
    priority: 1,
  },
  {
    goalId: "fitness",
    subcategoryId: "hypertrophy",
    supplementNames: ["Creatine", "EAA", "Essential Amino Acids", "BCAA", "Casein Protein", "Whey Protein"],
    categoryIds: [2], // Muscle
    priority: 1,
  },
  {
    goalId: "fitness",
    subcategoryId: "endurance",
    supplementNames: ["Beetroot", "Beet Root Juice Concentrate", "CoQ10", "Caffeine", "BCAA"],
    categoryIds: [2, 3], // Muscle, Performance
    priority: 1,
  },
  {
    goalId: "fitness",
    subcategoryId: "recovery",
    supplementNames: ["BCAA", "Astaxanthin", "Agmatine Sulfate", "Beetroot", "Boron"],
    categoryIds: [2, 9], // Muscle, Joints
    priority: 1,
  },

  // Cognitive Focus Subcategories
  // Based on actual supplements in database with category_ids [4] (Focus)
  {
    goalId: "cognitive",
    subcategoryId: "memory",
    supplementNames: ["Bacopa Monnieri", "ALCAR", "American Ginseng", "Aniracetam", "7,8-Dihydroxyflavone"],
    categoryIds: [4], // Focus
    priority: 1,
  },
  {
    goalId: "cognitive",
    subcategoryId: "focus",
    supplementNames: ["Caffeine", "Caffeine Anhydrous", "ALCAR", "Bacopa Monnieri", "Adrafinil"],
    categoryIds: [4], // Focus
    priority: 1,
  },
  {
    goalId: "cognitive",
    subcategoryId: "mood",
    supplementNames: ["Ashwagandha", "5-HTP", "CBD Oil", "Chamomile", "Agmatine Sulfate"],
    categoryIds: [4, 5], // Focus, Stress
    priority: 1,
  },
  {
    goalId: "cognitive",
    subcategoryId: "productivity",
    supplementNames: ["Caffeine", "ALCAR", "Bacopa Monnieri", "American Ginseng", "B-Complex"],
    categoryIds: [4], // Focus
    priority: 1,
  },

  // Longevity Subcategories
  // Based on actual supplements in database with category_ids [6, 8] (Metabolic, Anti-Aging)
  {
    goalId: "longevity",
    subcategoryId: "antiAging",
    supplementNames: ["Alpha Lipoic Acid", "Astaxanthin", "Apigenin", "Berberine HCL", "ALCAR"],
    categoryIds: [8], // Anti-Aging
    priority: 1,
  },
  {
    goalId: "longevity",
    subcategoryId: "healthspan",
    supplementNames: ["Alpha Lipoic Acid", "Astaxanthin", "ALCAR", "Apigenin", "7-Keto DHEA"],
    categoryIds: [1, 8], // Health, Anti-Aging
    priority: 1,
  },
  {
    goalId: "longevity",
    subcategoryId: "energy",
    supplementNames: ["Alpha Lipoic Acid", "CoQ10", "ALCAR", "Berberine", "Benfotiamine"],
    categoryIds: [6, 8], // Metabolic, Anti-Aging
    priority: 1,
  },
  {
    goalId: "longevity",
    subcategoryId: "longevity",
    supplementNames: ["Alpha Lipoic Acid", "Astaxanthin", "Apigenin", "Berberine HCL", "ALCAR"],
    categoryIds: [8], // Anti-Aging
    priority: 1,
  },

  // Sleep Subcategories
  // Based on actual supplements in database with category_ids [7] (Sleep)
  {
    goalId: "sleep",
    subcategoryId: "quality",
    supplementNames: ["5-HTP", "Ashwagandha", "Chamomile", "Apigenin", "CBD Oil"],
    categoryIds: [7], // Sleep
    priority: 1,
  },
  {
    goalId: "sleep",
    subcategoryId: "duration",
    supplementNames: ["5-HTP", "Ashwagandha", "Chamomile", "Apigenin", "CBD Oil"],
    categoryIds: [7], // Sleep
    priority: 1,
  },
  {
    goalId: "sleep",
    subcategoryId: "deepSleep",
    supplementNames: ["5-HTP", "Ashwagandha", "Chamomile", "Apigenin", "CBD Oil"],
    categoryIds: [7], // Sleep
    priority: 1,
  },
  {
    goalId: "sleep",
    subcategoryId: "fallingAsleep",
    supplementNames: ["5-HTP", "Ashwagandha", "Chamomile", "Apigenin", "CBD Oil"],
    categoryIds: [7], // Sleep
    priority: 1,
  },
]

/**
 * Get supplements for a specific subcategory
 */
export function getSupplementsForSubcategory(
  goalId: string,
  subcategoryId: string
): SubcategorySupplementMapping | undefined {
  return subcategorySupplementMap.find(
    (mapping) => mapping.goalId === goalId && mapping.subcategoryId === subcategoryId
  )
}

/**
 * Get all supplements for multiple subcategories
 */
export function getSupplementsForSubcategories(
  subcategories: Record<string, string[]>
): {
  supplementNames: string[]
  categoryIds: number[]
  priority: number
} {
  const allSupplementNames = new Set<string>()
  const allCategoryIds = new Set<number>()
  let maxPriority = 0

  Object.entries(subcategories).forEach(([goalId, subcategoryIds]) => {
    subcategoryIds.forEach((subcategoryId) => {
      const mapping = getSupplementsForSubcategory(goalId, subcategoryId)
      if (mapping) {
        mapping.supplementNames.forEach((name) => allSupplementNames.add(name))
        mapping.categoryIds?.forEach((id) => allCategoryIds.add(id))
        if (mapping.priority && mapping.priority > maxPriority) {
          maxPriority = mapping.priority
        }
      }
    })
  })

  return {
    supplementNames: Array.from(allSupplementNames),
    categoryIds: Array.from(allCategoryIds),
    priority: maxPriority,
  }
}
