"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bell, Globe, Ruler, ChevronRight } from "lucide-react"
import { useTranslation, type Language } from "@/lib/translations"
import { LanguageToggle } from "./language-toggle"

export function Settings() {
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [units, setUnits] = useState<"metric" | "imperial">("metric")

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
    const storedNotifications = localStorage.getItem("notificationsEnabled")
    if (storedNotifications !== null) {
      setNotificationsEnabled(storedNotifications === "true")
    }

    const storedUnits = localStorage.getItem("units") as "metric" | "imperial" | null
    if (storedUnits) {
      setUnits(storedUnits)
    }
  }, [])

  const handleNotificationsToggle = (enabled: boolean) => {
    setNotificationsEnabled(enabled)
    localStorage.setItem("notificationsEnabled", enabled.toString())
  }

  const handleUnitsChange = (newUnits: "metric" | "imperial") => {
    setUnits(newUnits)
    localStorage.setItem("units", newUnits)
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
          <h1 className="text-2xl font-bold">{t("settings") || "Settings"}</h1>
        </motion.div>

        <div className="space-y-6">
          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white/5 p-4"
          >
            <div className="mb-4 flex items-center gap-3">
              <Bell className="h-5 w-5 text-teal-400" />
              <h2 className="text-lg font-semibold">{t("notifications") || "Notifications"}</h2>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-300">
                  {t("enableNotifications") || "Enable push notifications"}
                </p>
                <p className="text-xs text-gray-500">
                  {t("notificationsDescription") || "Get reminders for supplement intake"}
                </p>
              </div>
              <button
                onClick={() => handleNotificationsToggle(!notificationsEnabled)}
                className={`relative h-6 w-11 rounded-full transition-colors ${
                  notificationsEnabled ? "bg-teal-500" : "bg-gray-600"
                }`}
              >
                <span
                  className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform ${
                    notificationsEnabled ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </motion.div>

          {/* Language */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white/5 p-4"
          >
            <div className="mb-4 flex items-center gap-3">
              <Globe className="h-5 w-5 text-teal-400" />
              <h2 className="text-lg font-semibold">{t("language") || "Language"}</h2>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-300">{t("selectLanguage") || "Select your language"}</p>
              <LanguageToggle />
            </div>
          </motion.div>

          {/* Units */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl bg-white/5 p-4"
          >
            <div className="mb-4 flex items-center gap-3">
              <Ruler className="h-5 w-5 text-teal-400" />
              <h2 className="text-lg font-semibold">{t("units") || "Units"}</h2>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => handleUnitsChange("metric")}
                className={`flex-1 rounded-xl border-2 py-3 text-sm font-medium transition-all ${
                  units === "metric"
                    ? "border-teal-500 bg-teal-500/20 text-teal-400"
                    : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                }`}
              >
                {t("metric") || "Metric"}
              </button>
              <button
                onClick={() => handleUnitsChange("imperial")}
                className={`flex-1 rounded-xl border-2 py-3 text-sm font-medium transition-all ${
                  units === "imperial"
                    ? "border-teal-500 bg-teal-500/20 text-teal-400"
                    : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                }`}
              >
                {t("imperial") || "Imperial"}
              </button>
            </div>
          </motion.div>

          {/* Additional Settings Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-2"
          >
            <a
              href="/notifications"
              className="flex items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <Bell className="h-5 w-5 text-gray-400" />
                <span>{t("notificationSettings") || "Notification Settings"}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </a>
            <a
              href="/appearance"
              className="flex items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🎨</span>
                <span>{t("appearance") || "Appearance"}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </a>
            <a
              href="/privacy"
              className="flex items-center justify-between rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <span className="text-xl">🔒</span>
                <span>{t("privacy") || "Privacy"}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </a>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

