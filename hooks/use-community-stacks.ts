import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"

export interface CommunityStack {
  id: number
  user_id: string
  title: string
  description: string | null
  supplements: Array<{ name: string; dosage: string }>
  result_description: string | null
  likes_count: number
  comments_count: number
  is_public: boolean
  created_at: string
  author_name?: string
  is_liked?: boolean
}

export function useCommunityStacks(userId: string | null) {
  const [stacks, setStacks] = useState<CommunityStack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshTrigger, setRefreshTrigger] = useState(0)

  useEffect(() => {
    const fetchStacks = async () => {
      try {
        // Fetch public community stacks
        const { data: stacksData, error: stacksError } = await supabase
          .from('community_stacks')
          .select(`
            *,
            profiles (
              first_name,
              username
            )
          `)
          .eq('is_public', true)
          .order('created_at', { ascending: false })
          .limit(50)

        if (stacksError) throw stacksError

        // Fetch user's likes if authenticated
        let userLikes: Set<number> = new Set()
        if (userId) {
          const { data: likesData } = await supabase
            .from('stack_likes')
            .select('stack_id')
            .eq('user_id', userId)

          userLikes = new Set(likesData?.map(l => l.stack_id) || [])
        }

        const formattedStacks: CommunityStack[] = (stacksData || []).map((stack: any) => ({
          id: stack.id,
          user_id: stack.user_id,
          title: stack.title,
          description: stack.description,
          supplements: Array.isArray(stack.supplements) ? stack.supplements : [],
          result_description: stack.result_description,
          likes_count: stack.likes_count || 0,
          comments_count: stack.comments_count || 0,
          is_public: stack.is_public,
          created_at: stack.created_at,
          author_name: stack.profiles?.username || stack.profiles?.first_name || 'Anonymous',
          is_liked: userLikes.has(stack.id),
        }))

        setStacks(formattedStacks)
      } catch (err) {
        console.error('Error fetching community stacks:', err)
        setError(err instanceof Error ? err.message : 'Failed to load stacks')
      } finally {
        setLoading(false)
      }
    }

    fetchStacks()
  }, [userId, refreshTrigger])

  const toggleLike = async (stackId: number) => {
    if (!userId) {
      alert('Please sign in to like stacks')
      return
    }

    try {
      const stack = stacks.find(s => s.id === stackId)
      if (!stack) return

      const isLiked = stack.is_liked

      if (isLiked) {
        // Unlike
        const { error: unlikeError } = await supabase
          .from('stack_likes')
          .delete()
          .eq('stack_id', stackId)
          .eq('user_id', userId)

        if (unlikeError) throw unlikeError

        // Update likes count
        const { error: updateError } = await supabase
          .from('community_stacks')
          .update({ likes_count: Math.max(0, stack.likes_count - 1) })
          .eq('id', stackId)

        if (updateError) throw updateError

        setStacks(prev => prev.map(s =>
          s.id === stackId
            ? { ...s, is_liked: false, likes_count: Math.max(0, s.likes_count - 1) }
            : s
        ))
      } else {
        // Like
        const { error: likeError } = await supabase
          .from('stack_likes')
          .insert({ stack_id: stackId, user_id: userId })

        if (likeError) {
          if (likeError.code === '23505') {
            // Already liked, just update state
            setStacks(prev => prev.map(s =>
              s.id === stackId ? { ...s, is_liked: true } : s
            ))
            return
          }
          throw likeError
        }

        // Update likes count
        const { error: updateError } = await supabase
          .from('community_stacks')
          .update({ likes_count: stack.likes_count + 1 })
          .eq('id', stackId)

        if (updateError) throw updateError

        setStacks(prev => prev.map(s =>
          s.id === stackId
            ? { ...s, is_liked: true, likes_count: s.likes_count + 1 }
            : s
        ))
      }
    } catch (err) {
      console.error('Error toggling like:', err)
      alert(err instanceof Error ? err.message : 'Failed to update like')
    }
  }

  const shareStack = async (stack: CommunityStack) => {
    const shareData = {
      title: stack.title,
      text: `${stack.title} - ${stack.supplements.map(s => s.name).join(', ')}`,
      url: `${window.location.origin}/community/${stack.id}`,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        await navigator.clipboard.writeText(shareData.url)
        alert('Link copied to clipboard!')
      }
    } catch (err) {
      console.error('Error sharing:', err)
    }
  }

  const refreshStacks = () => {
    // Trigger a refetch by incrementing refreshTrigger
    setRefreshTrigger(prev => prev + 1)
  }

  return {
    stacks,
    loading,
    error,
    toggleLike,
    shareStack,
    refreshStacks,
  }
}
