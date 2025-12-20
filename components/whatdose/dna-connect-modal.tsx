"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Dna, ExternalLink, Activity, CheckCircle } from "lucide-react"
import { useTranslation, type Language } from "@/lib/translations"
import { useAuth } from "@/contexts/auth-context"
import { useTerra } from "@/hooks/use-terra"

interface DNAConnectModalProps {
  isOpen: boolean
  onClose: () => void
}

export function DNAConnectModal({ isOpen, onClose }: DNAConnectModalProps) {
  const { user } = useAuth()
  const { connections, loading, connectProvider, disconnectProvider } = useTerra(user?.id || null)
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)

  useEffect(() => {
    const stored = localStorage.getItem("language") as Language
    if (stored) setLanguage(stored)

    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLanguage(e.detail)
    }

    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener)
  }, [])

  const handleConnect = async (provider: string) => {
    // In a real implementation, this would redirect to Terra OAuth flow
    // For now, we'll simulate with a prompt
    const terraUserId = prompt(`Enter your Terra User ID for ${provider}:`)
    if (terraUserId) {
      const result = await connectProvider(provider, terraUserId)
      if (result.error) {
        alert(result.error)
      } else {
        alert(`Successfully connected to ${provider}!`)
      }
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-end justify-center bg-black/60 backdrop-blur-sm"
          onClick={onClose}
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
            <div className="overflow-y-auto overscroll-contain" style={{ maxHeight: "calc(100vh - 80px)" }}>
              <div className="p-6 pb-24">
                {/* Header */}
                <div className="mb-6 flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/30">
                      <Dna className="h-5 w-5 text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold">{t("dnaProfile") || "DNA Profile"}</h2>
                      <p className="text-sm text-gray-400">
                        {t("connectDNADescription") || "Connect your genetic data for personalized recommendations"}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={onClose}
                    className="rounded-full bg-white/10 p-2 hover:bg-white/20"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-6">
                  <div className="rounded-xl bg-purple-500/10 p-4">
                    <h3 className="mb-2 font-medium text-purple-400">
                      {t("benefits") || "Benefits"}
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-300">
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-400" />
                        {t("personalizedRecommendations") || "Personalized supplement recommendations"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-400" />
                        {t("geneticInsights") || "Genetic insights for optimal dosing"}
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-purple-400" />
                        {t("metabolismInfo") || "Metabolism and absorption information"}
                      </li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-medium">{t("supportedServices") || "Supported Services"}</h3>
                    <div className="space-y-2">
                      {["GARMIN", "FITBIT", "APPLE_HEALTH", "GOOGLE_FIT", "OURA", "WHOOP"].map((provider) => {
                        const connection = connections.find(c => c.provider === provider)
                        const isConnected = connection?.status === 'connected'
                        
                        return (
                          <button
                            key={provider}
                            onClick={() => {
                              if (isConnected) {
                                disconnectProvider(provider)
                              } else {
                                handleConnect(provider)
                              }
                            }}
                            className={`flex w-full items-center justify-between rounded-xl p-4 transition-colors ${
                              isConnected ? "bg-emerald-500/10" : "bg-white/5 hover:bg-white/10"
                            }`}
                          >
                            <div className="flex items-center gap-3">
                              <Activity className="h-5 w-5 text-teal-400" />
                              <span>{provider.replace('_', ' ')}</span>
                            </div>
                            {isConnected ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-400" />
                                <span className="text-xs text-emerald-400">Connected</span>
                              </div>
                            ) : (
                              <ExternalLink className="h-4 w-4 text-gray-400" />
                            )}
                          </button>
                        )
                      })}
                    </div>
                  </div>

                  <div className="rounded-xl bg-amber-500/10 p-4">
                    <p className="text-sm text-amber-400">
                      {t("dnaPrivacyNote") ||
                        "Your genetic data is processed securely and never shared with third parties."}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      alert(t("dnaConnectionComingSoon") || "DNA connection feature coming soon!")
                      onClose()
                    }}
                    className="w-full rounded-xl bg-gradient-to-r from-purple-500 to-teal-500 py-3 font-medium transition-all hover:opacity-90"
                  >
                    {t("connectDNA") || "Connect DNA Profile"}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

