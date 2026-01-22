import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { Database } from "@/lib/database.types"

type SupplementVote = Database['public']['Tables']['supplement_votes']['Row']
type SupplementComment = Database['public']['Tables']['supplement_comments']['Row']

export interface SupplementVoteStats {
  upvotes: number
  downvotes: number
  userVote: 'upvote' | 'downvote' | null
}

export interface SupplementCommentWithProfile extends SupplementComment {
  profiles: {
    first_name: string | null
    username: string | null
  } | null
}

export function useSupplementVoting(supplementId: number | null, userId: string | null) {
  const [stats, setStats] = useState<SupplementVoteStats>({
    upvotes: 0,
    downvotes: 0,
    userVote: null,
  })
  const [comments, setComments] = useState<SupplementCommentWithProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch vote stats and user's vote
  useEffect(() => {
    if (!supplementId) {
      setStats({ upvotes: 0, downvotes: 0, userVote: null })
      return
    }

    let cancelled = false

    const fetchStats = async () => {
      try {
        // Get supplement with vote counts
        const { data: supplement, error: supError } = await supabase
          .from('supplements')
          .select('upvotes_count, downvotes_count')
          .eq('id', supplementId)
          .single()

        if (supError) {
          // Ignore 406 errors (Not Acceptable) - can happen with too many requests
          if (supError.code === 'PGRST116' || supError.message?.includes('406')) {
            console.warn('Request rejected (406), skipping vote stats fetch')
            return
          }
          throw supError
        }

        if (cancelled) return

        // Get user's vote if logged in
        let userVote: 'upvote' | 'downvote' | null = null
        if (userId) {
          const { data: vote, error: voteError } = await supabase
            .from('supplement_votes')
            .select('vote_type')
            .eq('supplement_id', supplementId)
            .eq('user_id', userId)
            .maybeSingle()

          // Ignore 406 errors for vote lookup
          if (voteError && voteError.code !== 'PGRST116' && !voteError.message?.includes('406')) {
            console.warn('Error fetching user vote:', voteError)
          } else if (vote) {
            userVote = vote.vote_type as 'upvote' | 'downvote'
          }
        }

        if (cancelled) return

        setStats({
          upvotes: supplement?.upvotes_count || 0,
          downvotes: supplement?.downvotes_count || 0,
          userVote,
        })
      } catch (err) {
        if (cancelled) return
        console.error('Error fetching vote stats:', err)
        setError(err instanceof Error ? err.message : 'Failed to load votes')
      }
    }

    // Debounce to prevent too many rapid requests
    const timeoutId = setTimeout(() => {
      fetchStats()
    }, 100)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [supplementId, userId])

  // Fetch comments
  useEffect(() => {
    if (!supplementId) {
      setComments([])
      return
    }

    let cancelled = false

    const fetchComments = async () => {
      try {
        const { data, error: commentsError } = await supabase
          .from('supplement_comments')
          .select(`
            *,
            profiles:user_id (
              first_name,
              username
            )
          `)
          .eq('supplement_id', supplementId)
          .order('created_at', { ascending: false })

        // Ignore 406 errors
        if (commentsError && commentsError.code !== 'PGRST116' && !commentsError.message?.includes('406')) {
          throw commentsError
        }

        if (cancelled) return

        setComments((data || []) as SupplementCommentWithProfile[])
      } catch (err) {
        if (cancelled) return
        console.error('Error fetching comments:', err)
      }
    }

    // Debounce to prevent too many rapid requests
    const timeoutId = setTimeout(() => {
      fetchComments()
    }, 100)

    return () => {
      cancelled = true
      clearTimeout(timeoutId)
    }
  }, [supplementId])

  const vote = async (voteType: 'upvote' | 'downvote') => {
    if (!supplementId || !userId) {
      return { error: 'Must be logged in to vote' }
    }

    setLoading(true)
    setError(null)

    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('supplement_votes')
        .select('id, vote_type')
        .eq('supplement_id', supplementId)
        .eq('user_id', userId)
        .single()

      if (existingVote) {
        // If same vote type, remove vote. Otherwise, update to new type
        if (existingVote.vote_type === voteType) {
          const { error: deleteError } = await supabase
            .from('supplement_votes')
            .delete()
            .eq('id', existingVote.id)

          if (deleteError) throw deleteError

          // Update local state
          setStats(prev => ({
            ...prev,
            userVote: null,
            upvotes: voteType === 'upvote' ? Math.max(prev.upvotes - 1, 0) : prev.upvotes,
            downvotes: voteType === 'downvote' ? Math.max(prev.downvotes - 1, 0) : prev.downvotes,
          }))
        } else {
          // Update vote type
          const { error: updateError } = await supabase
            .from('supplement_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id)

          if (updateError) throw updateError

          // Update local state
          setStats(prev => ({
            ...prev,
            userVote: voteType,
            upvotes: voteType === 'upvote' ? prev.upvotes + 1 : Math.max(prev.upvotes - 1, 0),
            downvotes: voteType === 'downvote' ? prev.downvotes + 1 : Math.max(prev.downvotes - 1, 0),
          }))
        }
      } else {
        // Insert new vote
        const { error: insertError } = await supabase
          .from('supplement_votes')
          .insert({
            supplement_id: supplementId,
            user_id: userId,
            vote_type: voteType,
          })

        if (insertError) throw insertError

        // Update local state
        setStats(prev => ({
          ...prev,
          userVote: voteType,
          upvotes: voteType === 'upvote' ? prev.upvotes + 1 : prev.upvotes,
          downvotes: voteType === 'downvote' ? prev.downvotes + 1 : prev.downvotes,
        }))
      }

      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to vote'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const addComment = async (content: string) => {
    if (!supplementId || !userId) {
      return { error: 'Must be logged in to comment' }
    }

    if (!content.trim()) {
      return { error: 'Comment cannot be empty' }
    }

    setLoading(true)
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from('supplement_comments')
        .insert({
          supplement_id: supplementId,
          user_id: userId,
          content: content.trim(),
        })
        .select(`
          *,
          profiles:user_id (
            first_name,
            username
          )
        `)
        .single()

      if (insertError) throw insertError

      // Add to local state (newest first)
      setComments(prev => [data as SupplementCommentWithProfile, ...prev])

      return { data, error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to add comment'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  const deleteComment = async (commentId: number) => {
    if (!userId) {
      return { error: 'Must be logged in' }
    }

    setLoading(true)
    setError(null)

    try {
      const { error: deleteError } = await supabase
        .from('supplement_comments')
        .delete()
        .eq('id', commentId)
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      // Remove from local state
      setComments(prev => prev.filter(c => c.id !== commentId))

      return { error: null }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete comment'
      setError(errorMessage)
      return { error: errorMessage }
    } finally {
      setLoading(false)
    }
  }

  return {
    stats,
    comments,
    loading,
    error,
    vote,
    addComment,
    deleteComment,
  }
}
