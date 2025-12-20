"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Dumbbell, Brain, Heart, Moon, ArrowRight, ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { DNAProgress } from "./dna-progress"
import { useTranslation, type Language } from "@/lib/translations"
import { useAuth } from "@/contexts/auth-context"
import { supabase } from "@/lib/supabase"
import { getSupplementsForSubcategories } from "@/lib/subcategory-supplements"
import { generateTimelineFromStack } from "@/lib/generate-timeline-from-stack"
import { getSupplementPriority, isCommonSupplement } from "@/lib/common-supplements"
import { StackReview } from "./stack-review"
import { generateStackFromPredefined, getPredefinedStacksForGoals } from "@/lib/generate-stack-from-predefined"

const goals = [
  { 
    id: "fitness", 
    labelKey: "fitnessPerformance" as const, 
    icon: Dumbbell, 
    color: "bg-red-500/20 text-red-400",
    subcategories: [
      { id: "strength", labelKey: "fitnessPerformanceStrength" as const },
      { id: "hypertrophy", labelKey: "fitnessPerformanceHypertrophy" as const },
      { id: "endurance", labelKey: "fitnessPerformanceEndurance" as const },
      { id: "recovery", labelKey: "fitnessPerformanceRecovery" as const },
    ]
  },
  { 
    id: "cognitive", 
    labelKey: "cognitiveFocus" as const, 
    icon: Brain, 
    color: "bg-purple-500/20 text-purple-400",
    subcategories: [
      { id: "memory", labelKey: "cognitiveFocusMemory" as const },
      { id: "focus", labelKey: "cognitiveFocusFocus" as const },
      { id: "mood", labelKey: "cognitiveFocusMood" as const },
      { id: "productivity", labelKey: "cognitiveFocusProductivity" as const },
    ]
  },
  { 
    id: "longevity", 
    labelKey: "longevity" as const, 
    icon: Heart, 
    color: "bg-pink-500/20 text-pink-400",
    subcategories: [
      { id: "antiAging", labelKey: "longevityAntiAging" as const },
      { id: "healthspan", labelKey: "longevityHealthspan" as const },
      { id: "energy", labelKey: "longevityEnergy" as const },
      { id: "longevity", labelKey: "longevityLongevity" as const },
    ]
  },
  { 
    id: "sleep", 
    labelKey: "sleep" as const, 
    icon: Moon, 
    color: "bg-blue-500/20 text-blue-400",
    subcategories: [
      { id: "quality", labelKey: "sleepQuality" as const },
      { id: "duration", labelKey: "sleepDuration" as const },
      { id: "deepSleep", labelKey: "sleepDeepSleep" as const },
      { id: "fallingAsleep", labelKey: "sleepFallingAsleep" as const },
    ]
  },
]

