/**
 * Stack Builder
 * Generates Basic Health Stack and Goal Stack based on user profile
 */

import { supabase } from './supabase'
import { calculateDosageFromSupplement, type Gender } from './dosage-calculator'
import type { ScheduleBlock, ResearchStatus } from './database.types'

export interface UserProfile {
  id: string
  age: number | null
  weight_kg: number | null
  gender: Gender | null
  experience_level: string | null // 'beginner' | 'intermediate' | 'advanced' | 'biohacker'
  health_conditions: string[] | null // e.g., ['SSRI', 'Blood Thinners']
  selected_goals: string[] | null
}

export interface StackItem {
  supplement_id: number
  schedule_block: ScheduleBlock
  custom_dosage_val: number | null
  is_active: boolean
  // Metadata for smart blending
  source_goals?: string[] // Which goals this supplement came from
  evidence_level?: ResearchStatus // Green, Blue, Red
  priority?: number // Higher = more important
}

export interface StackBuilderResult {
  success: boolean
  basicHealthStack: StackItem[]
  goalStack: StackItem[]
  errors: string[]
  warnings: string[]
}

/**
 * Check if supplement has contraindications for user
 */
function hasContraindication(
  supplementContraindications: string[] | null,
  userHealthConditions: string[] | null
): boolean {
  if (!supplementContraindications || supplementContraindications.length === 0) {
    return false
  }

  if (!userHealthConditions || userHealthConditions.length === 0) {
    return false
  }

  // Check if any user health condition matches a supplement contraindication
  return supplementContraindications.some(contraindication =>
    userHealthConditions.some(condition =>
      condition.toLowerCase() === contraindication.toLowerCase()
    )
  )
}

/**
 * Check if user should see Red (Experimental) supplements
 * Red = Level C (Experimental) - only for Biohacker level
 */
function shouldShowExperimental(experienceLevel: string | null): boolean {
  return experienceLevel === 'biohacker'
}

/**
 * Determine if user needs Iron based on Avatar rules
 */
function needsIron(age: number | null, gender: Gender | null): boolean {
  // Women 20-50: Require Iron (unless post-menopausal - we'll assume not for now)
  if (gender === 'female' && age !== null && age >= 20 && age <= 50) {
    return true
  }

  // Men & Women 50+: NO Iron
  if (age !== null && age >= 50) {
    return false
  }

  // Default: no iron
  return false
}

/**
 * Determine if user needs CoQ10 and K2 based on Avatar rules
 */
function needsCoQ10AndK2(age: number | null): boolean {
  // Age 40+: Add CoQ10 and K2
  return age !== null && age >= 40
}

/**
 * Build Basic Health Stack based on Avatar (Age/Gender) and Weight
 */
