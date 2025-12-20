/**
 * Cleanup script to remove old staging batches
 * This will keep only the most recent batch or remove all batches
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

async function cleanupStaging(keepLatest: boolean = false) {
  const supabase = createServerClient()

  // First, get all batches
  const { data: batches, error: batchError } = await supabase
    .from('supplement_import_staging')
    .select('import_batch_id, created_at')
    .order('created_at', { ascending: false })

  if (batchError) {
    console.error('Error fetching batches:', batchError)
    return
  }

  if (!batches || batches.length === 0) {
    console.log('No batches found')
    return
  }

  // Get unique batch IDs
  const uniqueBatches = Array.from(new Set(batches.map(b => b.import_batch_id)))
  console.log(`Found ${uniqueBatches.length} unique batches with ${batches.length} total rows\n`)

  // Show batch info
  for (const batchId of uniqueBatches) {
    const batchRows = batches.filter(b => b.import_batch_id === batchId)
    const firstRow = batchRows[0]
    console.log(`Batch: ${batchId.substring(0, 8)}...`)
    console.log(`  Created: ${firstRow.created_at}`)
    console.log(`  Rows: ${batchRows.length}`)
    
    // Check if processed
    const { data: processedCheck } = await supabase
      .from('supplement_import_staging')
      .select('processed')
      .eq('import_batch_id', batchId)
      .limit(1)
    
    const isProcessed = processedCheck && processedCheck.length > 0 && processedCheck[0].processed
    console.log(`  Processed: ${isProcessed ? 'Yes' : 'No'}\n`)
  }

  if (keepLatest) {
    // Keep only the latest batch
    const latestBatchId = uniqueBatches[0]
    const batchesToDelete = uniqueBatches.slice(1)
    
    if (batchesToDelete.length === 0) {
      console.log('Only one batch exists, nothing to clean up')
      return
    }

    console.log(`\n🗑️  Deleting ${batchesToDelete.length} old batches, keeping latest...`)
    
    for (const batchId of batchesToDelete) {
      const { error } = await supabase
        .from('supplement_import_staging')
        .delete()
        .eq('import_batch_id', batchId)
      
      if (error) {
        console.error(`Error deleting batch ${batchId.substring(0, 8)}...:`, error)
      } else {
        const deletedCount = batches.filter(b => b.import_batch_id === batchId).length
        console.log(`  ✅ Deleted batch ${batchId.substring(0, 8)}... (${deletedCount} rows)`)
      }
    }
    
    console.log(`\n✅ Cleanup complete. Kept latest batch with ${batches.filter(b => b.import_batch_id === latestBatchId).length} rows`)
  } else {
    // Delete all batches
    console.log(`\n🗑️  Deleting ALL batches...`)
    const { error } = await supabase
      .from('supplement_import_staging')
      .delete()
      .neq('import_batch_id', '00000000-0000-0000-0000-000000000000') // Delete all (this condition is always true)
    
    if (error) {
      console.error('Error deleting all batches:', error)
    } else {
      console.log(`✅ Deleted all ${batches.length} rows from staging table`)
    }
  }
}

// Parse command line arguments
const args = process.argv.slice(2)
const deleteAll = args.includes('--all')
const keepLatest = args.includes('--keep-latest') || !deleteAll

if (deleteAll) {
  console.log('⚠️  Will delete ALL batches from staging table\n')
} else {
  console.log('ℹ️  Will keep the latest batch and delete others\n')
}

cleanupStaging(keepLatest)
  .then(() => {
    console.log('\n✅ Cleanup script completed')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Cleanup failed:', error)
    process.exit(1)
  })
