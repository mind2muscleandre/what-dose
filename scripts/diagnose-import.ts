/**
 * Diagnostic script to check why variants aren't being linked
 */

// Load environment variables from .env.local FIRST
import * as fs from 'fs'
import * as path from 'path'

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

async function diagnose() {
  const supabase = createServerClient()

  // Get the latest batch
  const { data: batches, error: batchError } = await supabase
    .from('supplement_import_staging')
    .select('import_batch_id, created_at')
    .order('created_at', { ascending: false })
    .limit(1)

  if (batchError || !batches || batches.length === 0) {
    console.error('No batches found')
    return
  }

  const batchId = batches[0].import_batch_id
  console.log(`\n📊 Diagnosing batch: ${batchId}\n`)

  // Check staging records
  const { data: staging, error: stagingError } = await supabase
    .from('supplement_import_staging')
    .select('*')
    .eq('import_batch_id', batchId)
    .order('is_parent', { ascending: false })

  if (stagingError) {
    console.error('Error fetching staging:', stagingError)
    return
  }

  const parents = staging?.filter(s => s.is_parent) || []
  const variants = staging?.filter(s => !s.is_parent) || []
  
  console.log(`Parents in staging: ${parents.length}`)
  console.log(`Variants in staging: ${variants.length}\n`)

  // Check how many variants have parent_supplement_name
  const variantsWithParentName = variants.filter(v => v.parent_supplement_name)
  console.log(`Variants with parent_supplement_name: ${variantsWithParentName.length}`)

  // Check how many variants have suggested_parent_id
  const variantsWithParentId = variants.filter(v => v.suggested_parent_id)
  console.log(`Variants with suggested_parent_id: ${variantsWithParentId.length}\n`)

  // Sample some variants to see their parent_supplement_name
  console.log('Sample variants (first 10):')
  variants.slice(0, 10).forEach(v => {
    console.log(`  - ${v.row_data?.name_en}: parent_supplement_name="${v.parent_supplement_name}", suggested_parent_id=${v.suggested_parent_id}`)
  })

  // Check created parents
  const { data: createdParents, error: parentsError } = await supabase
    .from('supplements')
    .select('id, name_en, is_parent')
    .eq('is_parent', true)
    .order('created_at', { ascending: false })
    .limit(20)

  if (parentsError) {
    console.error('Error fetching parents:', parentsError)
  } else {
    console.log(`\nCreated parents (sample of 20):`)
    createdParents?.forEach(p => {
      console.log(`  - ${p.name_en} (id: ${p.id})`)
    })
  }

  // Try to match some variants with parents
  console.log('\n🔍 Checking matches...\n')
  const sampleVariants = variants.slice(0, 5)
  for (const variant of sampleVariants) {
    if (!variant.parent_supplement_name) continue
    
    const { data: matchingParents } = await supabase
      .from('supplements')
      .select('id, name_en')
      .eq('name_en', variant.parent_supplement_name)
      .eq('is_parent', true)
      .eq('parent_id', null)
      .limit(1)

    if (matchingParents && matchingParents.length > 0) {
      console.log(`✅ "${variant.row_data?.name_en}" -> parent_supplement_name="${variant.parent_supplement_name}" matches parent id=${matchingParents[0].id}`)
    } else {
      console.log(`❌ "${variant.row_data?.name_en}" -> parent_supplement_name="${variant.parent_supplement_name}" has NO matching parent`)
    }
  }
}

diagnose()
  .then(() => {
    console.log('\n✅ Diagnosis complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Diagnosis failed:', error)
    process.exit(1)
  })
