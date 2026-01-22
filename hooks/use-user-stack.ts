import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { generateTimelineFromStack } from "@/lib/generate-timeline-from-stack"

export interface StackItem {
  id: number
  supplement_id: number
  supplement_name: string
  custom_dosage_val: number | null
  schedule_block: string
  unit: string | null
  dosing_base_val: number | null
  dosing_max_val: number | null
}

export function useUserStack(userId: string | null) {
  const [stackItems, setStackItems] = useState<StackItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!userId) {
      setLoading(false)
      return
    }

    const fetchStack = async () => {
      try {
        const { data, error: fetchError } = await supabase
          .from('user_stacks')
          .select(`
            id,
            supplement_id,
            custom_dosage_val,
            schedule_block,
            supplements (
              name_en,
              dosing_base_val,
              dosing_max_val,
              unit
            )
          `)
          .eq('user_id', userId)
          .eq('is_active', true)
          .order('schedule_block')
          .order('created_at')

        if (fetchError) throw fetchError

        const items: StackItem[] = (data || []).map((item: any) => ({
          id: item.id,
          supplement_id: item.supplement_id,
          supplement_name: item.supplements?.name_en || 'Unknown',
          custom_dosage_val: item.custom_dosage_val,
          schedule_block: item.schedule_block,
          unit: item.supplements?.unit || null,
          dosing_base_val: item.supplements?.dosing_base_val || null,
          dosing_max_val: item.supplements?.dosing_max_val || null,
        }))

        setStackItems(items)
      } catch (err) {
        console.error('Error fetching user stack:', err)
        setError(err instanceof Error ? err.message : 'Failed to load stack')
      } finally {
        setLoading(false)
      }
    }

    fetchStack()
  }, [userId])

  const addToStack = async (supplementId: number, scheduleBlock: string, customDosage?: number) => {
    if (!userId) return { error: 'Not authenticated' }

    try {
      // First, check if there's an inactive row with the same supplement_id and schedule_block
      const { data: existingInactive, error: checkError } = await supabase
        .from('user_stacks')
        .select('id, supplement_id, custom_dosage_val, schedule_block, is_active')
        .eq('user_id', userId)
        .eq('supplement_id', supplementId)
        .eq('schedule_block', scheduleBlock)
        .maybeSingle()

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError
      }

      // If there's an inactive row, reactivate it instead of creating new
      if (existingInactive && !existingInactive.is_active) {
        const { data: reactivatedData, error: updateError } = await supabase
          .from('user_stacks')
          .update({
            is_active: true,
            custom_dosage_val: customDosage || existingInactive.custom_dosage_val || null,
          })
          .eq('id', existingInactive.id)
          .select(`
            id,
            supplement_id,
            custom_dosage_val,
            schedule_block,
            supplements (
              name_en,
              dosing_base_val,
              dosing_max_val,
              unit
            )
          `)
          .single()

        if (updateError) throw updateError

        const reactivatedItem: StackItem = {
          id: reactivatedData.id,
          supplement_id: reactivatedData.supplement_id,
          supplement_name: (reactivatedData.supplements as any)?.name_en || 'Unknown',
          custom_dosage_val: reactivatedData.custom_dosage_val,
          schedule_block: reactivatedData.schedule_block,
          unit: (reactivatedData.supplements as any)?.unit || null,
          dosing_base_val: (reactivatedData.supplements as any)?.dosing_base_val || null,
          dosing_max_val: (reactivatedData.supplements as any)?.dosing_max_val || null,
        }

        setStackItems(prev => {
          const filtered = prev.filter(item => item.id !== reactivatedItem.id)
          return [...filtered, reactivatedItem]
        })

        // Update timeline blocks when stack changes
        if (userId) {
          generateTimelineFromStack(userId).catch(err => {
            console.error('Error updating timeline after reactivating stack item:', err)
          })
        }

        return { data: reactivatedItem, error: null }
      }

      // Check if there's an active row (shouldn't happen, but just in case)
      if (existingInactive && existingInactive.is_active) {
        return { error: 'This supplement is already in your stack for this time' }
      }

      // No existing row, create new one
      const { data, error: insertError } = await supabase
        .from('user_stacks')
        .insert({
          user_id: userId,
          supplement_id: supplementId,
          schedule_block: scheduleBlock,
          custom_dosage_val: customDosage || null,
        })
        .select(`
          id,
          supplement_id,
          custom_dosage_val,
          schedule_block,
          supplements (
            name_en,
            dosing_base_val,
            dosing_max_val,
            unit
          )
        `)
        .single()

      if (insertError) {
        // If duplicate, return error
        if (insertError.code === '23505') {
          return { error: 'This supplement is already in your stack for this time' }
        }
        throw insertError
      }

      const newItem: StackItem = {
        id: data.id,
        supplement_id: data.supplement_id,
        supplement_name: (data.supplements as any)?.name_en || 'Unknown',
        custom_dosage_val: data.custom_dosage_val,
        schedule_block: data.schedule_block,
        unit: (data.supplements as any)?.unit || null,
        dosing_base_val: (data.supplements as any)?.dosing_base_val || null,
        dosing_max_val: (data.supplements as any)?.dosing_max_val || null,
      }

      setStackItems(prev => [...prev, newItem])
      
      // Update timeline blocks when stack changes
      if (userId) {
        generateTimelineFromStack(userId).catch(err => {
          console.error('Error updating timeline after adding to stack:', err)
        })
      }
      
      return { data: newItem, error: null }
    } catch (err) {
      console.error('Error adding to stack:', err)
      return { error: err instanceof Error ? err.message : 'Failed to add to stack' }
    }
  }

  const removeFromStack = async (stackItemId: number) => {
    if (!userId) return { error: 'Not authenticated' }

    try {
      const { error: deleteError } = await supabase
        .from('user_stacks')
        .update({ is_active: false })
        .eq('id', stackItemId)
        .eq('user_id', userId)

      if (deleteError) throw deleteError

      setStackItems(prev => prev.filter(item => item.id !== stackItemId))
      
      // Update timeline blocks when stack changes
      if (userId) {
        generateTimelineFromStack(userId).catch(err => {
          console.error('Error updating timeline after removing from stack:', err)
        })
      }
      
      return { error: null }
    } catch (err) {
      console.error('Error removing from stack:', err)
      return { error: err instanceof Error ? err.message : 'Failed to remove from stack' }
    }
  }

  const updateStackItem = async (stackItemId: number, updates: { schedule_block?: string; custom_dosage_val?: number }) => {
    if (!userId) return { error: 'Not authenticated' }

    try {
      const { data, error: updateError } = await supabase
        .from('user_stacks')
        .update(updates)
        .eq('id', stackItemId)
        .eq('user_id', userId)
        .select(`
          id,
          supplement_id,
          custom_dosage_val,
          schedule_block,
          supplements (
            name_en,
            dosing_base_val,
            dosing_max_val,
            unit
          )
        `)
        .single()

      if (updateError) throw updateError

      const updatedItem: StackItem = {
        id: data.id,
        supplement_id: data.supplement_id,
        supplement_name: (data.supplements as any)?.name_en || 'Unknown',
        custom_dosage_val: data.custom_dosage_val,
        schedule_block: data.schedule_block,
        unit: (data.supplements as any)?.unit || null,
        dosing_base_val: (data.supplements as any)?.dosing_base_val || null,
        dosing_max_val: (data.supplements as any)?.dosing_max_val || null,
      }

      setStackItems(prev => prev.map(item => item.id === stackItemId ? updatedItem : item))
      
      // Update timeline blocks when stack changes
      if (userId) {
        generateTimelineFromStack(userId).catch(err => {
          console.error('Error updating timeline after updating stack item:', err)
        })
      }
      
      return { data: updatedItem, error: null }
    } catch (err) {
      console.error('Error updating stack item:', err)
      return { error: err instanceof Error ? err.message : 'Failed to update stack item' }
    }
  }

  return {
    stackItems,
    loading,
    error,
    addToStack,
    removeFromStack,
    updateStackItem,
  }
}
