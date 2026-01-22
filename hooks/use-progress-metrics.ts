import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { ProgressMetrics } from "@/lib/whatdose-data"

export function useProgressMetrics(userId: string | null) {
  const [metrics, setMetrics] = useState<ProgressMetrics>({
    total_tasks: 0,
    completed_tasks: 0,
    completion_percentage: 0,
    streak_days: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchMetrics = async () => {
      try {
        // Get today's metrics
        const today = new Date().toISOString().split('T')[0]
        
        const { data, error: metricsError } = await supabase
          .from('user_progress_metrics')
          .select('*')
          .eq('user_id', userId)
          .eq('metric_date', today)
          .single()

        if (metricsError && metricsError.code !== 'PGRST116') { // PGRST116 = no rows returned
          throw metricsError
        }

        if (data) {
          setMetrics({
            total_tasks: data.total_tasks || 0,
            completed_tasks: data.completed_tasks || 0,
            completion_percentage: Number(data.compliance_percentage) || 0,
            streak_days: data.streak_days || 0,
          })
        } else {
          // If no metrics exist for today, calculate from daily_task_completions
          const { data: completions } = await supabase
            .from('daily_task_completions')
            .select('*')
            .eq('user_id', userId)
            .eq('completion_date', today)

          const total = completions?.length || 0
          const completed = completions?.filter(c => c.is_completed).length || 0
          const percentage = total > 0 ? Math.round((completed / total) * 100) : 0

          // Calculate streak
          const { data: streakData } = await supabase
            .from('daily_task_completions')
            .select('completion_date, is_completed')
            .eq('user_id', userId)
            .order('completion_date', { ascending: false })
            .limit(30)

          let streak = 0
          if (streakData) {
            const dates = new Set(streakData.map(d => d.completion_date))
            let currentDate = new Date()
            while (dates.has(currentDate.toISOString().split('T')[0])) {
              streak++
              currentDate.setDate(currentDate.getDate() - 1)
            }
          }

          setMetrics({
            total_tasks: total,
            completed_tasks: completed,
            completion_percentage: percentage,
            streak_days: streak,
          })
        }
      } catch (err) {
        console.error('Error fetching progress metrics:', err)
        setError(err instanceof Error ? err.message : 'Failed to load metrics')
      } finally {
        setLoading(false)
      }
    }

    fetchMetrics()
  }, [userId])

  return { metrics, loading, error }
}