async function buildBasicHealthStack(
  profile: UserProfile
): Promise<{ items: StackItem[]; errors: string[]; warnings: string[] }> {
  const items: StackItem[] = []
  const errors: string[] = []
  const warnings: string[] = []

  // Essential supplements for everyone
  // Include alternative names for more flexible searching
  const essentialSupplements = [
    { 
      name: 'Vitamin D3', 
      i18nKey: 'vit_d3', 
      scheduleBlock: 'Morning' as ScheduleBlock,
      alternatives: ['D3', 'Vitamin D', 'Cholecalciferol']
    },
    { 
      name: 'Omega-3', 
      i18nKey: 'omega_3', 
      scheduleBlock: 'Dinner' as ScheduleBlock,
      alternatives: ['Omega 3', 'Omega-3 (EPA/DHA)', 'Fish Oil', 'EPA/DHA']
    },
    { 
      name: 'Magnesium', 
      i18nKey: 'magnesium', 
      scheduleBlock: 'Bedtime' as ScheduleBlock,
      alternatives: ['Magnesium Glycinate', 'Magnesium L-Threonate', 'Mg']
    },
    { 
      name: 'Zinc', 
      i18nKey: 'zinc', 
      scheduleBlock: 'Morning' as ScheduleBlock,
      alternatives: ['Zinc Picolinate', 'Zn']
    }
  ]

  // Add Iron if needed
  if (needsIron(profile.age, profile.gender)) {
    essentialSupplements.push({
      name: 'Iron',
      i18nKey: 'iron',
      scheduleBlock: 'Morning' as ScheduleBlock,
      alternatives: ['Iron Bisglycinate', 'Ferrous', 'Fe']
    })
  }

  // Add CoQ10 and K2 if needed
  if (needsCoQ10AndK2(profile.age)) {
    essentialSupplements.push(
      { 
        name: 'CoQ10', 
        i18nKey: 'coq10', 
        scheduleBlock: 'Morning' as ScheduleBlock,
        alternatives: ['Coenzyme Q10', 'Ubiquinone', 'Ubiquinol']
      },
      { 
        name: 'Vitamin K2', 
        i18nKey: 'vit_k2', 
        scheduleBlock: 'Morning' as ScheduleBlock,
        alternatives: ['K2', 'MK-7', 'MK-4', 'Menaquinone']
      }
    )
  }

  // Import findSupplementByName for better search logic
  const { findSupplementByName } = await import('./generate-stack-from-predefined')

  // Find and add each supplement
  for (const supplement of essentialSupplements) {
    // Try to find by i18n_key first
    let found = null

    if (supplement.i18nKey) {
      const { data, error } = await supabase
        .from('supplements')
        .select('*')
        .eq('is_parent', true)
        .eq('i18n_key', `supplements.${supplement.i18nKey}`)
        .limit(1)
        .maybeSingle()

      if (data && !error) {
        found = data
      }
    }

    // Fallback to findSupplementByName which has better search logic
    if (!found) {
      try {
        const foundByName = await findSupplementByName(
          supplement.name,
          supplement.alternatives
        )

        if (foundByName) {
          // Get full supplement data
          const { data: fullData, error: fullError } = await supabase
            .from('supplements')
            .select('*')
            .eq('id', foundByName.id)
            .single()

          if (fullData && !fullError) {
            found = fullData
          } else if (fullError) {
            console.warn(`Error fetching full data for ${supplement.name}:`, fullError)
          }
        }
      } catch (error) {
        console.error(`Error in findSupplementByName for ${supplement.name}:`, error)
      }
    }

    if (found) {
      // Check contraindications
      if (hasContraindication(found.contraindications, profile.health_conditions)) {
        warnings.push(`Skipped ${found.name_en}: contraindicated with user's health conditions`)
        continue
      }

      // Calculate dosage
      const dosageResult = calculateDosageFromSupplement(
        {
          scaling_algorithm: found.scaling_algorithm as any,
          scaling_base_dose: found.scaling_base_dose,
          dosing_base_val: found.dosing_base_val,
          scaling_safe_min: found.scaling_safe_min,
          scaling_safe_max: found.scaling_safe_max,
          scaling_gender_male: found.scaling_gender_male,
          scaling_gender_female: found.scaling_gender_female,
          unit: found.unit
        },
        profile.weight_kg,
        profile.gender
      )

      const customDosage = dosageResult?.calculatedDose ?? null

      items.push({
        supplement_id: found.id,
        schedule_block: supplement.scheduleBlock,
        custom_dosage_val: customDosage,
        is_active: true,
        source_goals: ['Basic Health'],
        evidence_level: found.research_status,
        priority: 10 // High priority for basic health
      })
    } else {
      // More detailed error message
      const searchTerms = [supplement.name, ...(supplement.alternatives || [])].join(', ')
      errors.push(`Could not find supplement: ${supplement.name} (searched for: ${searchTerms})`)
      
      // Debug: Check if supplement exists but isn't marked as parent
      const { data: debugCheck } = await supabase
        .from('supplements')
        .select('id, name_en, name_sv, is_parent, parent_id')
        .or(`name_en.ilike.%${supplement.name}%,name_sv.ilike.%${supplement.name}%`)
        .limit(10)
      
      if (debugCheck && debugCheck.length > 0) {
        console.warn(`Found ${debugCheck.length} supplements matching "${supplement.name}" but none marked as parent:`, debugCheck)
        console.warn('Consider marking one as parent or updating the search logic')
        console.warn('To fix, run: scripts/fix-vitamin-d3.sql (or similar script for other supplements)')
      } else {
        console.warn(`No supplements found matching "${supplement.name}" in database at all.`)
        console.warn('This supplement may need to be added to the database first.')
      }
      
      console.warn(`Could not find supplement "${supplement.name}" in database. Tried:`, {
        i18nKey: supplement.i18nKey ? `supplements.${supplement.i18nKey}` : null,
        name: supplement.name,
        alternatives: supplement.alternatives
      })
    }
  }

  return { items, errors, warnings }
}

