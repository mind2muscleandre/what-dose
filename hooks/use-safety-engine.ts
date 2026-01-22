import { useState, useCallback } from "react"
import { supabase } from "@/lib/supabase"

export interface InteractionWarning {
  supplement_a_id: number
  supplement_a_name: string
  supplement_b_id: number
  supplement_b_name: string
  severity: number
  mechanism: string | null
  description: string | null
  evidence_level: string | null
}

export interface DosageWarning {
  supplement_id: number
  supplement_name: string
  current_dosage: number
  max_safe_dosage: number
  unit: string
  severity: number
  description: string
}

export type SafetyWarning = InteractionWarning | DosageWarning

export function useSafetyEngine(userId: string | null) {
  const [warnings, setWarnings] = useState<InteractionWarning[]>([])
  const [dosageWarnings, setDosageWarnings] = useState<DosageWarning[]>([])
  const [loading, setLoading] = useState(false)

  const checkInteractions = useCallback(async (supplementIds: number[]) => {
    if (!userId || supplementIds.length < 2) {
      console.log('[Safety Engine] Skipping check: userId or supplementIds missing', { userId, supplementIds })
      setWarnings([])
      return []
    }

    console.log('[Safety Engine] Checking interactions for supplements:', supplementIds)
    setLoading(true)
    try {
      // Get substances for all supplements in stack
      const { data: supplementSubstances, error: ssError } = await supabase
        .from('supplement_substances')
        .select(`
          supplement_id,
          substance_id,
          substances (
            id,
            name
          )
        `)
        .in('supplement_id', supplementIds)
      
      console.log('[Safety Engine] Supplement substances result:', { 
        count: supplementSubstances?.length || 0, 
        data: supplementSubstances,
        error: ssError 
      })

      // Ignore 406 errors (Not Acceptable) - common with Supabase
      if (ssError && ssError.code !== 'PGRST116' && !ssError.message?.includes('406')) {
        console.warn('Error fetching supplement substances (ignored):', ssError.code || ssError.message)
        setWarnings([])
        setLoading(false)
        return []
      }
      
      if (ssError && (ssError.code === 'PGRST116' || ssError.message?.includes('406'))) {
        // No data found or 406 error - not a critical error
        setWarnings([])
        setLoading(false)
        return []
      }

      if (!supplementSubstances || supplementSubstances.length === 0) {
        setWarnings([])
        setLoading(false)
        return []
      }

      // Get all unique substance IDs
      const substanceIds = Array.from(
        new Set(supplementSubstances.map((ss: any) => ss.substance_id))
      )

      console.log('[Safety Engine] Unique substance IDs:', substanceIds)

      if (substanceIds.length < 2) {
        console.log('[Safety Engine] Not enough substances for interaction check (need at least 2)')
        setWarnings([])
        setLoading(false)
        return []
      }

      // Find interactions between these substances
      // We want interactions where BOTH substances are in our list
      // (i.e., both substance_a_id AND substance_b_id are in substanceIds)
      let interactionsQuery = supabase
        .from('interactions')
        .select(`
          substance_a_id,
          substance_b_id,
          severity,
          mechanism,
          description,
          evidence_level
        `)
        .in('substance_a_id', substanceIds)
        .in('substance_b_id', substanceIds)

      const { data: interactions, error: intError } = await interactionsQuery

      console.log('[Safety Engine] Interactions result:', { 
        count: interactions?.length || 0, 
        data: interactions,
        error: intError 
      })

      // Ignore 406 errors (Not Acceptable) - common with Supabase
      if (intError && (intError.code === 'PGRST116' || intError.message?.includes('406'))) {
        // No interactions found or 406 error - not a critical error
        console.log('[Safety Engine] No interactions found (406/PGRST116)')
        setWarnings([])
        setLoading(false)
        return []
      }
      
      if (intError) {
        console.warn('[Safety Engine] Error fetching interactions (ignored):', intError.code || intError.message)
        setWarnings([])
        setLoading(false)
        return []
      }

      if (!interactions || interactions.length === 0) {
        console.log('[Safety Engine] No interactions found in database')
        setWarnings([])
        setLoading(false)
        return []
      }

      // Get all supplement names in one query for efficiency
      const { data: allSupplements, error: suppsError } = await supabase
        .from('supplements')
        .select('id, name_en')
        .in('id', supplementIds)

      // Ignore 406 errors (Not Acceptable) - common with Supabase
      if (suppsError && (suppsError.code === 'PGRST116' || suppsError.message?.includes('406'))) {
        // No supplements found or 406 error - not a critical error
        setWarnings([])
        setLoading(false)
        return []
      }
      
      if (suppsError) {
        console.warn('Error fetching supplement names (ignored):', suppsError.code || suppsError.message)
        setWarnings([])
        setLoading(false)
        return []
      }

      // Create a map for quick lookup
      const supplementNamesMap = new Map<number, string>()
      if (allSupplements) {
        allSupplements.forEach((supp: any) => {
          supplementNamesMap.set(supp.id, supp.name_en || 'Unknown')
        })
      }

      // Map interactions to supplement pairs
      const warningsMap = new Map<string, InteractionWarning>()

      for (const interaction of interactions) {
        const substanceAId = interaction.substance_a_id
        const substanceBId = interaction.substance_b_id

        // Find supplements that contain these substances
        const supplementsWithA = supplementSubstances
          .filter((ss: any) => ss.substance_id === substanceAId)
          .map((ss: any) => ss.supplement_id)

        const supplementsWithB = supplementSubstances
          .filter((ss: any) => ss.substance_id === substanceBId)
          .map((ss: any) => ss.supplement_id)

        // Create warnings for each supplement pair
        for (const suppA of supplementsWithA) {
          for (const suppB of supplementsWithB) {
            if (suppA === suppB) continue // Skip same supplement

            const key = `${Math.min(suppA, suppB)}-${Math.max(suppA, suppB)}`
            if (warningsMap.has(key)) continue

            warningsMap.set(key, {
              supplement_a_id: suppA,
              supplement_a_name: supplementNamesMap.get(suppA) || 'Unknown',
              supplement_b_id: suppB,
              supplement_b_name: supplementNamesMap.get(suppB) || 'Unknown',
              severity: interaction.severity,
              mechanism: interaction.mechanism || null,
              description: interaction.description || null,
              evidence_level: interaction.evidence_level || null,
            })
          }
        }
      }

      const warningsList = Array.from(warningsMap.values())
      console.log('[Safety Engine] Final warnings list:', warningsList)
      setWarnings(warningsList)
      setLoading(false)
      return warningsList
    } catch (err) {
      // Better error logging
      if (err instanceof Error) {
        // Ignore 406 errors
        if (err.message?.includes('406')) {
          console.warn('Interaction check skipped (406 error):', err.message)
        } else {
          console.warn('Error checking interactions:', err.message)
        }
      } else if (err && typeof err === 'object') {
        // Handle Supabase error objects
        const supabaseError = err as { code?: string; message?: string; details?: string; hint?: string }
        if (supabaseError.code === 'PGRST116' || supabaseError.message?.includes('406')) {
          console.warn('Interaction check skipped (406/PGRST116):', supabaseError.code || supabaseError.message)
        } else {
          console.warn('Error checking interactions:', supabaseError.code || supabaseError.message || JSON.stringify(err))
        }
      } else {
        console.warn('Error checking interactions (unknown type):', err)
      }
      setWarnings([])
      setLoading(false)
      return []
    }
  }, [userId])

  const checkDosages = useCallback(async (stackItems: Array<{
    supplement_id: number
    custom_dosage_val: number | null
    unit: string | null
    dosing_max_val: number | null
  }>) => {
    if (!userId || stackItems.length === 0) {
      setDosageWarnings([])
      return []
    }

    console.log('[Safety Engine] Checking dosages for stack items:', stackItems)
    
    const warnings: DosageWarning[] = []
    
    // Get supplement IDs to fetch safe_max values
    const supplementIds = stackItems.map(item => item.supplement_id)
    
    try {
      // Fetch supplements with safe_max values
      const { data: supplements, error } = await supabase
        .from('supplements')
        .select('id, name_en, dosing_max_val, scaling_safe_max, unit')
        .in('id', supplementIds)
      
      if (error) {
        console.warn('[Safety Engine] Error fetching supplements for dosage check:', error)
        setDosageWarnings([])
        return []
      }
      
      if (!supplements) {
        setDosageWarnings([])
        return []
      }
      
      // Create a map for quick lookup
      const supplementsMap = new Map<number, typeof supplements[0]>()
      supplements.forEach(supp => {
        supplementsMap.set(supp.id, supp)
      })
      
      // Check each stack item
      for (const item of stackItems) {
        const supplement = supplementsMap.get(item.supplement_id)
        if (!supplement) continue
        
        const currentDosage = item.custom_dosage_val
        if (!currentDosage || currentDosage <= 0) continue
        
        // Use scaling_safe_max if available, otherwise dosing_max_val
        const maxSafeDosage = supplement.scaling_safe_max || supplement.dosing_max_val
        if (!maxSafeDosage) continue
        
        // Check if current dosage exceeds safe max
        if (currentDosage > maxSafeDosage) {
          const excessPercent = ((currentDosage - maxSafeDosage) / maxSafeDosage) * 100
          
          // Determine severity based on how much over the limit
          let severity = 3 // Medium by default
          if (excessPercent > 50) {
            severity = 5 // Very High - more than 50% over
          } else if (excessPercent > 25) {
            severity = 4 // High - 25-50% over
          }
          
          warnings.push({
            supplement_id: item.supplement_id,
            supplement_name: supplement.name_en || 'Unknown',
            current_dosage: currentDosage,
            max_safe_dosage: maxSafeDosage,
            unit: item.unit || supplement.unit || 'mg',
            severity,
            description: `Current dosage (${currentDosage}${item.unit || supplement.unit || 'mg'}) exceeds the recommended maximum safe dosage (${maxSafeDosage}${item.unit || supplement.unit || 'mg'}). This may cause adverse effects.`
          })
        }
      }
      
      console.log('[Safety Engine] Dosage warnings found:', warnings)
      setDosageWarnings(warnings)
      return warnings
    } catch (err) {
      console.warn('[Safety Engine] Error checking dosages:', err)
      setDosageWarnings([])
      return []
    }
  }, [userId])

  return {
    warnings,
    dosageWarnings,
    loading,
    checkInteractions,
    checkDosages,
  }
}
