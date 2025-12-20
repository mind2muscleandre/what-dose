/**
 * Script to categorize all supplements in the database
 * Ensures every supplement is properly categorized and mapped to subcategories
 * 
 * Usage:
 *   npx tsx scripts/categorize-all-supplements.ts
 */

import { supabase } from "../lib/supabase"
import { getSubcategoriesForSupplement, categoryToSubcategoryMap } from "../lib/supplement-category-mapper"

interface SupplementCategory {
  id: number
  name_en: string
  category_ids: number[] | null
  is_base_health: boolean
  is_parent: boolean
  subcategories: { goalId: string; subcategoryIds: string[] }[]
  needsCategory: boolean
  suggestedCategories?: number[]
}

async function categorizeAllSupplements() {
  console.log("🔍 Fetching all supplements from database...\n")

  try {
    // Fetch all supplements
    const { data: supplements, error } = await supabase
      .from('supplements')
      .select('id, name_en, category_ids, is_base_health, is_parent')
      .order('name_en')

    if (error) {
      console.error("❌ Error fetching supplements:", error)
      return
    }

    if (!supplements || supplements.length === 0) {
      console.log("⚠️  No supplements found in database")
      return
    }

    console.log(`📊 Found ${supplements.length} total supplements\n`)

    // Categorize each supplement
    const categorized: SupplementCategory[] = supplements.map(supplement => {
      const subcategories = getSubcategoriesForSupplement(supplement.category_ids)
      const needsCategory = !supplement.category_ids || supplement.category_ids.length === 0

      // Suggest categories based on name (simple heuristic)
      let suggestedCategories: number[] | undefined
      if (needsCategory) {
        suggestedCategories = suggestCategoriesFromName(supplement.name_en)
      }

      return {
        id: supplement.id,
        name_en: supplement.name_en,
        category_ids: supplement.category_ids,
        is_base_health: supplement.is_base_health || false,
        is_parent: supplement.is_parent || false,
        subcategories,
        needsCategory,
        suggestedCategories,
      }
    })

    // Group by status
    const uncategorized = categorized.filter(s => s.needsCategory)
    const categorizedSupplements = categorized.filter(s => !s.needsCategory)
    const baseHealth = categorized.filter(s => s.is_base_health)
    const parents = categorized.filter(s => s.is_parent)

    // Statistics
    console.log("📈 Statistics:")
    console.log(`   Total supplements: ${categorized.length}`)
    console.log(`   Parent supplements: ${parents.length}`)
    console.log(`   Base health: ${baseHealth.length}`)
    console.log(`   Categorized: ${categorizedSupplements.length}`)
    console.log(`   ⚠️  Uncategorized: ${uncategorized.length}\n`)

    // Show uncategorized supplements
    if (uncategorized.length > 0) {
      console.log("⚠️  UNCATEGORIZED SUPPLEMENTS (need category_ids):\n")
      uncategorized.forEach(s => {
        console.log(`   - ${s.name_en} (ID: ${s.id})`)
        if (s.suggestedCategories && s.suggestedCategories.length > 0) {
          console.log(`     Suggested categories: ${s.suggestedCategories.join(", ")}`)
          const categoryNames = s.suggestedCategories.map(id => getCategoryName(id)).join(", ")
          console.log(`     (${categoryNames})`)
        }
        console.log()
      })
    }

    // Show category distribution
    console.log("\n📊 Category Distribution:\n")
    const categoryCounts: Record<number, number> = {}
    categorizedSupplements.forEach(s => {
      s.category_ids?.forEach(catId => {
        categoryCounts[catId] = (categoryCounts[catId] || 0) + 1
      })
    })

    Object.entries(categoryCounts)
      .sort(([a], [b]) => parseInt(a) - parseInt(b))
      .forEach(([catId, count]) => {
        console.log(`   Category ${catId} (${getCategoryName(parseInt(catId))}): ${count} supplements`)
      })

    // Show subcategory mapping
    console.log("\n🎯 Subcategory Mapping:\n")
    const subcategoryCounts: Record<string, number> = {}
    categorizedSupplements.forEach(s => {
      s.subcategories.forEach(({ goalId, subcategoryIds }) => {
        subcategoryIds.forEach(subId => {
          const key = `${goalId}-${subId}`
          subcategoryCounts[key] = (subcategoryCounts[key] || 0) + 1
        })
      })
    })

    Object.entries(subcategoryCounts)
      .sort()
      .forEach(([key, count]) => {
        const [goalId, subId] = key.split("-")
        console.log(`   ${goalId}/${subId}: ${count} supplements`)
      })

    // Generate SQL update statements for uncategorized supplements
    if (uncategorized.length > 0) {
      console.log("\n💾 SQL Update Statements (for uncategorized supplements):\n")
      uncategorized.forEach(s => {
        if (s.suggestedCategories && s.suggestedCategories.length > 0) {
          const categoriesArray = `ARRAY[${s.suggestedCategories.join(", ")}]`
          console.log(`UPDATE supplements SET category_ids = ${categoriesArray} WHERE id = ${s.id}; -- ${s.name_en}`)
        } else {
          console.log(`-- TODO: Manually categorize: ${s.name_en} (ID: ${s.id})`)
        }
      })
    }

    // Generate comprehensive mapping report
    console.log("\n📋 Complete Supplement to Subcategory Mapping:\n")
    const goalSubcategoryMap: Record<string, Record<string, string[]>> = {}
    
    categorizedSupplements.forEach(s => {
      s.subcategories.forEach(({ goalId, subcategoryIds }) => {
        if (!goalSubcategoryMap[goalId]) {
          goalSubcategoryMap[goalId] = {}
        }
        subcategoryIds.forEach(subId => {
          if (!goalSubcategoryMap[goalId][subId]) {
            goalSubcategoryMap[goalId][subId] = []
          }
          goalSubcategoryMap[goalId][subId].push(s.name_en)
        })
      })
    })

    Object.entries(goalSubcategoryMap).forEach(([goalId, subcategories]) => {
      console.log(`\n${goalId.toUpperCase()}:`)
      Object.entries(subcategories).forEach(([subId, supplements]) => {
        console.log(`  ${subId}: ${supplements.length} supplements`)
        supplements.slice(0, 5).forEach(name => console.log(`    - ${name}`))
        if (supplements.length > 5) {
          console.log(`    ... and ${supplements.length - 5} more`)
        }
      })
    })

    console.log("\n✅ Categorization complete!")
    console.log(`\n📝 Next steps:`)
    if (uncategorized.length > 0) {
      console.log(`   1. Review and run the SQL update statements above`)
      console.log(`   2. Manually categorize supplements without suggestions`)
    } else {
      console.log(`   ✅ All supplements are categorized!`)
    }
    console.log(`   3. Use the mapping above to update lib/subcategory-supplements.ts if needed`)

  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

/**
 * Suggest categories based on supplement name (simple heuristic)
 */
function suggestCategoriesFromName(name: string): number[] {
  const nameLower = name.toLowerCase()
  const suggestions: number[] = []

  // Muscle/Strength keywords
  if (nameLower.includes("creatine") || nameLower.includes("bcaa") || nameLower.includes("protein") ||
      nameLower.includes("leucine") || nameLower.includes("hmb") || nameLower.includes("beta-alanine")) {
    suggestions.push(2) // Muscle
  }

  // Performance/Endurance keywords
  if (nameLower.includes("caffeine") || nameLower.includes("beetroot") || nameLower.includes("citrulline") ||
      nameLower.includes("coq10") || nameLower.includes("beta-alanine")) {
    suggestions.push(3) // Performance
  }

  // Cognitive/Focus keywords
  if (nameLower.includes("caffeine") || nameLower.includes("l-theanine") || nameLower.includes("bacopa") ||
      nameLower.includes("lion") || nameLower.includes("ginkgo") || nameLower.includes("rhodiola") ||
      nameLower.includes("alcar") || nameLower.includes("gpc") || nameLower.includes("racetam")) {
    suggestions.push(4) // Focus
  }

  // Stress/Mood keywords
  if (nameLower.includes("ashwagandha") || nameLower.includes("5-htp") || nameLower.includes("saffron") ||
      nameLower.includes("sam") || nameLower.includes("cbd") || nameLower.includes("chamomile")) {
    suggestions.push(5) // Stress
  }

  // Metabolic keywords
  if (nameLower.includes("berberine") || nameLower.includes("metformin") || nameLower.includes("alpha-lipoic") ||
      nameLower.includes("benfotiamine")) {
    suggestions.push(6) // Metabolic
  }

  // Sleep keywords
  if (nameLower.includes("melatonin") || nameLower.includes("magnesium") || nameLower.includes("glycine") ||
      nameLower.includes("gaba") || nameLower.includes("valerian") || nameLower.includes("5-htp") ||
      nameLower.includes("chamomile") || nameLower.includes("apigenin")) {
    suggestions.push(7) // Sleep
  }

  // Anti-Aging keywords
  if (nameLower.includes("nmn") || nameLower.includes("resveratrol") || nameLower.includes("quercetin") ||
      nameLower.includes("fisetin") || nameLower.includes("alpha-lipoic") || nameLower.includes("astaxanthin") ||
      nameLower.includes("coq10") || nameLower.includes("nad")) {
    suggestions.push(8) // Anti-Aging
  }

  // Joints keywords
  if (nameLower.includes("glucosamine") || nameLower.includes("chondroitin") || nameLower.includes("msm") ||
      nameLower.includes("curcumin") || nameLower.includes("tart cherry")) {
    suggestions.push(9) // Joints
  }

  // Base health (common vitamins/minerals)
  if (nameLower.includes("vitamin") || nameLower.includes("omega") || nameLower.includes("magnesium") ||
      nameLower.includes("zinc") || nameLower.includes("iron") || nameLower.includes("calcium") ||
      nameLower.includes("b-complex") || nameLower.includes("multivitamin")) {
    if (!suggestions.includes(1)) {
      suggestions.unshift(1) // Health (add at beginning)
    }
  }

  // Remove duplicates
  return [...new Set(suggestions)]
}

/**
 * Get human-readable category name
 */
function getCategoryName(categoryId: number): string {
  const names: Record<number, string> = {
    1: "Health",
    2: "Muscle",
    3: "Performance",
    4: "Focus",
    5: "Stress",
    6: "Metabolic",
    7: "Sleep",
    8: "Anti-Aging",
    9: "Joints",
  }
  return names[categoryId] || `Unknown (${categoryId})`
}

// Run the script
categorizeAllSupplements()
