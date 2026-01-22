/**
 * Helper functions to calculate dosage options and benefits for supplements
 * Used in both Stack Review and Library components
 */

import type { Language } from "@/lib/translations"

export interface DosageOption {
  label: string
  value: number
  description: string
}

export interface SupplementInfo {
  benefits: string[]
  usageNotes: string[]
  dosageOptions: DosageOption[]
}

/**
 * Calculate dosage options for a supplement
 */
export async function calculateDosageOptions(
  baseDose: number | null,
  maxDose: number | null,
  unit: string | null,
  supplementName: string,
  userWeight: number | null,
  t: (key: string) => string
): Promise<DosageOption[]> {
  const hasDosing = baseDose !== null && baseDose > 0 && unit

  if (!hasDosing) {
    return []
  }

  const doses: DosageOption[] = []

  // 1. Standard dose
  doses.push({
    label: t("standardDose"),
    value: baseDose,
    description: t("standardDoseDescription")
  })

  // 2. Calculate weight-based dose if available
  let weightBasedDose: number | null = null
  if (userWeight && supplementName) {
    const { getAllPredefinedStacks } = await import('@/lib/predefined-stacks')
    const allStacks = getAllPredefinedStacks()
    const supplementDosageMap = new Map<string, number>()
    
    allStacks.forEach(stack => {
      stack.supplements.forEach(supp => {
        if (supp.dosagePerKg) {
          const baseName = supp.supplementName.toLowerCase()
          supplementDosageMap.set(baseName, supp.dosagePerKg)
          supplementDosageMap.set(baseName.replace(/\s+/g, '-'), supp.dosagePerKg)
          supplementDosageMap.set(baseName.replace(/-/g, ' '), supp.dosagePerKg)
          supplementDosageMap.set(baseName.replace(/[-\s]/g, ''), supp.dosagePerKg)
          
          supp.alternatives?.forEach(alt => {
            const altLower = alt.toLowerCase()
            supplementDosageMap.set(altLower, supp.dosagePerKg!)
            supplementDosageMap.set(altLower.replace(/\s+/g, '-'), supp.dosagePerKg!)
            supplementDosageMap.set(altLower.replace(/-/g, ' '), supp.dosagePerKg!)
            supplementDosageMap.set(altLower.replace(/[-\s]/g, ''), supp.dosagePerKg!)
          })
        }
      })
    })

    const supplementNameLower = supplementName.toLowerCase()
    const nameVariations = [
      supplementNameLower,
      supplementNameLower.replace(/\s+/g, '-'),
      supplementNameLower.replace(/-/g, ' '),
      supplementNameLower.replace(/[-\s]/g, ''),
    ]

    let dosagePerKg: number | undefined
    for (const nameVar of nameVariations) {
      dosagePerKg = supplementDosageMap.get(nameVar)
      if (dosagePerKg) break
    }

    if (dosagePerKg) {
      weightBasedDose = userWeight * dosagePerKg
      if (weightBasedDose >= 1000) {
        weightBasedDose = Math.round(weightBasedDose)
      } else {
        weightBasedDose = Math.round(weightBasedDose * 10) / 10
      }
    }
  }

  // 2. Weight-based dose OR low dose
  if (weightBasedDose && weightBasedDose !== baseDose) {
    doses.push({
      label: t("weightBasedDose"),
      value: weightBasedDose,
      description: t("weightBasedDoseDescription").replace('{weight}', userWeight?.toString() || '')
    })
  } else if (baseDose && maxDose && maxDose > baseDose) {
    const lowDose = Math.round(baseDose * 0.75 * 10) / 10
    if (lowDose > 0 && lowDose !== baseDose) {
      doses.push({
        label: t("lowDose"),
        value: lowDose,
        description: t("lowDoseDescription")
      })
    }
  }

  // 3. Max dose
  if (maxDose && maxDose > baseDose) {
    doses.push({
      label: t("maxDose"),
      value: maxDose,
      description: t("maxDoseDescription")
    })
  } else if (baseDose && !maxDose) {
    const highDose = Math.round(baseDose * 1.5 * 10) / 10
    if (highDose !== baseDose) {
      doses.push({
        label: t("highDose"),
        value: highDose,
        description: t("highDoseDescription")
      })
    }
  }

  // Ensure we have at least 2-3 options
  if (doses.length === 1 && baseDose) {
    const lowDose = Math.round(baseDose * 0.75 * 10) / 10
    const highDose = Math.round(baseDose * 1.5 * 10) / 10
    if (lowDose > 0 && lowDose !== baseDose) {
      doses.push({
        label: t("lowDose"),
        value: lowDose,
        description: t("lowDoseDescription")
      })
    }
    if (highDose !== baseDose) {
      doses.push({
        label: t("highDose"),
        value: highDose,
        description: t("highDoseDescription")
      })
    }
  }

  return doses.slice(0, 3) // Limit to 3 options
}

