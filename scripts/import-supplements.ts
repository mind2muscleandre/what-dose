/**
 * CSV Import Script for Supplements with Parent-Child Detection
 * 
 * This script:
 * 1. Reads the CSV file
 * 2. Detects parent-child relationships
 * 3. Inserts data into supplement_import_staging
 * 4. Processes the batch using the database function
 * 
 * Usage:
 *   npx ts-node scripts/import-supplements.ts <path-to-csv>
 * 
 * Or with tsx:
 *   npx tsx scripts/import-supplements.ts <path-to-csv>
 */

// Load environment variables from .env.local FIRST, before any other imports
import * as fs from 'fs'
import * as path from 'path'

// Load .env.local file manually
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach(line => {
    const trimmed = line.trim()
    // Skip comments and empty lines
    if (trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([^=:#]+)=(.*)$/)
      if (match) {
        const key = match[1].trim()
        let value = match[2].trim()
        // Remove quotes if present
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

interface CSVRow {
  name_sv: string
  name_en: string
  research_status: string
  dosing_base: string
  dosing_max: string
  description: string
  bioavailability: string
  interaction_risk: string
  is_base_health: string
  category_ids: string
}

interface ParsedDosing {
  value: number | null
  unit: string | null
}

interface ProcessedRow extends CSVRow {
  parent_supplement_name?: string
  is_parent: boolean
  suggested_parent_id?: number
}

/**
 * Detect parent-child relationships based on CSV patterns
 */
function detectParentChild(rows: CSVRow[]): ProcessedRow[] {
  const processed: ProcessedRow[] = []
  
  // First pass: identify potential parents (names without parentheses, not compound variants)
  const potentialParents = new Set<string>()
  const nameToRow = new Map<string, CSVRow>()
  
  rows.forEach(row => {
    nameToRow.set(row.name_en, row)
    const hasParentheses = /\(/.test(row.name_en)
    const baseName = extractBaseName(row.name_en)
    const isCompound = isCompoundVariant(row.name_en, baseName)
    
    // A name is a potential parent if it doesn't have parentheses and isn't a compound variant
    if (!hasParentheses && !isCompound) {
      potentialParents.add(row.name_en)
    }
  })

  // Second pass: classify as parent or variant and find matching parent
  rows.forEach(row => {
    const hasParentheses = /\(/.test(row.name_en)
    const baseName = extractBaseName(row.name_en)
    const isCompound = isCompoundVariant(row.name_en, baseName)
    
    const processedRow: ProcessedRow = {
      ...row,
      is_parent: false,
      parent_supplement_name: undefined,
    }

    // Find the best matching parent
    let bestParent: string | null = null
    
    // If it's a potential parent itself and has no parentheses, it's a parent
    if (potentialParents.has(row.name_en) && !hasParentheses) {
      processedRow.is_parent = true
    } else {
      // It's a variant - find matching parent
      // Strategy 1: Check if name starts with parent name (e.g., "Gotu Kola (Centella)" starts with "Gotu Kola")
      for (const parentName of potentialParents) {
        const nameWithoutParens = row.name_en.replace(/\([^)]*\)/g, '').trim()
        if (nameWithoutParens.startsWith(parentName) || 
            row.name_en.startsWith(parentName + ' ') ||
            row.name_en.startsWith(parentName + '(')) {
          bestParent = parentName
          break
        }
      }
      
      // Strategy 2: Check if name contains parent name (e.g., "Acetyl-L-Carnitine (ALCAR)" contains "ALCAR")
      if (!bestParent) {
        for (const parentName of potentialParents) {
          // Check if parent name appears in the variant name (case-insensitive)
          const variantLower = row.name_en.toLowerCase()
          const parentLower = parentName.toLowerCase()
          if (variantLower.includes(parentLower) && parentName !== row.name_en) {
            bestParent = parentName
            break
          }
        }
      }
      
      // Strategy 3: Try base name matching
      if (!bestParent) {
        for (const parentName of potentialParents) {
          const parentBase = extractBaseName(parentName)
          if (parentBase === baseName && parentName !== row.name_en) {
            bestParent = parentName
            break
          }
        }
      }
      
      // Strategy 4: If name has parentheses, extract parent name from variant FIRST
      // e.g., "BCAA (Branched Chain Amino Acids)" -> parent should be "BCAA"
      // e.g., "Vitamin B1 (Thiamine)" -> parent should be "Vitamin B1"
      if (!bestParent && hasParentheses) {
        const match = row.name_en.match(/^([^(]+)\s*\(/)
        if (match) {
          const extractedParent = match[1].trim()
          
          // First check if the exact extracted name exists as a potential parent
          if (potentialParents.has(extractedParent)) {
            bestParent = extractedParent
          } else {
            // Try to find an exact match (case-insensitive)
            for (const parentName of potentialParents) {
              if (parentName.toLowerCase() === extractedParent.toLowerCase()) {
                bestParent = parentName
                break
              }
            }
            
            // If still no match, check if any parent starts with the extracted parent
            // But be more strict - only match if it's a good fit
            if (!bestParent) {
              for (const parentName of potentialParents) {
                // Match if parent starts with extracted parent (e.g., "Vitamin B1" matches "Vitamin B1 (Thiamine)")
                if (parentName.toLowerCase().startsWith(extractedParent.toLowerCase()) &&
                    Math.abs(parentName.length - extractedParent.length) < 5) {
                  bestParent = parentName
                  break
                }
              }
            }
            
            // If still no match, use the extracted name (it will be created as a parent)
            if (!bestParent && extractedParent.length > 0) {
              bestParent = extractedParent
            }
          }
        }
      }
      
      // Strategy 5: Find shortest parent that starts with baseName (only if no parentheses)
      if (!bestParent && !hasParentheses && (isCompound || baseName !== row.name_en)) {
        let shortestMatch: string | null = null
        for (const parentName of potentialParents) {
          if (parentName.startsWith(baseName) || extractBaseName(parentName) === baseName) {
            if (!shortestMatch || parentName.length < shortestMatch.length) {
              shortestMatch = parentName
            }
          }
        }
        bestParent = shortestMatch || null
      }
      
      // Strategy 6: For compound names, try to find parent by first word
      if (!bestParent && isCompound) {
        const firstWord = row.name_en.split(/\s+/)[0]
        for (const parentName of potentialParents) {
          if (parentName.startsWith(firstWord) || firstWord.startsWith(parentName.split(/\s+/)[0])) {
            bestParent = parentName
            break
          }
        }
        // If still no match, use first word as parent
        if (!bestParent && firstWord.length > 2) {
          bestParent = firstWord
        }
      }
      
      processedRow.is_parent = false
      processedRow.parent_supplement_name = bestParent || undefined
    }

    processed.push(processedRow)
  })
  
  // Third pass: Create missing parents for variants that couldn't find a match
  // If a variant has a parent_supplement_name that doesn't exist in potentialParents,
  // we need to create a parent row for it
  const missingParents = new Set<string>()
  processed.forEach(row => {
    if (!row.is_parent && row.parent_supplement_name && !potentialParents.has(row.parent_supplement_name)) {
      // Check if this parent name already exists as a row
      const existsAsRow = rows.some(r => r.name_en === row.parent_supplement_name)
      if (!existsAsRow) {
        missingParents.add(row.parent_supplement_name)
      }
    }
  })
  
  // Add missing parents as new rows
  missingParents.forEach(parentName => {
    // Find a variant that uses this parent to get default values
    const variantRow = processed.find(r => r.parent_supplement_name === parentName)
    if (variantRow) {
      const parentRow: ProcessedRow = {
        ...variantRow,
        name_en: parentName,
        name_sv: parentName, // Use English name as fallback
        is_parent: true,
        parent_supplement_name: undefined,
      }
      processed.push(parentRow)
    }
  })

  return processed
}

/**
 * Extract base name from supplement name
 * Examples:
 *   "Magnesium L-Threonate" -> "Magnesium"
 *   "Ashwagandha (KSM-66)" -> "Ashwagandha"
 *   "Magnesiumglycinat" -> "Magnesium"
 */
function extractBaseName(name: string): string {
  // Remove parentheses and content within
  let base = name.replace(/\([^)]*\)/g, '').trim()

  // Check for compound names (e.g., "Magnesiumglycinat" -> "Magnesium")
  const commonBases = [
    'Magnesium', 'Vitamin', 'Curcumin', 'Ashwagandha', 'Berberine',
    'L-', 'D-', 'Alpha', 'Beta', 'Omega'
  ]

  for (const baseWord of commonBases) {
    if (base.startsWith(baseWord)) {
      return baseWord
    }
  }

  // Try to split on common separators
  const parts = base.split(/\s+/)
  if (parts.length > 1) {
    // Return first word if it looks like a base (capitalized, common length)
    if (parts[0].length > 2 && parts[0][0] === parts[0][0].toUpperCase()) {
      return parts[0]
    }
  }

  return base
}

/**
 * Check if name is a compound variant (e.g., "Magnesiumglycinat")
 */
function isCompoundVariant(name: string, baseName: string): boolean {
  // If name starts with base but has more characters without space, it's compound
  if (name.startsWith(baseName) && name.length > baseName.length) {
    const rest = name.substring(baseName.length)
    // No space means it's likely a compound word
    return !rest.includes(' ')
  }
  return false
}

/**
 * Parse dosing string (e.g., "50 mg", "2000 IU", "1 g") into value and unit
 */
function parseDosing(dosing: string): ParsedDosing {
  if (!dosing || dosing.trim() === '-' || dosing.trim() === '') {
    return { value: null, unit: null }
  }
  
  const trimmed = dosing.trim()
  
  // Try to extract number and unit
  const match = trimmed.match(/^([\d.]+)\s*([a-zA-Z]+)?$/)
  if (match) {
    const value = parseFloat(match[1])
    const unit = match[2] || null
    
    // Normalize common units
    let normalizedUnit = unit
    if (unit) {
      const unitLower = unit.toLowerCase()
      if (unitLower === 'mg' || unitLower === 'mcg' || unitLower === 'g' || 
          unitLower === 'iu' || unitLower === 'ml' || unitLower === 'tsk' ||
          unitLower === 'koppar' || unitLower === 'dos' || unitLower === 'tabs' ||
          unitLower === 'mdr' || unitLower === 'mrd' || unitLower === 'hu') {
        normalizedUnit = unitLower
      }
    }
    
    return { value: isNaN(value) ? null : value, unit: normalizedUnit }
  }
  
  // If no match, try to extract just the number
  const numberMatch = trimmed.match(/[\d.]+/)
  if (numberMatch) {
    const value = parseFloat(numberMatch[0])
    return { value: isNaN(value) ? null : value, unit: null }
  }
  
  return { value: null, unit: null }
}

/**
 * Extract risk level from interaction_risk text
 */
function extractRiskLevel(riskText: string): string {
  if (!riskText) return 'Low'
  
  const text = riskText.toLowerCase()
  if (text.includes('high') || text.includes('hög')) return 'High'
  if (text.includes('medium') || text.includes('medel')) return 'Medium'
  return 'Low'
}

/**
 * Parse CSV file
 */
function parseCSV(filePath: string): CSVRow[] {
  const content = fs.readFileSync(filePath, 'utf-8')
  const lines = content.split('\n').filter(line => line.trim())
  
  // Skip header if present (assuming format: name_sv,name_en,research_status,dosing_base,dosing_max,description,bioavailability,interaction_risk,is_base_health,category_ids)
  const rows: CSVRow[] = []
  
  for (const line of lines) {
    // Simple CSV parsing (handles quoted fields)
    const fields = parseCSVLine(line)
    
    if (fields.length >= 10) {
      rows.push({
        name_sv: fields[0] || '',
        name_en: fields[1] || '',
        research_status: fields[2] || 'Blue',
        dosing_base: fields[3] || '',
        dosing_max: fields[4] || '',
        description: fields[5] || '',
        bioavailability: fields[6] || '',
        interaction_risk: fields[7] || '',
        is_base_health: fields[8] || 'FALSE',
        category_ids: fields[9] || '',
      })
    }
  }
  
  return rows
}

/**
 * Parse a single CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const fields: string[] = []
  let current = ''
  let inQuotes = false
  
  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      fields.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  
  fields.push(current.trim())
  return fields
}

/**
 * Main import function
 */
async function importSupplements(csvFilePath: string) {
  console.log(`Reading CSV file: ${csvFilePath}`)
  
  // Parse CSV
  const csvRows = parseCSV(csvFilePath)
  console.log(`Parsed ${csvRows.length} rows from CSV`)

  // Detect parent-child relationships
  console.log('Detecting parent-child relationships...')
  const processedRows = detectParentChild(csvRows)
  
  const parentCount = processedRows.filter(r => r.is_parent).length
  const variantCount = processedRows.filter(r => !r.is_parent).length
  console.log(`Detected ${parentCount} parents and ${variantCount} variants`)

  // Initialize Supabase client
  const supabase = createServerClient()

  // Insert into staging table
  console.log('Inserting into staging table...')
  const batchId = crypto.randomUUID()
  
  const stagingInserts = processedRows.map(row => {
    // Parse dosings to extract values and units
    const baseDosing = parseDosing(row.dosing_base)
    const maxDosing = parseDosing(row.dosing_max)
    
    // Use unit from base dosing, fallback to max dosing
    const unit = baseDosing.unit || maxDosing.unit || null
    
    // Extract risk level from interaction_risk text
    const riskLevel = extractRiskLevel(row.interaction_risk)
    
    return {
      import_batch_id: batchId,
      row_data: {
        name_sv: row.name_sv,
        name_en: row.name_en,
        research_status: row.research_status,
        dosing_base_val: baseDosing.value,
        dosing_max_val: maxDosing.value,
        unit: unit,
        description: row.description,
        bioavailability: row.bioavailability,
        interaction_risk: row.interaction_risk,
        interaction_risk_level: riskLevel,
        is_base_health: row.is_base_health,
        category_ids: row.category_ids,
      },
      parent_supplement_name: row.parent_supplement_name || null,
      is_parent: row.is_parent,
      suggested_parent_id: null,
    }
  })

  // Insert in batches to avoid overwhelming the database
  const BATCH_SIZE = 100
  for (let i = 0; i < stagingInserts.length; i += BATCH_SIZE) {
    const batch = stagingInserts.slice(i, i + BATCH_SIZE)
    const { error } = await supabase
      .from('supplement_import_staging')
      .insert(batch)
    
    if (error) {
      console.error(`Error inserting batch ${i / BATCH_SIZE + 1}:`, error)
      throw error
    }
    console.log(`Inserted batch ${i / BATCH_SIZE + 1}/${Math.ceil(stagingInserts.length / BATCH_SIZE)}`)
  }

  // Process the batch using the database function
  console.log('Processing batch using database function...')
  const { data, error } = await supabase.rpc('process_supplement_import_batch', {
    batch_id: batchId
  })

  if (error) {
    console.error('Error processing batch:', error)
    throw error
  }

  console.log('Import completed!')
  console.log('Results:', data)
}

// Run if executed directly
if (require.main === module) {
  const csvPath = process.argv[2]
  
  if (!csvPath) {
    console.error('Usage: npx tsx scripts/import-supplements.ts <path-to-csv>')
    process.exit(1)
  }

  const fullPath = path.resolve(csvPath)
  if (!fs.existsSync(fullPath)) {
    console.error(`File not found: ${fullPath}`)
    process.exit(1)
  }

  importSupplements(fullPath)
    .then(() => {
      console.log('✅ Import completed successfully')
      process.exit(0)
    })
    .catch((error) => {
      console.error('❌ Import failed:', error)
      process.exit(1)
    })
}

export { importSupplements, detectParentChild }
