"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Copy, Heart, MessageCircle, Share2, User, Plus, X } from "lucide-react"
import { useTranslation, type Language } from "@/lib/translations"
import { useAuth } from "@/contexts/auth-context"
import { useCommunityStacks } from "@/hooks/use-community-stacks"
import { useUserStack } from "@/hooks/use-user-stack"
import { analytics } from "@/lib/analytics"
import { supabase } from "@/lib/supabase"

export function Community() {
  const router = useRouter()
  const { user } = useAuth()
  const { stacks, loading, error, toggleLike, shareStack, refreshStacks } = useCommunityStacks(user?.id || null)
  const { stackItems, loading: stackLoading, addToStack } = useUserStack(user?.id || null)
  const [lang, setLang] = useState<Language>("en")
  const { t } = useTranslation(lang)
  const [showShareModal, setShowShareModal] = useState(false)
  const [shareTitle, setShareTitle] = useState("")
  const [shareDescription, setShareDescription] = useState("")
  const [shareResult, setShareResult] = useState("")
  const [sharing, setSharing] = useState(false)

  useEffect(() => {
    const storedLang = localStorage.getItem("language") as Language
    if (storedLang) setLang(storedLang)

    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLang(e.detail)
    }

    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener)
  }, [])

  const handleCloneStack = async (stack: typeof stacks[0]) => {
    if (!user) {
      alert(t("pleaseSignIn") || "Please sign in to clone stacks")
      router.push('/auth/login')
      return
    }

    analytics.cloneStack(stack.id)

    try {
      let successCount = 0
      let errorCount = 0
      const errors: string[] = []

      // Clone each supplement from the community stack
      for (const supplement of stack.supplements) {
        try {
          // Search for supplement by name
          const { data: supplementData, error: searchError } = await supabase
            .from('supplements')
            .select('id, name_en')
            .eq('is_parent', true)
            .ilike('name_en', `%${supplement.name}%`)
            .limit(1)
            .single()

          if (searchError || !supplementData) {
            errorCount++
            errors.push(`${supplement.name}: ${t("notFoundInDatabase") || "Not found in database"}`)
            continue
          }

          // Parse dosage from string (e.g., "5g" -> 5, "200mg" -> 200)
          const dosageMatch = supplement.dosage.match(/(\d+(?:\.\d+)?)\s*(mg|g|mcg|IU|ml|tabs|caps)/i)
          const dosageValue = dosageMatch ? parseFloat(dosageMatch[1]) : null
          const unit = dosageMatch ? dosageMatch[2].toLowerCase() : null

          // Convert to mg if needed for custom_dosage_val
          let customDosage: number | undefined = undefined
          if (dosageValue) {
            if (unit === 'g') {
              customDosage = dosageValue * 1000 // Convert g to mg
            } else if (unit === 'mg') {
              customDosage = dosageValue
            } else if (unit === 'mcg') {
              customDosage = dosageValue / 1000 // Convert mcg to mg
            }
          }

          // Add to stack with default schedule (Morning)
          const result = await addToStack(supplementData.id, 'Morning', customDosage)
          
          if (result.error) {
            errorCount++
            errors.push(`${supplement.name}: ${result.error}`)
          } else {
            successCount++
          }
        } catch (err) {
          errorCount++
          errors.push(`${supplement.name}: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
      }

      // Show results
      if (successCount > 0) {
        const message = errorCount > 0
          ? `${t("clonedStackPartial") || `Cloned ${successCount} supplement(s). ${errorCount} failed.`}\n\n${errors.join('\n')}`
          : t("clonedStackSuccess") || `Successfully cloned ${successCount} supplement(s) to your stack!`
        alert(message)
        router.push('/stack')
      } else {
        alert(t("clonedStackFailed") || `Failed to clone stack:\n\n${errors.join('\n')}`)
      }
    } catch (err) {
      console.error('Error cloning stack:', err)
      alert(t("errorCloningStack") || `Error cloning stack: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  const handleShareMyStack = async () => {
    if (!user) {
      alert(t("pleaseSignIn") || "Please sign in to share your stack")
      router.push('/auth/login')
      return
    }

    if (stackItems.length === 0) {
      alert(t("emptyStackCannotShare") || "Your stack is empty. Add supplements to your stack first.")
      return
    }

    if (!shareTitle.trim()) {
      alert(t("shareTitleRequired") || "Please enter a title for your stack")
      return
    }

    setSharing(true)
    try {
      // Format supplements from user_stacks
      const supplements = stackItems.map(item => {
        const dosage = item.custom_dosage_val || item.dosing_base_val || 0
        const unit = item.unit || ''
        return {
          name: item.supplement_name,
          dosage: `${dosage}${unit}`
        }
      })

      const { data, error: shareError } = await supabase
        .from('community_stacks')
        .insert({
          user_id: user.id,
          title: shareTitle.trim(),
          description: shareDescription.trim() || null,
          result_description: shareResult.trim() || null,
          supplements: supplements,
          is_public: true,
          likes_count: 0,
          comments_count: 0,
        })
        .select()
        .single()

      if (shareError) throw shareError

      // Reset form
      setShareTitle("")
      setShareDescription("")
      setShareResult("")
      setShowShareModal(false)

      // Refresh stacks list
      if (refreshStacks) {
        refreshStacks()
      }

      alert(t("stackSharedSuccessfully") || "Your stack has been shared successfully!")
      analytics.shareStack(data.id)
    } catch (err) {
      console.error('Error sharing stack:', err)
      alert(err instanceof Error ? err.message : t("errorSharingStack") || "Failed to share stack")
    } finally {
      setSharing(false)
    }
  }

  if (loading) {
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
      <div className="px-4 pt-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">{t("communityTitle")}</h1>
            <p className="text-gray-400">{t("discoverStacks")}</p>
          </div>
          {user && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-2 text-sm font-medium text-white transition-all hover:opacity-90"
            >
              <Plus className="h-4 w-4" />
              {t("shareYourStack") || "Share Your Stack"}
            </motion.button>
          )}
        </div>

        {stacks.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No community stacks yet. Be the first to share!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stacks.map((stack, i) => (
              <motion.div
                key={stack.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-white/5 p-4"
              >
                {/* Author */}
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-purple-500">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="font-medium">{stack.author_name}</p>
                    <p className="text-sm text-gray-400">{stack.title}</p>
                  </div>
                </div>

                {/* Result */}
                {stack.result_description && (
                  <div className="mb-4 rounded-xl bg-emerald-500/10 px-4 py-3">
                    <p className="text-sm text-emerald-400">
                      {t("result")}: {stack.result_description}
                    </p>
                  </div>
                )}

                {/* Description */}
                {stack.description && (
                  <p className="mb-4 text-sm text-gray-300">{stack.description}</p>
                )}

                {/* Supplements */}
                <div className="mb-4 space-y-2">
                  {stack.supplements.map((sup, j) => (
                    <div key={j} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2">
                      <span className="text-sm">{sup.name}</span>
                      <span className="text-sm text-gray-400">{sup.dosage}</span>
                    </div>
                  ))}
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleLike(stack.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        stack.is_liked ? "text-pink-400" : "text-gray-400 hover:text-pink-400"
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${stack.is_liked ? "fill-current" : ""}`} />
                      <span className="text-sm">{stack.likes_count}</span>
                    </motion.button>
                    <button className="flex items-center gap-1 text-gray-400 hover:text-teal-400">
                      <MessageCircle className="h-5 w-5" />
                      <span className="text-sm">{stack.comments_count}</span>
                    </button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => shareStack(stack)}
                      className="text-gray-400 hover:text-white"
                    >
                      <Share2 className="h-5 w-5" />
                    </motion.button>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleCloneStack(stack)}
                    className="flex items-center gap-2 rounded-lg bg-teal-500/20 px-3 py-2 text-sm font-medium text-teal-400 hover:bg-teal-500/30"
                  >
                    <Copy className="h-4 w-4" />
                    {t("cloneStack")}
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Share Stack Modal */}
      <AnimatePresence>
        {showShareModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => !sharing && setShowShareModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0d1f1f] p-6 shadow-2xl"
            >
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-xl font-bold">{t("shareYourStack") || "Share Your Stack"}</h2>
                <button
                  onClick={() => setShowShareModal(false)}
                  disabled={sharing}
                  className="rounded-full bg-white/10 p-2 hover:bg-white/20 disabled:opacity-50"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    {t("stackTitle") || "Stack Title"} <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={shareTitle}
                    onChange={(e) => setShareTitle(e.target.value)}
                    placeholder={t("stackTitlePlaceholder") || "e.g., My Hypertrophy Stack"}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none"
                    disabled={sharing}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    {t("description") || "Description"} ({t("optional") || "Optional"})
                  </label>
                  <textarea
                    value={shareDescription}
                    onChange={(e) => setShareDescription(e.target.value)}
                    placeholder={t("stackDescriptionPlaceholder") || "Describe your stack and why you use it..."}
                    rows={3}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none"
                    disabled={sharing}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-gray-300">
                    {t("results") || "Results"} ({t("optional") || "Optional"})
                  </label>
                  <textarea
                    value={shareResult}
                    onChange={(e) => setShareResult(e.target.value)}
                    placeholder={t("stackResultsPlaceholder") || "What results have you achieved with this stack?"}
                    rows={2}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none"
                    disabled={sharing}
                  />
                </div>

                <div className="rounded-lg bg-teal-500/10 p-3">
                  <p className="text-xs text-gray-400 mb-2">{t("stackPreview") || "Your stack includes:"}</p>
                  <div className="space-y-1">
                    {stackItems.slice(0, 5).map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-300">
                        • {item.supplement_name} {item.custom_dosage_val || item.dosing_base_val}{item.unit}
                      </div>
                    ))}
                    {stackItems.length > 5 && (
                      <div className="text-sm text-gray-400">
                        + {stackItems.length - 5} {t("moreSupplements") || "more supplements"}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-3">
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowShareModal(false)}
                    disabled={sharing}
                    className="flex-1 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-medium transition-all hover:bg-white/10 disabled:opacity-50"
                  >
                    {t("cancel") || "Cancel"}
                  </motion.button>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={handleShareMyStack}
                    disabled={sharing || !shareTitle.trim()}
                    className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-4 py-3 text-sm font-medium text-white transition-all hover:opacity-90 disabled:opacity-50"
                  >
                    {sharing ? t("sharing") || "Sharing..." : t("share") || "Share"}
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
