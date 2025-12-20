/**
 * Reprocess the latest batch
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

async function reprocessBatch() {
  const supabase = createServerClient()

  // Get latest batch
  const { data: batches, error: batchError } = await supabase
    .from('supplement_import_staging')
    .select('import_batch_id')
    .order('created_at', { ascending: false })
    .limit(1)

  if (batchError || !batches || batches.length === 0) {
    console.error('No batches found')
    return
  }

  const batchId = batches[0].import_batch_id
  console.log(`Reprocessing batch: ${batchId.substring(0, 8)}...\n`)

  // Reset processed status for unprocessed rows
  const { error: resetError } = await supabase
    .from('supplement_import_staging')
    .update({ processed: false, suggested_parent_id: null })
    .eq('import_batch_id', batchId)
    .eq('processed', true)

  if (resetError) {
    console.error('Error resetting processed status:', resetError)
    return
  }

  // Process the batch
  const { data, error } = await supabase.rpc('process_supplement_import_batch', {
    batch_id: batchId
  })

  if (error) {
    console.error('Error processing batch:', error)
    return
  }

  console.log('Results:', data)
}

reprocessBatch()
  .then(() => {
    console.log('\n✅ Reprocessing complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Reprocessing failed:', error)
    process.exit(1)
  })
