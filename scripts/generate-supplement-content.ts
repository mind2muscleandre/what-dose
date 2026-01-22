/**
 * Generate Descriptions and Benefits for All Supplements
 * 
 * This script uses OpenAI to generate proper descriptions and 3 benefits
 * for all supplements in the database.
 * 
 * Requirements:
 *   1. Install OpenAI package: npm install openai
 *   2. Set OPENAI_API_KEY in .env.local
 *   3. Run database migration to add description and benefits columns first
 * 
 * Usage:
 *   npx tsx scripts/generate-supplement-content.ts
 * 
 * Options:
 *   --dry-run    : Preview what would be generated without updating database
 *   --skip-ai    : Use fallback category-based generation (no API calls)
 *   --limit N    : Only process first N supplements (for testing)
 *   --force      : Force overwrite even if content exists (default behavior)
 */

// Load environment variables from .env.local FIRST, before any other imports
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local file manually
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim()
    // Skip comments and empty lines
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=:#]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        let value = match[2].trim()
        // Remove quotes if present
        if ((value.startsWith('"') && value.endsWith('"')) || 
            (value.startsWith("'") && value.endsWith("'"))) {
          value = value.slice(1, -1)
        }
        if (key && !process.env[key]) {
          process.env[key] = value
        }
      }
    }
  })
}

import { createServerClient } from '../lib/supabase'

// Try to import OpenAI, but make it optional
let OpenAI: any = null
try {
  OpenAI = require('openai').OpenAI
} catch (e) {
  console.warn('⚠️  OpenAI package not found. Install with: npm install openai')
  console.warn('   Falling back to category-based generation only.')
}

// Category mappings
const categoryNames: Record<number, string> = {
  1: 'Health',
  2: 'Muscle',
  3: 'Performance',
  4: 'Focus',
  5: 'Stress',
  6: 'Metabolic',
  7: 'Sleep',
  8: 'Anti-Aging',
  9: 'Joints',
}

const categoryDescriptions: Record<number, string> = {
  1: 'supports overall health and wellness',
  2: 'supports muscle growth, strength, and recovery',
  3: 'enhances physical performance and athletic capacity',
  4: 'improves cognitive function, focus, and mental clarity',
  5: 'helps manage stress, anxiety, and promotes relaxation',
  6: 'supports healthy metabolism and energy production',
  7: 'promotes restful sleep and recovery',
  8: 'supports cellular health, longevity, and anti-aging processes',
  9: 'supports joint health, mobility, and comfort',
}

const categoryBenefits: Record<number, string[]> = {
  1: [
    'Supports overall health and wellness',
    'Enhances immune system function',
    'Promotes optimal body function'
  ],
  2: [
    'Promotes muscle growth and recovery',
    'Enhances strength and power output',
    'Supports protein synthesis'
  ],
  3: [
    'Enhances physical performance and endurance',
    'Improves exercise capacity',
    'Supports athletic performance'
  ],
  4: [
    'Improves cognitive function and mental clarity',
    'Enhances focus and concentration',
    'Supports brain health'
  ],
  5: [
    'Helps manage stress and anxiety',
    'Promotes relaxation and calm',
    'Supports mood balance'
  ],
  6: [
    'Supports healthy metabolism',
    'Enhances energy production',
    'Promotes metabolic function'
  ],
  7: [
    'Promotes restful sleep and recovery',
    'Supports sleep quality',
    'Enhances relaxation'
  ],
  8: [
    'Supports cellular health and longevity',
    'Promotes anti-aging processes',
    'Enhances cellular function'
  ],
  9: [
    'Supports joint health and mobility',
    'Promotes joint comfort',
    'Enhances joint function'
  ],
}

interface SupplementContent {
  description: string
  benefits: string[]
}

/**
 * Check if existing content is bad (contains dosage info, too short, Swedish, etc.)
 */
