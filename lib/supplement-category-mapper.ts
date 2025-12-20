/**
 * Utility functions to map existing supplements to subcategories based on their category_ids
 * This helps connect existing supplements in the database to the new subcategory system
 */

import { supabase } from "./supabase"

/**
 * Maps category IDs to subcategories
 * This allows us to automatically connect supplements with category_ids [2, 3] to fitness subcategories
 */
export const categoryToSubcategoryMap: Record<number, { goalId: string; subcategoryIds: string[] }[]> = {
  // Category 1 = Health (Base health supplements - can apply to all goals)
  1: [
    { goalId: "fitness", subcategoryIds: ["recovery"] },
    { goalId: "cognitive", subcategoryIds: ["mood", "productivity"] },
    { goalId: "longevity", subcategoryIds: ["healthspan"] },
    { goalId: "sleep", subcategoryIds: ["quality"] },
  ],
  // Category 2 = Muscle
  2: [
    { goalId: "fitness", subcategoryIds: ["strength", "hypertrophy", "recovery"] },
  ],
  // Category 3 = Performance
  3: [
    { goalId: "fitness", subcategoryIds: ["strength", "endurance", "recovery"] },
  ],
  // Category 4 = Focus
  4: [
    { goalId: "cognitive", subcategoryIds: ["memory", "focus", "productivity"] },
  ],
  // Category 5 = Stress
  5: [
    { goalId: "cognitive", subcategoryIds: ["mood"] },
  ],
  // Category 6 = Metabolic
  6: [
    { goalId: "longevity", subcategoryIds: ["energy", "healthspan"] },
  ],
  // Category 7 = Sleep
  7: [
    { goalId: "sleep", subcategoryIds: ["quality", "duration", "deepSleep", "fallingAsleep"] },
  ],
  // Category 8 = Anti-Aging
  8: [
    { goalId: "longevity", subcategoryIds: ["antiAging", "longevity", "healthspan"] },
  ],
  // Category 9 = Joints
  9: [
    { goalId: "fitness", subcategoryIds: ["recovery"] },
  ],
}

/**
 * Get recommended subcategories for a supplement based on its category_ids
 */
export function getSubcategoriesForSupplement(categoryIds: number[] | null): { goalId: string; subcategoryIds: string[] }[] {
  if (!categoryIds || categoryIds.length === 0) {
    return []
  }

  const subcategoryMap = new Map<string, Set<string>>()

  categoryIds.forEach(categoryId => {
    const mappings = categoryToSubcategoryMap[categoryId] || []
    mappings.forEach(({ goalId, subcategoryIds }) => {
      if (!subcategoryMap.has(goalId)) {
        subcategoryMap.set(goalId, new Set())
      }
      subcategoryIds.forEach(subId => {
        subcategoryMap.get(goalId)!.add(subId)
      })
    })
  })

  return Array.from(subcategoryMap.entries()).map(([goalId, subcategoryIds]) => ({
    goalId,
    subcategoryIds: Array.from(subcategoryIds),
  }))
}

/**
 * Find supplements in database that match a specific subcategory
 * This can be used to automatically populate the subcategory mapping
 */
export async function findSupplementsForSubcategory(
  goalId: string,
  subcategoryId: string
): Promise<{ id: number; name_en: string; category_ids: number[] | null }[]> {
  try {
    // Get category IDs that map to this subcategory
    const relevantCategoryIds: number[] = []
    Object.entries(categoryToSubcategoryMap).forEach(([catId, mappings]) => {
      mappings.forEach(({ goalId: gId, subcategoryIds }) => {
        if (gId === goalId && subcategoryIds.includes(subcategoryId)) {
          relevantCategoryIds.push(parseInt(catId))
        }
      })
    })

    if (relevantCategoryIds.length === 0) {
      return []
    }

    // Fetch supplements with matching category_ids
    const { data, error } = await supabase
      .from('supplements')
      .select('id, name_en, category_ids')
      .eq('is_parent', true)
      .limit(100)

    if (error) {
      console.error('Error fetching supplements:', error)
      return []
    }

    // Filter supplements that have at least one matching category
    const matchingSupplements = (data || []).filter(supplement => {
      if (!supplement.category_ids || !Array.isArray(supplement.category_ids)) {
        return false
      }
      return relevantCategoryIds.some(catId => supplement.category_ids.includes(catId))
    })

    return matchingSupplements.map(s => ({
      id: s.id,
      name_en: s.name_en,
      category_ids: s.category_ids,
    }))
  } catch (error) {
    console.error('Error finding supplements for subcategory:', error)
    return []
  }
}

/**
 * Generate supplement recommendations for all subcategories
 * This can be used to populate the subcategory-supplements.ts file
 */
export async function generateSubcategoryRecommendations(): Promise<void> {
  const recommendations: Record<string, string[]> = {}

  const subcategories = [
    { goalId: "fitness", subcategoryId: "strength" },
    { goalId: "fitness", subcategoryId: "hypertrophy" },
    { goalId: "fitness", subcategoryId: "endurance" },
    { goalId: "fitness", subcategoryId: "recovery" },
    { goalId: "cognitive", subcategoryId: "memory" },
    { goalId: "cognitive", subcategoryId: "focus" },
    { goalId: "cognitive", subcategoryId: "mood" },
    { goalId: "cognitive", subcategoryId: "productivity" },
    { goalId: "longevity", subcategoryId: "antiAging" },
    { goalId: "longevity", subcategoryId: "healthspan" },
    { goalId: "longevity", subcategoryId: "energy" },
    { goalId: "longevity", subcategoryId: "longevity" },
    { goalId: "sleep", subcategoryId: "quality" },
    { goalId: "sleep", subcategoryId: "duration" },
    { goalId: "sleep", subcategoryId: "deepSleep" },
    { goalId: "sleep", subcategoryId: "fallingAsleep" },
  ]

  for (const { goalId, subcategoryId } of subcategories) {
    const supplements = await findSupplementsForSubcategory(goalId, subcategoryId)
    const key = `${goalId}-${subcategoryId}`
    recommendations[key] = supplements.map(s => s.name_en).slice(0, 10) // Top 10
  }

  console.log('Generated recommendations:', JSON.stringify(recommendations, null, 2))
}
