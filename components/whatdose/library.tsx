"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, ChevronRight, AlertTriangle, CheckCircle, Beaker, ChevronDown, Heart, Dumbbell, Brain, Moon, Zap, Activity, Shield, Pill, ThumbsUp, ThumbsDown, MessageCircle, Send, Trash2, Check, Clock } from "lucide-react"
import { useTranslation, type Language } from "@/lib/translations"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useUserStack } from "@/hooks/use-user-stack"
import { useSupplementVoting } from "@/hooks/use-supplement-voting"
import { analytics } from "@/lib/analytics"
import { AddToStackModal } from "./add-to-stack-modal"
import { useProfile } from "@/hooks/use-profile"
import { calculateDosageOptions, calculateBenefits, suggestTiming } from "@/lib/supplement-info-helper"
import type { SupplementSearchResult } from "@/lib/database.types"

interface Variant {
  id: number
  name_en: string
  name_sv: string | null
  default_dosage_val: number | null
  max_dosage_val: number | null
  unit: string | null
  dosing_notes: string | null
  bioavailability_notes: string | null
  interaction_risk_text: string | null
  interaction_risk_level: "Low" | "Medium" | "High"
  research_status: "Green" | "Blue" | "Red"
  category_ids: number[] | null
  upvotes_count?: number
  downvotes_count?: number
  comments_count?: number
}

