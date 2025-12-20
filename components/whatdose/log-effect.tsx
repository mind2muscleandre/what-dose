"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Activity, CheckCircle, XCircle, ArrowRight } from "lucide-react"
import { useTranslation, type Language } from "@/lib/translations"
import { useRouter } from "next/navigation"

interface EffectLog {
  id: string
  supplement: string
  effect: "positive" | "negative"
  intensity: number
  notes: string
  date: string
}

export function LogEffect() {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)
  const [selectedSupplement, setSelectedSupplement] = useState("")
  const [effect, setEffect] = useState<"positive" | "negative">("positive")
  const [intensity, setIntensity] = useState(5)
  const [notes, setNotes] = useState("")
  const [stackItems, setStackItems] = useState<Array<{ id: string; name: string }>>([])

  useEffect(() => {
    const stored = localStorage.getItem("language") as Language
    if (stored) setLanguage(stored)

    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLanguage(e.detail)
    }

    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener)
  }, [])

  useEffect(() => {
    // Load stack items for dropdown
    const stored = localStorage.getItem("userStack")
    if (stored) {
      try {
        const items = JSON.parse(stored)
        setStackItems(items.map((item: { id: string; name: string }) => ({ id: item.id, name: item.name })))
      } catch (e) {
        console.error("Failed to load stack:", e)
      }
    }
  }, [])

  const handleSubmit = () => {
    if (!selectedSupplement) return

    const newLog: EffectLog = {
      id: Date.now().toString(),
      supplement: selectedSupplement,
      effect,
      intensity,
      notes,
      date: new Date().toISOString(),
    }

    // Save to localStorage
    const existingLogs = JSON.parse(localStorage.getItem("effectLogs") || "[]")
    existingLogs.push(newLog)
    localStorage.setItem("effectLogs", JSON.stringify(existingLogs))

    // Reset form
    setSelectedSupplement("")
    setEffect("positive")
    setIntensity(5)
    setNotes("")

    // Show success feedback
    alert(t("effectLogged") || "Effect logged successfully!")
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1f1f] via-[#0a1a1a] to-[#0a0f0f] pb-24 text-white">
      <div className="mx-auto max-w-md px-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="mb-2 text-2xl font-bold">{t("logEffect")}</h1>
          <p className="text-sm text-gray-400">
            {t("logEffectDescription") || "Track how supplements affect you"}
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Supplement Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <label className="mb-2 block text-sm font-medium text-gray-400">
              {t("selectSupplement") || "Select Supplement"}
            </label>
            {stackItems.length === 0 ? (
              <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-center">
                <p className="mb-3 text-sm text-gray-400">
                  {t("noSupplementsInStack") || "No supplements in your stack"}
                </p>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push("/stack")}
                  className="rounded-xl bg-teal-500/20 px-4 py-2 text-sm font-medium text-teal-400 hover:bg-teal-500/30"
                >
                  {t("goToStack") || "Go to My Stack"}
                </motion.button>
              </div>
            ) : (
              <select
                value={selectedSupplement}
                onChange={(e) => setSelectedSupplement(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white focus:border-teal-500 focus:outline-none"
              >
                <option value="">{t("selectSupplement") || "Select Supplement"}</option>
                {stackItems.map((item) => (
                  <option key={item.id} value={item.name}>
                    {item.name}
                  </option>
                ))}
              </select>
            )}
          </motion.div>

          {/* Effect Type */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <label className="mb-3 block text-sm font-medium text-gray-400">
              {t("effectType") || "Effect Type"}
            </label>
            <div className="grid grid-cols-2 gap-3">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setEffect("positive")}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 transition-all ${
                  effect === "positive"
                    ? "border-emerald-500 bg-emerald-500/20 text-emerald-400"
                    : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                }`}
              >
                <CheckCircle className="h-5 w-5" />
                {t("positive") || "Positive"}
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setEffect("negative")}
                className={`flex items-center justify-center gap-2 rounded-xl border-2 py-3 transition-all ${
                  effect === "negative"
                    ? "border-red-500 bg-red-500/20 text-red-400"
                    : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                }`}
              >
                <XCircle className="h-5 w-5" />
                {t("negative") || "Negative"}
              </motion.button>
            </div>
          </motion.div>

          {/* Intensity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <label className="mb-3 block text-sm font-medium text-gray-400">
              {t("intensity") || "Intensity"} ({intensity}/10)
            </label>
            <input
              type="range"
              min="1"
              max="10"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full accent-teal-500"
            />
            <div className="mt-2 flex justify-between text-xs text-gray-500">
              <span>1</span>
              <span>5</span>
              <span>10</span>
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <label className="mb-2 block text-sm font-medium text-gray-400">
              {t("notes") || "Notes"}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none"
              placeholder={t("addNotes") || "Add any additional notes..."}
            />
          </motion.div>

          {/* Submit Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            disabled={!selectedSupplement}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-4 font-medium transition-all hover:opacity-90 disabled:opacity-50"
          >
            <Activity className="h-5 w-5" />
            {t("logEffect") || "Log Effect"}
            <ArrowRight className="h-5 w-5" />
          </motion.button>
        </div>
      </div>
    </div>
  )
}