/**
 * Build Goal Stack based on Category + Subcategory + Level
 * Uses predefined stacks from predefined-stacks.ts which are already curated
 */
async function buildGoalStack(
  profile: UserProfile,
  category: string,
  subcategory: string | null,
  level: string | null
): Promise<{ items: StackItem[]; errors: string[]; warnings: string[] }> {
  const items: StackItem[] = []
  const errors: string[] = []
  const warnings: string[] = []

  // Import predefined stacks
  const { fitnessStacks, cognitiveStacks, longevityStacks, sleepStacks } = await import('./predefined-stacks')
  const { findSupplementByName } = await import('./generate-stack-from-predefined')

  // Get the appropriate predefined stack based on category and subcategory
  let predefinedStack = null

  if (subcategory) {
    switch (category.toLowerCase()) {
      case 'fitness':
        predefinedStack = fitnessStacks[subcategory]
        break
      case 'cognitive':
        predefinedStack = cognitiveStacks[subcategory]
        break
      case 'longevity':
        predefinedStack = longevityStacks[subcategory]
        break
      case 'sleep':
        predefinedStack = sleepStacks[subcategory]
        break
    }
  }

  // If no stack found, try to get default for category
  if (!predefinedStack) {
    if (category.toLowerCase() === 'fitness') {
      predefinedStack = fitnessStacks.hypertrophy || fitnessStacks.strength
    } else if (category.toLowerCase() === 'cognitive') {
      predefinedStack = cognitiveStacks.focus || cognitiveStacks.memory
    } else if (category.toLowerCase() === 'longevity') {
      predefinedStack = longevityStacks.antiAging || longevityStacks.healthspan
    } else if (category.toLowerCase() === 'sleep') {
      predefinedStack = sleepStacks.quality || sleepStacks.deepSleep
    }
  }

  if (!predefinedStack) {
    warnings.push(`No predefined stack found for category: ${category}, subcategory: ${subcategory}`)
    return { items, errors, warnings }
  }

  // Get supplements based on experience level
  let stackSupplements = predefinedStack.supplements

  // Use experience level variations if available
  if (predefinedStack.experienceVariations) {
    const experienceLevel = profile.experience_level as 'beginner' | 'intermediate' | 'advanced' | 'biohacker'
    if (predefinedStack.experienceVariations[experienceLevel]) {
      stackSupplements = predefinedStack.experienceVariations[experienceLevel]
    }
  }

  // Find and add each supplement from the predefined stack
  for (const stackSupplement of stackSupplements) {
    // Check age/gender conditions
    if (stackSupplement.minAge && profile.age && profile.age < stackSupplement.minAge) {
      continue
    }
    if (stackSupplement.maxAge && profile.age && profile.age > stackSupplement.maxAge) {
      continue
    }
    if (stackSupplement.gender && stackSupplement.gender !== 'all' && profile.gender !== stackSupplement.gender) {
      continue
    }

    // Find supplement in database
    const found = await findSupplementByName(
      stackSupplement.supplementName,
      stackSupplement.alternatives
    )

    if (!found) {
      warnings.push(`Could not find supplement: ${stackSupplement.supplementName}`)
      continue
    }

    // Get full supplement data to check contraindications
    const { data: fullSupplement } = await supabase
      .from('supplements')
      .select('*')
      .eq('id', found.id)
      .single()

    if (!fullSupplement) {
      warnings.push(`Could not load full data for: ${stackSupplement.supplementName}`)
      continue
    }

    // Check contraindications
    if (hasContraindication(fullSupplement.contraindications, profile.health_conditions)) {
      warnings.push(`Skipped ${fullSupplement.name_en}: contraindicated`)
      continue
    }

    // Calculate dosage
    // Prefer new scaling algorithm if available, otherwise use predefined stack dosage logic
    let customDosage: number | null = null

    if (fullSupplement.scaling_algorithm) {
      // Use new scaling algorithm
      const dosageResult = calculateDosageFromSupplement(
        {
          scaling_algorithm: fullSupplement.scaling_algorithm as any,
          scaling_base_dose: fullSupplement.scaling_base_dose,
          dosing_base_val: fullSupplement.dosing_base_val,
          scaling_safe_min: fullSupplement.scaling_safe_min,
          scaling_safe_max: fullSupplement.scaling_safe_max,
          scaling_gender_male: fullSupplement.scaling_gender_male,
          scaling_gender_female: fullSupplement.scaling_gender_female,
          unit: fullSupplement.unit
        },
        profile.weight_kg,
        profile.gender
      )
      customDosage = dosageResult?.calculatedDose ?? null
    } else {
      // Fallback to predefined stack dosage calculation
      // This logic should match generate-stack-from-predefined.ts
      let baseDosage = stackSupplement.dosage || found.dosing_base_val || 0

      // Apply experience level multiplier if specified
      if (stackSupplement.experienceLevels) {
        const experienceLevel = profile.experience_level as 'beginner' | 'intermediate' | 'advanced' | 'biohacker'
        if (stackSupplement.experienceLevels[experienceLevel] !== undefined) {
          baseDosage = stackSupplement.experienceLevels[experienceLevel]
        }
      }

      // Apply weight-based scaling
      if (stackSupplement.dosagePerKg && profile.weight_kg) {
        baseDosage = baseDosage * (profile.weight_kg / 75.0) // Normalize to 75kg
      }

      // Apply activity multipliers (if activity level was available, but we don't have it in profile)
      // For now, use moderate as default

      customDosage = Math.round(baseDosage)
    }

    items.push({
      supplement_id: found.id,
      schedule_block: stackSupplement.scheduleBlock,
      custom_dosage_val: customDosage,
      is_active: true,
      source_goals: [category], // Track which goal this came from
      evidence_level: fullSupplement.research_status,
      priority: fullSupplement.is_base_health ? 8 : 5 // Lower priority for goal-specific
    })
  }

  return { items, errors, warnings }
}

