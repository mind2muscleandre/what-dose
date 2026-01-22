/**
 * Check Supabase database status for supplements
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

async function checkStatus() {
  const supabase = createServerClient()

  console.log('📊 Checking Supabase database status...\n')

  // Check total supplements
  const { count: totalCount, error: countError } = await supabase
    .from('supplements')
    .select('*', { count: 'exact', head: true })

  if (countError) {
    console.error('❌ Error counting supplements:', countError)
    process.exit(1)
  }

  // Check parent supplements
  const { count: parentCount, error: parentCountError } = await supabase
    .from('supplements')
    .select('*', { count: 'exact', head: true })
    .eq('is_parent', true)

  if (parentCountError) {
    console.error('❌ Error counting parent supplements:', parentCountError)
    process.exit(1)
  }

  // Check variants
  const { count: variantCount, error: variantCountError } = await supabase
    .from('supplements')
    .select('*', { count: 'exact', head: true })
    .eq('is_parent', false)

  if (variantCountError) {
    console.error('❌ Error counting variants:', variantCountError)
    process.exit(1)
  }

  // Check descriptions and benefits for all supplements
  const { data: allSupplements, error: fetchError } = await supabase
    .from('supplements')
    .select('id, name_en, is_parent, description, benefits')

  if (fetchError) {
    console.error('❌ Error fetching supplements:', fetchError)
    process.exit(1)
  }

  const parents = allSupplements?.filter(s => s.is_parent) || []
  const variants = allSupplements?.filter(s => !s.is_parent) || []
  
  const parentsWithDescription = parents.filter(s => s.description && s.description.length > 0).length
  const parentsWithBenefits = parents.filter(s => s.benefits && Array.isArray(s.benefits) && s.benefits.length === 3).length
  const variantsWithDescription = variants.filter(s => s.description && s.description.length > 0).length
  const variantsWithBenefits = variants.filter(s => s.benefits && Array.isArray(s.benefits) && s.benefits.length === 3).length
  
  const totalWithDescription = (allSupplements?.filter(s => s.description && s.description.length > 0).length || 0)
  const totalWithBenefits = (allSupplements?.filter(s => s.benefits && Array.isArray(s.benefits) && s.benefits.length === 3).length || 0)

  console.log('📈 Database Statistics:')
  console.log('='.repeat(50))
  console.log(`Total supplements: ${totalCount}`)
  console.log(`  - Parent supplements: ${parentCount}`)
  console.log(`  - Variants: ${variantCount}`)
  console.log('')
  console.log(`Parent supplements with content:`)
  console.log(`  ✅ With description: ${parentsWithDescription}/${parentCount} (${Math.round((parentsWithDescription/(parentCount || 1))*100)}%)`)
  console.log(`  ✅ With 3 benefits: ${parentsWithBenefits}/${parentCount} (${Math.round((parentsWithBenefits/(parentCount || 1))*100)}%)`)
  console.log('')
  console.log(`Variants with content:`)
  console.log(`  ✅ With description: ${variantsWithDescription}/${variantCount} (${Math.round((variantsWithDescription/(variantCount || 1))*100)}%)`)
  console.log(`  ✅ With 3 benefits: ${variantsWithBenefits}/${variantCount} (${Math.round((variantsWithBenefits/(variantCount || 1))*100)}%)`)
  console.log('')
  console.log(`Total (all supplements):`)
  console.log(`  ✅ With description: ${totalWithDescription}/${totalCount} (${Math.round((totalWithDescription/(totalCount || 1))*100)}%)`)
  console.log(`  ✅ With 3 benefits: ${totalWithBenefits}/${totalCount} (${Math.round((totalWithBenefits/(totalCount || 1))*100)}%)`)

  // Check if description and benefits columns exist
  const sample = allSupplements?.[0]
  if (sample) {
    console.log('\n📋 Column Status:')
    console.log(`  - description column: ${sample.description !== undefined ? '✅ Exists' : '❌ Missing'}`)
    console.log(`  - benefits column: ${sample.benefits !== undefined ? '✅ Exists' : '❌ Missing'}`)
  }

  // Show sample
  if (allSupplements && allSupplements.length > 0) {
    console.log('\n📝 Sample supplement:')
    const sample = allSupplements[0]
    console.log(`  Name: ${sample.name_en}`)
    console.log(`  Description: ${sample.description?.substring(0, 80) || 'MISSING'}...`)
    console.log(`  Benefits: ${sample.benefits?.length || 0} benefits`)
    if (sample.benefits && sample.benefits.length > 0) {
      sample.benefits.forEach((b, i) => console.log(`    ${i + 1}. ${b}`))
    }
  }

  // Show sample from both parents and variants
  if (parents.length > 0 && variants.length > 0) {
    console.log('\n📝 Sample parent supplement:')
    const sampleParent = parents[0]
    console.log(`  Name: ${sampleParent.name_en}`)
    console.log(`  Description: ${sampleParent.description?.substring(0, 80) || 'MISSING'}...`)
    console.log(`  Benefits: ${sampleParent.benefits?.length || 0} benefits`)
    
    console.log('\n📝 Sample variant supplement:')
    const sampleVariant = variants[0]
    console.log(`  Name: ${sampleVariant.name_en}`)
    console.log(`  Description: ${sampleVariant.description?.substring(0, 80) || 'MISSING'}...`)
    console.log(`  Benefits: ${sampleVariant.benefits?.length || 0} benefits`)
  }
}

checkStatus()
  .then(() => {
    console.log('\n✨ Check complete!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error)
    process.exit(1)
  })
