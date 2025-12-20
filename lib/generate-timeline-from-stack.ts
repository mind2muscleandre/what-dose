/**
 * Utility functions to generate timeline blocks and items from user_stacks
 * This ensures that supplements in the stack appear in "Today's Tasks" on the dashboard
 */

import { supabase } from "./supabase"

/**
 * Map schedule_block to timeline block configuration
 */
const scheduleBlockToTimelineConfig: Record<string, {
  blockId: string
  title: string
  subtitle?: string
  suggestedTime: string
  uiColorHex: string
  iconKey: string
  displayOrder: number
}> = {
  Morning: {
    blockId: "morning_routine",
    title: "Morning",
    subtitle: "Start your day right",
    suggestedTime: "08:00",
    uiColorHex: "#f59e0b", // Amber
    iconKey: "sun",
    displayOrder: 1,
  },
  Lunch: {
    blockId: "lunch",
    title: "Lunch",
    subtitle: "Midday boost",
    suggestedTime: "12:00",
    uiColorHex: "#10b981", // Emerald
    iconKey: "sun",
    displayOrder: 2,
  },
  "Pre-Workout": {
    blockId: "pre_workout",
    title: "Pre-Workout",
    subtitle: "Performance boost",
    suggestedTime: "17:00",
    uiColorHex: "#ef4444", // Red
    iconKey: "dumbbell",
    displayOrder: 3,
  },
  "Post-Workout": {
    blockId: "post_workout",
    title: "Post-Workout",
    subtitle: "Recovery",
    suggestedTime: "18:00",
    uiColorHex: "#8b5cf6", // Purple
    iconKey: "dumbbell",
    displayOrder: 4,
  },
  Dinner: {
    blockId: "dinner",
    title: "Dinner",
    subtitle: "Evening routine",
    suggestedTime: "19:00",
    uiColorHex: "#3b82f6", // Blue
    iconKey: "moon",
    displayOrder: 5,
  },
  Bedtime: {
    blockId: "bedtime",
    title: "Bedtime",
    subtitle: "Wind down",
    suggestedTime: "22:00",
    uiColorHex: "#6366f1", // Indigo
    iconKey: "moon",
    displayOrder: 6,
  },
}

/**
 * Generate timeline blocks and items from user_stacks
 * This creates timeline_blocks and timeline_items so supplements appear in "Today's Tasks"
 */
export async function generateTimelineFromStack(userId: string): Promise<{ error: Error | null }> {
  try {
    // Fetch all active stack items for the user
    const { data: stackItems, error: stackError } = await supabase
      .from('user_stacks')
      .select('id, supplement_id, schedule_block, custom_dosage_val')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('created_at')

    if (stackError) {
      console.error('Error fetching stack items:', stackError)
      return { error: stackError as Error }
    }

    if (!stackItems || stackItems.length === 0) {
      console.log('No stack items found, skipping timeline generation')
      return { error: null }
    }

    // Group stack items by schedule_block
    const itemsBySchedule: Record<string, typeof stackItems> = {}
    stackItems.forEach(item => {
      const schedule = item.schedule_block
      if (!itemsBySchedule[schedule]) {
        itemsBySchedule[schedule] = []
      }
      itemsBySchedule[schedule].push(item)
    })

    // Create or update timeline blocks for each schedule_block that has items
    const timelineBlockIds = new Map<string, number>() // Map block_id to timeline_blocks.id

    for (const [scheduleBlock, items] of Object.entries(itemsBySchedule)) {
      const config = scheduleBlockToTimelineConfig[scheduleBlock]
      if (!config) {
        console.warn(`No config found for schedule_block: ${scheduleBlock}`)
        continue
      }

      // Upsert timeline block
      const { data: blockData, error: blockError } = await supabase
        .from('timeline_blocks')
        .upsert({
          user_id: userId,
          block_id: config.blockId,
          title: config.title,
          subtitle: config.subtitle,
          suggested_time: config.suggestedTime,
          ui_color_hex: config.uiColorHex,
          icon_key: config.iconKey,
          display_order: config.displayOrder,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,block_id',
          ignoreDuplicates: false,
        })
        .select()
        .single()

      if (blockError) {
        console.error(`Error creating timeline block for ${scheduleBlock}:`, blockError)
        continue
      }

      if (blockData) {
        timelineBlockIds.set(config.blockId, blockData.id)
      }
    }

    // Delete old timeline items for blocks we're updating (to avoid duplicates)
    const blockIdsToUpdate = Array.from(timelineBlockIds.values())
    if (blockIdsToUpdate.length > 0) {
      await supabase
        .from('timeline_items')
        .delete()
        .in('block_id', blockIdsToUpdate)
    }

    // Create timeline items for each stack item
    const timelineItemsToInsert: any[] = []

    for (const [scheduleBlock, items] of Object.entries(itemsBySchedule)) {
      const config = scheduleBlockToTimelineConfig[scheduleBlock]
      if (!config) continue

      const timelineBlockId = timelineBlockIds.get(config.blockId)
      if (!timelineBlockId) continue

      items.forEach((stackItem, index) => {
        // Generate unique item_id: user_id + stack_item_id
        const itemId = `${userId}-${stackItem.id}`

        timelineItemsToInsert.push({
          block_id: timelineBlockId,
          stack_item_id: stackItem.id,
          item_id: itemId,
          display_order: index,
          notes: null,
          critical_instruction: null,
        })
      })
    }

    // Insert all timeline items
    if (timelineItemsToInsert.length > 0) {
      const { error: itemsError } = await supabase
        .from('timeline_items')
        .insert(timelineItemsToInsert)

      if (itemsError) {
        console.error('Error creating timeline items:', itemsError)
        return { error: itemsError as Error }
      }

      console.log(`Created ${timelineItemsToInsert.length} timeline items from ${stackItems.length} stack items`)
    }

    // Deactivate timeline blocks that no longer have items
    const activeBlockIds = Array.from(timelineBlockIds.keys())
    const { data: allUserBlocks } = await supabase
      .from('timeline_blocks')
      .select('id, block_id')
      .eq('user_id', userId)
      .eq('is_active', true)

    if (allUserBlocks) {
      const blocksToDeactivate = allUserBlocks.filter(
        block => !activeBlockIds.includes(block.block_id)
      )

      if (blocksToDeactivate.length > 0) {
        await supabase
          .from('timeline_blocks')
          .update({ is_active: false })
          .in('id', blocksToDeactivate.map(b => b.id))
      }
    }

    return { error: null }
  } catch (error) {
    console.error('Error generating timeline from stack:', error)
    return { error: error as Error }
  }
}