/**
 * Main Stack Builder function
 * Generates both Basic Health Stack and Goal Stacks for ALL selected goals
 */
export async function buildUserStack(
  userId: string,
  profile: UserProfile,
  goalCategory?: string,
  goalSubcategory?: string | null,
  goalLevel?: string | null,
  includeBasicHealth: boolean = true,
  selectedGoals?: string[],
  selectedSubcategories?: Record<string, string[]>
): Promise<StackBuilderResult> {
  const errors: string[] = []
  const warnings: string[] = []

  // Build Basic Health Stack (only if includeBasicHealth is true)
  let basicHealthResult = { items: [] as StackItem[], errors: [] as string[], warnings: [] as string[] }
  if (includeBasicHealth) {
    basicHealthResult = await buildBasicHealthStack(profile)
    errors.push(...basicHealthResult.errors)
    warnings.push(...basicHealthResult.warnings)
  }

  // Build Goal Stacks for ALL selected goals
  let goalStackItems: StackItem[] = []
  
  // If selectedGoals and selectedSubcategories are provided, use them (multiple goals)
  if (selectedGoals && selectedGoals.length > 0 && selectedSubcategories) {
    for (const goal of selectedGoals) {
      const goalSubcategories = selectedSubcategories[goal] || []
      
      // Build stack for each subcategory of this goal
      for (const subcategory of goalSubcategories) {
        const goalResult = await buildGoalStack(profile, goal, subcategory, goalLevel || null)
        goalStackItems.push(...goalResult.items)
        errors.push(...goalResult.errors)
        warnings.push(...goalResult.warnings)
      }
      
      // If no subcategories selected for this goal, use first subcategory as default
      if (goalSubcategories.length === 0) {
        let defaultSubcategory: string | null = null
        if (goal === 'fitness') {
          defaultSubcategory = 'hypertrophy'
        } else if (goal === 'cognitive') {
          defaultSubcategory = 'focus'
        } else if (goal === 'longevity') {
          defaultSubcategory = 'antiAging'
        } else if (goal === 'sleep') {
          defaultSubcategory = 'quality'
        }
        
        if (defaultSubcategory) {
          const goalResult = await buildGoalStack(profile, goal, defaultSubcategory, goalLevel || null)
          goalStackItems.push(...goalResult.items)
          errors.push(...goalResult.errors)
          warnings.push(...goalResult.warnings)
        }
      }
    }
  } else if (goalCategory) {
    // Fallback to single goal (backward compatibility)
    const goalResult = await buildGoalStack(profile, goalCategory, goalSubcategory || null, goalLevel || null)
    goalStackItems = goalResult.items
    errors.push(...goalResult.errors)
    warnings.push(...goalResult.warnings)
  }

  // Smart Stack Blender: Merge, deduplicate, and optimize
  const blendResult = await blendStacks(
    basicHealthResult.items,
    goalStackItems,
    profile,
    selectedGoals || []
  )
  
  const blendedStack = blendResult.items
  warnings.push(...blendResult.warnings)

  // Separate back into basic health and goal stacks for return structure
  const basicHealthIds = new Set(basicHealthResult.items.map(i => i.supplement_id))
  const finalBasicHealth = blendedStack.filter(i => basicHealthIds.has(i.supplement_id))
  const finalGoalStack = blendedStack.filter(i => !basicHealthIds.has(i.supplement_id))

  return {
    success: errors.length === 0,
    basicHealthStack: finalBasicHealth,
    goalStack: finalGoalStack,
    errors,
    warnings
  }
}

