import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface TerraConnection {
  id: number
  user_id: string
  terra_user_id: string
  provider: string
  status: "connected" | "disconnected" | "error"
  last_sync_at: string | null
}

export function useTerra(userId: string | null) {
  const [connections, setConnections] = useState<TerraConnection[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchConnections = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('terra_connections')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })

        if (fetchError) throw fetchError

        setConnections(data || [])
      } catch (err) {
        console.error('Error fetching Terra connections:', err)
        setError(err instanceof Error ? err.message : 'Failed to load connections')
      } finally {
        setLoading(false)
      }
    }

    fetchConnections()
  }, [userId])

  const connectProvider = async (provider: string, terraUserId: string) => {
    if (!userId) return { error: 'Not authenticated' }

    try {
      const { data, error: connectError } = await supabase
        .from('terra_connections')
        .upsert({
          user_id: userId,
          terra_user_id: terraUserId,
          provider,
          status: 'connected',
          last_sync_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,provider'
        })
        .select()
        .single()

      if (connectError) throw connectError

      setConnections(prev => {
        const filtered = prev.filter(c => c.provider !== provider)
        return [data, ...filtered]
      })

      return { data, error: null }
    } catch (err) {
      console.error('Error connecting provider:', err)
      return { error: err instanceof Error ? err.message : 'Failed to connect provider' }
    }
  }

  const disconnectProvider = async (provider: string) => {
    if (!userId) return { error: 'Not authenticated' }

    try {
      const { error: disconnectError } = await supabase
        .from('terra_connections')
        .update({ status: 'disconnected' })
        .eq('user_id', userId)
        .eq('provider', provider)

      if (disconnectError) throw disconnectError

      setConnections(prev => prev.map(c =>
        c.provider === provider ? { ...c, status: 'disconnected' } : c
      ))

      return { error: null }
    } catch (err) {
      console.error('Error disconnecting provider:', err)
      return { error: err instanceof Error ? err.message : 'Failed to disconnect provider' }
    }
  }

  return {
    connections,
    loading,
    error,
    connectProvider,
    disconnectProvider,
  }
}

