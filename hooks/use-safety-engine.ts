import { useState, useEffect } from "react"
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

export function useSafetyEngine(userId: string | null) {
  const [warnings, setWarnings] = useState<InteractionWarning[]>([])
  const [loading, setLoading] = useState(false)

  const checkInteractions = async (supplementIds: number[]) => {
    if (!userId || supplementIds.length < 2) {
      setWarnings([])
      return []
    }

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

      if (ssError) throw ssError

      if (!supplementSubstances || supplementSubstances.length === 0) {
        setWarnings([])
        setLoading(false)
        return []
      }

      // Get all unique substance IDs
      const substanceIds = Array.from(
        new Set(supplementSubstances.map((ss: any) => ss.substance_id))
      )

      if (substanceIds.length < 2) {
        setWarnings([])
        setLoading(false)
        return []
      }

      // Find interactions between these substances
      const { data: interactions, error: intError } = await supabase
        .from('interactions')
        .select(`
          substance_a_id,
          substance_b_id,
          severity,
          mechanism,
          description,
          evidence_level,
          substances!interactions_substance_a_id_fkey (
            name
          ),
          substances!interactions_substance_b_id_fkey (
            name
          )
        `)
        .or(`substance_a_id.in.(${substanceIds.join(',')}),substance_b_id.in.(${substanceIds.join(',')})`)

      if (intError) throw intError

      if (!interactions || interactions.length === 0) {
        setWarnings([])
        setLoading(false)
        return []
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

            // Get supplement names
            const { data: suppA_data } = await supabase
              .from('supplements')
              .select('name_en')
              .eq('id', suppA)
              .single()

            const { data: suppB_data } = await supabase
              .from('supplements')
              .select('name_en')
              .eq('id', suppB)
              .single()

            warningsMap.set(key, {
              supplement_a_id: suppA,
              supplement_a_name: suppA_data?.name_en || 'Unknown',
              supplement_b_id: suppB,
              supplement_b_name: suppB_data?.name_en || 'Unknown',
              severity: interaction.severity,
              mechanism: interaction.mechanism,
              description: interaction.description,
              evidence_level: interaction.evidence_level,
            })
          }
        }
      }

      const warningsList = Array.from(warningsMap.values())
      setWarnings(warningsList)
      setLoading(false)
      return warningsList
    } catch (err) {
      console.error('Error checking interactions:', err)
      setLoading(false)
      return []
    }
  }

  return {
    warnings,
    loading,
    checkInteractions,
  }
}
