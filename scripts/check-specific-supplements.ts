/**
 * Check specific supplements to see their content
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

async function checkSpecific() {
  const supabase = createServerClient()

  // Check CBD Oil specifically
  const { data: cbd, error: cbdError } = await supabase
    .from('supplements')
    .select('id, name_en, description, benefits')
    .or('name_en.ilike.%CBD%,name_en.ilike.%cbd%')
    .limit(5)

  console.log('🔍 Checking CBD Oil supplements:\n')
  if (cbdError) {
    console.error('Error:', cbdError)
  } else if (cbd && cbd.length > 0) {
    cbd.forEach(s => {
      console.log(`${s.name_en}:`)
      console.log(`  Description: "${s.description || 'MISSING'}"`)
      console.log(`  Description length: ${s.description?.length || 0} chars`)
      console.log(`  Benefits: ${s.benefits?.length || 0} benefits`)
      if (s.benefits) {
        s.benefits.forEach((b, i) => {
          console.log(`    ${i + 1}. "${b}"`)
        })
      }
      console.log('')
    })
  } else {
    console.log('No CBD Oil found')
  }

  // Check supplements with very short descriptions
  const { data: short, error: shortError } = await supabase
    .from('supplements')
    .select('id, name_en, description, benefits')
    .not('description', 'is', null)
    .limit(100)

  if (shortError) {
    console.error('Error:', shortError)
  } else if (short) {
    const veryShort = short.filter(s => 
      s.description && 
      (s.description.length < 60 || 
       (s.description.split(',').length >= 2 && s.description.split(',').every(w => w.trim().length < 15)))
    )
    
    console.log(`\n🔍 Found ${veryShort.length} supplements with very short/keyword descriptions:\n`)
    veryShort.slice(0, 20).forEach(s => {
      console.log(`${s.name_en}: "${s.description}" (${s.description?.length || 0} chars)`)
    })
  }

  // Check for Swedish words
  const { data: all, error: allError } = await supabase
    .from('supplements')
    .select('id, name_en, description, benefits')
    .limit(200)

  if (allError) {
    console.error('Error:', allError)
  } else if (all) {
    const swedishPatterns = [
      /\b(och|eller|med|för|är|ska|kan|måste|bör|efter|innan|under|över)\b/i,
      /\b(kvinnor|män|gravid|menstruerande|ersätter|förlust|kofaktor|insulinresistens)\b/i,
      /\b(lever|cellmembran|synaptisk|neurotransmittor|systemet|endocannabinoid-systemet)\b/i,
      /[åäöÅÄÖ]/,
      /-systemet\b/i,
    ]

    const withSwedish = all.filter(s => {
      if (s.description && swedishPatterns.some(p => p.test(s.description))) return true
      if (s.benefits) {
        return s.benefits.some(b => swedishPatterns.some(p => p.test(b)))
      }
      return false
    })

    console.log(`\n🔍 Found ${withSwedish.length} supplements with Swedish words:\n`)
    withSwedish.slice(0, 20).forEach(s => {
      console.log(`${s.name_en}:`)
      if (s.description && swedishPatterns.some(p => p.test(s.description))) {
        console.log(`  Description: "${s.description.substring(0, 100)}..."`)
      }
      if (s.benefits) {
        s.benefits.forEach((b, i) => {
          if (swedishPatterns.some(p => p.test(b))) {
            console.log(`  Benefit ${i + 1}: "${b}"`)
          }
        })
      }
      console.log('')
    })
  }
}

checkSpecific()
  .then(() => {
    console.log('\n✨ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
