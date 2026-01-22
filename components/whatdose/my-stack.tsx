"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, Trash2, Edit2, Clock, Pill, RefreshCw } from "lucide-react"
import { useTranslation, type Language } from "@/lib/translations"
import { useAuth } from "@/contexts/auth-context"
import { useUserStack } from "@/hooks/use-user-stack"
import { useSafetyEngine } from "@/hooks/use-safety-engine"
import { SafetyWarnings } from "./safety-warnings"
import { analytics } from "@/lib/analytics"
import { useProfile } from "@/hooks/use-profile"
import { generateTimelineFromStack } from "@/lib/generate-timeline-from-stack"
import { StackBlocks } from "./stack-blocks"
import type { TimelineBlock } from "@/lib/whatdose-data"

export function MyStack() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)
  const { stackItems, loading, error, removeFromStack, updateStackItem } = useUserStack(user?.id || null)
  const { warnings, dosageWarnings, checkInteractions, checkDosages } = useSafetyEngine(user?.id || null)
  const { profile } = useProfile(user?.id || null)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editForm, setEditForm] = useState<{ schedule_block?: string; custom_dosage_val?: number }>({})
  const [showReplaceConfirm, setShowReplaceConfirm] = useState(false)
  const [syncingTimeline, setSyncingTimeline] = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null)
  
  // Show "Create New Stack" if user has completed onboarding (even if stack is empty)
  const showCreateNewStack = profile?.onboarding_completed || stackItems.length > 0
  
  const handleSyncTimeline = async () => {
    if (!user?.id) return
    setSyncingTimeline(true)
    try {
      const { error } = await generateTimelineFromStack(user.id)
      if (error) {
        alert(`Error syncing timeline: ${error.message}`)
      } else {
        alert("Timeline synced successfully! Refresh the page to see your tasks.")
      }
    } catch (error) {
      alert(`Error: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSyncingTimeline(false)
    }
  }

  // Check interactions and dosages when stack changes
  useEffect(() => {
    if (stackItems.length > 0) {
      const supplementIds = stackItems.map(item => item.supplement_id)
      checkInteractions(supplementIds)
      
      // Check for high dosages
      checkDosages(stackItems.map(item => ({
        supplement_id: item.supplement_id,
        custom_dosage_val: item.custom_dosage_val,
        unit: item.unit,
        dosing_max_val: item.dosing_max_val,
      })))
    } else {
      checkDosages([])
    }
  }, [stackItems, checkInteractions, checkDosages])

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const stored = localStorage.getItem("language") as Language
    if (stored) setLanguage(stored)

    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLanguage(e.detail)
    }

    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener)
  }, [])

  const handleDelete = async (id: number) => {
    const item = stackItems.find(i => i.id === id)
    if (!item) return
    
    const confirmed = window.confirm(
      t("confirmDeleteSupplement") || 
      `Are you sure you want to remove ${item.supplement_name} from your stack?`
    )
    
    if (!confirmed) return
    
    const result = await removeFromStack(id)
    if (result.error) {
      alert(result.error)
    } else if (item) {
      analytics.removeFromStack(item.supplement_name)
      setDeleteConfirmId(null)
    }
  }

  const handleEdit = (item: typeof stackItems[0]) => {
    setEditingId(item.id)
    setEditForm({
      schedule_block: item.schedule_block,
      custom_dosage_val: item.custom_dosage_val || undefined,
    })
  }

  const handleSaveEdit = async () => {
    if (!editingId) return
    const result = await updateStackItem(editingId, editForm)
    if (result.error) {
      alert(result.error)
    } else {
      setEditingId(null)
      setEditForm({})
    }
  }

  const handleCancelEdit = () => {
    setEditingId(null)
    setEditForm({})
  }

  const formatDosage = (item: typeof stackItems[0]) => {
    if (item.custom_dosage_val) {
      return `${item.custom_dosage_val}${item.unit || ''}`
    }
    if (item.dosing_base_val && item.dosing_max_val && item.dosing_base_val !== item.dosing_max_val) {
      return `${item.dosing_base_val}-${item.dosing_max_val}${item.unit || ''}`
    }
    if (item.dosing_base_val) {
      return `${item.dosing_base_val}${item.unit || ''}`
    }
    return "Dosage not specified"
  }

  // Convert stackItems to TimelineBlock format (same as Dashboard)
  const timelineBlocks: TimelineBlock[] = (() => {
    const scheduleBlockConfig: Record<string, { blockId: string; title: string; suggestedTime: string; uiColorHex: string }> = {
      Morning: { blockId: "morning_routine", title: "Morning", suggestedTime: "08:00", uiColorHex: "#f59e0b" },
      Lunch: { blockId: "lunch", title: "Lunch", suggestedTime: "12:00", uiColorHex: "#10b981" },
      "Pre-Workout": { blockId: "pre_workout", title: "Pre-Workout", suggestedTime: "17:00", uiColorHex: "#ef4444" },
      "Post-Workout": { blockId: "post_workout", title: "Post-Workout", suggestedTime: "18:00", uiColorHex: "#8b5cf6" },
      Dinner: { blockId: "dinner", title: "Dinner", suggestedTime: "19:00", uiColorHex: "#3b82f6" },
      Bedtime: { blockId: "bedtime", title: "Bedtime", suggestedTime: "22:00", uiColorHex: "#6366f1" },
    }

    // Group items by schedule_block
    const groupedByTime = stackItems.reduce((acc, item) => {
      if (!acc[item.schedule_block]) acc[item.schedule_block] = []
      acc[item.schedule_block].push(item)
      return acc
    }, {} as Record<string, typeof stackItems>)

    // Convert to TimelineBlock format
    return Object.entries(groupedByTime).map(([scheduleBlock, items]) => {
      const config = scheduleBlockConfig[scheduleBlock] || {
        blockId: scheduleBlock.toLowerCase().replace(/\s+/g, '_'),
        title: scheduleBlock,
        suggestedTime: "08:00",
        uiColorHex: "#0ea5e9"
      }

      return {
        block_id: config.blockId,
        title: config.title,
        subtitle: "",
        icon_key: "pill",
        ui_color_hex: config.uiColorHex,
        suggested_time: config.suggestedTime,
        items: items.map(item => ({
          item_id: item.id.toString(),
          name: item.supplement_name,
          dosage_display: formatDosage(item),
          form: "pill",
          is_completed: false, // Not used in stack view
          notes: "",
          critical_instruction: null,
        }))
      }
    })
  })()

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1f1f]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500/30 border-t-teal-500" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1f1f] text-white">
        <div className="text-center">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1f1f] via-[#0a1a1a] to-[#0a0f0f] pb-24 text-white">
      <div className="mx-auto max-w-md px-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 space-y-3"
        >
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">{t("myStack")}</h1>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/library")}
              className="flex items-center gap-2 rounded-xl bg-teal-500/20 px-4 py-2 text-sm font-medium text-teal-400 hover:bg-teal-500/30"
            >
              <Plus className="h-4 w-4" />
              {t("addSupplement") || "Add Supplement"}
            </motion.button>
          </div>
          
          {/* Action Buttons */}
          <div className="flex gap-2">
            {/* Sync Timeline Button - Show if stack has items */}
            {stackItems.length > 0 && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSyncTimeline}
                disabled={syncingTimeline}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10 disabled:opacity-50"
              >
                {syncingTimeline ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Syncing...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4" />
                    Sync to Tasks
                  </>
                )}
              </motion.button>
            )}
            
            {/* Create New Stack Button - Show if user has completed onboarding */}
            {showCreateNewStack && (
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  if (stackItems.length > 0) {
                    setShowReplaceConfirm(true)
                  } else {
                    // If stack is empty, go directly to quick stack builder
                    router.push("/onboarding?createNewStack=true")
                  }
                }}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
              >
                <RefreshCw className="h-4 w-4" />
                {stackItems.length > 0 ? t("createNewStack") : t("createNewStackButton")}
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Replace Confirmation Dialog - Only show if stack has items */}
        {showReplaceConfirm && stackItems.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
            onClick={() => setShowReplaceConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a1a1a] p-6 text-white"
            >
              <h3 className="mb-2 text-lg font-bold">{t("createNewStack")}</h3>
              <p className="mb-4 text-sm text-gray-400">{t("replacingCurrentStack")}</p>
              
              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    setShowReplaceConfirm(false)
                    router.push("/onboarding?createNewStack=true")
                  }}
                  className="w-full rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3 text-sm font-medium"
                >
                  {t("continue")}
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowReplaceConfirm(false)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 text-sm font-medium"
                >
                  {t("cancel")}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {stackItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center"
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <Pill className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-300">
              {t("emptyStack") || "Your stack is empty"}
            </h3>
            <p className="mb-6 text-sm text-gray-400">
              {t("emptyStackDescription") || "Add supplements from the library to get started"}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/library")}
              className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 font-medium"
            >
              {t("browseLibrary") || "Browse Library"}
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Safety Warnings */}
            <SafetyWarnings 
              warnings={warnings} 
              dosageWarnings={dosageWarnings}
              onFixDosage={async (supplementId, maxSafeDosage) => {
                // Find the stack item with this supplement
                const item = stackItems.find(i => i.supplement_id === supplementId)
                if (!item) return
                
                // Update to max safe dosage
                const result = await updateStackItem(item.id, { custom_dosage_val: maxSafeDosage })
                if (result.error) {
                  alert(result.error)
                } else {
                  // Success - the warning should disappear after state updates
                }
              }}
            />

            {/* Stack Blocks - Same layout as Dashboard */}
            <StackBlocks
              blocks={timelineBlocks}
              onEdit={(itemId) => {
                const item = stackItems.find(i => i.id.toString() === itemId)
                if (item) handleEdit(item)
              }}
              onDelete={(itemId) => {
                const item = stackItems.find(i => i.id.toString() === itemId)
                if (item) handleDelete(item.id)
              }}
              editingId={editingId?.toString() || null}
            />

            {/* Edit Modal - Show when editing */}
            {editingId && (() => {
              const item = stackItems.find(i => i.id === editingId)
              if (!item) return null
              
              return (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
                  onClick={handleCancelEdit}
                >
                  <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={(e) => e.stopPropagation()}
                    className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a1a1a] p-6 text-white"
                  >
                    <h3 className="mb-4 text-lg font-bold">Edit Supplement</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="mb-1 block text-sm text-gray-400">Supplement</label>
                        <p className="text-white">{item.supplement_name}</p>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm text-gray-400">Timing</label>
                        <select
                          value={editForm.schedule_block || item.schedule_block}
                          onChange={(e) => setEditForm({ ...editForm, schedule_block: e.target.value })}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
                        >
                          {["Morning", "Lunch", "Pre-Workout", "Post-Workout", "Dinner", "Bedtime"].map(time => (
                            <option key={time} value={time} className="bg-[#0d1f1f]">{time}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="mb-1 block text-sm text-gray-400">Dosage ({item.unit || 'mg'})</label>
                        <input
                          type="number"
                          value={editForm.custom_dosage_val ?? item.custom_dosage_val ?? ''}
                          onChange={(e) => setEditForm({ ...editForm, custom_dosage_val: e.target.value ? parseFloat(e.target.value) : undefined })}
                          className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none"
                          placeholder={`Custom dosage (${item.unit || 'mg'})`}
                        />
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleSaveEdit}
                          className="flex-1 rounded-xl bg-teal-500 py-2 text-sm font-medium"
                        >
                          {t("save") || "Save"}
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="flex-1 rounded-xl border border-white/10 bg-white/5 py-2 text-sm font-medium"
                        >
                          {t("cancel") || "Cancel"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>
              )
            })()}
          </div>
        )}
      </div>
    </div>
  )
}

