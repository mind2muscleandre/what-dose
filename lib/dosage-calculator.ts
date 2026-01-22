/**
 * Dosage Calculator
 * Implements scaling algorithms for supplement dosage calculations
 */

import type { ResearchStatus } from './database.types'

export type ScalingAlgorithm = 'linear_weight' | 'gender_split' | 'fixed'
export type Gender = 'male' | 'female' | 'other'

// Evidence level mapping: Green = A (Strong), Blue = B (Moderate), Red = C (Experimental)
export type EvidenceLevel = ResearchStatus

export interface ScalingConfig {
  algorithm: ScalingAlgorithm
  base_dose: number
  unit: string
  safe_min?: number
  safe_max?: number
  gender_male?: number
  gender_female?: number
}

export interface DosageCalculationParams {
  userWeight: number | null // Weight in kg
  gender: Gender | null
  baseDose: number
  algorithm: ScalingAlgorithm
  safeMin?: number
  safeMax?: number
  genderMale?: number
  genderFemale?: number
  unit?: string
}

export interface DosageResult {
  calculatedDose: number
  unit: string
  algorithm: ScalingAlgorithm
  wasClamped: boolean // Whether the result was clamped to safe_min/max
}

/**
 * Round dosage to appropriate precision based on unit
 */
function roundDosage(dose: number, unit?: string): number {
  if (!unit) {
    // Default rounding: whole numbers for large doses, 1 decimal for small
    return dose >= 1000 ? Math.round(dose) : Math.round(dose * 10) / 10
  }

  switch (unit.toLowerCase()) {
    case 'iu':
      // Round to nearest 100 IU for Vitamin D, etc.
      return Math.round(dose / 100) * 100
    case 'mg':
      // Round to nearest 50mg for large doses, 10mg for smaller
      if (dose >= 500) {
        return Math.round(dose / 50) * 50
      }
      return Math.round(dose / 10) * 10
    case 'g':
      // Round to 1 decimal place for grams
      return Math.round(dose * 10) / 10
    case 'mcg':
      // Round to whole number for micrograms
      return Math.round(dose)
    default:
      // Default: round to 1 decimal
      return Math.round(dose * 10) / 10
  }
}

/**
 * Clamp dosage between safe_min and safe_max
 */
function clampDosage(dose: number, safeMin?: number, safeMax?: number): { dose: number; wasClamped: boolean } {
  let wasClamped = false
  let clampedDose = dose

  if (safeMin !== undefined && clampedDose < safeMin) {
    clampedDose = safeMin
    wasClamped = true
  }

  if (safeMax !== undefined && clampedDose > safeMax) {
    clampedDose = safeMax
    wasClamped = true
  }

  return { dose: clampedDose, wasClamped }
}

/**
 * Calculate dosage using linear weight scaling
 * Formula: calculated_dose = base_dose * (user_weight / 75.0)
 * Constraint: Must clamp between safe_min and safe_max
 */
function calculateLinearWeight(params: DosageCalculationParams): DosageResult {
  const { userWeight, baseDose, safeMin, safeMax, unit } = params

  if (!userWeight || userWeight <= 0) {
    // Fallback to base dose if weight not available
    const { dose, wasClamped } = clampDosage(baseDose, safeMin, safeMax)
    return {
      calculatedDose: roundDosage(dose, unit),
      unit: unit || 'mg',
      algorithm: 'linear_weight',
      wasClamped
    }
  }

  // Calculate: base_dose * (user_weight / 75.0)
  const calculatedDose = baseDose * (userWeight / 75.0)

  // Clamp to safe range
  const { dose, wasClamped } = clampDosage(calculatedDose, safeMin, safeMax)

  return {
    calculatedDose: roundDosage(dose, unit),
    unit: unit || 'mg',
    algorithm: 'linear_weight',
    wasClamped
  }
}

/**
 * Calculate dosage using gender split
 * Returns specific fixed dosage based on biological sex
 */
function calculateGenderSplit(params: DosageCalculationParams): DosageResult {
  const { gender, genderMale, genderFemale, baseDose, unit } = params

  let dose: number

  if (gender === 'male' && genderMale !== undefined) {
    dose = genderMale
  } else if (gender === 'female' && genderFemale !== undefined) {
    dose = genderFemale
  } else {
    // Fallback to base dose if gender-specific dose not available
    dose = baseDose
  }

  return {
    calculatedDose: roundDosage(dose, unit),
    unit: unit || 'mg',
    algorithm: 'gender_split',
    wasClamped: false
  }
}

/**
 * Calculate dosage using fixed algorithm
 * No scaling, returns base_dose
 */
function calculateFixed(params: DosageCalculationParams): DosageResult {
  const { baseDose, unit } = params

  return {
    calculatedDose: roundDosage(baseDose, unit),
    unit: unit || 'mg',
    algorithm: 'fixed',
    wasClamped: false
  }
}

/**
 * Main dosage calculator function
 */
export function calculateDosage(params: DosageCalculationParams): DosageResult {
  switch (params.algorithm) {
    case 'linear_weight':
      return calculateLinearWeight(params)
    case 'gender_split':
      return calculateGenderSplit(params)
    case 'fixed':
      return calculateFixed(params)
    default:
      // Fallback to fixed if algorithm unknown
      return calculateFixed(params)
  }
}

/**
 * Calculate dosage from supplement database row
 */
export function calculateDosageFromSupplement(
  supplement: {
    scaling_algorithm?: ScalingAlgorithm | null
    scaling_base_dose?: number | null
    dosing_base_val?: number | null
    scaling_safe_min?: number | null
    scaling_safe_max?: number | null
    scaling_gender_male?: number | null
    scaling_gender_female?: number | null
    unit?: string | null
  },
  userWeight: number | null,
  gender: Gender | null
): DosageResult | null {
  // Determine algorithm (default to fixed if not set)
  const algorithm = (supplement.scaling_algorithm || 'fixed') as ScalingAlgorithm

  // Determine base dose (prefer scaling_base_dose, fallback to dosing_base_val)
  const baseDose = supplement.scaling_base_dose ?? supplement.dosing_base_val

  if (!baseDose) {
    return null // Cannot calculate without base dose
  }

  return calculateDosage({
    userWeight,
    gender,
    baseDose,
    algorithm,
    safeMin: supplement.scaling_safe_min ?? undefined,
    safeMax: supplement.scaling_safe_max ?? undefined,
    genderMale: supplement.scaling_gender_male ?? undefined,
    genderFemale: supplement.scaling_gender_female ?? undefined,
    unit: supplement.unit ?? undefined
  })
}
