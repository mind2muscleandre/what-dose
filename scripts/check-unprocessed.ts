/**
 * Check which rows are unprocessed
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

async function checkUnprocessed() {
  const supabase = createServerClient()

  // Get latest batch
  const { data: batches } = await supabase
    .from('supplement_import_staging')
    .select('import_batch_id')
    .order('created_at', { ascending: false })
    .limit(1)

  if (!batches || batches.length === 0) {
    console.log('No batches found')
    return
  }

  const batchId = batches[0].import_batch_id

  // Get unprocessed rows
  const { data: unprocessed, error } = await supabase
    .from('supplement_import_staging')
    .select('*')
    .eq('import_batch_id', batchId)
    .eq('processed', false)
    .order('row_data->>name_en')

  if (error) {
    console.error('Error:', error)
    return
  }

  console.log(`Unprocessed rows: ${unprocessed?.length || 0}\n`)

  if (unprocessed && unprocessed.length > 0) {
    console.log('Sample of unprocessed rows (first 20):')
    unprocessed.slice(0, 20).forEach((row: any) => {
      const name = row.row_data?.name_en || 'N/A'
      const isParent = row.is_parent
      const parentName = row.parent_supplement_name || 'null'
      const error = row.processing_error || 'none'
      console.log(`  - ${name} (is_parent: ${isParent}, parent: "${parentName}", error: ${error})`)
    })
  }
}

checkUnprocessed()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
