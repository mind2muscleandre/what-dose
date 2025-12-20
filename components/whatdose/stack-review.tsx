"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useRouter } from "next/navigation"
import { Check, ChevronRight, ArrowLeft, ArrowRight } from "lucide-react"
import { supabase } from "@/lib/supabase"
import { useTranslation, type Language } from "@/lib/translations"
import type { StackItem } from "@/hooks/use-user-stack"

interface StackReviewProps {
  userId: string
  onComplete: () => void
}

interface SupplementInfo {
  id: number
  name_en: string
  name_sv?: string
  dosing_base_val: number | null
  dosing_max_val: number | null
  unit: string | null
  dosing_notes?: string | null
  bioavailability_notes?: string | null
  category_ids?: number[] | null
  research_status?: string | null
  custom_dosage_val?: number | null
  schedule_block: string
  stack_item_id: number
  whySelected?: string
  benefits?: string[]
  alternativeDoses?: { label: string; value: number; description: string }[]
}

export function StackReview({ userId, onComplete }: StackReviewProps) {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [supplements, setSupplements] = useState<SupplementInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [userGoals, setUserGoals] = useState<string[]>([])
  const [userSubcategories, setUserSubcategories] = useState<Record<string, string[]>>({})
  const [userWeight, setUserWeight] = useState<number | null>(null)
  const [userGender, setUserGender] = useState<string | null>(null)
  const [basicHealthSupplements, setBasicHealthSupplements] = useState<Set<string>>(new Set())

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language
    if (saved) setLanguage(saved)
    
    // Load basic health stack supplements
    const loadBasicHealthSupplements = async () => {
      const { basicHealthStack } = await import('@/lib/predefined-stacks')
      const supplementNames = new Set<string>()
      basicHealthStack.supplements.forEach(supp => {
        supplementNames.add(supp.supplementName.toLowerCase())
        supp.alternatives?.forEach(alt => supplementNames.add(alt.toLowerCase()))
      })
      setBasicHealthSupplements(supplementNames)
    }
    loadBasicHealthSupplements()
  }, [])

  useEffect(() => {
    const loadData = async () => {
      // Load user profile first to get weight and gender
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('selected_goals, weight_kg, gender')
          .eq('id', userId)
          .single()

        if (error) throw error

        if (data?.selected_goals) {
          setUserGoals(data.selected_goals)
        }
        if (data?.weight_kg) {
          setUserWeight(data.weight_kg)
        }
        if (data?.gender) {
          setUserGender(data.gender)
        }
      } catch (error) {
        console.error('Error loading user profile:', error)
      }
      
      // Then load stack supplements (which needs weight for calculations)
      await loadStackSupplements()
    }
    
    loadData()
  }, [userId])

  const loadStackSupplements = async () => {
    try {
      // Fetch user stack with supplement details
      const { data: stackData, error: stackError } = await supabase
        .from('user_stacks')
        .select(`
          id,
          supplement_id,
          custom_dosage_val,
          schedule_block,
          supplements (
            id,
            name_en,
            name_sv,
            dosing_base_val,
            dosing_max_val,
            unit,
            dosing_notes,
            bioavailability_notes,
            category_ids,
            research_status
          )
        `)
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('created_at')

      if (stackError) throw stackError

      // Use already loaded weight and gender from useEffect, or fetch if not available
      let currentWeight = userWeight
      let currentGender = userGender
      if (!currentWeight || !currentGender) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('weight_kg, gender')
          .eq('id', userId)
          .single()
        if (profileData?.weight_kg) {
          currentWeight = profileData.weight_kg
          setUserWeight(currentWeight)
        }
        if (profileData?.gender) {
          currentGender = profileData.gender
          setUserGender(currentGender)
        }
      }
      
      // Get weight-based dosage info from predefined stacks
      const { getAllPredefinedStacks } = await import('@/lib/predefined-stacks')
      const allStacks = getAllPredefinedStacks()
      
      // Create a map of supplement names to dosagePerKg
      // Include multiple name variations for better matching
      const supplementDosageMap = new Map<string, number>()
      allStacks.forEach(stack => {
        stack.supplements.forEach(supp => {
          if (supp.dosagePerKg) {
            const baseName = supp.supplementName.toLowerCase()
            // Add base name
            supplementDosageMap.set(baseName, supp.dosagePerKg)
            // Add variations (with/without spaces, hyphens)
            supplementDosageMap.set(baseName.replace(/\s+/g, '-'), supp.dosagePerKg)
            supplementDosageMap.set(baseName.replace(/-/g, ' '), supp.dosagePerKg)
            supplementDosageMap.set(baseName.replace(/[-\s]/g, ''), supp.dosagePerKg)
            
            // Add alternatives with variations
            supp.alternatives?.forEach(alt => {
              const altLower = alt.toLowerCase()
              supplementDosageMap.set(altLower, supp.dosagePerKg!)
              supplementDosageMap.set(altLower.replace(/\s+/g, '-'), supp.dosagePerKg!)
              supplementDosageMap.set(altLower.replace(/-/g, ' '), supp.dosagePerKg!)
              supplementDosageMap.set(altLower.replace(/[-\s]/g, ''), supp.dosagePerKg!)
            })
          }
        })
      })

      // Get basic health stack supplements for checking
      const { basicHealthStack } = await import('@/lib/predefined-stacks')
      const basicHealthNames = new Set<string>()
      basicHealthStack.supplements.forEach(supp => {
        basicHealthNames.add(supp.supplementName.toLowerCase())
        supp.alternatives?.forEach(alt => basicHealthNames.add(alt.toLowerCase()))
      })
      
      // Transform to SupplementInfo with why/benefits
      const supplementInfos: SupplementInfo[] = (stackData || []).map((item: any) => {
        const supplement = item.supplements
        const baseDose = item.custom_dosage_val || supplement?.dosing_base_val || null
        const maxDose = supplement?.dosing_max_val || null
        
        // Only create dose options if we have valid dosing information
        const hasDosing = baseDose !== null && baseDose > 0 && supplement?.unit
        
        // Calculate weight-based dose if available
        let weightBasedDose: number | null = null
        const weightToUse = currentWeight || userWeight
        if (weightToUse && supplement?.name_en) {
          // Try multiple name variations for better matching
          const supplementNameLower = supplement.name_en.toLowerCase()
          const nameVariations = [
            supplementNameLower,
            supplementNameLower.replace(/\s+/g, '-'), // "Omega 3" -> "omega-3"
            supplementNameLower.replace(/-/g, ' '),   // "omega-3" -> "omega 3"
            supplementNameLower.replace(/[-\s]/g, ''), // "omega-3" -> "omega3"
          ]
          
          let dosagePerKg: number | undefined
          for (const nameVar of nameVariations) {
            dosagePerKg = supplementDosageMap.get(nameVar)
            if (dosagePerKg) break
          }
          
          if (dosagePerKg) {
            weightBasedDose = weightToUse * dosagePerKg
            // Round appropriately
            if (weightBasedDose >= 1000) {
              weightBasedDose = Math.round(weightBasedDose)
            } else {
              weightBasedDose = Math.round(weightBasedDose * 10) / 10
            }
          }
        }
        
        const alternativeDoses = hasDosing ? (() => {
          const doses: { label: string; value: number; description: string }[] = []
          
          // 1. Standard dose (most common/base)
          doses.push({
            label: t("standardDose"),
            value: baseDose,
            description: t("standardDoseDescription")
          })
          
          // 2. Weight-based dose (if available) OR low dose
          if (weightBasedDose && weightBasedDose !== baseDose) {
            doses.push({
              label: t("weightBasedDose"),
              value: weightBasedDose,
              description: t("weightBasedDoseDescription").replace('{weight}', (currentWeight || userWeight)?.toString() || '')
            })
          } else if (baseDose && maxDose && maxDose > baseDose) {
            // Low dose: 75% of base (if no weight-based available)
            const lowDose = Math.round(baseDose * 0.75 * 10) / 10
            if (lowDose > 0 && lowDose !== baseDose) {
              doses.push({
                label: t("lowDose"),
                value: lowDose,
                description: t("lowDoseDescription")
              })
            }
          }
          
          // 3. Max dose (highest)
          if (maxDose && maxDose > baseDose) {
            doses.push({
              label: t("maxDose"),
              value: maxDose,
              description: t("maxDoseDescription")
            })
          } else if (baseDose && !maxDose) {
            // High dose: 1.5x base (if no max available)
            const highDose = Math.round(baseDose * 1.5 * 10) / 10
            if (highDose !== baseDose) {
              doses.push({
                label: t("highDose"),
                value: highDose,
                description: t("highDoseDescription")
              })
            }
          }
          
          // Ensure we have exactly 3 options if possible (but allow 4 for Creatine with cognitive dose)
          if (doses.length === 1 && baseDose) {
            // Add low and high if we only have standard
            const lowDose = Math.round(baseDose * 0.75 * 10) / 10
            const highDose = Math.round(baseDose * 1.5 * 10) / 10
            if (lowDose > 0 && lowDose !== baseDose) {
              doses.push({
                label: t("lowDose"),
                value: lowDose,
                description: t("lowDoseDescription")
              })
            }
            if (highDose !== baseDose) {
              doses.push({
                label: t("highDose"),
                value: highDose,
                description: t("highDoseDescription")
              })
            }
          }
          
          // For Creatine, we'll add cognitive dose separately, so allow up to 3 here
          // (cognitive dose will be added after, making it 4 total)
          return doses.length > 0 ? doses.slice(0, 3) : undefined
        })() : undefined

        // Check if this supplement is part of Basic Health Stack
        const supplementNameLower = (supplement?.name_en || '').toLowerCase()
        const isBasicHealth = basicHealthNames.has(supplementNameLower)
        
        // Special handling for Creatine - add cognitive dose option (20g)
        let creatineCognitiveDose: { label: string; value: number; description: string } | null = null
        if (supplementNameLower.includes('creatine') && hasDosing && supplement?.unit) {
          // Add 20g option for cognitive benefits
          // Handle unit conversion: if baseDose is 5000 and unit is "g", it's likely stored in mg
          const unitLower = supplement.unit.toLowerCase()
          let cognitiveDoseValue: number
          
          if (unitLower === 'g' && baseDose && baseDose >= 1000) {
            // If stored as mg (5000mg = 5g), then 20g = 20000
            cognitiveDoseValue = 20000
          } else if (unitLower === 'mg') {
            // If unit is mg, 20g = 20000mg
            cognitiveDoseValue = 20000
          } else {
            // If unit is g and value is reasonable (< 1000), use 20g directly
            cognitiveDoseValue = 20
          }
          
          creatineCognitiveDose = {
            label: t("cognitiveDose"),
            value: cognitiveDoseValue,
            description: t("cognitiveDoseCreatineDescription")
          }
        }
        
        // Generate why selected and benefits based on supplement name, goals, and categories
        // Use currentGender from loadStackSupplements scope, fallback to userGender state
        const genderToUse = currentGender || userGender
        const { whySelected, benefits } = getSupplementInfo(
          supplement?.name_en || '',
          supplement?.category_ids || [],
          userGoals,
          supplement?.dosing_notes || null,
          supplement?.bioavailability_notes || null,
          isBasicHealth,
          genderToUse
        )
        
        // Add Creatine cognitive dose option if applicable
        if (creatineCognitiveDose && alternativeDoses) {
          alternativeDoses.push(creatineCognitiveDose)
        }

        return {
          id: supplement?.id,
          name_en: supplement?.name_en || 'Unknown',
          name_sv: supplement?.name_sv,
          dosing_base_val: supplement?.dosing_base_val,
          dosing_max_val: supplement?.dosing_max_val,
          unit: supplement?.unit,
          dosing_notes: supplement?.dosing_notes,
          bioavailability_notes: supplement?.bioavailability_notes,
          category_ids: supplement?.category_ids,
          research_status: supplement?.research_status,
          custom_dosage_val: item.custom_dosage_val,
          schedule_block: item.schedule_block,
          stack_item_id: item.id,
          whySelected,
          benefits,
          alternativeDoses
        }
      })

      setSupplements(supplementInfos)
    } catch (error) {
      console.error('Error loading stack supplements:', error)
    } finally {
      setLoading(false)
    }
  }

  // Get background color based on primary category
  const getCategoryBackground = (categoryIds: number[] | null | undefined): string => {
    if (!categoryIds || categoryIds.length === 0) {
      return 'from-slate-900 via-purple-900 to-slate-900' // Default purple
    }
    
    // Use the first category as primary
    const primaryCategory = categoryIds[0]
    
    const categoryColors: Record<number, string> = {
      1: 'from-teal-900 via-emerald-900 to-teal-900', // Health - Teal/Green
      2: 'from-red-900 via-orange-900 to-red-900', // Muscle - Red/Orange
      3: 'from-orange-900 via-amber-900 to-orange-900', // Performance - Orange/Yellow
      4: 'from-purple-900 via-indigo-900 to-purple-900', // Focus - Purple
      5: 'from-blue-900 via-cyan-900 to-blue-900', // Stress - Blue
      6: 'from-yellow-900 via-amber-900 to-yellow-900', // Metabolic - Yellow
      7: 'from-indigo-900 via-blue-900 to-indigo-900', // Sleep - Dark Blue
      8: 'from-pink-900 via-rose-900 to-pink-900', // Anti-Aging - Pink
      9: 'from-green-900 via-emerald-900 to-green-900', // Joints - Green
    }
    
    return categoryColors[primaryCategory] || 'from-slate-900 via-purple-900 to-slate-900'
  }

  const getSupplementInfo = (
    name: string,
    categoryIds: number[],
    goals: string[],
    dosingNotes: string | null,
    bioavailabilityNotes: string | null,
    isBasicHealth: boolean = false,
    userGender: string | null = null
  ): {
    whySelected: string
    benefits: string[]
    alternativeDoses?: { label: string; value: number; description: string }[]
  } => {
    const normalizedName = name.toLowerCase()
    
    // Map category IDs to goal names
    const categoryToGoalMap: Record<number, string> = {
      1: 'health',
      2: 'fitness', // Muscle
      3: 'fitness', // Performance
      4: 'cognitive', // Focus
      5: 'cognitive', // Stress
      6: 'longevity', // Metabolic
      7: 'sleep',
      8: 'longevity', // Anti-Aging
      9: 'fitness', // Joints/Recovery
    }
    
    // Find which goals match this supplement's categories
    const matchingGoals = categoryIds
      .map(catId => categoryToGoalMap[catId])
      .filter((goal, index, self) => goal && self.indexOf(goal) === index)
      .filter(goal => goals.includes(goal))
    
    // Get goal display names
    const goalNames = matchingGoals.map(goal => {
      const goalMap: Record<string, string> = {
        fitness: t("fitnessPerformance"),
        cognitive: t("cognitiveFocus"),
        longevity: t("longevity"),
        sleep: t("sleep"),
        health: t("health"),
      }
      return goalMap[goal] || goal
    })
    
    // If no matching goals, try to infer from categories
    let goalText = goalNames.length > 0 
      ? goalNames.join(language === 'sv' ? ' och ' : ' and ')
      : ''
    
    if (!goalText && categoryIds.length > 0) {
      // Infer goals from categories
      const inferredGoals: string[] = []
      if (categoryIds.includes(2) || categoryIds.includes(3)) inferredGoals.push(t("fitnessPerformance"))
      if (categoryIds.includes(4) || categoryIds.includes(5)) inferredGoals.push(t("cognitiveFocus"))
      if (categoryIds.includes(8) || categoryIds.includes(6)) inferredGoals.push(t("longevity"))
      if (categoryIds.includes(7)) inferredGoals.push(t("sleep"))
      goalText = inferredGoals.length > 0 
        ? inferredGoals.join(language === 'sv' ? ' och ' : ' and ')
        : t("yourGoals")
    } else if (!goalText) {
      goalText = t("yourGoals")
    }
    
    // Creatine
    if (normalizedName.includes('creatine')) {
      const whyText = goals.includes('fitness')
        ? t("whyCreatineForFitness").replace('{goals}', goalText)
        : t("whyCreatine")
      return {
        whySelected: whyText,
        benefits: [t("benefitCreatine1"), t("benefitCreatine2"), t("benefitCreatine3")],
      }
    }
    
    // EAA / Essential Amino Acids
    if (normalizedName.includes('eaa') || normalizedName.includes('essential amino')) {
      const whyText = goals.includes('fitness')
        ? t("whyEAAForFitness").replace('{goals}', goalText)
        : t("whyEAA")
      return {
        whySelected: whyText,
        benefits: [t("benefitEAA1"), t("benefitEAA2"), t("benefitEAA3")],
      }
    }
    
    // Caffeine
    if (normalizedName.includes('caffeine')) {
      const whyText = goals.includes('cognitive') || goals.includes('fitness')
        ? t("whyCaffeineForGoals").replace('{goals}', goalText)
        : t("whyCaffeine")
      return {
        whySelected: whyText,
        benefits: [t("benefitCaffeine1"), t("benefitCaffeine2"), t("benefitCaffeine3")],
      }
    }
    
    // BCAA
    if (normalizedName.includes('bcaa')) {
      const whyText = goals.includes('fitness')
        ? t("whyBCAAForFitness").replace('{goals}', goalText)
        : t("whyBCAA")
      return {
        whySelected: whyText,
        benefits: [t("benefitBCAA1"), t("benefitBCAA2")],
      }
    }
    
    // ALCAR
    if (normalizedName.includes('alcar') || normalizedName.includes('acetyl-l-carnitine')) {
      const whyText = goals.includes('cognitive')
        ? t("whyALCARForCognitive").replace('{goals}', goalText)
        : t("whyALCAR")
      return {
        whySelected: whyText,
        benefits: [t("benefitALCAR1"), t("benefitALCAR2")],
      }
    }
    
    // Bacopa
    if (normalizedName.includes('bacopa')) {
      const whyText = goals.includes('cognitive')
        ? t("whyBacopaForCognitive").replace('{goals}', goalText)
        : t("whyBacopa")
      return {
        whySelected: whyText,
        benefits: [t("benefitBacopa1"), t("benefitBacopa2")],
      }
    }
    
    // 7,8-Dihydroxyflavone
    if (normalizedName.includes('7,8-dihydroxyflavone') || normalizedName.includes('7,8-dhf')) {
      const whyText = goals.includes('cognitive')
        ? t("whyDHFForCognitive").replace('{goals}', goalText)
        : t("whyDHF")
      return {
        whySelected: whyText,
        benefits: [t("benefitDHF1"), t("benefitDHF2"), t("benefitDHF3")],
      }
    }
    
    // Generic but personalized based on goals and categories
    const categoryNames = categoryIds.map(catId => {
      const catMap: Record<number, string> = {
        1: t("categoryHealth"),
        2: t("categoryMuscle"),
        3: t("categoryPerformance"),
        4: t("categoryFocus"),
        5: t("categoryStress"),
        6: t("categoryMetabolic"),
        7: t("categorySleep"),
        8: t("categoryAntiAging"),
        9: t("categoryJoints"),
      }
      return catMap[catId] || ''
    }).filter(Boolean)
    
    let whyText = ''
    
    // Add Basic Health Stack information if applicable
    const basicHealthText = isBasicHealth 
      ? ` ${t("whyBasicHealthStack")}` 
      : ''
    
    if (goalNames.length > 0) {
      whyText = t("whySelectedForGoals")
        .replace(/{goals}/g, goalText)
        .replace(/{name}/g, name) + basicHealthText
    } else if (categoryNames.length > 0) {
      whyText = t("whySelectedForCategories")
        .replace(/{categories}/g, categoryNames.join(language === 'sv' ? ', ' : ', '))
        .replace(/{name}/g, name) + basicHealthText
    } else {
      whyText = t("whyDefaultGeneric").replace(/{name}/g, name) + basicHealthText
    }
    
    // Build benefits from dosing notes and bioavailability if available
    // Filter out gender-specific benefits
    const benefits: string[] = []
    
    // Helper function to check if text is gender-specific and should be filtered
    const shouldFilterGenderSpecific = (text: string, gender: string | null): boolean => {
      if (!gender || !text) return false
      const lowerText = text.toLowerCase()
      const lowerGender = gender.toLowerCase()
      
      // Check for female-specific terms
      const femaleTerms = ['menstruerande', 'menstruating', 'kvinnor', 'women', 'female', 'pregnant', 'gravid', 'replaces loss', 'ersätter förlust']
      const maleTerms = ['män', 'men', 'male', 'testosterone', 'testosteron']
      
      if (lowerGender === 'female' || lowerGender === 'kvinna') {
        // If user is female, filter out male-specific terms
        return maleTerms.some(term => lowerText.includes(term))
      } else if (lowerGender === 'male' || lowerGender === 'man') {
        // If user is male, filter out female-specific terms
        return femaleTerms.some(term => lowerText.includes(term))
      }
      
      return false
    }
    
    // Add dosing notes and bioavailability notes as benefits
    if (dosingNotes && !shouldFilterGenderSpecific(dosingNotes, userGender)) {
      benefits.push(dosingNotes)
    }
    if (bioavailabilityNotes && !shouldFilterGenderSpecific(bioavailabilityNotes, userGender)) {
      benefits.push(bioavailabilityNotes)
    }
    
    // Ensure we have at least 2-3 benefits for all supplements (like Creatine)
    // If we have notes, use them. Otherwise, add generic benefits based on categories
    if (benefits.length === 0) {
      // Generate category-based benefits
      const categoryBenefits: string[] = []
      if (categoryIds.includes(1)) categoryBenefits.push(t("benefitHealth1"))
      if (categoryIds.includes(2)) categoryBenefits.push(t("benefitMuscle1"))
      if (categoryIds.includes(3)) categoryBenefits.push(t("benefitPerformance1"))
      if (categoryIds.includes(4)) categoryBenefits.push(t("benefitFocus1"))
      if (categoryIds.includes(5)) categoryBenefits.push(t("benefitStress1"))
      if (categoryIds.includes(6)) categoryBenefits.push(t("benefitMetabolic1"))
      if (categoryIds.includes(7)) categoryBenefits.push(t("benefitSleep1"))
      if (categoryIds.includes(8)) categoryBenefits.push(t("benefitAntiAging1"))
      if (categoryIds.includes(9)) categoryBenefits.push(t("benefitJoints1"))
      
      // Use category-specific benefits if available, otherwise use defaults
      if (categoryBenefits.length > 0) {
        benefits.push(...categoryBenefits.slice(0, 3))
      } else {
        benefits.push(t("benefitDefault1"), t("benefitDefault2"), t("benefitDefault3"))
      }
    } else if (benefits.length < 2) {
      // If we only have 1 benefit, add a default one
      benefits.push(t("benefitDefault1"))
    }
    
    // Ensure we have at least 2 benefits, max 4 (like Creatine)
    if (benefits.length < 2) {
      benefits.push(t("benefitDefault2"))
    }
    
    return {
      whySelected: whyText,
      benefits: benefits.slice(0, 4), // Limit to 4 benefits
    }
  }

  const handleDoseChange = async (stackItemId: number, newDose: number) => {
    setUpdating(true)
    try {
      const { error } = await supabase
        .from('user_stacks')
        .update({ custom_dosage_val: newDose })
        .eq('id', stackItemId)

      if (error) throw error

      // Update local state
      setSupplements(prev => prev.map(s => 
        s.stack_item_id === stackItemId 
          ? { ...s, custom_dosage_val: newDose }
          : s
      ))
    } catch (error) {
      console.error('Error updating dose:', error)
    } finally {
      setUpdating(false)
    }
  }

  const handleNext = () => {
    if (currentIndex < supplements.length - 1) {
      setCurrentIndex(currentIndex + 1)
    } else {
      onComplete()
    }
  }

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    )
  }

  if (supplements.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-white">No supplements found</div>
      </div>
    )
  }
  
  // Get background for loading/empty states based on first supplement if available
  const defaultBackground = supplements.length > 0 
    ? getCategoryBackground(supplements[0]?.category_ids)
    : 'from-slate-900 via-purple-900 to-slate-900'

  const currentSupplement = supplements[currentIndex]
  const isLast = currentIndex === supplements.length - 1

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 p-6">
        <div className="mx-auto max-w-2xl">
          <h1 className="text-2xl font-bold text-white">{t("hereIsYourStack")}</h1>
          <p className="mt-2 text-sm text-gray-400">
            {t("stackReviewDescription")} ({currentIndex + 1} / {supplements.length})
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="border-b border-white/10 px-6 py-4">
        <div className="mx-auto max-w-2xl">
          <div className="h-2 w-full rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-purple-500"
              initial={{ width: 0 }}
              animate={{ width: `${((currentIndex + 1) / supplements.length) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>
      </div>

      {/* Supplement Card */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="mx-auto max-w-2xl">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm"
            >
              {/* Supplement Name */}
              <h2 className="text-3xl font-bold text-white">{currentSupplement.name_en}</h2>
              {currentSupplement.name_sv && (
                <p className="mt-1 text-lg text-gray-400">{currentSupplement.name_sv}</p>
              )}

              {/* Schedule Block */}
              <div className="mt-4 inline-block rounded-full bg-purple-500/20 px-4 py-1 text-sm text-purple-300">
                {currentSupplement.schedule_block}
              </div>

              {/* Why Selected */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white">{t("whySelected")}</h3>
                <p className="mt-2 text-gray-300">{currentSupplement.whySelected}</p>
              </div>

              {/* Benefits */}
              <div className="mt-6">
                <h3 className="text-lg font-semibold text-white">{t("benefits")}</h3>
                <ul className="mt-2 space-y-2">
                  {currentSupplement.benefits?.map((benefit, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-gray-300">
                      <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-purple-400" />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Dosage Options - Only show if we have dosing information */}
              {currentSupplement.alternativeDoses && currentSupplement.alternativeDoses.length > 0 ? (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white">{t("dosageOptions")}</h3>
                  <p className="mt-2 text-sm text-gray-400">{t("dosageOptionsDescription")}</p>
                  
                  <div className="mt-4 space-y-3">
                    {currentSupplement.alternativeDoses.map((option, idx) => {
                    const isSelected = currentSupplement.custom_dosage_val === option.value ||
                      (!currentSupplement.custom_dosage_val && idx === 0)
                    
                    return (
                      <motion.button
                        key={idx}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleDoseChange(currentSupplement.stack_item_id, option.value)}
                        disabled={updating}
                        className={`w-full rounded-xl border p-4 text-left transition-all ${
                          isSelected
                            ? 'border-purple-500 bg-purple-500/20'
                            : 'border-white/10 bg-white/5 hover:bg-white/10'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-semibold text-white">{option.label}</div>
                            <div className="mt-1 text-sm text-gray-400">{option.description}</div>
                            <div className="mt-2 text-lg font-bold text-purple-400">
                              {(() => {
                                // Format dosage correctly based on unit
                                const value = option.value
                                const unit = currentSupplement.unit || ''
                                const unitLower = unit.toLowerCase()
                                
                                // Fix common unit mismatches
                                // If value is >= 1000 and unit is "g", it's likely stored in mg
                                if (unitLower === 'g' && value >= 1000) {
                                  // Convert mg to g (e.g., 5000 -> 5g)
                                  const grams = value / 1000
                                  return grams % 1 === 0 ? `${grams}${unit}` : `${grams.toFixed(1)}${unit}`
                                }
                                // If value is < 1 and unit is "mg", it's likely stored in g
                                if (unitLower === 'mg' && value < 1 && value > 0) {
                                  // Convert g to mg (e.g., 0.5 -> 500mg)
                                  return `${Math.round(value * 1000)}${unit}`
                                }
                                
                                // For values that are whole numbers, show without decimals
                                if (value % 1 === 0) {
                                  return `${value}${unit}`
                                }
                                
                                // For decimal values, show one decimal place
                                return `${value.toFixed(1)}${unit}`
                              })()}
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="h-6 w-6 text-purple-400" />
                          )}
                        </div>
                      </motion.button>
                    )
                    })}
                  </div>
                </div>
              ) : (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-white">{t("dosageOptions")}</h3>
                  <p className="mt-2 text-sm text-gray-400">{t("noDosingInfo")}</p>
                  {currentSupplement.dosing_notes && (
                    <p className="mt-2 text-sm text-gray-300 italic">{currentSupplement.dosing_notes}</p>
                  )}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation */}
      <div className="border-t border-white/10 p-6">
        <div className="mx-auto flex max-w-2xl items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-white transition-all hover:bg-white/10 disabled:opacity-50"
          >
            <ArrowLeft className="h-5 w-5" />
            {t("previous")}
          </button>

          <div className="flex gap-2">
            {supplements.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full transition-all ${
                  idx === currentIndex ? 'bg-purple-500' : 'bg-white/20'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNext}
            className="flex items-center gap-2 rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white transition-all hover:bg-purple-700"
          >
            {isLast ? t("finish") : t("next")}
            {!isLast && <ArrowRight className="h-5 w-5" />}
          </button>
        </div>
      </div>
    </div>
  )
}