export function Library() {
  const { user } = useAuth()
  const { addToStack } = useUserStack(user?.id || null)
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilter, setActiveFilter] = useState("all")
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [selectedParent, setSelectedParent] = useState<SupplementSearchResult | null>(null)
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(null)
  const [expandedParents, setExpandedParents] = useState<Set<number>>(new Set())
  const [supplements, setSupplements] = useState<SupplementSearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showStatusInfo, setShowStatusInfo] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [parentDosingInfo, setParentDosingInfo] = useState<{ dosing_base_val: number | null; dosing_max_val: number | null; unit: string | null } | null>(null)
  const [dosageOptions, setDosageOptions] = useState<{ label: string; value: number; description: string }[]>([])
  const [benefits, setBenefits] = useState<string[]>([])
  const [usageNotes, setUsageNotes] = useState<string[]>([])
  const [suggestedTiming, setSuggestedTiming] = useState<'Morning' | 'Lunch' | 'Pre-Workout' | 'Post-Workout' | 'Dinner' | 'Bedtime' | null>(null)
  const { profile } = useProfile(user?.id || null)
  
  // Get supplement ID for voting/comments - only fetch when supplement is actually selected
  // This prevents unnecessary requests on page load
  const selectedSupplementId = (selectedVariant || selectedParent) 
    ? (selectedVariant 
        ? selectedVariant.id 
        : selectedParent?.parent_id || null)
    : null
  
  // Temporarily disabled to prevent loading issues
  // const { stats, comments, loading: votingLoading, vote, addComment, deleteComment } = useSupplementVoting(
  //   selectedSupplementId,
  //   selectedSupplementId ? user?.id || null : null
  // )
  const stats = { upvotes: 0, downvotes: 0, userVote: null }
  const comments: any[] = []
  const votingLoading = false
  const vote = async () => ({ error: 'Disabled' })
  const addComment = async () => ({ error: 'Disabled' })
  const deleteComment = async () => ({ error: 'Disabled' })

  const [lang, setLang] = useState<Language>("en")
  const { t } = useTranslation(lang)

  useEffect(() => {
    const storedLang = localStorage.getItem("language") as Language
    if (storedLang) setLang(storedLang)

    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLang(e.detail)
    }

    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener)
  }, [])

  // Track what we've already loaded to prevent infinite loops
  const loadingRef = useRef(false)
  const lastVariantIdRef = useRef<number | null>(null)
  const lastParentIdRef = useRef<number | null>(null)
  const lastWeightRef = useRef<number | null>(null)
  const lastGenderRef = useRef<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch parent dosing info and calculate dosage options/benefits when supplement is selected
  // Only loads when a supplement is actually opened (not on page load)
  useEffect(() => {
    // Clear any pending timeouts
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }

    // Only load if we have a selection
    if (!selectedVariant && !selectedParent) {
      setParentDosingInfo(null)
      setDosageOptions([])
      setBenefits([])
      setUsageNotes([])
      setSuggestedTiming(null)
      lastVariantIdRef.current = null
      lastParentIdRef.current = null
      return
    }

    // Prevent concurrent loads
    if (loadingRef.current) return

    // Check if we need to reload - only check IDs
    const currentVariantId = selectedVariant?.id || null
    const currentParentId = selectedParent?.parent_id || null

    // Only reload if supplement ID changed
    if (
      currentVariantId === lastVariantIdRef.current &&
      currentParentId === lastParentIdRef.current
    ) {
      return
    }

    let cancelled = false

    const loadSupplementInfo = async () => {
      if (cancelled || loadingRef.current) return
      
      loadingRef.current = true

      try {
        const currentWeight = profile?.weight_kg || null
        const currentGender = profile?.gender || null

        if (selectedVariant) {
          // Use variant info - no API call needed
          setParentDosingInfo(null)
          
          const options = await calculateDosageOptions(
            selectedVariant.default_dosage_val,
            selectedVariant.max_dosage_val,
            selectedVariant.unit,
            selectedVariant.name_en,
            currentWeight,
            t
          )
          
          if (cancelled) return
          setDosageOptions(options)
          
          const { benefits: calculatedBenefits, usageNotes: calculatedUsageNotes } = calculateBenefits(
            selectedVariant.category_ids,
            selectedVariant.dosing_notes,
            selectedVariant.bioavailability_notes,
            selectedVariant.name_en,
            currentGender,
            selectedVariant.benefits, // Pass database benefits if available
            t
          )
          
          if (cancelled) return
          setBenefits(calculatedBenefits)
          setUsageNotes(calculatedUsageNotes)

          lastVariantIdRef.current = currentVariantId
          lastParentIdRef.current = null
        } else if (selectedParent) {
          // Fetch parent info
          const { data: parentData, error: parentError } = await supabase
            .from('supplements')
            .select('dosing_base_val, dosing_max_val, unit, category_ids, dosing_notes, bioavailability_notes')
            .eq('id', selectedParent.parent_id)
            .maybeSingle()

          if (cancelled) return

          // Ignore errors for now to prevent crashes
          if (parentError) {
            console.warn('Error fetching parent info (ignored):', parentError.code || parentError.message)
            setParentDosingInfo({ dosing_base_val: null, dosing_max_val: null, unit: null })
            setDosageOptions([])
            setBenefits([])
            setUsageNotes([])
            setSuggestedTiming(null)
          } else if (parentData) {
            setParentDosingInfo({
              dosing_base_val: parentData.dosing_base_val,
              dosing_max_val: parentData.dosing_max_val,
              unit: parentData.unit,
            })
            
            const options = await calculateDosageOptions(
              parentData.dosing_base_val,
              parentData.dosing_max_val,
              parentData.unit,
              selectedParent.parent_name_en,
              currentWeight,
              t
            )
            
            if (cancelled) return
            setDosageOptions(options)
            
            const { benefits: calculatedBenefits, usageNotes: calculatedUsageNotes } = calculateBenefits(
              parentData.category_ids,
              parentData.dosing_notes,
              parentData.bioavailability_notes,
              selectedParent.parent_name_en,
              currentGender,
              parentData.benefits, // Pass database benefits if available
              t
            )
            
            const timing = await suggestTiming(selectedParent.parent_name_en, parentData.category_ids)
            
            if (cancelled) return
            setBenefits(calculatedBenefits)
            setUsageNotes(calculatedUsageNotes)
            setSuggestedTiming(timing)

            lastVariantIdRef.current = null
            lastParentIdRef.current = currentParentId
          } else {
            setParentDosingInfo({ dosing_base_val: null, dosing_max_val: null, unit: null })
            setDosageOptions([])
            setBenefits([])
            setUsageNotes([])
            setSuggestedTiming(null)
          }
        }

        lastWeightRef.current = currentWeight
        lastGenderRef.current = currentGender
      } catch (err) {
        if (cancelled) return
        console.error('Error loading supplement info (ignored):', err)
      } finally {
        if (!cancelled) {
          loadingRef.current = false
        }
      }
    }
    
    // Load immediately when supplement is selected
    loadSupplementInfo()

    return () => {
      cancelled = true
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedParent?.parent_id, selectedVariant?.id])

  // Fetch supplements from Supabase (by category or search)
  useEffect(() => {
    const fetchSupplements = async () => {
      setLoading(true)
      setError(null)

      try {
        let data: SupplementSearchResult[] | null = null

        // If category is selected, fetch by category
        if (selectedCategory) {
          const { data: categoryData, error: categoryError } = await supabase
            .from('supplements')
            .select(`
              id,
              name_en,
              name_sv,
              dosing_notes,
              research_status,
              category_ids,
              is_parent,
              parent_id,
              upvotes_count,
              downvotes_count,
              comments_count
            `)
            .eq('is_parent', true)
            .contains('category_ids', [selectedCategory])
            .order('name_en')
            .limit(100)

          if (categoryError) throw categoryError

          // Transform to SupplementSearchResult format
          if (categoryData) {
            // Get variants for each parent
            const parentIds = categoryData.map(s => s.id)
            const { data: variantsData } = await supabase
              .from('supplements')
              .select('*')
              .in('parent_id', parentIds)
              .order('name_en')

            // Group variants by parent
            const variantsByParent = new Map<number, Variant[]>()
            variantsData?.forEach(v => {
              if (v.parent_id) {
                const existing = variantsByParent.get(v.parent_id) || []
                existing.push({
                  id: v.id,
                  name_en: v.name_en || '',
                  name_sv: v.name_sv,
                  default_dosage_val: v.dosing_base_val,
                  max_dosage_val: v.dosing_max_val,
                  unit: v.unit,
                  dosing_notes: v.dosing_notes,
                  bioavailability_notes: v.bioavailability_notes,
                  interaction_risk_text: v.interaction_risk_text,
                  interaction_risk_level: v.interaction_risk_level as "Low" | "Medium" | "High",
                  research_status: v.research_status as "Green" | "Blue" | "Red",
                  category_ids: v.category_ids,
                  upvotes_count: v.upvotes_count || 0,
                  downvotes_count: v.downvotes_count || 0,
                  comments_count: v.comments_count || 0
                })
                variantsByParent.set(v.parent_id, existing)
              }
            })

            data = categoryData.map(s => ({
              parent_id: s.id,
              parent_name_en: s.name_en || '',
              parent_name_sv: s.name_sv,
              parent_description: s.description || s.dosing_notes, // Use description, fallback to dosing_notes
              parent_research_status: s.research_status as "Green" | "Blue" | "Red",
              parent_category_ids: s.category_ids,
              parent_upvotes_count: s.upvotes_count || 0,
              parent_downvotes_count: s.downvotes_count || 0,
              parent_comments_count: s.comments_count || 0,
              variants: variantsByParent.get(s.id) || []
            }))
          }
        }
        // If search query exists (2+ chars), use search function
        else if (searchQuery.trim().length >= 2) {
          const { data: searchData, error: searchError } = await supabase.rpc('search_supplements', {
            search_term: searchQuery.trim()
          })

          if (searchError) throw searchError
          
          // Enhance search results with category_ids and vote/comment counts from database
          if (searchData) {
            const parentIds = searchData.map((s: any) => s.parent_id)
            
            // Get parent data with counts
            const { data: parentData } = await supabase
              .from('supplements')
              .select('id, category_ids, upvotes_count, downvotes_count, comments_count')
              .in('id', parentIds)
            
            // Get all variant IDs from search results to fetch their counts
            const variantIds: number[] = []
            searchData.forEach((s: any) => {
              if (s.variants && Array.isArray(s.variants)) {
                s.variants.forEach((v: any) => {
                  if (v.id) variantIds.push(v.id)
                })
              }
            })
            
            // Get variant counts
            const variantCountsMap = new Map<number, { upvotes: number; downvotes: number; comments: number }>()
            if (variantIds.length > 0) {
              const { data: variantData } = await supabase
                .from('supplements')
                .select('id, upvotes_count, downvotes_count, comments_count')
                .in('id', variantIds)
              
              variantData?.forEach(v => {
                variantCountsMap.set(v.id, {
                  upvotes: v.upvotes_count || 0,
                  downvotes: v.downvotes_count || 0,
                  comments: v.comments_count || 0
                })
              })
            }
            
            const categoryMap = new Map<number, number[]>()
            const countsMap = new Map<number, { upvotes: number; downvotes: number; comments: number }>()
            parentData?.forEach(p => {
              if (p.category_ids) {
                categoryMap.set(p.id, p.category_ids)
              }
              countsMap.set(p.id, {
                upvotes: p.upvotes_count || 0,
                downvotes: p.downvotes_count || 0,
                comments: p.comments_count || 0
              })
            })
            
            data = searchData.map((s: any) => {
              const counts = countsMap.get(s.parent_id) || { upvotes: 0, downvotes: 0, comments: 0 }
              
              // Enhance variants with vote counts
              const enhancedVariants = (s.variants || []).map((v: any) => {
                const variantCounts = variantCountsMap.get(v.id) || { upvotes: 0, downvotes: 0, comments: 0 }
                return {
                  ...v,
                  upvotes_count: variantCounts.upvotes,
                  downvotes_count: variantCounts.downvotes,
                  comments_count: variantCounts.comments
                }
              })
              
              return {
                ...s,
                parent_category_ids: categoryMap.get(s.parent_id) || null,
                parent_upvotes_count: counts.upvotes,
                parent_downvotes_count: counts.downvotes,
                parent_comments_count: counts.comments,
                variants: enhancedVariants
              }
            })
          } else {
            data = searchData
          }
          
          analytics.searchSupplements(searchQuery.trim())
        }
        // Otherwise, fetch all supplements (limit to reasonable number)
        else {
          const { data: allData, error: allError } = await supabase
            .from('supplements')
            .select(`
              id,
              name_en,
              name_sv,
              dosing_notes,
              research_status,
              category_ids,
              is_parent,
              parent_id,
              upvotes_count,
              downvotes_count,
              comments_count
            `)
            .eq('is_parent', true)
            .order('name_en')
            .limit(50) // Limit initial load

          if (allError) throw allError

          if (allData) {
            const parentIds = allData.map(s => s.id)
            const { data: variantsData } = await supabase
              .from('supplements')
              .select('*')
              .in('parent_id', parentIds)
              .order('name_en')

            const variantsByParent = new Map<number, Variant[]>()
            variantsData?.forEach(v => {
              if (v.parent_id) {
                const existing = variantsByParent.get(v.parent_id) || []
                existing.push({
                  id: v.id,
                  name_en: v.name_en || '',
                  name_sv: v.name_sv,
                  default_dosage_val: v.dosing_base_val,
                  max_dosage_val: v.dosing_max_val,
                  unit: v.unit,
                  dosing_notes: v.dosing_notes,
                  bioavailability_notes: v.bioavailability_notes,
                  interaction_risk_text: v.interaction_risk_text,
                  interaction_risk_level: v.interaction_risk_level as "Low" | "Medium" | "High",
                  research_status: v.research_status as "Green" | "Blue" | "Red",
                  category_ids: v.category_ids,
                  upvotes_count: v.upvotes_count || 0,
                  downvotes_count: v.downvotes_count || 0,
                  comments_count: v.comments_count || 0
                })
                variantsByParent.set(v.parent_id, existing)
              }
            })

            data = allData.map(s => ({
              parent_id: s.id,
              parent_name_en: s.name_en || '',
              parent_name_sv: s.name_sv,
              parent_description: s.description || s.dosing_notes, // Use description, fallback to dosing_notes
              parent_research_status: s.research_status as "Green" | "Blue" | "Red",
              parent_category_ids: s.category_ids,
              parent_upvotes_count: s.upvotes_count || 0,
              parent_downvotes_count: s.downvotes_count || 0,
              parent_comments_count: s.comments_count || 0,
              variants: variantsByParent.get(s.id) || []
            }))
          }
        }

        setSupplements(data || [])
      } catch (err) {
        console.error('Fetch error:', err)
        setError(err instanceof Error ? err.message : 'An error occurred')
        setSupplements([])
      } finally {
        setLoading(false)
      }
    }

    // Debounce search (but not category selection)
    const timeoutId = selectedCategory 
      ? setTimeout(fetchSupplements, 0) // Immediate for category
      : setTimeout(fetchSupplements, 300) // Debounced for search
    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedCategory])

  // Category filter chips
  const categoryFilters = [
    { id: null, label: t("all"), key: "all" },
    { id: 1, label: t("categoryHealth"), key: "health" },
    { id: 2, label: t("categoryMuscle"), key: "muscle" },
    { id: 3, label: t("categoryPerformance"), key: "performance" },
    { id: 4, label: t("categoryFocus"), key: "focus" },
    { id: 5, label: t("categoryStress"), key: "stress" },
    { id: 6, label: t("categoryMetabolic"), key: "metabolic" },
    { id: 7, label: t("categorySleep"), key: "sleep" },
    { id: 8, label: t("categoryAntiAging"), key: "antiAging" },
    { id: 9, label: t("categoryJoints"), key: "joints" },
  ]

  const statusFilterChips = [
    { key: "all", label: t("all") },
    { key: "greenStatus", label: t("greenStatus") },
    { key: "blueStatus", label: "Blue" },
    { key: "redStatus", label: "Red" },
  ]

  const filteredSupplements = supplements.filter((sup) => {
    const matchesFilter =
      activeFilter === "all" ||
      (activeFilter === "greenStatus" && sup.parent_research_status === "Green") ||
      (activeFilter === "blueStatus" && sup.parent_research_status === "Blue") ||
      (activeFilter === "redStatus" && sup.parent_research_status === "Red")
    return matchesFilter
  })

  const toggleExpand = (parentId: number) => {
    const newExpanded = new Set(expandedParents)
    if (newExpanded.has(parentId)) {
      newExpanded.delete(parentId)
    } else {
      newExpanded.add(parentId)
    }
    setExpandedParents(newExpanded)
  }

  const formatDosage = (base: number | null, max: number | null, unit: string | null) => {
    if (!base && !max) return "Dosage not specified"
    const baseStr = base ? `${base}${unit || ''}` : ''
    const maxStr = max ? `${max}${unit || ''}` : ''
    if (baseStr && maxStr && base !== max) return `${baseStr} - ${maxStr}`
    return baseStr || maxStr
  }

  const getStatusColor = (status: "Green" | "Blue" | "Red") => {
    switch (status) {
      case "Green": return "bg-emerald-500/20 text-emerald-400"
      case "Blue": return "bg-blue-500/20 text-blue-400"
      case "Red": return "bg-red-500/20 text-red-400"
    }
  }

  // Get category icon and color
  const getCategoryIcon = (categoryId: number) => {
    const categoryMap: Record<number, { icon: any; color: string }> = {
      1: { icon: Heart, color: "text-teal-400" }, // Health
      2: { icon: Dumbbell, color: "text-red-400" }, // Muscle
      3: { icon: Activity, color: "text-orange-400" }, // Performance
      4: { icon: Brain, color: "text-purple-400" }, // Focus
      5: { icon: Shield, color: "text-blue-400" }, // Stress
      6: { icon: Zap, color: "text-yellow-400" }, // Metabolic
      7: { icon: Moon, color: "text-indigo-400" }, // Sleep
      8: { icon: Heart, color: "text-pink-400" }, // Anti-Aging
      9: { icon: Pill, color: "text-green-400" }, // Joints
    }
    return categoryMap[categoryId] || { icon: Beaker, color: "text-gray-400" }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1f1f] via-[#0a1a1a] to-[#0a0f0f] pb-24 text-white">
      {/* Sticky Search Header */}
      <div className="sticky top-0 z-40 bg-[#0d1f1f]/95 px-4 pb-4 pt-6 backdrop-blur-lg">
        <h1 className="mb-4 text-2xl font-bold">{t("libraryTitle")}</h1>
        <div className="relative mb-4">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder={t("searchSupplementsPlaceholder")}
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value)
              if (e.target.value.trim().length > 0) {
                setSelectedCategory(null) // Clear category when searching
              }
            }}
            className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="mb-3">
          <p className="mb-2 text-xs font-medium text-gray-400">{t("filterByCategory") || "Filter by Category"}</p>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
            {categoryFilters.map((category) => (
              <button
                key={category.key}
                onClick={() => {
                  setSelectedCategory(category.id)
                  setSearchQuery("") // Clear search when selecting category
                }}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all ${
                  selectedCategory === category.id 
                    ? "bg-teal-500 text-white" 
                    : "bg-white/10 text-gray-300 hover:bg-white/15"
                }`}
              >
                {category.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filter Chips */}
        <div>
          <div className="mb-2 flex items-center gap-2">
            <p className="text-xs font-medium text-gray-400">{t("filterByStatus") || "Filter by Status"}</p>
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowStatusInfo(!showStatusInfo)}
                className="flex h-5 w-5 items-center justify-center rounded-full border border-gray-500/50 bg-white/5 text-xs text-gray-400 transition-all hover:border-gray-400 hover:bg-white/10 hover:text-gray-300 active:bg-white/15"
                title={t("statusFilterInfo") || "Click for info"}
              >
                ?
              </button>
              {/* Tooltip - Click to show, works on both desktop and mobile */}
              <AnimatePresence>
                {showStatusInfo && (
                  <>
                    {/* Backdrop overlay for mobile */}
                    <div
                      className="fixed inset-0 z-40 md:hidden"
                      onClick={() => setShowStatusInfo(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -10 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -10 }}
                      className="absolute left-0 top-6 z-50 w-[calc(100vw-2rem)] max-w-[280px] rounded-lg border border-white/20 bg-slate-900/98 p-4 text-xs text-gray-300 shadow-2xl backdrop-blur-sm sm:left-auto sm:right-0 sm:w-72"
                    >
                    <div className="mb-2 flex items-center justify-between">
                      <p className="font-semibold text-white">{t("statusFilterTitle") || "Research Status"}</p>
                      <button
                        onClick={() => setShowStatusInfo(false)}
                        className="text-gray-500 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mb-3 text-xs text-gray-400">{t("statusFilterSubtitle") || "These colors indicate the level of scientific evidence:"}</p>
                    <div className="space-y-2.5">
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full bg-emerald-500"></div>
                        <div className="flex-1">
                          <span className="font-semibold text-emerald-400">{t("greenStatus")}</span>
                          <span className="text-gray-400">: {t("greenStatusDescription") || "Well-researched and proven effective"}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full bg-blue-500"></div>
                        <div className="flex-1">
                          <span className="font-semibold text-blue-400">Blue</span>
                          <span className="text-gray-400">: {t("blueStatusDescription") || "Emerging research, promising but needs more studies"}</span>
                        </div>
                      </div>
                      <div className="flex items-start gap-2.5">
                        <div className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full bg-red-500"></div>
                        <div className="flex-1">
                          <span className="font-semibold text-red-400">Red</span>
                          <span className="text-gray-400">: {t("redStatusDescription") || "Limited research or mixed results"}</span>
                        </div>
                      </div>
                    </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-2">
            {statusFilterChips.map((chip) => (
              <button
                key={chip.key}
                onClick={() => setActiveFilter(chip.key)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm transition-all ${
                  activeFilter === chip.key ? "bg-purple-500 text-white" : "bg-white/10 text-gray-300 hover:bg-white/15"
                }`}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Supplement List */}
      <div className="px-4">
        {loading && (
          <div className="flex items-center justify-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-500/30 border-t-teal-500" />
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-500/10 p-4 text-red-400">
            Error: {error}
          </div>
        )}

        {!loading && !error && searchQuery.trim().length < 2 && !selectedCategory && supplements.length === 0 && (
          <div className="py-12 text-center text-gray-400">
            {t("selectCategoryOrSearch") || "Select a category above or type at least 2 characters to search..."}
          </div>
        )}

        {!loading && !error && filteredSupplements.length === 0 && (searchQuery.trim().length >= 2 || selectedCategory) && (
          <div className="py-12 text-center text-gray-400">
            {t("noSupplementsFound") || "No supplements found"}
          </div>
        )}

        {!loading && !error && filteredSupplements.length > 0 && (
          <div className="space-y-3">
            {filteredSupplements.map((parent, i) => {
              const isExpanded = expandedParents.has(parent.parent_id)
              const variants = (parent.variants as Variant[]) || []
              const hasVariants = variants.length > 0

              return (
                <motion.div
                  key={parent.parent_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="rounded-2xl bg-white/5 overflow-hidden"
                >
                  {/* Parent Row */}
                  <button
                    onClick={() => {
                      if (hasVariants) {
                        toggleExpand(parent.parent_id)
                      } else {
                        setSelectedParent(parent)
                        setSelectedVariant(null)
                        analytics.viewSupplement(parent.parent_name_en)
                      }
                    }}
                    className="flex w-full items-center gap-4 p-4 text-left transition-colors hover:bg-white/10"
                  >
                    <div
                      className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                        parent.parent_research_status === "Green" ? "bg-emerald-500/20" : 
                        parent.parent_research_status === "Blue" ? "bg-blue-500/20" : 
                        "bg-red-500/20"
                      }`}
                    >
                      <Beaker
                        className={`h-6 w-6 ${
                          parent.parent_research_status === "Green" ? "text-emerald-400" : 
                          parent.parent_research_status === "Blue" ? "text-blue-400" : 
                          "text-red-400"
                        }`}
                      />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{parent.parent_name_en}</span>
                        <span className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(parent.parent_research_status)}`}>
                          {parent.parent_research_status}
                        </span>
                        {hasVariants && (
                          <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-xs text-teal-400">
                            {variants.length} variant{variants.length !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                      {parent.parent_description && (
                        <p className="text-sm text-gray-400 line-clamp-1">{parent.parent_description}</p>
                      )}
                      {/* Vote and Comment Counts */}
                      <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <ThumbsUp className="h-3.5 w-3.5 text-emerald-400" />
                          <span>{(parent as any).parent_upvotes_count || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <ThumbsDown className="h-3.5 w-3.5 text-red-400" />
                          <span>{(parent as any).parent_downvotes_count || 0}</span>
                        </div>
                        {(parent as any).parent_comments_count > 0 && (
                          <div className="flex items-center gap-1">
                            <MessageCircle className="h-3.5 w-3.5 text-blue-400" />
                            <span>{(parent as any).parent_comments_count || 0}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {/* Category Icons - Right side, aligned with name */}
                    <div className="flex items-center gap-1.5">
                      {(() => {
                        // Get category_ids from parent or first variant
                        const categoryIds = (parent as any).parent_category_ids || 
                          (variants.length > 0 && variants[0]?.category_ids) || 
                          []
                        
                        if (!categoryIds || categoryIds.length === 0) return null
                        
                        // Show up to 3 category icons
                        return categoryIds.slice(0, 3).map((catId: number) => {
                          const { icon: Icon, color } = getCategoryIcon(catId)
                          return (
                            <div
                              key={catId}
                              className={`flex h-6 w-6 items-center justify-center rounded-full bg-white/10 ${color}`}
                              title={categoryFilters.find(c => c.id === catId)?.label || ''}
                            >
                              <Icon className="h-3.5 w-3.5" />
                            </div>
                          )
                        })
                      })()}
                    </div>
                    {hasVariants ? (
                      <ChevronDown
                        className={`h-5 w-5 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      />
                    ) : (
                      <ChevronRight className="h-5 w-5 text-gray-500" />
                    )}
                  </button>

                  {/* Variants List */}
                  {isExpanded && hasVariants && (
                    <div className="border-t border-white/10 bg-white/2">
                      {variants.map((variant) => (
                        <button
                          key={variant.id}
                          onClick={() => {
                            setSelectedParent(parent)
                            setSelectedVariant(variant)
                            analytics.viewSupplement(variant.name_en)
                          }}
                          className="flex w-full items-center gap-4 p-4 pl-12 text-left transition-colors hover:bg-white/10"
                        >
                          <div className={`h-2 w-2 rounded-full ${getStatusColor(variant.research_status)}`} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{variant.name_en}</span>
                              <span className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(variant.research_status)}`}>
                                {variant.research_status}
                              </span>
                            </div>
                            <p className="text-sm text-gray-400">
                              {formatDosage(variant.default_dosage_val, variant.max_dosage_val, variant.unit)}
                            </p>
                            {/* Vote and Comment Counts for Variants */}
                            <div className="mt-1.5 flex items-center gap-3 text-xs text-gray-500">
                              <div className="flex items-center gap-1">
                                <ThumbsUp className="h-3.5 w-3.5 text-emerald-400" />
                                <span>{variant.upvotes_count || 0}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <ThumbsDown className="h-3.5 w-3.5 text-red-400" />
                                <span>{variant.downvotes_count || 0}</span>
                              </div>
                              {(variant.comments_count || 0) > 0 && (
                                <div className="flex items-center gap-1">
                                  <MessageCircle className="h-3.5 w-3.5 text-blue-400" />
                                  <span>{variant.comments_count || 0}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <ChevronRight className="h-5 w-5 text-gray-500" />
                        </button>
                      ))}
                    </div>
                  )}
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {(selectedParent || selectedVariant) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
            onClick={() => {
              setSelectedParent(null)
              setSelectedVariant(null)
              setNewComment("")
            }}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-t-3xl bg-[#0d1f1f] shadow-2xl"
              style={{ maxHeight: "calc(100vh - 80px)" }}
            >
              {/* Scrollable content area */}
              <div 
                className="overflow-y-auto overscroll-contain" 
                style={{ maxHeight: "calc(100vh - 80px)" }}
              >
                <div className="p-6 pb-24">
                  {selectedVariant && selectedParent ? (
                    <>
                      {/* Variant Detail */}
                      <div className="mb-6 flex items-start justify-between">
                        <div>
                          <p className="text-sm text-gray-400">{selectedParent.parent_name_en}</p>
                          <h2 className="text-xl font-bold">{selectedVariant.name_en}</h2>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedParent(null)
                            setSelectedVariant(null)
                            setNewComment("")
                          }}
                          className="rounded-full bg-white/10 p-2 hover:bg-white/20"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="space-y-6">
                        {(selectedVariant.description || selectedVariant.dosing_notes) && (
                          <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-400">{t("description")}</h3>
                            <p className="text-gray-200">{selectedVariant.description || selectedVariant.dosing_notes}</p>
                          </div>
                        )}

                        {/* Dosage Options - Same as Stack Review */}
                        {dosageOptions.length > 0 ? (
                          <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-400">{t("dosageOptions") || "Dosage Options"}</h3>
                            <div className="space-y-2">
                              {dosageOptions.map((option, idx) => {
                                const unit = selectedVariant.unit || ''
                                const unitLower = unit.toLowerCase()
                                const value = option.value
                                
                                // Format dosage display
                                let dosageDisplay = ''
                                if (unitLower === 'g' && value >= 1000) {
                                  const grams = value / 1000
                                  dosageDisplay = grams % 1 === 0 ? `${grams}${unit}` : `${grams.toFixed(1)}${unit}`
                                } else if (unitLower === 'mg' && value < 1 && value > 0) {
                                  dosageDisplay = `${Math.round(value * 1000)}${unit}`
                                } else if (value % 1 === 0) {
                                  dosageDisplay = `${value}${unit}`
                                } else {
                                  dosageDisplay = `${value.toFixed(1)}${unit}`
                                }
                                
                                return (
                                  <div
                                    key={idx}
                                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                                  >
                                    <div className="font-semibold text-white">{option.label}</div>
                                    <div className="mt-1 text-lg font-bold text-teal-400">{dosageDisplay}</div>
                                    {option.description && (
                                      <div className="mt-1 text-xs text-gray-400">{option.description}</div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ) : (
                          <div className="rounded-xl bg-teal-500/10 p-4">
                            <div className="mb-2 flex items-center gap-2 text-teal-400">
                              <CheckCircle className="h-5 w-5" />
                              <span className="font-medium">{t("recommendedDose")}</span>
                            </div>
                            <p className="text-lg font-semibold">
                              {formatDosage(selectedVariant.default_dosage_val, selectedVariant.max_dosage_val, selectedVariant.unit)}
                            </p>
                            {selectedVariant.bioavailability_notes && (
                              <p className="mt-2 text-sm text-gray-300">{selectedVariant.bioavailability_notes}</p>
                            )}
                          </div>
                        )}

                        {/* Suggested Timing */}
                        {suggestedTiming && (
                          <div className="rounded-lg border border-teal-500/30 bg-teal-500/10 p-4">
                            <h3 className="mb-2 text-sm font-medium text-teal-400 flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              Suggested Timing
                            </h3>
                            <p className="text-sm text-teal-300">
                              Best taken: <span className="font-semibold">{suggestedTiming}</span>
                            </p>
                          </div>
                        )}

                        {/* Benefits */}
                        {benefits.length > 0 && (
                          <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-400">{t("benefits") || "Benefits"}</h3>
                            <ul className="space-y-2">
                              {benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-300">
                                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-400" />
                                  <span className="text-sm">{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Usage Notes */}
                        {usageNotes.length > 0 && (
                          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                            <h3 className="mb-2 text-sm font-medium text-amber-400">Usage Instructions</h3>
                            <ul className="space-y-1">
                              {usageNotes.map((note, idx) => (
                                <li key={idx} className="text-sm text-amber-300">{note}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {selectedVariant.interaction_risk_text && (
                          <div>
                            <div className="mb-3 flex items-center gap-2 text-amber-400">
                              <AlertTriangle className="h-5 w-5" />
                              <span className="font-medium">{t("interactions")}</span>
                              <span className={`rounded-full px-2 py-0.5 text-xs ${getStatusColor(selectedVariant.research_status)}`}>
                                {selectedVariant.interaction_risk_level} Risk
                              </span>
                            </div>
                            <p className="text-sm text-gray-300">{selectedVariant.interaction_risk_text}</p>
                          </div>
                        )}

                        {/* Voting Section */}
                        <div className="rounded-xl bg-white/5 p-4">
                          <h3 className="mb-3 text-sm font-medium text-gray-400">Community Feedback</h3>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => vote('upvote')}
                              disabled={votingLoading || !user}
                              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
                                stats.userVote === 'upvote'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-white/10 text-gray-300 hover:bg-white/15'
                              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <ThumbsUp className="h-4 w-4" />
                              <span>{stats.upvotes}</span>
                            </button>
                            <button
                              onClick={() => vote('downvote')}
                              disabled={votingLoading || !user}
                              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
                                stats.userVote === 'downvote'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-white/10 text-gray-300 hover:bg-white/15'
                              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <ThumbsDown className="h-4 w-4" />
                              <span>{stats.downvotes}</span>
                            </button>
                          </div>
                          {!user && (
                            <p className="mt-2 text-xs text-gray-500">Sign in to vote</p>
                          )}
                        </div>

                        {/* Comments Section */}
                        <div className="rounded-xl bg-white/5 p-4">
                          <h3 className="mb-3 text-sm font-medium text-gray-400 flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Comments ({comments.length})
                          </h3>
                          
                          {/* Add Comment */}
                          {user && (
                            <div className="mb-4 flex gap-2">
                              <input
                                type="text"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter' && newComment.trim()) {
                                    const result = await addComment(newComment)
                                    if (!result.error) {
                                      setNewComment("")
                                    }
                                  }
                                }}
                                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none"
                              />
                              <button
                                onClick={async () => {
                                  if (newComment.trim()) {
                                    const result = await addComment(newComment)
                                    if (!result.error) {
                                      setNewComment("")
                                    }
                                  }
                                }}
                                disabled={!newComment.trim() || votingLoading}
                                className="rounded-lg bg-teal-500/20 p-2 text-teal-400 transition-all hover:bg-teal-500/30 disabled:opacity-50"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            </div>
                          )}

                          {/* Comments List */}
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {comments.length === 0 ? (
                              <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
                            ) : (
                              comments.map((comment) => (
                                <div key={comment.id} className="rounded-lg bg-white/5 p-3">
                                  <div className="mb-1 flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-400">
                                      {comment.profiles?.first_name || comment.profiles?.username || 'Anonymous'}
                                    </span>
                                    {user?.id === comment.user_id && (
                                      <button
                                        onClick={() => deleteComment(comment.id)}
                                        className="text-xs text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-200">{comment.content}</p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : selectedParent ? (
                    <>
                      {/* Parent Detail */}
                      <div className="mb-6 flex items-start justify-between">
                        <div>
                          <h2 className="text-xl font-bold">{selectedParent.parent_name_en}</h2>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedParent(null)
                            setSelectedVariant(null)
                            setNewComment("")
                          }}
                          className="rounded-full bg-white/10 p-2 hover:bg-white/20"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="space-y-6">
                        {selectedParent.parent_description && (
                          <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-400">{t("description")}</h3>
                            <p className="text-gray-200">{selectedParent.parent_description}</p>
                          </div>
                        )}

                        {/* Dosage Options - Same as Stack Review */}
                        {dosageOptions.length > 0 ? (
                          <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-400">{t("dosageOptions") || "Dosage Options"}</h3>
                            <div className="space-y-2">
                              {dosageOptions.map((option, idx) => {
                                const unit = parentDosingInfo?.unit || ''
                                const unitLower = unit.toLowerCase()
                                const value = option.value
                                
                                // Format dosage display
                                let dosageDisplay = ''
                                if (unitLower === 'g' && value >= 1000) {
                                  const grams = value / 1000
                                  dosageDisplay = grams % 1 === 0 ? `${grams}${unit}` : `${grams.toFixed(1)}${unit}`
                                } else if (unitLower === 'mg' && value < 1 && value > 0) {
                                  dosageDisplay = `${Math.round(value * 1000)}${unit}`
                                } else if (value % 1 === 0) {
                                  dosageDisplay = `${value}${unit}`
                                } else {
                                  dosageDisplay = `${value.toFixed(1)}${unit}`
                                }
                                
                                return (
                                  <div
                                    key={idx}
                                    className="rounded-xl border border-white/10 bg-white/5 p-3"
                                  >
                                    <div className="font-semibold text-white">{option.label}</div>
                                    <div className="mt-1 text-lg font-bold text-teal-400">{dosageDisplay}</div>
                                    {option.description && (
                                      <div className="mt-1 text-xs text-gray-400">{option.description}</div>
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ) : null}

                        {/* Benefits */}
                        {benefits.length > 0 && (
                          <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-400">{t("benefits") || "Benefits"}</h3>
                            <ul className="space-y-2">
                              {benefits.map((benefit, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-gray-300">
                                  <Check className="mt-0.5 h-4 w-4 flex-shrink-0 text-teal-400" />
                                  <span className="text-sm">{benefit}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Usage Notes */}
                        {usageNotes.length > 0 && (
                          <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                            <h3 className="mb-2 text-sm font-medium text-amber-400">Usage Instructions</h3>
                            <ul className="space-y-1">
                              {usageNotes.map((note, idx) => (
                                <li key={idx} className="text-sm text-amber-300">{note}</li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {(selectedParent.variants as Variant[])?.length > 0 && (
                          <div>
                            <h3 className="mb-3 text-sm font-medium text-gray-400">Variants</h3>
                            <div className="space-y-2">
                              {(selectedParent.variants as Variant[]).map((variant) => (
                                <button
                                  key={variant.id}
                                  onClick={() => setSelectedVariant(variant)}
                                  className="w-full rounded-xl bg-white/5 p-4 text-left transition-colors hover:bg-white/10"
                                >
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <p className="font-medium">{variant.name_en}</p>
                                      <p className="text-sm text-gray-400">
                                        {formatDosage(variant.default_dosage_val, variant.max_dosage_val, variant.unit)}
                                      </p>
                                    </div>
                                    <ChevronRight className="h-5 w-5 text-gray-500" />
                                  </div>
                                </button>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Voting Section */}
                        <div className="rounded-xl bg-white/5 p-4">
                          <h3 className="mb-3 text-sm font-medium text-gray-400">Community Feedback</h3>
                          <div className="flex items-center gap-4">
                            <button
                              onClick={() => vote('upvote')}
                              disabled={votingLoading || !user}
                              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
                                stats.userVote === 'upvote'
                                  ? 'bg-emerald-500/20 text-emerald-400'
                                  : 'bg-white/10 text-gray-300 hover:bg-white/15'
                              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <ThumbsUp className="h-4 w-4" />
                              <span>{stats.upvotes}</span>
                            </button>
                            <button
                              onClick={() => vote('downvote')}
                              disabled={votingLoading || !user}
                              className={`flex items-center gap-2 rounded-lg px-4 py-2 transition-all ${
                                stats.userVote === 'downvote'
                                  ? 'bg-red-500/20 text-red-400'
                                  : 'bg-white/10 text-gray-300 hover:bg-white/15'
                              } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                              <ThumbsDown className="h-4 w-4" />
                              <span>{stats.downvotes}</span>
                            </button>
                          </div>
                          {!user && (
                            <p className="mt-2 text-xs text-gray-500">Sign in to vote</p>
                          )}
                        </div>

                        {/* Comments Section */}
                        <div className="rounded-xl bg-white/5 p-4">
                          <h3 className="mb-3 text-sm font-medium text-gray-400 flex items-center gap-2">
                            <MessageCircle className="h-4 w-4" />
                            Comments ({comments.length})
                          </h3>
                          
                          {/* Add Comment */}
                          {user && (
                            <div className="mb-4 flex gap-2">
                              <input
                                type="text"
                                placeholder="Add a comment..."
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={async (e) => {
                                  if (e.key === 'Enter' && newComment.trim()) {
                                    const result = await addComment(newComment)
                                    if (!result.error) {
                                      setNewComment("")
                                    }
                                  }
                                }}
                                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none"
                              />
                              <button
                                onClick={async () => {
                                  if (newComment.trim()) {
                                    const result = await addComment(newComment)
                                    if (!result.error) {
                                      setNewComment("")
                                    }
                                  }
                                }}
                                disabled={!newComment.trim() || votingLoading}
                                className="rounded-lg bg-teal-500/20 p-2 text-teal-400 transition-all hover:bg-teal-500/30 disabled:opacity-50"
                              >
                                <Send className="h-4 w-4" />
                              </button>
                            </div>
                          )}

                          {/* Comments List */}
                          <div className="space-y-3 max-h-64 overflow-y-auto">
                            {comments.length === 0 ? (
                              <p className="text-sm text-gray-500">No comments yet. Be the first to comment!</p>
                            ) : (
                              comments.map((comment) => (
                                <div key={comment.id} className="rounded-lg bg-white/5 p-3">
                                  <div className="mb-1 flex items-center justify-between">
                                    <span className="text-xs font-medium text-gray-400">
                                      {comment.profiles?.first_name || comment.profiles?.username || 'Anonymous'}
                                    </span>
                                    {user?.id === comment.user_id && (
                                      <button
                                        onClick={() => deleteComment(comment.id)}
                                        className="text-xs text-red-400 hover:text-red-300"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-200">{comment.content}</p>
                                  <p className="mt-1 text-xs text-gray-500">
                                    {new Date(comment.created_at).toLocaleDateString()}
                                  </p>
                                </div>
                              ))
                            )}
                          </div>
                        </div>
                      </div>
                    </>
                  ) : null}

                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      
                      console.log('Add to Stack button clicked')
                      
                      if (!user) {
                        alert("Please sign in to add supplements to your stack")
                        return
                      }

                      const supplement = selectedVariant || selectedParent
                      if (!supplement) {
                        console.warn('No supplement selected')
                        return
                      }

                      // Get supplement ID - use variant if available, otherwise parent
                      const supplementId = selectedVariant 
                        ? selectedVariant.id 
                        : selectedParent?.parent_id

                      if (!supplementId) {
                        alert("Unable to add supplement")
                        return
                      }

                      const supplementName = selectedVariant 
                        ? selectedVariant.name_en 
                        : selectedParent?.parent_name_en || ""
                      
                      console.log('Opening add modal for supplement:', supplementId, 'Name:', supplementName)
                      
                      // Close detail modal first
                      // setSelectedParent(null)
                      // setSelectedVariant(null)
                      
                      // Then open add modal
                      setShowAddModal(true)
                    }}
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3 font-medium transition-all hover:opacity-90 cursor-pointer"
                    type="button"
                  >
                    {t("addToStack")}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add to Stack Modal - Render outside AnimatePresence to avoid conflicts */}
      <AddToStackModal
        isOpen={showAddModal}
        onClose={() => {
          console.log('Closing add modal')
          setShowAddModal(false)
          setParentDosingInfo(null)
        }}
        onConfirm={async (scheduleBlock, customDosage) => {
          const supplement = selectedVariant || selectedParent
          if (!supplement) {
            console.warn('No supplement when confirming')
            return
          }

          const supplementId = selectedVariant 
            ? selectedVariant.id 
            : selectedParent?.parent_id

          if (!supplementId) {
            alert("Unable to add supplement")
            return
          }

          console.log('Adding to stack:', supplementId, scheduleBlock, customDosage)

          const result = await addToStack(supplementId, scheduleBlock, customDosage)
          
          if (result.error) {
            alert(result.error)
          } else {
            const supplementName = selectedVariant 
              ? selectedVariant.name_en 
              : selectedParent?.parent_name_en || ""
            analytics.addToStack(supplementName)
            alert(t("addedToStack") || "Added to your stack!")
            setSelectedParent(null)
            setSelectedVariant(null)
            setShowAddModal(false)
            setParentDosingInfo(null)
          }
        }}
        supplementId={selectedVariant 
          ? selectedVariant.id 
          : selectedParent?.parent_id || 0}
        supplementName={selectedVariant 
          ? selectedVariant.name_en 
          : selectedParent?.parent_name_en || ""}
        defaultDosageVal={selectedVariant 
          ? selectedVariant.default_dosage_val 
          : parentDosingInfo?.dosing_base_val || null}
        maxDosageVal={selectedVariant 
          ? selectedVariant.max_dosage_val 
          : parentDosingInfo?.dosing_max_val || null}
        unit={selectedVariant 
          ? selectedVariant.unit 
          : parentDosingInfo?.unit || null}
      />
    </div>
  )
}
