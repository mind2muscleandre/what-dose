/**
 * Script to truncate (empty) supplement tables
 * WARNING: This will delete ALL data from the tables!
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

async function truncateTables() {
  const supabase = createServerClient()

  const args = process.argv.slice(2)
  const stagingOnly = args.includes('--staging-only')
  const supplementsOnly = args.includes('--supplements-only')

  if (!stagingOnly && !supplementsOnly) {
    console.log('⚠️  Will truncate BOTH tables: supplement_import_staging AND supplements\n')
    console.log('Use --staging-only to only truncate staging table')
    console.log('Use --supplements-only to only truncate supplements table\n')
  }

  // Truncate staging table
  if (!supplementsOnly) {
    console.log('🗑️  Truncating supplement_import_staging...')
    const { error: stagingError } = await supabase
      .from('supplement_import_staging')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all (this condition is always true)
    
    if (stagingError) {
      console.error('❌ Error truncating staging:', stagingError)
    } else {
      console.log('✅ supplement_import_staging truncated')
    }
  }

  // Truncate supplements table
  if (!stagingOnly) {
    console.log('🗑️  Truncating supplements...')
    const { error: supplementsError } = await supabase
      .from('supplements')
      .delete()
      .neq('id', 0) // Delete all (this condition is always true)
    
    if (supplementsError) {
      console.error('❌ Error truncating supplements:', supplementsError)
    } else {
      console.log('✅ supplements truncated')
    }
  }

  console.log('\n✅ Done!')
}

truncateTables()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
