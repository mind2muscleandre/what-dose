/**
 * Count supplements in the supplements table
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

async function countSupplements() {
  const supabase = createServerClient()

  // Count all supplements
  const { count: totalCount, error: totalError } = await supabase
    .from('supplements')
    .select('*', { count: 'exact', head: true })

  if (totalError) {
    console.error('Error counting supplements:', totalError)
    return
  }

  console.log(`Total supplements: ${totalCount}`)

  // Count parents
  const { count: parentsCount } = await supabase
    .from('supplements')
    .select('*', { count: 'exact', head: true })
    .eq('is_parent', true)

  console.log(`Parents: ${parentsCount}`)

  // Count variants
  const { count: variantsCount } = await supabase
    .from('supplements')
    .select('*', { count: 'exact', head: true })
    .eq('is_parent', false)

  console.log(`Variants: ${variantsCount}`)
}

countSupplements()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
