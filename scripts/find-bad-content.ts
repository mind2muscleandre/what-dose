/**
 * Find supplements with bad content (short descriptions, Swedish words, etc.)
 */

import * as fs from 'fs'
import * as path from 'path'

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=:#]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        let value = match[2].trim()
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

function isSwedish(text: string): boolean {
  if (!text) return false
  const lowerText = text.toLowerCase()
  const swedishPatterns = [
    /\b(och|eller|med|för|är|ska|kan|måste|bör|efter|innan|under|över)\b/i,
    /\b(kvinnor|män|gravid|menstruerande|ersätter|förlust|kofaktor|insulinresistens)\b/i,
    /\b(lever|cellmembran|synaptisk|neurotransmittor|systemet|endocannabinoid-systemet)\b/i,
    /[åäöÅÄÖ]/,
    /-systemet\b/i,
  ]
  return swedishPatterns.some(pattern => pattern.test(lowerText))
}

async function findBadContent() {
  const supabase = createServerClient()

  const { data: supplements, error } = await supabase
    .from('supplements')
    .select('id, name_en, description, benefits')
    .order('name_en')

  if (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }

  if (!supplements || supplements.length === 0) {
    console.log('⚠️  No supplements found')
    return
  }

  const badSupplements: Array<{
    name: string
    id: number
    reason: string
    description?: string
    benefits?: string[]
  }> = []

  supplements.forEach(supp => {
    const issues: string[] = []

    // Check description
    if (!supp.description || supp.description.length === 0) {
      issues.push('Missing description')
    } else {
      // Check for Swedish
      if (isSwedish(supp.description)) {
        issues.push('Contains Swedish words')
      }
      
      // Check if too short or just keywords (like "Sleep, pain, anxiety")
      const trimmedDesc = supp.description.trim()
      
      // More aggressive detection for keyword lists
      const hasCommas = trimmedDesc.includes(',')
      const wordCount = trimmedDesc.split(/\s+/).length
      const commaCount = (trimmedDesc.match(/,/g) || []).length
      
      // If it has commas and few words, likely a keyword list
      const isKeywordList = hasCommas && 
                            wordCount <= 10 && 
                            commaCount >= 1 &&
                            trimmedDesc.length < 100 &&
                            !trimmedDesc.toLowerCase().includes('that') && 
                            !trimmedDesc.toLowerCase().includes('which') &&
                            !trimmedDesc.toLowerCase().includes('supplement') &&
                            !trimmedDesc.toLowerCase().includes('helps') &&
                            !trimmedDesc.toLowerCase().includes('supports')
      
      if (isKeywordList) {
        issues.push('Description is just keywords (comma-separated like "Sleep, pain, anxiety")')
      } else if (supp.description.length < 80) {
        issues.push(`Description too short (${supp.description.length} chars, should be at least 80)`)
      }
      
      // Check if no period (not a complete sentence)
      if (!supp.description.includes('.') && supp.description.length < 120) {
        issues.push('Description lacks complete sentence (no period)')
      }
    }

    // Check benefits
    if (!supp.benefits || !Array.isArray(supp.benefits) || supp.benefits.length !== 3) {
      issues.push(`Wrong number of benefits (${supp.benefits?.length || 0} instead of 3)`)
    } else {
      supp.benefits.forEach((benefit, idx) => {
        if (isSwedish(benefit)) {
          issues.push(`Benefit ${idx + 1} contains Swedish`)
        }
        if (benefit.length < 20) {
          issues.push(`Benefit ${idx + 1} too short (${benefit.length} chars)`)
        }
        if (!benefit.includes(' ')) {
          issues.push(`Benefit ${idx + 1} is just a single word`)
        }
        // Check if just keywords
        if (benefit.split(',').length >= 2 && benefit.split(',').every(word => word.trim().length < 10)) {
          issues.push(`Benefit ${idx + 1} is just keywords`)
        }
      })
    }

    if (issues.length > 0) {
      badSupplements.push({
        name: supp.name_en,
        id: supp.id,
        reason: issues.join(', '),
        description: supp.description || undefined,
        benefits: supp.benefits || undefined
      })
    }
  })

  // Also search for specific patterns
  const shortDescriptions = supplements.filter(s => 
    s.description && s.description.length > 0 && s.description.length < 100
  )
  
  const keywordDescriptions = supplements.filter(s => 
    s.description && 
    /^[^.]{1,80}$/.test(s.description.trim()) && 
    s.description.split(',').length >= 2 && 
    s.description.split(',').every(word => word.trim().length < 20)
  )

  console.log('🔍 Finding supplements with bad content...\n')
  console.log(`Found ${badSupplements.length} supplements with issues out of ${supplements.length} total`)
  console.log(`Found ${shortDescriptions.length} supplements with short descriptions (< 100 chars)`)
  console.log(`Found ${keywordDescriptions.length} supplements with keyword-only descriptions\n`)

  // Show keyword descriptions first
  if (keywordDescriptions.length > 0) {
    console.log('📋 Supplements with keyword-only descriptions (like "Sleep, pain, anxiety"):\n')
    keywordDescriptions.slice(0, 30).forEach(supp => {
      console.log(`${supp.name_en}: "${supp.description}"`)
    })
    if (keywordDescriptions.length > 30) {
      console.log(`... and ${keywordDescriptions.length - 30} more\n`)
    }
    console.log('')
  }

  if (badSupplements.length > 0) {
    console.log('📋 Supplements with other issues:\n')
    badSupplements.slice(0, 50).forEach(supp => {
      console.log(`${supp.name}:`)
      console.log(`  Issues: ${supp.reason}`)
      if (supp.description) {
        console.log(`  Description: "${supp.description.substring(0, 80)}${supp.description.length > 80 ? '...' : ''}"`)
      }
      if (supp.benefits) {
        console.log(`  Benefits: ${supp.benefits.length} benefits`)
        supp.benefits.forEach((b, i) => {
          console.log(`    ${i + 1}. "${b.substring(0, 60)}${b.length > 60 ? '...' : ''}"`)
        })
      }
      console.log('')
    })
    
    if (badSupplements.length > 50) {
      console.log(`... and ${badSupplements.length - 50} more\n`)
    }

    console.log(`\n💡 Run the generate script with --force to fix all of these:`)
    console.log(`   npx tsx scripts/generate-supplement-content.ts --force`)
  } else {
    console.log('✅ All supplements have good content!')
  }
}

findBadContent()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
