/**
 * Script to remove BCAA from the database
 * This will:
 * 1. Find all BCAA supplements (exact and partial matches)
 * 2. Delete them from the supplements table
 * 3. Also remove any user_stacks entries that reference BCAA
 * 
 * Usage:
 *   npx tsx scripts/remove-bcaa.ts
 */

import { supabase } from "../lib/supabase"

async function removeBCAA() {
  console.log("🔍 Searching for BCAA supplements in database...\n")

  try {
    // Find all BCAA supplements (case-insensitive search)
    const { data: bcaaSupplements, error: searchError } = await supabase
      .from('supplements')
      .select('id, name_en, name_sv')
      .or('name_en.ilike.%BCAA%,name_sv.ilike.%BCAA%,name_en.ilike.%Branched Chain Amino%,name_sv.ilike.%Branched Chain Amino%')

    if (searchError) {
      console.error("❌ Error searching for BCAA:", searchError)
      return
    }

    if (!bcaaSupplements || bcaaSupplements.length === 0) {
      console.log("✅ No BCAA supplements found in database")
      return
    }

    console.log(`📊 Found ${bcaaSupplements.length} BCAA supplement(s):`)
    bcaaSupplements.forEach(s => {
      console.log(`   - ID: ${s.id}, Name: ${s.name_en}${s.name_sv ? ` (${s.name_sv})` : ''}`)
    })
    console.log()

    // Get all supplement IDs to delete
    const supplementIds = bcaaSupplements.map(s => s.id)

    // First, check if any user_stacks reference these supplements
    const { data: stackItems, error: stackError } = await supabase
      .from('user_stacks')
      .select('id, user_id, supplement_id')
      .in('supplement_id', supplementIds)

    if (stackError) {
      console.error("❌ Error checking user_stacks:", stackError)
      return
    }

    if (stackItems && stackItems.length > 0) {
      console.log(`⚠️  Found ${stackItems.length} user stack item(s) referencing BCAA supplements`)
      console.log("   These will be deleted along with the supplements\n")
    }

    // Confirm deletion
    console.log("⚠️  WARNING: This will permanently delete:")
    console.log(`   - ${bcaaSupplements.length} supplement(s) from the database`)
    if (stackItems && stackItems.length > 0) {
      console.log(`   - ${stackItems.length} user stack item(s)`)
    }
    console.log()
    console.log("Press Ctrl+C to cancel, or wait 5 seconds to proceed...")
    
    // Wait 5 seconds before proceeding
    await new Promise(resolve => setTimeout(resolve, 5000))

    // Delete user_stacks entries first (to avoid foreign key constraint issues)
    if (stackItems && stackItems.length > 0) {
      const { error: deleteStackError } = await supabase
        .from('user_stacks')
        .delete()
        .in('supplement_id', supplementIds)

      if (deleteStackError) {
        console.error("❌ Error deleting user_stacks:", deleteStackError)
        return
      }
      console.log(`✅ Deleted ${stackItems.length} user stack item(s)`)
    }

    // Delete supplements
    const { error: deleteError } = await supabase
      .from('supplements')
      .delete()
      .in('id', supplementIds)

    if (deleteError) {
      console.error("❌ Error deleting supplements:", deleteError)
      return
    }

    console.log(`✅ Successfully deleted ${bcaaSupplements.length} BCAA supplement(s) from the database`)
    console.log()
    console.log("Deleted supplements:")
    bcaaSupplements.forEach(s => {
      console.log(`   - ${s.name_en}${s.name_sv ? ` (${s.name_sv})` : ''}`)
    })
  } catch (error) {
    console.error("❌ Error:", error)
    process.exit(1)
  }
}

removeBCAA()
