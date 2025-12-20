import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import type { TimelineBlock, SupplementItem } from "@/lib/whatdose-data"

export function useTimelineBlocks(userId: string | null) {
  const [blocks, setBlocks] = useState<TimelineBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchTimelineBlocks = async () => {
      try {
        // Fetch timeline blocks
        const { data: blocksData, error: blocksError } = await supabase
          .from('timeline_blocks')
          .select('*')
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('display_order')

        if (blocksError) throw blocksError

        if (!blocksData || blocksData.length === 0) {
          setBlocks([])
          setLoading(false)
          return
        }

        // Fetch timeline items for each block
        const blockIds = blocksData.map(b => b.id)
        const { data: itemsData, error: itemsError } = await supabase
          .from('timeline_items')
          .select('*')
          .in('block_id', blockIds)
          .order('display_order')

        if (itemsError) throw itemsError

        // Fetch today's completions
        const today = new Date().toISOString().split('T')[0]
        const itemIds = itemsData?.map(i => i.item_id) || []
        
        const { data: completionsData } = await supabase
          .from('daily_task_completions')
          .select('item_id, is_completed')
          .eq('user_id', userId)
          .eq('completion_date', today)
          .in('item_id', itemIds)

        const completionsMap = new Map(
          completionsData?.map(c => [c.item_id, c.is_completed]) || []
        )

        // Fetch user_stacks data for items that have stack_item_id
        const stackItemIds = itemsData
          ?.filter(i => i.stack_item_id)
          .map(i => i.stack_item_id)
          .filter(Boolean) || []

        let stackItemsMap = new Map()
        if (stackItemIds.length > 0) {
          const { data: stackItemsData, error: stackError } = await supabase
            .from('user_stacks')
            .select('id, supplement_id, custom_dosage_val, schedule_block')
            .in('id', stackItemIds)
            .eq('is_active', true)

          if (stackError) {
            console.warn('Error fetching stack items:', stackError)
          } else if (stackItemsData) {
            stackItemsMap = new Map(
              stackItemsData.map(s => [s.id, s])
            )
          }
        }

        // Fetch supplement details
        const supplementIds = Array.from(stackItemsMap.values())
          .map(s => s.supplement_id)
          .filter(Boolean)

        let supplementsMap = new Map()
        if (supplementIds.length > 0) {
          const { data: supplementsData, error: supplementsError } = await supabase
            .from('supplements')
            .select('id, name_en, name_sv, dosing_base_val, dosing_max_val, unit')
            .in('id', supplementIds)

          if (supplementsError) {
            console.warn('Error fetching supplements:', supplementsError)
          } else if (supplementsData) {
            supplementsMap = new Map(
              supplementsData.map(s => [s.id, s])
            )
          }
        }

        // Build timeline blocks with items
        const timelineBlocks: TimelineBlock[] = blocksData.map(block => {
          const blockItems = itemsData?.filter(i => i.block_id === block.id) || []
          
          const items: SupplementItem[] = blockItems.map(item => {
            const stackItem = item.stack_item_id 
              ? stackItemsMap.get(item.stack_item_id)
              : null
            
            const supplement = stackItem?.supplement_id 
              ? supplementsMap.get(stackItem.supplement_id)
              : null

            // Determine dosage: use custom_dosage_val if set, otherwise use supplement's dosing_base_val
            let dosage = ''
            if (stackItem?.custom_dosage_val) {
              dosage = `${stackItem.custom_dosage_val}${supplement?.unit || ''}`
            } else if (supplement?.dosing_base_val) {
              dosage = `${supplement.dosing_base_val}${supplement.unit || ''}`
            }

            return {
              item_id: item.item_id,
              name: supplement?.name_en || 'Unknown',
              dosage_display: dosage,
              form: 'pill', // Default, could be enhanced
              is_completed: completionsMap.get(item.item_id) || false,
              notes: item.notes || '',
              critical_instruction: item.critical_instruction || null,
            }
          })

          return {
            block_id: block.block_id,
            title: block.title,
            subtitle: block.subtitle || '',
            icon_key: block.icon_key || 'pill',
            ui_color_hex: block.ui_color_hex || '#0ea5e9',
            suggested_time: block.suggested_time || '08:00',
            items,
          }
        })

        setBlocks(timelineBlocks)
      } catch (err) {
        console.error('Error fetching timeline blocks:', err)
        setError(err instanceof Error ? err.message : 'Failed to load timeline')
      } finally {
        setLoading(false)
      }
    }

    fetchTimelineBlocks()
  }, [userId])

  const updateCompletion = async (itemId: string, isCompleted: boolean) => {
    if (!userId) return

    const today = new Date().toISOString().split('T')[0]

    const { error } = await supabase
      .from('daily_task_completions')
      .upsert({
        user_id: userId,
        item_id: itemId,
        completion_date: today,
        is_completed: isCompleted,
        completed_at: isCompleted ? new Date().toISOString() : null,
      }, {
        onConflict: 'user_id,item_id,completion_date'
      })

    if (error) {
      console.error('Error updating completion:', error)
      return
    }

    // Update local state
    setBlocks(prev => prev.map(block => ({
      ...block,
      items: block.items.map(item =>
        item.item_id === itemId
          ? { ...item, is_completed: isCompleted }
          : item
      )
    })))
  }

  return { blocks, loading, error, updateCompletion }
}
