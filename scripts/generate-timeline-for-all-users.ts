/**
 * Script to generate timeline blocks for all users who have stacks
 * Run this to sync existing stacks with timeline blocks
 * 
 * Usage:
 *   npx tsx scripts/generate-timeline-for-all-users.ts
 */

import { supabase } from "../lib/supabase"
import { generateTimelineFromStack } from "../lib/generate-timeline-from-stack"

async function generateTimelineForAllUsers() {
  console.log("🔍 Finding all users with active stacks...\n")

  try {
    // Get all unique user_ids that have active stack items
    const { data: stackData, error: stackError } = await supabase
      .from('user_stacks')
      .select('user_id')
      .eq('is_active', true)

    if (stackError) {
      console.error("❌ Error fetching stacks:", stackError)
      return
    }

    if (!stackData || stackData.length === 0) {
      console.log("⚠️  No active stacks found")
      return
    }

    // Get unique user IDs
    const uniqueUserIds = Array.from(new Set(stackData.map(s => s.user_id)))
    console.log(`📊 Found ${uniqueUserIds.length} users with active stacks\n`)

    let successCount = 0
    let errorCount = 0

    // Generate timeline for each user
    for (const userId of uniqueUserIds) {
      console.log(`Processing user: ${userId}`)
      const { error } = await generateTimelineFromStack(userId)
      
      if (error) {
        console.error(`  ❌ Error for user ${userId}:`, error.message)
        errorCount++
      } else {
        console.log(`  ✅ Timeline generated successfully`)
        successCount++
      }
    }

    console.log(`\n✅ Complete!`)
    console.log(`   Success: ${successCount}`)
    console.log(`   Errors: ${errorCount}`)
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

generateTimelineForAllUsers()
