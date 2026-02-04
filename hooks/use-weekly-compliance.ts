import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useWeeklyCompliance(userId: string | null) {
  const [weeklyCompliance, setWeeklyCompliance] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const calculateWeeklyCompliance = async () => {
      try {
        // Get dates for last 7 days
        const today = new Date()
        const dates: string[] = []
        for (let i = 0; i < 7; i++) {
          const date = new Date(today)
          date.setDate(date.getDate() - i)
          dates.push(date.toISOString().split('T')[0])
        }

        // Fetch completions for last 7 days
        const { data: completions, error } = await supabase
          .from('daily_task_completions')
          .select('completion_date, is_completed')
          .eq('user_id', userId)
          .in('completion_date', dates)

        if (error) {
          console.error('Error fetching weekly compliance:', error)
          setWeeklyCompliance(0)
          return
        }

        if (!completions || completions.length === 0) {
          setWeeklyCompliance(0)
          return
        }

        // Group by date and calculate daily compliance
        const dailyCompliance: number[] = []
        const dateGroups = new Map<string, { total: number; completed: number }>()

        completions.forEach(completion => {
          const date = completion.completion_date
          if (!dateGroups.has(date)) {
            dateGroups.set(date, { total: 0, completed: 0 })
          }
          const group = dateGroups.get(date)!
          group.total++
          if (completion.is_completed) {
            group.completed++
          }
        })

        // Calculate compliance percentage for each day
        dateGroups.forEach((group, date) => {
          if (group.total > 0) {
            const dayCompliance = Math.round((group.completed / group.total) * 100)
            dailyCompliance.push(dayCompliance)
          }
        })

        // Calculate average weekly compliance
        const average = dailyCompliance.length > 0
          ? Math.round(dailyCompliance.reduce((sum, val) => sum + val, 0) / dailyCompliance.length)
          : 0

        setWeeklyCompliance(average)
      } catch (err) {
        console.error('Error calculating weekly compliance:', err)
        setWeeklyCompliance(0)
      } finally {
        setLoading(false)
      }
    }

    calculateWeeklyCompliance()
  }, [userId])

  return { weeklyCompliance, loading }
}