/**
 * Smart Stack Blender Algorithm
 * Implements deduplication, conflict resolution, capping, and ingredient synergy
 */
async function blendStacks(
  basicHealthItems: StackItem[],
  goalItems: StackItem[],
  profile: UserProfile,
  selectedGoals: string[]
): Promise<{ items: StackItem[]; warnings: string[] }> {
  const warnings: string[] = []
  // Step 1: Get full supplement data for all items
  const allSupplementIds = Array.from(
    new Set([...basicHealthItems, ...goalItems].map(item => item.supplement_id))
  )

  const { data: supplementsData, error: suppsError } = await supabase
    .from('supplements')
    .select('id, name_en, research_status, scaling_safe_max, dosing_max_val, unit, is_base_health')
    .in('id', allSupplementIds)

  if (suppsError || !supplementsData) {
    console.error('Error fetching supplement data for blending:', suppsError)
    // Fallback: simple deduplication
    const fallbackResult = simpleDeduplicate([...basicHealthItems, ...goalItems])
    return {
      items: fallbackResult.items,
      warnings: [...fallbackResult.warnings, 'Could not fetch supplement data for advanced blending. Using simple deduplication.']
    }
  }

  const supplementsMap = new Map(supplementsData.map(s => [s.id, s]))

  // Step 2: Create a map to track supplements by ID (for deduplication)
  // Use a temporary structure with metadata
  interface TempStackItem extends StackItem {
    sources: string[]
    maxDose: number | null
  }
  const supplementMap = new Map<number, TempStackItem>()

  // Add basic health items first (they have priority)
  for (const item of basicHealthItems) {
    const supplement = supplementsMap.get(item.supplement_id)
    const maxDose = supplement?.scaling_safe_max || supplement?.dosing_max_val || null
    
    supplementMap.set(item.supplement_id, {
      ...item,
      sources: ['Basic Health'],
      maxDose,
      evidence_level: supplement?.research_status || 'Blue',
      priority: 10 // High priority for basic health
    })
  }

  // Step 3: Merge goal items (deduplication with dosage merging)
  for (const item of goalItems) {
    const supplement = supplementsMap.get(item.supplement_id)
    const existing = supplementMap.get(item.supplement_id)

    if (existing) {
      // MERGE LOGIC: Same supplement found
      // Take the highest safe dose
      const existingDose = existing.custom_dosage_val || 0
      const newDose = item.custom_dosage_val || 0
      const maxDose = supplement?.scaling_safe_max || supplement?.dosing_max_val || null
      
      // Use the higher dose, but cap at safe max
      const mergedDose = maxDose 
        ? Math.min(Math.max(existingDose, newDose), maxDose)
        : Math.max(existingDose, newDose)

      // Merge sources (which goals this supplement came from)
      // Find which goal this item came from by checking source_goals
      const goalSource = item.source_goals?.[0] || selectedGoals[0] || 'Goal'
      
      if (!existing.sources.includes(goalSource)) {
        existing.sources.push(goalSource)
      }
      existing.custom_dosage_val = mergedDose > 0 ? mergedDose : existing.custom_dosage_val
      
      // Use better schedule_block if available (conflict resolution)
      // Prefer more specific timing (Pre-Workout > Morning, Bedtime > Dinner)
      const schedulePriority: Record<ScheduleBlock, number> = {
        'Pre-Workout': 5,
        'Post-Workout': 4,
        'Bedtime': 3,
        'Dinner': 2,
        'Lunch': 1,
        'Morning': 0
      }
      
      if (schedulePriority[item.schedule_block] > schedulePriority[existing.schedule_block]) {
        existing.schedule_block = item.schedule_block
      }
    } else {
      // ADD LOGIC: New supplement
      const maxDose = supplement?.scaling_safe_max || supplement?.dosing_max_val || null
      const goalSource = item.source_goals?.[0] || selectedGoals[0] || 'Goal'
      
      supplementMap.set(item.supplement_id, {
        ...item,
        sources: [goalSource],
        maxDose,
        evidence_level: supplement?.research_status || 'Blue',
        priority: supplement?.is_base_health ? 8 : 5 // Lower priority for goal-specific
      })
    }
  }

  // Step 4: Conflict Resolution (timing separation)
  // Separate stimulants (caffeine) from sleep aids (melatonin, magnesium for sleep)
  const conflictResolved: StackItem[] = []
  const stimulants: StackItem[] = []
  const sleepAids: StackItem[] = []
  const others: StackItem[] = []

  for (const [supplementId, item] of supplementMap.entries()) {
    const supplement = supplementsMap.get(supplementId)
    const name = supplement?.name_en?.toLowerCase() || ''

    // Check for stimulants
    if (name.includes('caffeine') || name.includes('tyrosine') || name.includes('teacrine')) {
      // Force morning/pre-workout timing
      if (item.schedule_block === 'Bedtime' || item.schedule_block === 'Dinner') {
        item.schedule_block = 'Morning'
        warnings.push(`Moved ${supplement?.name_en} to Morning to avoid sleep interference`)
      }
      stimulants.push(item)
    }
    // Check for sleep aids
    else if (name.includes('melatonin') || name.includes('5-htp') || 
             name.includes('glycine') || name.includes('gaba') ||
             (name.includes('magnesium') && item.schedule_block === 'Bedtime')) {
      // Force bedtime timing
      if (item.schedule_block === 'Morning' || item.schedule_block === 'Pre-Workout') {
        item.schedule_block = 'Bedtime'
        warnings.push(`Moved ${supplement?.name_en} to Bedtime for optimal sleep support`)
      }
      sleepAids.push(item)
    } else {
      others.push(item)
    }
  }

  // Step 5: Capping based on experience level
  const maxSupplements: Record<string, number> = {
    beginner: 5,
    intermediate: 8,
    advanced: 12,
    biohacker: 15
  }
  const maxCount = maxSupplements[profile.experience_level || 'intermediate'] || 8

  // Combine all items
  const allItems = [...stimulants, ...others, ...sleepAids]

  // Sort by priority and evidence level (Green > Blue > Red)
  const evidencePriority: Record<ResearchStatus, number> = {
    'Green': 3,
    'Blue': 2,
    'Red': 1
  }

  allItems.sort((a, b) => {
    // First by priority (higher first)
    if (a.priority !== b.priority) {
      return (b.priority || 0) - (a.priority || 0)
    }
    // Then by evidence level (Green > Blue > Red)
    const aEvidence = evidencePriority[a.evidence_level || 'Blue']
    const bEvidence = evidencePriority[b.evidence_level || 'Blue']
    if (aEvidence !== bEvidence) {
      return bEvidence - aEvidence
    }
    return 0
  })

  // Cap the list
  const cappedItems = allItems.slice(0, maxCount)

  if (allItems.length > maxCount) {
    warnings.push(
      `Stack capped at ${maxCount} supplements (${allItems.length} were available). ` +
      `Removed ${allItems.length - maxCount} lower-priority supplements.`
    )
  }

  // Step 6: Ingredient Synergy Check (simplified - check for common overlaps)
  // This would ideally check supplement_substances table, but for now we'll do basic name checks
  const finalItems: StackItem[] = []
  const ingredientWarnings: string[] = []

  for (const item of cappedItems) {
    const supplement = supplementsMap.get(item.supplement_id)
    const name = supplement?.name_en?.toLowerCase() || ''

    // Check for ZMA + Multivitamin (both contain Zinc)
    if (name.includes('zma') || name.includes('zinc magnesium')) {
      const hasMultivitamin = cappedItems.some(i => {
        const s = supplementsMap.get(i.supplement_id)
        return s?.name_en?.toLowerCase().includes('multivitamin')
      })
      if (hasMultivitamin) {
        ingredientWarnings.push(
          'ZMA and Multivitamin both contain Zinc. Consider taking ZMA only if Multivitamin has low Zinc.'
        )
      }
    }

    // Remove metadata fields before returning (they're not stored in DB)
    const cleanItem: StackItem = {
      supplement_id: item.supplement_id,
      schedule_block: item.schedule_block,
      custom_dosage_val: item.custom_dosage_val,
      is_active: item.is_active
    }
    finalItems.push(cleanItem)
  }

  if (ingredientWarnings.length > 0) {
    warnings.push(...ingredientWarnings)
  }

  return {
    items: finalItems,
    warnings
  }
}

