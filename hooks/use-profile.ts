import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Profile } from "@/lib/database.types"

export interface ProfileStats {
  streak_days: number
  supplements_count: number
  compliance_percentage: number
}

export function useProfile(userId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [stats, setStats] = useState<ProfileStats>({
    streak_days: 0,
    supplements_count: 0,
    compliance_percentage: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchProfile = async () => {
      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .single()

        if (profileError) throw profileError
        setProfile(profileData)

        // Fetch stats
        const today = new Date().toISOString().split('T')[0]

        // Get streak from progress metrics
        const { data: metricsData, error: metricsError } = await supabase
          .from('user_progress_metrics')
          .select('streak_days, compliance_percentage')
          .eq('user_id', userId)
          .eq('metric_date', today)
          .maybeSingle()

        // Ignore 406 errors (Not Acceptable) - can happen with too many requests
        if (metricsError && metricsError.code !== 'PGRST116' && !metricsError.message?.includes('406')) {
          console.warn('Error fetching progress metrics:', metricsError)
        }

        // Get supplements count
        const { count: supplementsCount } = await supabase
          .from('user_stacks')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_active', true)

        setStats({
          streak_days: metricsData?.streak_days || 0,
          supplements_count: supplementsCount || 0,
          compliance_percentage: Number(metricsData?.compliance_percentage) || 0,
        })
      } catch (err) {
        console.error('Error fetching profile:', err)
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [userId])

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!userId) return { error: 'Not authenticated' }

    try {
      const { data, error: updateError } = await supabase
        .from('profiles')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', userId)
        .select()
        .single()

      if (updateError) throw updateError

      setProfile(data)
      return { data, error: null }
    } catch (err) {
      console.error('Error updating profile:', err)
      return { error: err instanceof Error ? err.message : 'Failed to update profile' }
    }
  }

  return {
    profile,
    stats,
    loading,
    error,
    updateProfile,
  }
}
