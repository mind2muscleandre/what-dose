import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export function useCheckInStatus(userId: string | null) {
  const [checkedInToday, setCheckedInToday] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const checkTodayStatus = async () => {
      try {
        const today = new Date().toISOString().split('T')[0]
        
        const { data, error } = await supabase
          .from('daily_checkins')
          .select('id')
          .eq('user_id', userId)
          .eq('date', today)
          .maybeSingle()

        if (error && error.code !== 'PGRST116') {
          console.error('Error checking check-in status:', error)
          return
        }

        setCheckedInToday(!!data)
      } catch (err) {
        console.error('Error checking check-in status:', err)
      } finally {
        setLoading(false)
      }
    }

    checkTodayStatus()
  }, [userId])

  return { checkedInToday, loading }
}