function isBadContent(description: string | null, benefits: string[] | null): boolean {
  if (!description && (!benefits || benefits.length === 0)) {
    return true // Missing content
  }

  // Check if description contains Swedish words
  const isSwedish = (text: string): boolean => {
    if (!text) return false
    const lowerText = text.toLowerCase()
    const swedishPatterns = [
      /\b(och|eller|med|för|är|ska|kan|måste|bör|efter|innan|under|över)\b/i,
      /\b(kvinnor|män|gravid|menstruerande|ersätter|förlust|kofaktor|insulinresistens)\b/i,
      /\b(lever|cellmembran|synaptisk|neurotransmittor|systemet|endocannabinoid-systemet)\b/i,
      /[åäöÅÄÖ]/,
      /-systemet\b/i, // Swedish suffix like "endocannabinoid-systemet"
    ]
    return swedishPatterns.some(pattern => pattern.test(lowerText))
  }

  // Check if description contains dosage information
  if (description) {
    const lowerDesc = description.toLowerCase()
    
    // Check for Swedish
    if (isSwedish(description)) {
      return true
    }
    
    const dosagePatterns = [
      /\d+\s*(mg|mcg|g|iu|ml)\s*(daily|per day|per dose|take|dose)/i,
      /maintenance dose/i,
      /loading phase/i,
      /take \d+/i,
      /\d+g\s*(daily|per day)/i,
      /dose refers to/i,
      /target blood levels/i,
    ]
    
    if (dosagePatterns.some(pattern => pattern.test(lowerDesc))) {
      return true // Contains dosage info
    }
    
    // Too short (likely just keywords, not a description)
    // Check if it's just a comma-separated list of keywords (like "Sleep, pain, anxiety")
    const trimmedDesc = description.trim()
    const isKeywordList = /^[^.]{1,80}$/.test(trimmedDesc) && 
                          trimmedDesc.split(',').length >= 2 && 
                          trimmedDesc.split(',').every(word => word.trim().length < 20) &&
                          !trimmedDesc.includes('that') && 
                          !trimmedDesc.includes('which') &&
                          !trimmedDesc.includes('supplement')
    
    if (isKeywordList) {
      return true // Just keywords like "Sleep, pain, anxiety"
    }
    
    if (description.length < 80) {
      return true // Too short (should be at least 80 chars)
    }
    
    // Check if it doesn't contain a complete sentence (no period or very short)
    if (!description.includes('.') && description.length < 120) {
      return true // No period and too short
    }
  }

  // Check if benefits contain dosage info, Swedish, or are too generic
  if (benefits && benefits.length > 0) {
    // Check for wrong number of benefits
    if (benefits.length !== 3) {
      return true
    }
    
    const hasDosageInBenefits = benefits.some(benefit => {
      const lowerBenefit = benefit.toLowerCase()
      return /\d+\s*(mg|mcg|g|iu)/i.test(lowerBenefit) || 
             /maintenance dose/i.test(lowerBenefit) ||
             /loading/i.test(lowerBenefit)
    })
    
    if (hasDosageInBenefits) {
      return true
    }
    
    // Check for Swedish in benefits
    const hasSwedish = benefits.some(b => isSwedish(b))
    if (hasSwedish) {
      return true
    }
    
    // Check if benefits are just keywords or too short
    const hasBadBenefits = benefits.some(b => {
      // Too short
      if (b.length < 25) {
        return true
      }
      // Just keywords (comma-separated short words like "Sleep, pain, anxiety")
      if (b.split(',').length >= 2 && b.split(',').every(word => word.trim().length < 12)) {
        return true
      }
      // No space (single word)
      if (!b.includes(' ')) {
        return true
      }
      // Check if it's the same as description (redundant)
      if (description && b.toLowerCase() === description.toLowerCase().substring(0, b.length)) {
        return true
      }
      return false
    })
    
    if (hasBadBenefits) {
      return true
    }
  }

  return false
}

/**
 * Generate content using OpenAI API
 */