/**
 * Calculate benefits for a supplement
 */
export function calculateBenefits(
  categoryIds: number[] | null,
  dosingNotes: string | null,
  bioavailabilityNotes: string | null,
  supplementName: string,
  userGender: string | null,
  dbBenefits: string[] | null, // Database benefits (if available)
  t: (key: string) => string
): { benefits: string[]; usageNotes: string[] } {
  // PRIORITY 1: Use database benefits if available (exactly 3)
  if (dbBenefits && Array.isArray(dbBenefits) && dbBenefits.length === 3) {
    const usageNotes: string[] = []
    
    // Still check for usage notes from dosing/bioavailability
    const isLoadingOrCyclingInfo = (text: string): boolean => {
      if (!text) return false
      const lowerText = text.toLowerCase()
      const loadingPatterns = [
        'requires loading',
        'loading over',
        'loading phase',
        'loading period',
        'requires cycling',
        'cycle',
        'cycling',
        'take in phases',
        'use in phases',
        'phase',
        'weeks',
        'days on',
        'days off',
        'on/off',
        'break',
        'rest period'
      ]
      return loadingPatterns.some(pattern => lowerText.includes(pattern))
    }
    
    if (dosingNotes && isLoadingOrCyclingInfo(dosingNotes)) {
      usageNotes.push(dosingNotes)
    }
    
    if (bioavailabilityNotes && isLoadingOrCyclingInfo(bioavailabilityNotes)) {
      usageNotes.push(bioavailabilityNotes)
    }
    
    return {
      benefits: dbBenefits,
      usageNotes: usageNotes.filter(Boolean)
    }
  }
  
  // Fallback to calculated benefits
  const benefits: string[] = []
  const usageNotes: string[] = []
  const normalizedName = supplementName.toLowerCase()

  // Helper functions (same as Stack Review)
  const isSwedish = (text: string): boolean => {
    if (!text) return false
    const lowerText = text.toLowerCase()
    const swedishPatterns = [
      /\b(och|eller|med|för|är|ska|kan|måste|bör|efter|innan|under|över)\b/i,
      /\b(kvinnor|män|gravid|menstruerande|ersätter|förlust|kofaktor|insulinresistens)\b/i,
      /\b(lever|cellmembran|synaptisk|neurotransmittor)\b/i,
      /[åäöÅÄÖ]/
    ]
    return swedishPatterns.some(pattern => pattern.test(lowerText))
  }

  const isTooTechnical = (text: string): boolean => {
    if (!text) return false
    const lowerText = text.toLowerCase()
    const technicalTerms = [
      'synaptic plasticity',
      'neurotransmitter modulation',
      'kofaktor',
      'glykolys',
      'insulinresistens',
      'bioavailability',
      'dose refers to',
      'taken with',
      'target blood levels',
      'fat-soluble',
      'must be taken',
      'mmol/l',
      'nmol/l'
    ]
    return technicalTerms.some(term => lowerText.includes(term))
  }

  const isLoadingOrCyclingInfo = (text: string): boolean => {
    if (!text) return false
    const lowerText = text.toLowerCase()
    const loadingPatterns = [
      'requires loading',
      'loading over',
      'loading phase',
      'loading period',
      'requires cycling',
      'cycle',
      'cycling',
      'take in phases',
      'use in phases',
      'phase',
      'weeks',
      'days on',
      'days off',
      'on/off',
      'break',
      'rest period'
    ]
    return loadingPatterns.some(pattern => lowerText.includes(pattern))
  }

  const shouldFilterGenderSpecific = (text: string, gender: string | null): boolean => {
    if (!gender || !text) return false
    const lowerText = text.toLowerCase()
    const lowerGender = gender.toLowerCase()
    
    const femaleTerms = ['menstruerande', 'menstruating', 'kvinnor', 'women', 'female', 'pregnant', 'gravid', 'replaces loss', 'ersätter förlust']
    const maleTerms = ['män', 'men', 'male', 'testosterone', 'testosteron']
    
    if (lowerGender === 'female' || lowerGender === 'kvinna') {
      return maleTerms.some(term => lowerText.includes(term))
    } else if (lowerGender === 'male' || lowerGender === 'man') {
      return femaleTerms.some(term => lowerText.includes(term))
    }
    
    return false
  }

  const cleanBenefit = (text: string): string | null => {
    if (!text) return null
    
    if (isSwedish(text) || isTooTechnical(text) || shouldFilterGenderSpecific(text, userGender)) {
      return null
    }
    
    let cleaned = text.trim()
    if (cleaned.endsWith('.')) {
      cleaned = cleaned.slice(0, -1)
    }
    if (cleaned.length > 0) {
      cleaned = cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
    }
    
    return cleaned.length > 0 ? cleaned : null
  }

  // Category-based benefits
  const categoryBenefits: string[] = []
  if (categoryIds) {
    if (categoryIds.includes(1)) categoryBenefits.push(t("benefitHealth1"))
    if (categoryIds.includes(2)) categoryBenefits.push(t("benefitMuscle1"))
    if (categoryIds.includes(3)) categoryBenefits.push(t("benefitPerformance1"))
    if (categoryIds.includes(4)) categoryBenefits.push(t("benefitFocus1"))
    if (categoryIds.includes(5)) categoryBenefits.push(t("benefitStress1"))
    if (categoryIds.includes(6)) categoryBenefits.push(t("benefitMetabolic1"))
    if (categoryIds.includes(7)) categoryBenefits.push(t("benefitSleep1"))
    if (categoryIds.includes(8)) categoryBenefits.push(t("benefitAntiAging1"))
    if (categoryIds.includes(9)) categoryBenefits.push(t("benefitJoints1"))
  }

  if (categoryBenefits.length > 0) {
    benefits.push(...categoryBenefits.slice(0, 2))
  }

  // Check for loading/cycling info
  if (dosingNotes && isLoadingOrCyclingInfo(dosingNotes)) {
    const cleaned = cleanBenefit(dosingNotes)
    if (cleaned && !usageNotes.includes(cleaned)) {
      usageNotes.push(cleaned)
    }
  }

  if (bioavailabilityNotes && isLoadingOrCyclingInfo(bioavailabilityNotes)) {
    const cleaned = cleanBenefit(bioavailabilityNotes)
    if (cleaned && !usageNotes.includes(cleaned)) {
      usageNotes.push(cleaned)
    }
  }

  // Specific usage notes
  if (normalizedName.includes('beta-alanine') || normalizedName.includes('beta alanine')) {
    if (!usageNotes.some(note => note.toLowerCase().includes('loading'))) {
      usageNotes.push("Requires loading phase over several weeks for optimal results")
    }
  }

  if (normalizedName.includes('creatine')) {
    if (!usageNotes.some(note => note.toLowerCase().includes('loading'))) {
      usageNotes.push("Can be taken with or without a loading phase. Loading phase: 20g/day for 5-7 days, then 5g/day")
    }
  }

  // Add cleaned dosing/bioavailability notes as benefits
  const cleanedDosingNote = dosingNotes && !isLoadingOrCyclingInfo(dosingNotes) && !isSwedish(dosingNotes) && !isTooTechnical(dosingNotes) ? cleanBenefit(dosingNotes) : null
  if (cleanedDosingNote && !benefits.includes(cleanedDosingNote)) {
    benefits.push(cleanedDosingNote)
  }

  const cleanedBioavailabilityNote = bioavailabilityNotes && !isLoadingOrCyclingInfo(bioavailabilityNotes) && !isSwedish(bioavailabilityNotes) && !isTooTechnical(bioavailabilityNotes) ? cleanBenefit(bioavailabilityNotes) : null
  if (cleanedBioavailabilityNote && !benefits.includes(cleanedBioavailabilityNote)) {
    benefits.push(cleanedBioavailabilityNote)
  }

  // Ensure we have at least 2-3 benefits
  if (benefits.length === 0) {
    if (categoryBenefits.length > 0) {
      benefits.push(...categoryBenefits.slice(0, 3))
    } else {
      benefits.push(t("benefitDefault1"), t("benefitDefault2"), t("benefitDefault3"))
    }
  } else if (benefits.length < 2) {
    if (categoryBenefits.length > benefits.length) {
      const remaining = categoryBenefits.filter(b => !benefits.includes(b))
      benefits.push(...remaining.slice(0, 2 - benefits.length))
    }
    if (benefits.length < 2) {
      benefits.push(t("benefitDefault1"))
    }
  }

  if (benefits.length < 2) {
    benefits.push(t("benefitDefault2"))
  }

  return {
    benefits: benefits.slice(0, 4),
    usageNotes: usageNotes.filter(Boolean)
  }
}

