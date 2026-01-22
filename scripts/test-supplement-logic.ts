/**
 * Test script for Supplement Logic System
 * Run with: npx tsx scripts/test-supplement-logic.ts
 */

import { supabase } from '../lib/supabase'
import { calculateDosage, calculateDosageFromSupplement } from '../lib/dosage-calculator'
import { buildUserStack } from '../lib/stack-builder'

async function testDosageCalculators() {
  console.log('🧪 Testing Dosage Calculators\n')

  // Test 1: Linear Weight Algorithm
  console.log('1. Testing Linear Weight Algorithm:')
  const linearResult1 = calculateDosage({
    userWeight: 50,
    gender: null,
    baseDose: 2000,
    algorithm: 'linear_weight',
    safeMin: 1000,
    safeMax: 4000,
    unit: 'IU'
  })
  console.log(`   User: 50kg → Expected: ~1333 IU, Got: ${linearResult1.calculatedDose} ${linearResult1.unit}`)

  const linearResult2 = calculateDosage({
    userWeight: 100,
    gender: null,
    baseDose: 2000,
    algorithm: 'linear_weight',
    safeMin: 1000,
    safeMax: 4000,
    unit: 'IU'
  })
  console.log(`   User: 100kg → Expected: ~2667 IU, Got: ${linearResult2.calculatedDose} ${linearResult2.unit}`)

  const linearResult3 = calculateDosage({
    userWeight: null,
    gender: null,
    baseDose: 2000,
    algorithm: 'linear_weight',
    safeMin: 1000,
    safeMax: 4000,
    unit: 'IU'
  })
  console.log(`   User: No weight → Expected: 2000 IU (fallback), Got: ${linearResult3.calculatedDose} ${linearResult3.unit}`)

  // Test 2: Gender Split Algorithm
  console.log('\n2. Testing Gender Split Algorithm:')
  const genderResult1 = calculateDosage({
    userWeight: null,
    gender: 'male',
    baseDose: 400,
    algorithm: 'gender_split',
    genderMale: 420,
    genderFemale: 320,
    unit: 'mg'
  })
  console.log(`   Male → Expected: 420mg, Got: ${genderResult1.calculatedDose} ${genderResult1.unit}`)

  const genderResult2 = calculateDosage({
    userWeight: null,
    gender: 'female',
    baseDose: 400,
    algorithm: 'gender_split',
    genderMale: 420,
    genderFemale: 320,
    unit: 'mg'
  })
  console.log(`   Female → Expected: 320mg, Got: ${genderResult2.calculatedDose} ${genderResult2.unit}`)

  // Test 3: Fixed Algorithm
  console.log('\n3. Testing Fixed Algorithm:')
  const fixedResult = calculateDosage({
    userWeight: null,
    gender: null,
    baseDose: 500,
    algorithm: 'fixed',
    unit: 'mg'
  })
  console.log(`   Fixed → Expected: 500mg, Got: ${fixedResult.calculatedDose} ${fixedResult.unit}`)

  console.log('\n✅ Dosage Calculator Tests Complete\n')
}

async function testDatabaseSchema() {
  console.log('🔍 Verifying Database Schema\n')

  try {
    // Check if enum exists
    const { data: enumCheck } = await supabase.rpc('pg_type_exists', { type_name: 'scaling_algorithm_type' })
    console.log('   Enum check:', enumCheck ? '✅' : '❌')

    // Check columns in supplements table
    const { data: supplements, error } = await supabase
      .from('supplements')
      .select('id, name_en, scaling_algorithm, scaling_base_dose, i18n_key')
      .limit(5)

    if (error) {
      console.error('   ❌ Error fetching supplements:', error)
      return
    }

    console.log(`   ✅ Found ${supplements?.length || 0} supplements`)
    if (supplements && supplements.length > 0) {
      console.log('   Sample supplements:')
      supplements.forEach(s => {
        console.log(`      - ${s.name_en}: algorithm=${s.scaling_algorithm || 'null'}, i18n_key=${s.i18n_key || 'null'}`)
      })
    }

    // Check health_conditions in profiles
    const { data: profiles } = await supabase
      .from('profiles')
      .select('id, health_conditions')
      .limit(1)

    console.log(`   ✅ Profiles table accessible`)
    if (profiles && profiles.length > 0) {
      console.log(`   ✅ health_conditions column exists: ${profiles[0].health_conditions ? 'Yes' : 'No data'}`)
    }

    console.log('\n✅ Database Schema Verification Complete\n')
  } catch (err) {
    console.error('❌ Error verifying schema:', err)
  }
}

async function testStackBuilder() {
  console.log('🏗️  Testing Stack Builder\n')

  // Test profile
  const testProfile = {
    id: 'test-user-id',
    age: 30,
    weight_kg: 75,
    gender: 'male' as const,
    experience_level: 'intermediate',
    health_conditions: null,
    selected_goals: ['fitness']
  }

  try {
    const result = await buildUserStack(testProfile.id, testProfile)
    console.log(`   ✅ Stack built successfully`)
    console.log(`   Basic Health Stack: ${result.basicHealthStack.length} items`)
    console.log(`   Goal Stack: ${result.goalStack.length} items`)
    console.log(`   Errors: ${result.errors.length}`)
    console.log(`   Warnings: ${result.warnings.length}`)
    
    if (result.errors.length > 0) {
      console.log('   Errors:')
      result.errors.forEach(e => console.log(`      - ${e}`))
    }
    
    if (result.warnings.length > 0) {
      console.log('   Warnings:')
      result.warnings.forEach(w => console.log(`      - ${w}`))
    }

    console.log('\n✅ Stack Builder Test Complete\n')
  } catch (err) {
    console.error('❌ Error building stack:', err)
  }
}

async function main() {
  console.log('='.repeat(60))
  console.log('SUPPLEMENT LOGIC SYSTEM - TEST SUITE')
  console.log('='.repeat(60))
  console.log()

  await testDatabaseSchema()
  await testDosageCalculators()
  await testStackBuilder()

  console.log('='.repeat(60))
  console.log('ALL TESTS COMPLETE')
  console.log('='.repeat(60))
}

main().catch(console.error)
