/**
 * Verify that all supplements have descriptions and benefits
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

async function verifyContent() {
  const supabase = createServerClient()

  const { data, error } = await supabase
    .from('supplements')
    .select('id, name_en, description, benefits')
    .eq('is_parent', true)
    .order('name_en')

  if (error) {
    console.error('❌ Error:', error)
    process.exit(1)
  }

  if (!data || data.length === 0) {
    console.log('⚠️  No supplements found')
    process.exit(0)
  }

  const total = data.length
  const withDescription = data.filter(s => s.description && s.description.length > 0).length
  const withBenefits = data.filter(s => s.benefits && Array.isArray(s.benefits) && s.benefits.length === 3).length
  const missingDescription = data.filter(s => !s.description || s.description.length === 0).length
  const missingBenefits = data.filter(s => !s.benefits || !Array.isArray(s.benefits) || s.benefits.length !== 3).length

  console.log('📊 Database Verification:')
  console.log('='.repeat(50))
  console.log(`Total supplements: ${total}`)
  console.log(`✅ With description: ${withDescription} (${Math.round(withDescription/total*100)}%)`)
  console.log(`✅ With 3 benefits: ${withBenefits} (${Math.round(withBenefits/total*100)}%)`)
  console.log(`❌ Missing description: ${missingDescription}`)
  console.log(`❌ Missing/incomplete benefits: ${missingBenefits}`)

  if (missingDescription > 0 || missingBenefits > 0) {
    console.log('\n⚠️  Supplements missing content:')
    const missing = data.filter(s => !s.description || s.description.length === 0 || !s.benefits || !Array.isArray(s.benefits) || s.benefits.length !== 3)
    missing.slice(0, 10).forEach(s => {
      const descStatus = s.description && s.description.length > 0 ? '✅' : '❌'
      const benefitsStatus = s.benefits && Array.isArray(s.benefits) && s.benefits.length === 3 ? '✅' : '❌'
      console.log(`   - ${s.name_en}: desc=${descStatus}, benefits=${benefitsStatus} (${s.benefits?.length || 0})`)
    })
    if (missing.length > 10) {
      console.log(`   ... and ${missing.length - 10} more`)
    }
  } else {
    console.log('\n✅ All supplements have proper descriptions and 3 benefits!')
  }

  // Show some examples
  console.log('\n📝 Sample supplements:')
  data.slice(0, 3).forEach(s => {
    console.log(`\n${s.name_en}:`)
    console.log(`  Description: ${s.description?.substring(0, 80)}...`)
    console.log(`  Benefits:`)
    s.benefits?.forEach((b, i) => console.log(`    ${i + 1}. ${b}`))
  })
}

verifyContent()
  .then(() => {
    console.log('\n✨ Verification complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