/**
 * Suggest optimal timing for a supplement based on its name and properties
 * Returns a schedule block recommendation
 */
export async function suggestTiming(
  supplementName: string,
  categoryIds: number[] | null
): Promise<'Morning' | 'Lunch' | 'Pre-Workout' | 'Post-Workout' | 'Dinner' | 'Bedtime'> {
  const normalizedName = supplementName.toLowerCase()
  
  // First, try to find timing from predefined stacks
  try {
    const { getAllPredefinedStacks } = await import('@/lib/predefined-stacks')
    const allStacks = getAllPredefinedStacks()
    const supplementTimingMap = new Map<string, 'Morning' | 'Lunch' | 'Pre-Workout' | 'Post-Workout' | 'Dinner' | 'Bedtime'>()
    
    allStacks.forEach(stack => {
      stack.supplements.forEach(supp => {
        const baseName = supp.supplementName.toLowerCase()
        supplementTimingMap.set(baseName, supp.scheduleBlock)
        supplementTimingMap.set(baseName.replace(/\s+/g, '-'), supp.scheduleBlock)
        supplementTimingMap.set(baseName.replace(/-/g, ' '), supp.scheduleBlock)
        supplementTimingMap.set(baseName.replace(/[-\s]/g, ''), supp.scheduleBlock)
        
        supp.alternatives?.forEach(alt => {
          const altLower = alt.toLowerCase()
          supplementTimingMap.set(altLower, supp.scheduleBlock)
          supplementTimingMap.set(altLower.replace(/\s+/g, '-'), supp.scheduleBlock)
          supplementTimingMap.set(altLower.replace(/-/g, ' '), supp.scheduleBlock)
          supplementTimingMap.set(altLower.replace(/[-\s]/g, ''), supp.scheduleBlock)
        })
      })
    })
    
    const nameVariations = [
      normalizedName,
      normalizedName.replace(/\s+/g, '-'),
      normalizedName.replace(/-/g, ' '),
      normalizedName.replace(/[-\s]/g, ''),
    ]
    
    for (const nameVar of nameVariations) {
      const timing = supplementTimingMap.get(nameVar)
      if (timing) {
        return timing
      }
    }
  } catch (err) {
    console.warn('Error loading predefined stacks for timing suggestion:', err)
  }
  
  // Fallback: Use name-based heuristics (same logic as stack-builder.ts)
  
  // Stimulants - Morning/Pre-Workout
  if (
    normalizedName.includes('caffeine') ||
    normalizedName.includes('tyrosine') ||
    normalizedName.includes('teacrine') ||
    normalizedName.includes('theobromine') ||
    normalizedName.includes('guarana')
  ) {
    return 'Pre-Workout'
  }
  
  // Sleep aids - Bedtime
  if (
    normalizedName.includes('melatonin') ||
    normalizedName.includes('5-htp') ||
    normalizedName.includes('5htp') ||
    normalizedName.includes('glycine') ||
    normalizedName.includes('gaba') ||
    normalizedName.includes('l-theanine') ||
    normalizedName.includes('theanine') ||
    (normalizedName.includes('magnesium') && categoryIds?.includes(7)) // Sleep category
  ) {
    return 'Bedtime'
  }
  
  // Post-workout supplements
  if (
    normalizedName.includes('bcaa') ||
    normalizedName.includes('whey') ||
    normalizedName.includes('protein') ||
    normalizedName.includes('glutamine')
  ) {
    return 'Post-Workout'
  }
  
  // Pre-workout supplements
  if (
    normalizedName.includes('creatine') ||
    normalizedName.includes('beta-alanine') ||
    normalizedName.includes('beta alanine') ||
    normalizedName.includes('citrulline') ||
    normalizedName.includes('arginine')
  ) {
    return 'Pre-Workout'
  }
  
  // Fat-soluble vitamins - usually with meals (Dinner)
  if (
    normalizedName.includes('vitamin d') ||
    normalizedName.includes('vitamin d3') ||
    normalizedName.includes('omega-3') ||
    normalizedName.includes('omega 3') ||
    normalizedName.includes('fish oil') ||
    normalizedName.includes('epa') ||
    normalizedName.includes('dha')
  ) {
    // Vitamin D3 is usually Morning, but Omega-3 is Dinner
    if (normalizedName.includes('omega') || normalizedName.includes('fish') || normalizedName.includes('epa') || normalizedName.includes('dha')) {
      return 'Dinner'
    }
    return 'Morning'
  }
  
  // Default to Morning for most supplements
  return 'Morning'
}