/**
 * Simple deduplication fallback (if supplement data fetch fails)
 */
function simpleDeduplicate(items: StackItem[]): { items: StackItem[]; warnings: string[] } {
  const seen = new Map<string, StackItem>()
  
  for (const item of items) {
    const key = `${item.supplement_id}-${item.schedule_block}`
    if (!seen.has(key)) {
      seen.set(key, item)
    } else {
      // Merge dosage if same supplement + timing
      const existing = seen.get(key)!
      if (item.custom_dosage_val && existing.custom_dosage_val) {
        existing.custom_dosage_val = Math.max(existing.custom_dosage_val, item.custom_dosage_val)
      }
    }
  }
  
  return {
    items: Array.from(seen.values()),
    warnings: ['Using simple deduplication (advanced blending unavailable)']
  }
}

/**
 * Save stack to database
 */
export async function saveStackToDatabase(
  userId: string,
  stackItems: StackItem[]
): Promise<{ success: boolean; error?: string }> {
  if (stackItems.length === 0) {
    return { success: true }
  }

  const itemsToInsert = stackItems.map(item => ({
    user_id: userId,
    supplement_id: item.supplement_id,
    schedule_block: item.schedule_block,
    custom_dosage_val: item.custom_dosage_val,
    is_active: item.is_active
  }))

  const { error } = await supabase.from('user_stacks').insert(itemsToInsert)

  if (error) {
    return { success: false, error: error.message }
  }

  // Generate timeline blocks from the stack
  const { generateTimelineFromStack } = await import('./generate-timeline-from-stack')
  const { error: timelineError } = await generateTimelineFromStack(userId)
  if (timelineError) {
    return { success: false, error: `Stack saved but timeline generation failed: ${timelineError.message}` }
  }

  return { success: true }
}
