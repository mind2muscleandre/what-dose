"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { X, Clock } from "lucide-react"
import { useTranslation, type Language } from "@/lib/translations"
import { supabase } from "@/lib/supabase"
import { useProfile } from "@/hooks/use-profile"
import { useAuth } from "@/contexts/auth-context"
import { calculateDosageOptions, suggestTiming } from "@/lib/supplement-info-helper"

interface AddToStackModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (scheduleBlock: string, customDosage: number | undefined) => void
  supplementId: number
  supplementName: string
  defaultDosageVal: number | null
  maxDosageVal: number | null
  unit: string | null
  categoryIds?: number[] | null
}

export function AddToStackModal({
  isOpen,
  onClose,
  onConfirm,
  supplementId,
  supplementName,
  defaultDosageVal,
  maxDosageVal,
  unit,
  categoryIds,
}: AddToStackModalProps) {
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)
  const [scheduleBlock, setScheduleBlock] = useState("Morning")
  const [selectedDose, setSelectedDose] = useState<{ label: string; value: number; description: string } | null>(null)
  const [customDosage, setCustomDosage] = useState<string>("")
  const [doseOptions, setDoseOptions] = useState<{ label: string; value: number; description: string }[]>([])
  const { user } = useAuth()
  const { profile } = useProfile(user?.id || null)

  useEffect(() => {
    const stored = localStorage.getItem("language") as Language
    if (stored) setLanguage(stored)

    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLanguage(e.detail)
    }

    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener)
  }, [])

  const userWeight = profile?.weight_kg || null

  // Calculate dose options and suggested timing when supplement data changes
  useEffect(() => {
    if (!isOpen) {
      // Reset when modal closes
      setDoseOptions([])
      setSelectedDose(null)
      setCustomDosage("")
      setScheduleBlock("Morning")
      return
    }
    
    let cancelled = false
    
    const loadSupplementInfo = async () => {
      try {
        // If dosage data is missing, try to fetch it from the database
        let finalDefaultDose = defaultDosageVal
        let finalMaxDose = maxDosageVal
        let finalUnit = unit
        
        if ((!finalDefaultDose || !finalUnit) && supplementId) {
          // Fetch dosing info from database
          const { data: supplementData, error } = await supabase
            .from('supplements')
            .select('dosing_base_val, dosing_max_val, unit')
            .eq('id', supplementId)
            .maybeSingle()
          
          if (!cancelled && !error && supplementData) {
            finalDefaultDose = supplementData.dosing_base_val
            finalMaxDose = supplementData.dosing_max_val
            finalUnit = supplementData.unit
          }
        }
        
        // Load dosage options
        const options = await calculateDosageOptions(
          finalDefaultDose,
          finalMaxDose,
          finalUnit,
          supplementName,
          userWeight,
          t
        )
        
        if (cancelled) return
        
        setDoseOptions(options)
        // Set default to standard dose
        if (options.length > 0) {
          setSelectedDose(options[0])
        } else {
          setSelectedDose(null)
        }
        
        // Load suggested timing
        const timing = await suggestTiming(supplementName, categoryIds || null)
        if (cancelled) return
        setScheduleBlock(timing)
      } catch (err) {
        if (cancelled) return
        console.error('Error loading supplement info:', err)
        setDoseOptions([])
        setSelectedDose(null)
      }
    }

    loadSupplementInfo()
    
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [defaultDosageVal, maxDosageVal, unit, supplementName, userWeight, isOpen, categoryIds, supplementId])

  const handleConfirm = () => {
    let finalDosage: number | undefined = undefined

    if (customDosage && customDosage.trim() !== "") {
      const parsed = parseFloat(customDosage)
      if (!isNaN(parsed) && parsed > 0) {
        finalDosage = parsed
      }
    } else if (selectedDose) {
      finalDosage = selectedDose.value
    }

    onConfirm(scheduleBlock, finalDosage)
  }

  const scheduleBlocks = ["Morning", "Lunch", "Pre-Workout", "Post-Workout", "Dinner", "Bedtime"]

  if (!isOpen) {
    return null
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md rounded-2xl border border-white/10 bg-[#0a1a1a] p-6 text-white"
      >
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">Add to Stack</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Supplement Name */}
        <div className="mb-6">
          <p className="text-lg font-semibold text-teal-400">{supplementName}</p>
        </div>

        {/* Schedule Block Selection */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-400">
            <Clock className="inline h-4 w-4 mr-1" />
            Timing
          </label>
          <select
            value={scheduleBlock}
            onChange={(e) => setScheduleBlock(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white focus:border-teal-500 focus:outline-none"
          >
            {scheduleBlocks.map(block => (
              <option key={block} value={block} className="bg-[#0d1f1f]">
                {block}
              </option>
            ))}
          </select>
        </div>

        {/* Dosage Selection */}
        {doseOptions.length > 0 ? (
          <div className="mb-6">
            <label className="mb-2 block text-sm font-medium text-gray-400">
              Dosage ({unit || 'mg'})
            </label>
            <div className="space-y-2">
              {doseOptions.map((option, index) => (
                <motion.button
                  key={index}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setSelectedDose(option)
                    setCustomDosage("")
                  }}
                  className={`w-full rounded-xl border-2 p-3 text-left transition-all ${
                    selectedDose?.value === option.value && !customDosage
                      ? "border-teal-500 bg-teal-500/20"
                      : "border-white/10 bg-white/5 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{option.label}</span>
                    {index === 0 && (
                      <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-xs font-medium text-teal-400">
                        (recommended)
                      </span>
                    )}
                  </div>
                  <div className="mt-1 text-lg font-bold text-teal-400">
                    {(() => {
                      const value = option.value
                      const unitLower = (unit || 'mg').toLowerCase()
                      
                      // Format dosage display (same as Stack Review)
                      if (unitLower === 'g' && value >= 1000) {
                        const grams = value / 1000
                        return grams % 1 === 0 ? `${grams}${unit}` : `${grams.toFixed(1)}${unit}`
                      } else if (unitLower === 'mg' && value < 1 && value > 0) {
                        return `${Math.round(value * 1000)}${unit}`
                      } else if (value % 1 === 0) {
                        return `${value}${unit || 'mg'}`
                      } else {
                        return `${value.toFixed(1)}${unit || 'mg'}`
                      }
                    })()}
                  </div>
                  {option.description && (
                    <div className="mt-1 text-xs text-gray-500">{option.description}</div>
                  )}
                </motion.button>
              ))}
            </div>
          </div>
        ) : null}

        {/* Custom Dosage Input */}
        <div className="mb-6">
          <label className="mb-2 block text-sm font-medium text-gray-400">
            Custom Dosage ({unit || 'mg'})
          </label>
          <input
            type="number"
            value={customDosage}
            onChange={(e) => {
              setCustomDosage(e.target.value)
              setSelectedDose(null)
            }}
            placeholder={`Enter custom dosage in ${unit || 'mg'}`}
            className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none"
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex-1 rounded-xl border border-white/10 bg-white/5 py-3 font-medium transition-all hover:bg-white/10"
          >
            {t("cancel") || "Cancel"}
          </motion.button>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleConfirm}
            className="flex-1 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-3 font-medium transition-all hover:opacity-90"
          >
            {t("addToStack") || "Add to Stack"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}