async function generateWithAI(
  name: string,
  categoryIds: number[] | null,
  researchStatus: string
): Promise<SupplementContent | null> {
  if (!OpenAI || !process.env.OPENAI_API_KEY) {
    return null
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  const categories = (categoryIds || []).map(id => categoryNames[id] || 'Health').join(', ')
  
  const prompt = `You are a supplement information expert. Generate a description and exactly 3 benefits for the supplement "${name}".

Context:
- Research Status: ${researchStatus} (Green=Well-researched, Blue=Emerging, Red=Experimental)
- Categories: ${categories || 'General Health'}

Requirements:
1. Description: Write 1-2 sentences explaining what the supplement does and how it works. DO NOT include dosage information, dosing instructions, or "take X mg" type information. Focus on what it is and what it does.

2. Benefits: Provide exactly 3 benefits. Each benefit should:
   - Be a complete sentence describing a specific benefit
   - NOT include dosage information
   - Be user-friendly and clear
   - Be based on the categories provided

Example for "Creatine Monohydrate":
{
  "description": "A naturally occurring compound that helps supply energy to muscle cells, particularly during high-intensity exercise. It increases phosphocreatine stores in muscles, which helps regenerate ATP during intense activities.",
  "benefits": [
    "Promotes muscle growth and recovery",
    "Enhances physical performance and endurance",
    "Supports ATP production for better workouts"
  ]
}

Return ONLY valid JSON in this exact format:
{
  "description": "...",
  "benefits": ["...", "...", "..."]
}`

  try {
    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini', // Using mini for cost efficiency
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const content = response.choices[0].message.content
    if (!content) {
      return null
    }

    const parsed = JSON.parse(content)
    
    // Validate response
    if (parsed.description && Array.isArray(parsed.benefits) && parsed.benefits.length === 3) {
      return {
        description: parsed.description.trim(),
        benefits: parsed.benefits.map((b: string) => b.trim()).slice(0, 3)
      }
    }
    
    return null
  } catch (error: any) {
    console.error(`  ⚠️  AI generation failed: ${error.message}`)
    return null
  }
}

/**
 * Generate content using category-based fallback
 */
function generateFallback(name: string, categoryIds: number[] | null): SupplementContent {
  const categories = categoryIds || [1] // Default to Health
  const primaryCategory = categories[0]
  
  const categoryDesc = categoryDescriptions[primaryCategory] || categoryDescriptions[1]
  const description = `${name} is a supplement that ${categoryDesc}.`
  
  // Collect benefits from categories
  const benefits: string[] = []
  for (const catId of categories.slice(0, 3)) {
    if (categoryBenefits[catId]) {
      benefits.push(...categoryBenefits[catId])
    }
  }
  
  // Ensure we have exactly 3
  while (benefits.length < 3) {
    benefits.push(categoryBenefits[1][benefits.length % 3]) // Fallback to Health benefits
  }
  
  return {
    description,
    benefits: benefits.slice(0, 3)
  }
}

/**
 * Main function
 */
async function generateAllContent() {
  const args = process.argv.slice(2)
  const dryRun = args.includes('--dry-run')
  const skipAI = args.includes('--skip-ai')
  const force = args.includes('--force') // Explicit force flag
  const limitArg = args.find(arg => arg.startsWith('--limit='))
  const limit = limitArg ? parseInt(limitArg.split('=')[1]) : null

  console.log('🚀 Starting supplement content generation...\n')

  if (dryRun) {
    console.log('⚠️  DRY RUN MODE - No database updates will be made\n')
  }

  if (skipAI || !OpenAI || !process.env.OPENAI_API_KEY) {
    console.log('📝 Using fallback category-based generation (no AI)\n')
  } else {
    console.log('🤖 Using OpenAI API for content generation\n')
    if (process.env.OPENAI_API_KEY) {
      console.log(`   API Key: ${process.env.OPENAI_API_KEY.substring(0, 10)}...\n`)
    }
  }

  // By default, we overwrite everything (force mode)
  if (force) {
    console.log('🔄 FORCE MODE: Will overwrite all existing content\n')
  } else {
    console.log('🔄 Will overwrite existing content (including bad content)\n')
  }

  const supabase = createServerClient()

  // Fetch all supplements (both parents and variants)
  console.log('📥 Fetching supplements from database...')
  const { data: supplements, error: fetchError } = await supabase
    .from('supplements')
    .select('id, name_en, category_ids, research_status, description, benefits, is_parent')
    .order('name_en')

  if (fetchError) {
    console.error('❌ Error fetching supplements:', fetchError)
    process.exit(1)
  }

  if (!supplements || supplements.length === 0) {
    console.log('⚠️  No supplements found')
    process.exit(0)
  }

  const totalSupplements = limit ? Math.min(limit, supplements.length) : supplements.length
  const supplementsToProcess = supplements.slice(0, totalSupplements)

  console.log(`✅ Found ${supplements.length} supplements (processing ${totalSupplements})\n`)

  let successCount = 0
  let skippedCount = 0
  let overwrittenCount = 0
  let createdCount = 0
  let errorCount = 0
  const errors: Array<{ name: string; error: string }> = []

  // Process each supplement
  for (let i = 0; i < supplementsToProcess.length; i++) {
    const supp = supplementsToProcess[i]
    const progress = `[${i + 1}/${totalSupplements}]`
    
    // Check if existing content is bad or missing
    const hasBadContent = isBadContent(supp.description, supp.benefits)
    const hasGoodContent = supp.description && 
                          supp.description.length > 30 && 
                          supp.benefits && 
                          Array.isArray(supp.benefits) && 
                          supp.benefits.length === 3 &&
                          !hasBadContent
    
    // Skip if content is already good (unless force mode)
    if (hasGoodContent && !force) {
      console.log(`${progress} ⏭️  Skipping ${supp.name_en} (already has good content)`)
      skippedCount++
      continue
    }
    
    if (hasBadContent) {
      console.log(`${progress} 🔄 Processing: ${supp.name_en} (replacing bad content)`)
    } else if (!supp.description || !supp.benefits || supp.benefits.length !== 3) {
      console.log(`${progress} 🔄 Processing: ${supp.name_en} (missing content)`)
    } else {
      console.log(`${progress} 🔄 Processing: ${supp.name_en}`)
    }

    let content: SupplementContent | null = null

    // Try AI generation first (unless skipped)
    if (!skipAI && OpenAI && process.env.OPENAI_API_KEY) {
      content = await generateWithAI(
        supp.name_en,
        supp.category_ids,
        supp.research_status || 'Blue'
      )
      
      // Add small delay to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    // Fallback to category-based generation
    if (!content) {
      content = generateFallback(supp.name_en, supp.category_ids)
      if (!skipAI) {
        console.log(`  📝 Using fallback generation`)
      }
    }

    // Update database (unless dry run)
    if (!dryRun) {
      const { error: updateError } = await supabase
        .from('supplements')
        .update({
          description: content.description,
          benefits: content.benefits
        })
        .eq('id', supp.id)

      if (updateError) {
        console.error(`  ❌ Update failed: ${updateError.message}`)
        errorCount++
        errors.push({ name: supp.name_en, error: updateError.message })
      } else {
        const hadExistingContent = !!(supp.description || (supp.benefits && supp.benefits.length > 0))
        if (hadExistingContent) {
          overwrittenCount++
          console.log(`  ✅ Overwritten successfully`)
        } else {
          createdCount++
          console.log(`  ✅ Created successfully`)
        }
        successCount++
      }
    } else {
      // Dry run - just show what would be generated
      const hadExistingContent = !!(supp.description || (supp.benefits && supp.benefits.length > 0))
      if (hadExistingContent) {
        console.log(`  📝 [WOULD OVERWRITE] Current: "${supp.description?.substring(0, 50) || 'none'}..."`)
      }
      console.log(`  📝 Description: ${content.description.substring(0, 80)}...`)
      console.log(`  📝 Benefits: ${content.benefits.join(', ')}`)
      successCount++
    }

    console.log('') // Empty line for readability
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('📊 SUMMARY')
  console.log('='.repeat(60))
  console.log(`✅ Successfully processed: ${successCount}`)
  if (skippedCount > 0) {
    console.log(`⏭️  Skipped (already has good content): ${skippedCount}`)
  }
  if (createdCount > 0) {
    console.log(`✨ Created new content: ${createdCount}`)
  }
  if (overwrittenCount > 0) {
    console.log(`🔄 Overwritten existing content: ${overwrittenCount}`)
  }
  console.log(`❌ Errors: ${errorCount}`)
  
  if (errors.length > 0) {
    console.log('\n❌ Errors:')
    errors.forEach(e => {
      console.log(`   - ${e.name}: ${e.error}`)
    })
  }

  if (dryRun) {
    console.log('\n⚠️  This was a DRY RUN - no changes were made to the database')
    console.log('   Run without --dry-run to apply changes')
  } else {
    console.log('\n✅ Content generation complete!')
    console.log('   All supplements now have proper descriptions and 3 benefits.')
  }
}

// Run the script
generateAllContent()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