export function Onboarding() {
  const router = useRouter()
  const { user } = useAuth()
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)
  const [isCreatingNewStack, setIsCreatingNewStack] = useState(false)
  const [useFullOnboarding, setUseFullOnboarding] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language
    if (saved) setLanguage(saved)
    
    // Check if creating new stack
    const params = new URLSearchParams(window.location.search)
    if (params.get("createNewStack") === "true") {
      setIsCreatingNewStack(true)
      // Check if user wants full onboarding
      if (params.get("fullOnboarding") === "true") {
        setUseFullOnboarding(true)
      }
    }
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (user === null) {
      router.push("/auth/login")
    }
  }, [user, router])

  const [step, setStep] = useState(0)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedGoals, setSelectedGoals] = useState<string[]>([])
  const [selectedSubcategories, setSelectedSubcategories] = useState<Record<string, string[]>>({})
  const [expandedGoal, setExpandedGoal] = useState<string | null>(null)
  const [biometrics, setBiometrics] = useState({ name: "", username: "", age: "", weight: "", gender: "" })
  const [experience, setExperience] = useState(1)
  const [showStackReview, setShowStackReview] = useState(false)
  const [includeBasicHealth, setIncludeBasicHealth] = useState(true) // Default to including basic health
  
  // For quick stack creation, skip biometrics and experience steps
  const isQuickStack = isCreatingNewStack && !useFullOnboarding
  const totalSteps = isQuickStack ? 1 : 3 // Only goal selection for quick stack

  const handleGoalToggle = (goalId: string) => {
    setSelectedGoals((prev) => {
      if (prev.includes(goalId)) {
        // Remove goal and its subcategories
        const newSubcategories = { ...selectedSubcategories }
        delete newSubcategories[goalId]
        setSelectedSubcategories(newSubcategories)
        return prev.filter((g) => g !== goalId)
      } else {
        // Add goal and expand it
        setExpandedGoal(goalId)
        return [...prev, goalId]
      }
    })
  }

  const handleSubcategoryToggle = (goalId: string, subcategoryId: string) => {
    setSelectedSubcategories((prev) => {
      const current = prev[goalId] || []
      if (current.includes(subcategoryId)) {
        return { ...prev, [goalId]: current.filter((s) => s !== subcategoryId) }
      } else {
        return { ...prev, [goalId]: [...current, subcategoryId] }
      }
    })
  }

  const createInitialStack = async (userId: string, goals: string[], subcategories: Record<string, string[]>): Promise<boolean> => {
    try {
      // Get supplement recommendations based on subcategories
      const { supplementNames, categoryIds: subcategoryCategoryIds } = getSupplementsForSubcategories(subcategories)

      // Map goals to category IDs: 1=Health, 2=Muscle, 3=Performance, 4=Focus, 5=Stress, 6=Metabolic, 7=Sleep, 8=Anti-Aging, 9=Joints
      // Note: "muscle" is kept for backward compatibility with existing data
      const goalToCategoryMap: Record<string, number[]> = {
        fitness: [2, 3], // Muscle + Performance (covers both gym and cardio)
        muscle: [2, 3], // Backward compatibility - maps to same as fitness
        cognitive: [4],
        longevity: [8],
        sleep: [7],
      }

      const categoryIds: number[] = []
      
      // Only add base health (category 1) if user has multiple goals or no specific fitness goals
      // If user only has fitness goals, prioritize goal-specific supplements
      const hasOnlyFitness = goals.length === 1 && goals.includes('fitness')
      if (!hasOnlyFitness) {
        categoryIds.push(1) // Add base health for users with multiple goals or non-fitness goals
      }
      
      // Add categories based on selected goals
      goals.forEach(goal => {
        const categoryIdsForGoal = goalToCategoryMap[goal]
        if (categoryIdsForGoal) {
          categoryIdsForGoal.forEach(catId => {
            if (!categoryIds.includes(catId)) {
              categoryIds.push(catId)
            }
          })
        }
      })

      // Add category IDs from subcategories
      subcategoryCategoryIds.forEach(catId => {
        if (!categoryIds.includes(catId)) {
          categoryIds.push(catId)
        }
      })

      // Fetch all parent supplements
      const { data: allSupplements, error: supplementsError } = await supabase
        .from('supplements')
        .select('id, name_en, is_base_health, category_ids, is_parent')
        .eq('is_parent', true)
        .limit(200) // Get more to filter from

      if (supplementsError) {
        console.error('Error fetching supplements:', supplementsError)
        return false
      }

      // First, try to find supplements by name (from subcategory mapping)
      const subcategorySupplements: typeof allSupplements = []
      if (supplementNames.length > 0) {
        supplementNames.forEach(name => {
          // Try exact match first
          const exactMatch = allSupplements?.find(s => 
            s.name_en?.toLowerCase() === name.toLowerCase()
          )
          if (exactMatch) {
            subcategorySupplements.push(exactMatch)
          } else {
            // Try partial match
            const partialMatch = allSupplements?.find(s => 
              s.name_en?.toLowerCase().includes(name.toLowerCase()) ||
              name.toLowerCase().includes(s.name_en?.toLowerCase() || '')
            )
            if (partialMatch && !subcategorySupplements.find(s => s.id === partialMatch.id)) {
              subcategorySupplements.push(partialMatch)
            }
          }
        })
      }

      // Filter supplements that match our categories (fallback)
      const categoryMatchingSupplements = (allSupplements || []).filter(supplement => {
        if (!supplement.category_ids || !Array.isArray(supplement.category_ids)) {
          return false
        }
        // Check if supplement's category_ids array contains any of our target categories
        return categoryIds.some(catId => supplement.category_ids.includes(catId))
      })

      // Prioritize: subcategory-specific supplements first, then base health, then category matches
      const baseHealth = categoryMatchingSupplements.filter(s => s.is_base_health)
      const goalSpecific = categoryMatchingSupplements.filter(s => !s.is_base_health)

      // Combine: subcategory supplements (prioritized) + base health + goal-specific
      const allCandidateSupplements = [
        ...subcategorySupplements, // Highest priority - from subcategory mapping
        ...baseHealth.filter(s => !subcategorySupplements.find(sub => sub.id === s.id)),
        ...goalSpecific.filter(s => !subcategorySupplements.find(sub => sub.id === s.id))
      ]

      // Sort supplements by priority: subcategory first, then goal-specific, then base health (only if needed)
      // Prioritize goal-specific supplements over base health when user has specific goals
      const allSupplementsWithPriority = [
        ...subcategorySupplements.map(s => ({ ...s, priority: 100, isSubcategory: true })),
        ...goalSpecific
          .filter(s => !subcategorySupplements.find(sub => sub.id === s.id))
          .map(s => ({ 
            ...s, 
            priority: getSupplementPriority(s.name_en) + 30, // Goal-specific gets high priority
            isSubcategory: false 
          })),
        // Only include base health if we don't have enough supplements yet
        ...(subcategorySupplements.length + goalSpecific.filter(s => !subcategorySupplements.find(sub => sub.id === s.id)).length < 6
          ? baseHealth
              .filter(s => !subcategorySupplements.find(sub => sub.id === s.id))
              .map(s => ({ 
                ...s, 
                priority: getSupplementPriority(s.name_en) + 10, // Base health gets lower priority
                isSubcategory: false 
              }))
          : [])
      ]

      // Sort by priority (highest first), then by name
      allSupplementsWithPriority.sort((a, b) => {
        if (b.priority !== a.priority) return b.priority - a.priority
        return (a.name_en || '').localeCompare(b.name_en || '')
      })

      // Remove duplicates and limit total
      const uniqueSupplements = Array.from(
        new Map(allSupplementsWithPriority.map(s => [s.id, s])).values()
      ).slice(0, 8) // Limit to 8 supplements total

      // Smart scheduling: Handle caffeine specially, distribute others intelligently
      const caffeineSupplements = uniqueSupplements.filter(s => 
        s.name_en?.toLowerCase().includes('caffeine')
      )
      const nonCaffeineSupplements = uniqueSupplements.filter(s => 
        !s.name_en?.toLowerCase().includes('caffeine')
      )

      // Schedule blocks: Pre-Workout for caffeine, distribute others
      const scheduleBlocks = ['Morning', 'Lunch', 'Dinner', 'Bedtime']
      const stackItems: any[] = []

      // Add caffeine to Pre-Workout with custom dosage (200-300mg)
      caffeineSupplements.forEach(supplement => {
        stackItems.push({
          user_id: userId,
          supplement_id: supplement.id,
          schedule_block: 'Pre-Workout' as const,
          custom_dosage_val: 250, // Default to 250mg (middle of 200-300mg range)
          is_active: true,
        })
      })

      // Distribute non-caffeine supplements across schedule blocks
      nonCaffeineSupplements.forEach((supplement, index) => {
        // Smart distribution: prioritize common supplements for morning
        let scheduleBlock = scheduleBlocks[index % scheduleBlocks.length]
        
        // If it's a common supplement and we have space in Morning, put it there
        if (isCommonSupplement(supplement.name_en) && index < 2) {
          scheduleBlock = 'Morning'
        }
        
        stackItems.push({
          user_id: userId,
          supplement_id: supplement.id,
          schedule_block: scheduleBlock as 'Morning' | 'Lunch' | 'Dinner' | 'Bedtime',
          is_active: true,
        })
      })

      // Insert stack items
      if (stackItems.length > 0) {
        const { error: insertError } = await supabase
          .from('user_stacks')
          .insert(stackItems)

        if (insertError) {
          console.error('Error creating initial stack:', insertError)
        } else {
          console.log(`Created initial stack with ${stackItems.length} supplements`)
          
          // Generate timeline blocks and items from the stack
          const { error: timelineError } = await generateTimelineFromStack(userId)
          if (timelineError) {
            console.error('Error generating timeline from stack:', timelineError)
          } else {
            console.log('Timeline blocks and items created successfully')
          }
        }
      }
      
      return true
    } catch (error) {
      console.error('Error creating initial stack:', error)
      return false
    }
  }

  const handleNext = async () => {
    const maxStep = isQuickStack ? 0 : 2 // Only step 0 for quick stack, steps 0-2 for full onboarding
    
    if (step < maxStep) {
      setStep(step + 1)
    } else {
      setIsAnalyzing(true)
      
      // Save onboarding data to profile and create initial stack
      if (user?.id) {
        try {
          // Save profile data (only update goals for quick stack, full update for onboarding)
          const updateData: any = {
            selected_goals: selectedGoals,
            updated_at: new Date().toISOString()
          }
          
          // Only update biometrics and experience for full onboarding
          if (!isQuickStack) {
            const experienceLevels = ["beginner", "intermediate", "advanced", "biohacker"]
            const experienceLevel = experienceLevels[experience] || "intermediate"
            updateData.first_name = biometrics.name?.trim() || null
            updateData.username = biometrics.username?.trim() || null
            updateData.age = biometrics.age ? parseInt(biometrics.age) : null
            updateData.weight_kg = biometrics.weight ? parseFloat(biometrics.weight) : null
            updateData.gender = biometrics.gender || null
            updateData.experience_level = experienceLevel
            updateData.onboarding_completed = true
          }
          
          const { error: profileError } = await supabase
            .from('profiles')
            .update(updateData)
            .eq('id', user.id)

          if (profileError) {
            console.error('Error saving onboarding data:', profileError)
          } else {
            // If creating new stack, remove old stack items first
            if (isCreatingNewStack) {
              const { error: deleteError } = await supabase
                .from('user_stacks')
                .delete()
                .eq('user_id', user.id)
              
              if (deleteError) {
                console.error('Error removing old stack:', deleteError)
              }
            }
            
            // Create initial stack using predefined stacks
            const age = biometrics.age ? parseInt(biometrics.age) : null
            const gender = biometrics.gender || null
            const weight = biometrics.weight ? parseFloat(biometrics.weight) : null
            
            // Map experience level
            const experienceLevels = ["beginner", "intermediate", "advanced", "biohacker"]
            const experienceLevel = experienceLevels[experience] || "intermediate"
            
            // Determine activity level (can be enhanced with user input later)
            // For now, assume moderate for most users, active for advanced/biohackers
            const activityLevel = experienceLevel === 'advanced' || experienceLevel === 'biohacker' 
              ? 'active' 
              : 'moderate'
            
            // Get predefined stacks for selected goals
            const predefinedStacks = getPredefinedStacksForGoals(
              selectedGoals,
              selectedSubcategories,
              includeBasicHealth
            )

            // Generate stack from predefined templates
            const { success, created, errors } = await generateStackFromPredefined({
              userId: user.id,
              stacks: predefinedStacks,
              age,
              gender: gender as 'male' | 'female' | null,
              weight,
              activityLevel: activityLevel as 'sedentary' | 'moderate' | 'active' | 'veryActive',
              experienceLevel: experienceLevel as 'beginner' | 'intermediate' | 'advanced' | 'biohacker',
              includeBasicHealth
            })

            if (errors.length > 0) {
              console.warn('Stack generation warnings:', errors)
            }

            const stackCreated = success && created > 0
            
            if (stackCreated) {
              // Show stack review instead of redirecting immediately
              setIsAnalyzing(false)
              setShowStackReview(true)
            } else {
              // If stack creation failed, redirect to stack page anyway
              setIsAnalyzing(false)
              router.push("/stack")
            }
          }
        } catch (error) {
          console.error('Error saving onboarding data:', error)
          setIsAnalyzing(false)
        }
      }
    }
  }

  const handleBack = () => {
    if (step > 0) setStep(step - 1)
  }

  // Show stack review if stack was created
  if (showStackReview && user?.id) {
    return (
      <StackReview
        userId={user.id}
        onComplete={() => {
          // Mark onboarding as completed if it wasn't already
          if (!isCreatingNewStack) {
            supabase
              .from('profiles')
              .update({ onboarding_completed: true })
              .eq('id', user.id)
              .then(() => {
                router.push("/stack")
              })
          } else {
            router.push("/stack")
          }
        }}
      />
    )
  }

  if (isAnalyzing) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#0d1f1f] via-[#0a1a1a] to-[#0a0f0f] px-6 text-white">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="flex flex-col items-center gap-8"
        >
          <div className="relative">
            <DNAProgress progress={100} size={120} />
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              className="absolute -inset-4 rounded-full border-2 border-teal-500/30 border-t-teal-500"
            />
          </div>
          <div className="text-center">
            <h2 className="mb-2 text-2xl font-bold">{t("analyzing")}</h2>
            <p className="text-gray-400">{t("creatingPlan")}</p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("calculatingDoses")}
          </div>
        </motion.div>
      </div>
    )
  }

  const experienceLevels = [t("beginner"), t("intermediate"), t("advanced"), t("biohacker")]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1f1f] via-[#0a1a1a] to-[#0a0f0f] px-6 py-8 text-white">
      <div className="mx-auto max-w-md">
        {/* Quick Stack Builder Header */}
        {isQuickStack && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-teal-500/20 bg-teal-500/10 p-4"
          >
            <h2 className="mb-1 text-lg font-bold text-teal-400">{t("quickStackBuilder")}</h2>
            <p className="text-sm text-gray-400">{t("quickStackDescription")}</p>
          </motion.div>
        )}
        
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="mb-2 flex justify-between text-sm text-gray-400">
            <span>
              {t("step")} {step + 1} {t("of")} {totalSteps}
            </span>
            <span>{Math.round(((step + 1) / totalSteps) * 100)}%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
              initial={{ width: 0 }}
              animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Goal Selection */}
          {step === 0 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div>
                <h1 className="mb-2 text-2xl font-bold">{t("goalsTitle")}</h1>
                <p className="text-gray-400">{t("goalsDescription")}</p>
              </div>

              <div className="space-y-4">
                {goals.map((goal) => {
                  const isSelected = selectedGoals.includes(goal.id)
                  const isExpanded = expandedGoal === goal.id
                  const goalSubcategories = selectedSubcategories[goal.id] || []
                  
                  return (
                    <div key={goal.id} className="space-y-2">
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleGoalToggle(goal.id)}
                        className={`flex w-full items-center justify-between rounded-2xl border-2 p-4 transition-all ${
                          isSelected
                            ? "border-teal-500 bg-teal-500/10"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`rounded-xl p-2 ${goal.color}`}>
                            <goal.icon className="h-5 w-5" />
                          </div>
                          <span className="text-sm font-medium">{t(goal.labelKey)}</span>
                        </div>
                        {isSelected && (
                          <span className="text-xs text-teal-400">
                            {goalSubcategories.length > 0 ? `${goalSubcategories.length} selected` : ""}
                          </span>
                        )}
                      </motion.button>
                      
                      {isSelected && isExpanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="ml-4 space-y-2 rounded-xl border border-white/10 bg-white/5 p-3"
                        >
                          <p className="text-xs text-gray-400">
                            {goal.id === "cognitive" 
                              ? t("cognitiveSubcategory")
                              : t(`${goal.id}Subcategory` as any)}
                          </p>
                          <div className="grid grid-cols-2 gap-2">
                            {goal.subcategories.map((subcategory) => {
                              const isSubSelected = goalSubcategories.includes(subcategory.id)
                              return (
                                <motion.button
                                  key={subcategory.id}
                                  whileTap={{ scale: 0.95 }}
                                  onClick={() => handleSubcategoryToggle(goal.id, subcategory.id)}
                                  className={`rounded-lg border py-2 px-3 text-xs transition-all ${
                                    isSubSelected
                                      ? "border-teal-500 bg-teal-500/20 text-teal-400"
                                      : "border-white/10 bg-white/5 hover:border-white/20"
                                  }`}
                                >
                                  {t(subcategory.labelKey)}
                                </motion.button>
                              )
                            })}
                          </div>
                        </motion.div>
                      )}
                    </div>
                  )
                })}
              </div>

              {/* Basic Health Stack Option - Show for both quick stack and full onboarding */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="mt-6 rounded-2xl border-2 border-white/10 bg-white/5 p-4"
              >
                <label className="flex cursor-pointer items-center gap-3">
                  <input
                    type="checkbox"
                    checked={includeBasicHealth}
                    onChange={(e) => setIncludeBasicHealth(e.target.checked)}
                    className="h-5 w-5 rounded border-white/20 bg-white/5 text-teal-500 focus:ring-2 focus:ring-teal-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-white">{t("includeBasicHealthStack")}</div>
                    <div className="text-sm text-gray-400">{t("includeBasicHealthStackDescription")}</div>
                  </div>
                </label>
              </motion.div>
            </motion.div>
          )}

          {/* Step 2: Biometrics */}
          {step === 1 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div>
                <h1 className="mb-2 text-2xl font-bold">{t("biometricsTitle")}</h1>
                <p className="text-gray-400">{t("biometricsDescription")}</p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm text-gray-400">{t("name") || "Name"}</label>
                  <input
                    type="text"
                    placeholder={t("namePlaceholder") || "Enter your name"}
                    value={biometrics.name}
                    onChange={(e) => setBiometrics({ ...biometrics, name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-400">{t("username") || "Username"}</label>
                  <input
                    type="text"
                    placeholder={t("usernamePlaceholder") || "Choose a username"}
                    value={biometrics.username}
                    onChange={(e) => setBiometrics({ ...biometrics, username: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                  <p className="mt-1 text-xs text-gray-500">{t("usernameDescription") || "This will be shown in the community"}</p>
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-400">{t("age")}</label>
                  <input
                    type="number"
                    placeholder="30"
                    value={biometrics.age}
                    onChange={(e) => setBiometrics({ ...biometrics, age: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-400">{t("weight")} (kg)</label>
                  <input
                    type="number"
                    placeholder="75"
                    value={biometrics.weight}
                    onChange={(e) => setBiometrics({ ...biometrics, weight: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-400">{t("gender")}</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: "male", label: t("male") },
                      { key: "female", label: t("female") },
                      { key: "other", label: t("other") },
                    ].map((gender) => (
                      <button
                        key={gender.key}
                        onClick={() => setBiometrics({ ...biometrics, gender: gender.label })}
                        className={`rounded-xl border py-3 text-sm transition-all ${
                          biometrics.gender === gender.label
                            ? "border-teal-500 bg-teal-500/10 text-teal-400"
                            : "border-white/10 bg-white/5 hover:border-white/20"
                        }`}
                      >
                        {gender.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Step 3: Experience Level */}
          {step === 2 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              className="space-y-6"
            >
              <div>
                <h1 className="mb-2 text-2xl font-bold">{t("experienceTitle")}</h1>
                <p className="text-gray-400">{t("experienceDescription")}</p>
              </div>

              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="3"
                  value={experience}
                  onChange={(e) => setExperience(Number(e.target.value))}
                  className="w-full accent-teal-500"
                />
                <div className="flex justify-between text-sm text-gray-400">
                  {experienceLevels.map((level, i) => (
                    <span key={level} className={experience === i ? "font-medium text-teal-400" : ""}>
                      {level}
                    </span>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl bg-white/5 p-4">
                <p className="text-sm text-gray-300">{t("experienceDescriptions")[experience]}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Buttons */}
        <div className="mt-8 flex gap-3">
          {step > 0 && (
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleBack}
              className="flex items-center gap-2 rounded-xl border border-white/10 px-6 py-3 transition-colors hover:bg-white/5"
            >
              <ArrowLeft className="h-4 w-4" />
              {t("back")}
            </motion.button>
          )}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleNext}
            disabled={step === 0 && selectedGoals.length === 0}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3 font-medium transition-all hover:opacity-90 disabled:opacity-50"
          >
            {step === 2 ? t("startAnalysis") : t("continue")}
            <ArrowRight className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}
