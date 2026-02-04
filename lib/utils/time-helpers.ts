import type { TimelineBlock } from "@/lib/whatdose-data"

export type TimePeriod = 'morning' | 'afternoon' | 'evening'

/**
 * Get the current time period based on hour
 */
export function getTimeOfDay(): TimePeriod {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}

/**
 * Check if a task time is within the active window (±2 hours of current time)
 */
export function isTimeActive(taskTime: string, currentTime: Date): boolean {
  const [hour, minute] = taskTime.split(':').map(Number)
  const taskHour = hour + minute / 60
  const currentHour = currentTime.getHours() + currentTime.getMinutes() / 60
  
  // Active within ±2 hours of scheduled time
  return Math.abs(currentHour - taskHour) <= 2
}

/**
 * Check if a task time has passed (more than 2 hours ago)
 */
export function isTimePast(taskTime: string, currentTime: Date): boolean {
  const [hour] = taskTime.split(':').map(Number)
  const currentHour = currentTime.getHours()
  return currentHour > hour + 2
}

/**
 * Map a timeline block to a time period based on suggested_time or block_id
 */
export function mapBlockToTimePeriod(block: TimelineBlock): TimePeriod {
  // First try to determine from suggested_time
  if (block.suggested_time) {
    const [hour] = block.suggested_time.split(':').map(Number)
    if (hour < 12) return 'morning'
    if (hour < 18) return 'afternoon'
    return 'evening'
  }
  
  // Fallback to block_id patterns
  const blockId = block.block_id.toLowerCase()
  if (blockId.includes('morning') || blockId.includes('morgon')) {
    return 'morning'
  }
  if (blockId.includes('afternoon') || blockId.includes('lunch') || blockId.includes('pre_workout')) {
    return 'afternoon'
  }
  if (blockId.includes('evening') || blockId.includes('kväll') || blockId.includes('bedtime') || blockId.includes('night')) {
    return 'evening'
  }
  
  // Default to morning if unclear
  return 'morning'
}

/**
 * Get time period emoji
 */
export function getTimePeriodEmoji(period: TimePeriod): string {
  switch (period) {
    case 'morning':
      return '🌅'
    case 'afternoon':
      return '🌆'
    case 'evening':
      return '🌙'
  }
}

/**
 * Get time period label
 */
export function getTimePeriodLabel(period: TimePeriod): string {
  switch (period) {
    case 'morning':
      return 'Morning'
    case 'afternoon':
      return 'Afternoon'
    case 'evening':
      return 'Evening'
  }
}
