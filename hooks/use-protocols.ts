import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Protocol } from "@/lib/database.types"

export interface ProtocolWithAuthor extends Protocol {
  author_name?: string
  is_liked?: boolean
}

export function useProtocols(userId: string | null) {
  const [protocols, setProtocols] = useState<ProtocolWithAuthor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchProtocols = async () => {
      try {
        // Fetch public protocols
        const { data: protocolsData, error: protocolsError } = await supabase
          .from('protocols')
          .select(`
            *,
            profiles!protocols_creator_id_fkey (
              first_name
            )
          `)
          .eq('is_public', true)
          .order('like_count', { ascending: false })
          .order('created_at', { ascending: false })
          .limit(50)

        if (protocolsError) throw protocolsError

        // Fetch user's likes if authenticated
        let userLikes: Set<number> = new Set()
        if (userId) {
          const { data: likesData } = await supabase
            .from('protocol_likes')
            .select('protocol_id')
            .eq('user_id', userId)

          userLikes = new Set(likesData?.map(l => l.protocol_id) || [])
        }

        const formattedProtocols: ProtocolWithAuthor[] = (protocolsData || []).map((protocol: any) => ({
          ...protocol,
          author_name: protocol.profiles?.first_name || 'Anonymous',
          is_liked: userLikes.has(protocol.id),
        }))

        setProtocols(formattedProtocols)
      } catch (err) {
        console.error('Error fetching protocols:', err)
        setError(err instanceof Error ? err.message : 'Failed to load protocols')
      } finally {
        setLoading(false)
      }
    }

    fetchProtocols()
  }, [userId])

  const createProtocol = async (title: string, description: string, protocolData: Record<string, any>, forkedFromId?: number) => {
    if (!userId) return { error: 'Not authenticated' }

    try {
      const { data, error: createError } = await supabase
        .from('protocols')
        .insert({
          creator_id: userId,
          title,
          description,
          protocol_data: protocolData,
          is_public: true,
          forked_from_id: forkedFromId || null,
        })
        .select()
        .single()

      if (createError) throw createError

      const newProtocol: ProtocolWithAuthor = {
        ...data,
        author_name: 'You',
        is_liked: false,
      }

      setProtocols(prev => [newProtocol, ...prev])
      return { data, error: null }
    } catch (err) {
      console.error('Error creating protocol:', err)
      return { error: err instanceof Error ? err.message : 'Failed to create protocol' }
    }
  }

  const forkProtocol = async (protocolId: number, title: string, description: string, modifications?: Record<string, any>) => {
    if (!userId) return { error: 'Not authenticated' }

    try {
      // Get original protocol
      const { data: original, error: fetchError } = await supabase
        .from('protocols')
        .select('*')
        .eq('id', protocolId)
        .single()

      if (fetchError) throw fetchError

      // Create fork with modifications
      const protocolData = modifications
        ? { ...original.protocol_data, ...modifications }
        : original.protocol_data

      return await createProtocol(
        title,
        description || `Forked from: ${original.title}`,
        protocolData,
        protocolId
      )
    } catch (err) {
      console.error('Error forking protocol:', err)
      return { error: err instanceof Error ? err.message : 'Failed to fork protocol' }
    }
  }

  const toggleLike = async (protocolId: number) => {
    if (!userId) {
      alert('Please sign in to like protocols')
      return
    }

    try {
      const protocol = protocols.find(p => p.id === protocolId)
      if (!protocol) return

      const isLiked = protocol.is_liked

      if (isLiked) {
        // Unlike
        const { error: unlikeError } = await supabase
          .from('protocol_likes')
          .delete()
          .eq('protocol_id', protocolId)
          .eq('user_id', userId)

        if (unlikeError) throw unlikeError

        // Update like count
        const { error: updateError } = await supabase
          .from('protocols')
          .update({ like_count: Math.max(0, protocol.like_count - 1) })
          .eq('id', protocolId)

        if (updateError) throw updateError

        setProtocols(prev => prev.map(p =>
          p.id === protocolId
            ? { ...p, is_liked: false, like_count: Math.max(0, p.like_count - 1) }
            : p
        ))
      } else {
        // Like
        const { error: likeError } = await supabase
          .from('protocol_likes')
          .insert({ protocol_id: protocolId, user_id: userId })

        if (likeError && likeError.code !== '23505') throw likeError

        // Update like count
        const { error: updateError } = await supabase
          .from('protocols')
          .update({ like_count: protocol.like_count + 1 })
          .eq('id', protocolId)

        if (updateError) throw updateError

        setProtocols(prev => prev.map(p =>
          p.id === protocolId
            ? { ...p, is_liked: true, like_count: p.like_count + 1 }
            : p
        ))
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      alert(err instanceof Error ? err.message : 'Failed to update like')
    }
  }

  return {
    protocols,
    loading,
    error,
    createProtocol,
    forkProtocol,
    toggleLike,
  }
}
