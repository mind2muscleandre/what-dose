"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Shield, Trash2, Download, ArrowLeft } from "lucide-react"
import { useTranslation, type Language } from "@/lib/translations"
import { useRouter } from "next/navigation"

export function Privacy() {
  const router = useRouter()
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

  const handleExportData = () => {
    // Export all user data
    const data = {
      stack: localStorage.getItem("userStack"),
      logs: localStorage.getItem("effectLogs"),
      profile: localStorage.getItem("userProfile"),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "whatdose-data.json"
    a.click()
    URL.revokeObjectURL(url)
    alert(t("dataExported") || "Data exported successfully!")
  }

  const handleDeleteData = () => {
    if (confirm(t("confirmDeleteData") || "Are you sure you want to delete all your data? This cannot be undone.")) {
      localStorage.clear()
      alert(t("dataDeleted") || "All data has been deleted.")
      router.push("/")
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1f1f] via-[#0a1a1a] to-[#0a0f0f] pb-24 text-white">
      <div className="mx-auto max-w-md px-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-4"
        >
          <button
            onClick={() => router.back()}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold">{t("privacy") || "Privacy"}</h1>
        </motion.div>

        <div className="space-y-6">
          {/* Privacy Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white/5 p-4"
          >
            <div className="mb-3 flex items-center gap-3">
              <Shield className="h-5 w-5 text-teal-400" />
              <h2 className="text-lg font-semibold">{t("dataPrivacy") || "Data Privacy"}</h2>
            </div>
            <p className="text-sm text-gray-300">
              {t("privacyDescription") ||
                "Your data is stored locally on your device. We do not collect or share your personal information."}
            </p>
          </motion.div>

          {/* Data Management */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <h2 className="text-lg font-semibold">{t("dataManagement") || "Data Management"}</h2>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleExportData}
              className="flex w-full items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <Download className="h-5 w-5 text-teal-400" />
                <span>{t("exportData") || "Export My Data"}</span>
              </div>
            </motion.button>

            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleDeleteData}
              className="flex w-full items-center justify-between rounded-xl bg-red-500/20 p-4 text-red-400 transition-colors hover:bg-red-500/30"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="h-5 w-5" />
                <span>{t("deleteAllData") || "Delete All Data"}</span>
              </div>
            </motion.button>
          </motion.div>

          {/* Privacy Policy Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-white/5 p-4"
          >
            <p className="mb-3 text-sm text-gray-300">
              {t("privacyPolicyText") || "Read our full privacy policy"}
            </p>
            <a
              href="#"
              className="text-sm text-teal-400 hover:text-teal-300"
              onClick={(e) => {
                e.preventDefault()
                alert(t("privacyPolicyComingSoon") || "Privacy policy coming soon")
              }}
            >
              {t("viewPrivacyPolicy") || "View Privacy Policy"}
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

