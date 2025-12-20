/**
 * Count all rows in staging table
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

async function countStaging() {
  const supabase = createServerClient()

  // Count all rows
  const { count, error } = await supabase
    .from('supplement_import_staging')
    .select('*', { count: 'exact', head: true })

  if (error) {
    console.error('Error counting rows:', error)
    return
  }

  console.log(`Total rows in staging table: ${count}`)

  // Get all unique batch IDs
  const { data: batches, error: batchError } = await supabase
    .from('supplement_import_staging')
    .select('import_batch_id')
    .order('created_at', { ascending: false })

  if (batchError) {
    console.error('Error fetching batches:', batchError)
    return
  }

  const uniqueBatches = Array.from(new Set(batches?.map(b => b.import_batch_id) || []))
  console.log(`Unique batches: ${uniqueBatches.length}`)

  // Count rows per batch
  for (const batchId of uniqueBatches) {
    const { count: batchCount } = await supabase
      .from('supplement_import_staging')
      .select('*', { count: 'exact', head: true })
      .eq('import_batch_id', batchId)
    
    console.log(`  Batch ${batchId.substring(0, 8)}...: ${batchCount} rows`)
  }
}

countStaging()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
