/**
 * Generate user stack from predefined stack templates
 * Handles age/gender filtering and supplement lookup
 */

import { supabase } from "./supabase"
import { 
  PredefinedStack, 
  StackSupplement, 
  filterSupplementsByDemographics,
  basicHealthStack,
  fitnessStacks,
  cognitiveStacks,
  longevityStacks,
  sleepStacks
} from "./predefined-stacks"

interface GenerateStackOptions {
  userId: string
  stacks: PredefinedStack[]
  age: number | null
  gender: string | null
  weight?: number | null // Weight in kg
  activityLevel?: 'sedentary' | 'moderate' | 'active' | 'veryActive' | null
  experienceLevel?: 'beginner' | 'intermediate' | 'advanced' | 'biohacker' | null
  includeBasicHealth?: boolean
}

/**
 * Find supplement in database by name (with fallback to alternatives)
 */
export async function findSupplementByName(
  supplementName: string,
  alternatives?: string[]
): Promise<{ id: number; name_en: string; dosing_base_val: number | null; unit: string | null } | null> {
  // Try exact match on name_en first
  const { data: exactMatch, error: exactError } = await supabase
    .from('supplements')
    .select('id, name_en, dosing_base_val, unit')
    .eq('is_parent', true)
    .ilike('name_en', supplementName)
    .limit(1)
    .maybeSingle()

  if (exactMatch && !exactError) {
    return exactMatch
  }

  // Try exact match on name_sv
  const { data: exactMatchSv, error: exactErrorSv } = await supabase
    .from('supplements')
    .select('id, name_en, dosing_base_val, unit')
    .eq('is_parent', true)
    .ilike('name_sv', supplementName)
    .limit(1)
    .maybeSingle()

  if (exactMatchSv && !exactErrorSv) {
    return exactMatchSv
  }

  // Try partial match on name_en
  const { data: partialMatch, error: partialError } = await supabase
    .from('supplements')
    .select('id, name_en, dosing_base_val, unit')
    .eq('is_parent', true)
    .ilike('name_en', `%${supplementName}%`)
    .limit(1)
    .maybeSingle()

  if (partialMatch && !partialError) {
    return partialMatch
  }

  // Try partial match on name_sv
  const { data: partialMatchSv, error: partialErrorSv } = await supabase
    .from('supplements')
    .select('id, name_en, dosing_base_val, unit')
    .eq('is_parent', true)
    .ilike('name_sv', `%${supplementName}%`)
    .limit(1)
    .maybeSingle()

  if (partialMatchSv && !partialErrorSv) {
    return partialMatchSv
  }

  // Strategy 5: Try alternatives with is_parent = true
  if (alternatives && alternatives.length > 0) {
    for (const alt of alternatives) {
      // Try name_en
      const { data: altMatch, error: altError } = await supabase
        .from('supplements')
        .select('id, name_en, dosing_base_val, unit')
        .eq('is_parent', true)
        .ilike('name_en', `%${alt}%`)
        .limit(1)
        .maybeSingle()

      if (altMatch && !altError) {
        return altMatch
      }

      // Try name_sv
      const { data: altMatchSv, error: altErrorSv } = await supabase
        .from('supplements')
        .select('id, name_en, dosing_base_val, unit')
        .eq('is_parent', true)
        .ilike('name_sv', `%${alt}%`)
        .limit(1)
        .maybeSingle()

      if (altMatchSv && !altErrorSv) {
        return altMatchSv
      }
    }
  }

  // Strategy 6: Fallback - Try without is_parent constraint (in case supplement isn't marked as parent)
  // This handles cases where supplements might not be properly marked as parents yet
  const { data: fallbackMatch, error: fallbackError } = await supabase
    .from('supplements')
    .select('id, name_en, dosing_base_val, unit, is_parent')
    .ilike('name_en', `%${supplementName}%`)
    .order('is_parent', { ascending: false }) // Prefer parents, but accept non-parents if needed
    .limit(1)
    .maybeSingle()

  if (fallbackMatch && !fallbackError) {
    return {
      id: fallbackMatch.id,
      name_en: fallbackMatch.name_en,
      dosing_base_val: fallbackMatch.dosing_base_val,
      unit: fallbackMatch.unit
    }
  }

  // Strategy 7: Try alternatives without is_parent constraint
  if (alternatives && alternatives.length > 0) {
    for (const alt of alternatives) {
      const { data: altFallback, error: altFallbackError } = await supabase
        .from('supplements')
        .select('id, name_en, dosing_base_val, unit, is_parent')
        .ilike('name_en', `%${alt}%`)
        .order('is_parent', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (altFallback && !altFallbackError) {
        return {
          id: altFallback.id,
          name_en: altFallback.name_en,
          dosing_base_val: altFallback.dosing_base_val,
          unit: altFallback.unit
        }
      }
    }
  }

  return null
}

/**
 * Calculate final dosage based on weight, activity, and experience level
 */
function calculateFinalDosage(
  supplement: StackSupplement,
  weight: number | null,
  activityLevel: string | null,
  experienceLevel: string | null
): number | null {
  let baseDosage = supplement.dosage || null

  // Apply experience level variation if available
  if (experienceLevel && supplement.experienceLevels) {
    const levelDosage = supplement.experienceLevels[experienceLevel as keyof typeof supplement.experienceLevels]
    if (levelDosage !== undefined) {
      baseDosage = levelDosage
    }
  }

  if (baseDosage === null) return null

  // Apply weight-based calculation if available (overrides base dosage)
  if (supplement.dosagePerKg && weight) {
    baseDosage = weight * supplement.dosagePerKg
    // If experience level had a different base, adjust proportionally
    if (experienceLevel && supplement.experienceLevels) {
      const levelDosage = supplement.experienceLevels[experienceLevel as keyof typeof supplement.experienceLevels]
      const standardDosage = supplement.dosage || levelDosage
      if (standardDosage && levelDosage && standardDosage !== levelDosage) {
        // Adjust weight-based calculation by experience level ratio
        const ratio = levelDosage / standardDosage
        baseDosage = baseDosage * ratio
      }
    }
  }

  // Apply activity multiplier if available
  if (supplement.activityMultipliers && activityLevel) {
    const multiplier = supplement.activityMultipliers[activityLevel as keyof typeof supplement.activityMultipliers]
    if (multiplier !== undefined) {
      baseDosage = baseDosage * multiplier
    }
  }

  // Round to reasonable precision (2 decimal places for mg, 0 for g)
  if (baseDosage >= 1000) {
    return Math.round(baseDosage) // Round to whole number for grams
  }
  return Math.round(baseDosage * 10) / 10 // Round to 1 decimal for mg
}

/**
 * Get supplements for a stack based on experience level
 */
function getSupplementsForExperienceLevel(
  stack: PredefinedStack,
  experienceLevel: string | null
): StackSupplement[] {
  // If stack has experience variations, use those
  if (stack.experienceVariations && experienceLevel) {
    const variation = stack.experienceVariations[experienceLevel as keyof typeof stack.experienceVariations]
    if (variation) {
      return variation
    }
  }

  // Otherwise use default supplements
  return stack.supplements
}

/**
 * Generate stack from predefined stack templates
 */
export async function generateStackFromPredefined({
  userId,
  stacks,
  age,
  gender,
  weight = null,
  activityLevel = null,
  experienceLevel = null,
  includeBasicHealth = false
}: GenerateStackOptions): Promise<{ 
  success: boolean
  created: number
  errors: string[]
}> {
  const errors: string[] = []
  const stackItems: any[] = []

  // Add basic health stack if requested
  if (includeBasicHealth) {
    stacks = [basicHealthStack, ...stacks]
  }

  // Track supplements we've already added to prevent duplicates across stacks
  const addedSupplementIds = new Set<number>()

  // Process each predefined stack
  for (const stack of stacks) {
    // Get supplements based on experience level
    const stackSupplements = getSupplementsForExperienceLevel(stack, experienceLevel)
    
    // Filter supplements by age and gender
    const filteredSupplements = filterSupplementsByDemographics(
      stackSupplements,
      age,
      gender
    )

    // Find and add each supplement
    for (const supplement of filteredSupplements) {
      const found = await findSupplementByName(
        supplement.supplementName,
        supplement.alternatives
      )

      if (found) {
        // Skip if we've already added this supplement (prevent duplicates across stacks)
        if (addedSupplementIds.has(found.id)) {
          continue
        }

        // Calculate final dosage based on weight, activity, and experience
        const calculatedDosage = calculateFinalDosage(
          supplement,
          weight,
          activityLevel,
          experienceLevel
        )

        // Set custom_dosage_val if:
        // 1. We have a calculated dosage AND it differs from database default, OR
        // 2. Database has no dosing_base_val (null) but we have a calculated dosage
        const customDosage = calculatedDosage && (
          !found.dosing_base_val || // No database default, use calculated
          Math.abs(calculatedDosage - found.dosing_base_val) > 0.01 // Differs from database default
        ) ? calculatedDosage : null

        stackItems.push({
          user_id: userId,
          supplement_id: found.id,
          schedule_block: supplement.scheduleBlock,
          custom_dosage_val: customDosage,
          is_active: true,
        })

        // Mark this supplement as added
        addedSupplementIds.add(found.id)
      } else {
        errors.push(`Could not find supplement: ${supplement.supplementName}`)
      }
    }
  }

  // Remove duplicates by supplement_id + schedule_block (safety check)
  const uniqueItems = Array.from(
    new Map(
      stackItems.map(item => [
        `${item.supplement_id}-${item.schedule_block}`,
        item
      ])
    ).values()
  )

  // Insert into database
  if (uniqueItems.length > 0) {
    const { error: insertError } = await supabase
      .from('user_stacks')
      .insert(uniqueItems)

    if (insertError) {
      errors.push(`Error inserting stack items: ${insertError.message}`)
      return { success: false, created: 0, errors }
    }

    // Generate timeline blocks and items from the stack
    const { generateTimelineFromStack } = await import('./generate-timeline-from-stack')
    const { error: timelineError } = await generateTimelineFromStack(userId)
    if (timelineError) {
      errors.push(`Warning: Could not generate timeline: ${timelineError.message}`)
    }
  }

  return {
    success: true,
    created: uniqueItems.length,
    errors
  }
}

/**
 * Get predefined stacks for selected goals and subcategories
 */
export function getPredefinedStacksForGoals(
  goals: string[],
  subcategories: Record<string, string[]>,
  includeBasicHealth: boolean = false
): PredefinedStack[] {
  const stacks: PredefinedStack[] = []

  // Add stacks based on goals and subcategories
  goals.forEach(goal => {
    const goalSubcategories = subcategories[goal] || []

    switch (goal) {
      case 'fitness':
        goalSubcategories.forEach(subcat => {
          const stack = fitnessStacks[subcat]
          if (stack) stacks.push(stack)
        })
        break

      case 'cognitive':
        goalSubcategories.forEach(subcat => {
          const stack = cognitiveStacks[subcat]
          if (stack) stacks.push(stack)
        })
        break

      case 'longevity':
        goalSubcategories.forEach(subcat => {
          const stack = longevityStacks[subcat]
          if (stack) stacks.push(stack)
        })
        break

      case 'sleep':
        goalSubcategories.forEach(subcat => {
          const stack = sleepStacks[subcat]
          if (stack) stacks.push(stack)
        })
        break
    }
  })

  // If no specific stacks found, use default for first subcategory
  if (stacks.length === 0 && goals.length > 0) {
    const firstGoal = goals[0]
    const firstSubcategory = subcategories[firstGoal]?.[0]

    if (firstGoal === 'fitness' && firstSubcategory) {
      const defaultStack = fitnessStacks[firstSubcategory] || fitnessStacks.hypertrophy
      if (defaultStack) stacks.push(defaultStack)
    } else if (firstGoal === 'cognitive' && firstSubcategory) {
      const defaultStack = cognitiveStacks[firstSubcategory] || cognitiveStacks.focus
      if (defaultStack) stacks.push(defaultStack)
    }
  }

  return stacks
}
