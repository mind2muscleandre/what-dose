"use client"

import { motion, AnimatePresence } from "framer-motion"
import { AlertTriangle, X, Check } from "lucide-react"
import type { InteractionWarning, DosageWarning } from "@/hooks/use-safety-engine"

interface SafetyWarningsProps {
  warnings: InteractionWarning[]
  dosageWarnings?: DosageWarning[]
  onDismiss?: () => void
  onFixDosage?: (supplementId: number, maxSafeDosage: number) => void
}

export function SafetyWarnings({ warnings, dosageWarnings = [], onDismiss, onFixDosage }: SafetyWarningsProps) {
  if (warnings.length === 0 && dosageWarnings.length === 0) return null

  const getSeverityColor = (severity: number) => {
    if (severity >= 4) return "bg-red-500/20 text-red-400 border-red-500/30"
    if (severity >= 3) return "bg-orange-500/20 text-orange-400 border-orange-500/30"
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
  }

  const getSeverityLabel = (severity: number) => {
    if (severity >= 4) return "High Risk"
    if (severity >= 3) return "Medium Risk"
    return "Low Risk"
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        className="mb-4 space-y-3"
      >
        {/* Dosage Warnings */}
        {dosageWarnings.map((warning, index) => (
          <motion.div
            key={`dosage-${warning.supplement_id}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`rounded-xl border p-4 ${getSeverityColor(warning.severity)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">High Dosage Warning</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                      {getSeverityLabel(warning.severity)}
                    </span>
                  </div>
                  <p className="text-sm mb-2">
                    <span className="font-medium">{warning.supplement_name}</span> dosage exceeds safe limits
                  </p>
                  <p className="text-xs opacity-90 mb-1">
                    Current: <span className="font-semibold">{warning.current_dosage}{warning.unit}</span> | 
                    Maximum safe: <span className="font-semibold">{warning.max_safe_dosage}{warning.unit}</span>
                  </p>
                  {warning.description && (
                    <p className="text-xs opacity-75 mt-1">{warning.description}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {onFixDosage && (
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onFixDosage(warning.supplement_id, warning.max_safe_dosage)}
                    className="flex items-center gap-1.5 rounded-lg bg-teal-500/20 px-3 py-1.5 text-xs font-medium text-teal-400 transition-all hover:bg-teal-500/30"
                  >
                    <Check className="h-3.5 w-3.5" />
                    Fix
                  </motion.button>
                )}
                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="flex-shrink-0 rounded-lg p-1 hover:bg-white/10 transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Interaction Warnings */}
        {warnings.map((warning, index) => (
          <motion.div
            key={`${warning.supplement_a_id}-${warning.supplement_b_id}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: (dosageWarnings.length + index) * 0.1 }}
            className={`rounded-xl border p-4 ${getSeverityColor(warning.severity)}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3 flex-1">
                <AlertTriangle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">Interaction Warning</span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-white/10">
                      {getSeverityLabel(warning.severity)}
                    </span>
                  </div>
                  <p className="text-sm mb-2">
                    <span className="font-medium">{warning.supplement_a_name}</span> and{" "}
                    <span className="font-medium">{warning.supplement_b_name}</span> may interact
                  </p>
                  {warning.description && (
                    <p className="text-xs opacity-90 mb-1">{warning.description}</p>
                  )}
                  {warning.mechanism && (
                    <p className="text-xs opacity-75">Mechanism: {warning.mechanism}</p>
                  )}
                  {warning.evidence_level && (
                    <p className="text-xs opacity-75 mt-1">
                      Evidence: {warning.evidence_level}
                    </p>
                  )}
                </div>
              </div>
              {onDismiss && (
                <button
                  onClick={onDismiss}
                  className="flex-shrink-0 rounded-lg p-1 hover:bg-white/10 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>
    </AnimatePresence>
  )
}

