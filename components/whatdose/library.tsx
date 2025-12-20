"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Search, X, ChevronRight, AlertTriangle, CheckCircle, Beaker, ChevronDown, Heart, Dumbbell, Brain, Moon, Zap, Activity, Shield, Pill } from "lucide-react"
import { useTranslation, type Language } from "@/lib/translations"
import { supabase } from "@/lib/supabase"
import { useAuth } from "@/contexts/auth-context"
import { useUserStack } from "@/hooks/use-user-stack"
import { analytics } from "@/lib/analytics"
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
              parent_id
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
                  category_ids: v.category_ids
                })
                variantsByParent.set(v.parent_id, existing)
              }
            })

            data = categoryData.map(s => ({
              parent_id: s.id,
              parent_name_en: s.name_en || '',
              parent_name_sv: s.name_sv,
              parent_description: s.dosing_notes,
              parent_research_status: s.research_status as "Green" | "Blue" | "Red",
              parent_category_ids: s.category_ids,
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
          
          // Enhance search results with category_ids from database
          if (searchData) {
            const parentIds = searchData.map((s: any) => s.parent_id)
            const { data: parentData } = await supabase
              .from('supplements')
              .select('id, category_ids')
              .in('id', parentIds)
            
            const categoryMap = new Map<number, number[]>()
            parentData?.forEach(p => {
              if (p.category_ids) {
                categoryMap.set(p.id, p.category_ids)
              }
            })
            
            data = searchData.map((s: any) => ({
              ...s,
              parent_category_ids: categoryMap.get(s.parent_id) || null
            }))
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
              parent_id
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
                  category_ids: v.category_ids
                })
                variantsByParent.set(v.parent_id, existing)
              }
            })

            data = allData.map(s => ({
              parent_id: s.id,
              parent_name_en: s.name_en || '',
              parent_name_sv: s.name_sv,
              parent_description: s.dosing_notes,
              parent_research_status: s.research_status as "Green" | "Blue" | "Red",
              parent_category_ids: s.category_ids,
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
                          }}
                          className="rounded-full bg-white/10 p-2 hover:bg-white/20"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>

                      <div className="space-y-6">
                        {selectedVariant.dosing_notes && (
                          <div>
                            <h3 className="mb-2 text-sm font-medium text-gray-400">{t("description")}</h3>
                            <p className="text-gray-200">{selectedVariant.dosing_notes}</p>
                          </div>
                        )}

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
                      </div>
                    </>
                  ) : null}

                  <button
                    onClick={async () => {
                      if (!user) {
                        alert("Please sign in to add supplements to your stack")
                        return
                      }

                      const supplement = selectedVariant || selectedParent
                      if (!supplement) return

                      // Get supplement ID
                      const supplementId = selectedVariant 
                        ? selectedVariant.id 
                        : selectedParent?.parent_id

                      if (!supplementId) {
                        alert("Unable to add supplement")
                        return
                      }

                      // Add to stack (default to Morning schedule)
                      const result = await addToStack(supplementId, "Morning")
                      
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
                      }
                    }}
                    className="mt-6 w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3 font-medium transition-all hover:opacity-90"
                  >
                    {t("addToStack")}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
