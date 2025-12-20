/**
 * Check import status
 */

// Load environment variables
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

async function checkStatus() {
  const supabase = createServerClient()

  // Get latest batch
  const { data: batches, error: batchError } = await supabase
    .from('supplement_import_staging')
    .select('import_batch_id, created_at, processed')
    .order('created_at', { ascending: false })
    .limit(1)

  if (batchError || !batches || batches.length === 0) {
    console.log('No batches found')
    return
  }

  const latestBatch = batches[0]
  console.log(`Latest batch: ${latestBatch.import_batch_id.substring(0, 8)}...`)
  console.log(`Created: ${latestBatch.created_at}`)
  console.log(`Processed: ${latestBatch.processed ? 'Yes' : 'No'}\n`)

  // Count rows in staging
  const { count: stagingCount } = await supabase
    .from('supplement_import_staging')
    .select('*', { count: 'exact', head: true })
    .eq('import_batch_id', latestBatch.import_batch_id)

  console.log(`Rows in staging: ${stagingCount}`)

  // Count processed vs unprocessed
  const { count: processedCount } = await supabase
    .from('supplement_import_staging')
    .select('*', { count: 'exact', head: true })
    .eq('import_batch_id', latestBatch.import_batch_id)
    .eq('processed', true)

  const { count: unprocessedCount } = await supabase
    .from('supplement_import_staging')
    .select('*', { count: 'exact', head: true })
    .eq('import_batch_id', latestBatch.import_batch_id)
    .eq('processed', false)

  console.log(`Processed: ${processedCount}`)
  console.log(`Unprocessed: ${unprocessedCount}\n`)

  // Count supplements
  const { count: totalSupplements } = await supabase
    .from('supplements')
    .select('*', { count: 'exact', head: true })

  const { count: parentsCount } = await supabase
    .from('supplements')
    .select('*', { count: 'exact', head: true })
    .eq('is_parent', true)

  const { count: variantsCount } = await supabase
    .from('supplements')
    .select('*', { count: 'exact', head: true })
    .eq('is_parent', false)

  console.log(`Supplements in database:`)
  console.log(`  Total: ${totalSupplements}`)
  console.log(`  Parents: ${parentsCount}`)
  console.log(`  Variants: ${variantsCount}`)
}

checkStatus()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
