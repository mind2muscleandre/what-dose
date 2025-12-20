import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Experiment } from "@/lib/database.types"

export interface ExperimentWithStats extends Experiment {
  current_phase?: string
  progress_percentage?: number
}

export function useExperiments(userId: string | null) {
  const [experiments, setExperiments] = useState<ExperimentWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchExperiments = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('experiments')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        // Calculate progress for each experiment
        const experimentsWithStats: ExperimentWithStats[] = (data || []).map(exp => {
          const startDate = new Date(exp.start_date)
          const endDate = new Date(exp.end_date)
          const today = new Date()
          const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
          const elapsedDays = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
          const progress = Math.min(100, Math.max(0, (elapsedDays / totalDays) * 100))

          // Determine current phase based on design
          let currentPhase = 'Setup'
          if (progress > 0 && progress < 100) {
            currentPhase = 'In Progress'
          } else if (progress >= 100) {
            currentPhase = 'Completed'
          }

          return {
            ...exp,
            current_phase: currentPhase,
            progress_percentage: progress,
          }
        })

        setExperiments(experimentsWithStats)
      } catch (err) {
        console.error('Error fetching experiments:', err)
        setError(err instanceof Error ? err.message : 'Failed to load experiments')
      } finally {
        setLoading(false)
      }
    }

    fetchExperiments()
  }, [userId])

  const createExperiment = async (
    title: string,
    description: string,
    design: string,
    startDate: string,
    endDate: string,
    interventionData: Record<string, any>
  ) => {
    if (!userId) return { error: 'Not authenticated' }

    try {
      const { data, error: createError } = await supabase
        .from('experiments')
        .insert({
          user_id: userId,
          title,
          description,
          design,
          start_date: startDate,
          end_date: endDate,
          intervention_data: interventionData,
          results_data: {},
        })
        .select()
        .single()

      if (createError) throw createError

      const newExperiment: ExperimentWithStats = {
        ...data,
        current_phase: 'Setup',
        progress_percentage: 0,
      }

      setExperiments(prev => [newExperiment, ...prev])
      return { data, error: null }
    } catch (err) {
      console.error('Error creating experiment:', err)
      return { error: err instanceof Error ? err.message : 'Failed to create experiment' }
    }
  }

  return {
    experiments,
    loading,
    error,
    createExperiment,
  }
}
