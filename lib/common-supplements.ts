/**
 * List of common/popular supplements that should be prioritized
 * These are well-researched, widely-used supplements
 */

export const COMMON_SUPPLEMENTS = [
  // Fitness & Performance
  "Creatine",
  "EAA",
  "Essential Amino Acids",
  "BCAA",
  "Whey Protein",
  "Casein Protein",
  "Caffeine",
  "Caffeine Anhydrous",
  "Beta-Alanine",
  "Beta Alanine",
  
  // Health & Wellness
  "Vitamin D",
  "Vitamin D3",
  "Omega-3",
  "Fish Oil",
  "Magnesium",
  "Zinc",
  "Multivitamin",
  "B-Complex",
  "Vitamin B12",
  "Iron",
  
  // Cognitive
  "L-Theanine",
  "ALCAR",
  "Bacopa Monnieri",
  "Ashwagandha",
  "Rhodiola",
  
  // Sleep
  "Melatonin",
  "Magnesium",
  "Glycine",
  "5-HTP",
  
  // Recovery
  "Glutamine",
  "Curcumin",
  "Turmeric",
]

/**
 * Check if a supplement name is considered "common"
 */
export function isCommonSupplement(name: string | null | undefined): boolean {
  if (!name) return false
  const normalizedName = name.toLowerCase()
  return COMMON_SUPPLEMENTS.some(common => 
    normalizedName === common.toLowerCase() ||
    normalizedName.includes(common.toLowerCase()) ||
    common.toLowerCase().includes(normalizedName)
  )
}

/**
 * Get priority score for a supplement (higher = more common/important)
 */
export function getSupplementPriority(name: string | null | undefined): number {
  if (!name) return 0
  const normalizedName = name.toLowerCase()
  
  // Highest priority: Creatine, EAA, Caffeine, Vitamin D, Omega-3
  if (normalizedName.includes('creatine') || 
      normalizedName.includes('eaa') ||
      normalizedName === 'essential amino acids' ||
      normalizedName.includes('caffeine') ||
      normalizedName.includes('vitamin d') ||
      normalizedName.includes('omega-3') ||
      normalizedName.includes('fish oil')) {
    return 10
  }
  
  // High priority: Common fitness supplements
  if (normalizedName.includes('bcaa') ||
      normalizedName.includes('whey') ||
      normalizedName.includes('protein') ||
      normalizedName.includes('magnesium') ||
      normalizedName.includes('zinc')) {
    return 8
  }
  
  // Medium priority: Other common supplements
  if (isCommonSupplement(name)) {
    return 5
  }
  
  return 1
}
