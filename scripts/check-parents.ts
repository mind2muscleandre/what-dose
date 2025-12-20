/**
 * Check if specific parents exist
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

async function checkParents() {
  const supabase = createServerClient()

  const parentsToCheck = ['Vitamin K2', 'ALCAR', 'BCAA', 'Acetyl-L-Carnitine']

  for (const parentName of parentsToCheck) {
    const { data, error } = await supabase
      .from('supplements')
      .select('id, name_en, is_parent, parent_id')
      .eq('name_en', parentName)
      .eq('is_parent', true)

    if (error) {
      console.error(`Error checking ${parentName}:`, error)
    } else {
      console.log(`${parentName}:`, data?.length || 0, 'found')
      if (data && data.length > 0) {
        console.log('  Details:', data)
      }
    }
  }
}

checkParents()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
