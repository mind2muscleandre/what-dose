/**
 * Script to generate subcategory supplement mappings based on existing supplements in database
 * 
 * Usage:
 *   npx tsx scripts/generate-subcategory-mapping.ts
 * 
 * This script will:
 * 1. Query all supplements from the database
 * 2. Map them to subcategories based on their category_ids
 * 3. Generate recommendations that can be used to update subcategory-supplements.ts
 */

import { generateSubcategoryRecommendations, findSupplementsForSubcategory } from "../lib/supplement-category-mapper"

async function main() {
  console.log("🔍 Generating subcategory supplement mappings...\n")

  try {
    // Generate recommendations for all subcategories
    await generateSubcategoryRecommendations()

    // Also show specific examples
    console.log("\n📋 Example: Fitness - Strength & Power")
    const strengthSupplements = await findSupplementsForSubcategory("fitness", "strength")
    console.log(`Found ${strengthSupplements.length} supplements:`)
    strengthSupplements.slice(0, 10).forEach(s => {
      console.log(`  - ${s.name_en} (categories: ${s.category_ids?.join(", ") || "none"})`)
    })

    console.log("\n📋 Example: Cognitive - Focus")
    const focusSupplements = await findSupplementsForSubcategory("cognitive", "focus")
    console.log(`Found ${focusSupplements.length} supplements:`)
    focusSupplements.slice(0, 10).forEach(s => {
      console.log(`  - ${s.name_en} (categories: ${s.category_ids?.join(", ") || "none"})`)
    })

    console.log("\n✅ Done! Use these recommendations to update lib/subcategory-supplements.ts")
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

main()
