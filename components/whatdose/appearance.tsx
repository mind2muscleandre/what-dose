"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Moon, Sun, Monitor, Type, ArrowLeft } from "lucide-react"
import { useTranslation, type Language } from "@/lib/translations"
import { useRouter } from "next/navigation"

export function Appearance() {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)
  const [theme, setTheme] = useState<"dark" | "light" | "system">("dark")
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">("medium")

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
    const storedTheme = localStorage.getItem("theme") as "dark" | "light" | "system" | null
    if (storedTheme) {
      setTheme(storedTheme)
    }

    const storedFontSize = localStorage.getItem("fontSize") as "small" | "medium" | "large" | null
    if (storedFontSize) {
      setFontSize(storedFontSize)
    }
  }, [])

  const handleThemeChange = (newTheme: "dark" | "light" | "system") => {
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
  }

  const handleFontSizeChange = (newSize: "small" | "medium" | "large") => {
    setFontSize(newSize)
    localStorage.setItem("fontSize", newSize)
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
          <h1 className="text-2xl font-bold">{t("appearance") || "Appearance"}</h1>
        </motion.div>

        <div className="space-y-6">
          {/* Theme Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-2xl bg-white/5 p-4"
          >
            <h2 className="mb-4 text-lg font-semibold">{t("theme") || "Theme"}</h2>
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: "dark", icon: Moon, label: t("dark") || "Dark" },
                { key: "light", icon: Sun, label: t("light") || "Light" },
                { key: "system", icon: Monitor, label: t("system") || "System" },
              ].map((option) => (
                <motion.button
                  key={option.key}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleThemeChange(option.key as "dark" | "light" | "system")}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 py-4 transition-all ${
                    theme === option.key
                      ? "border-teal-500 bg-teal-500/20 text-teal-400"
                      : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                  }`}
                >
                  <option.icon className="h-6 w-6" />
                  <span className="text-sm font-medium">{option.label}</span>
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Font Size */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-2xl bg-white/5 p-4"
          >
            <div className="mb-4 flex items-center gap-3">
              <Type className="h-5 w-5 text-teal-400" />
              <h2 className="text-lg font-semibold">{t("fontSize") || "Font Size"}</h2>
            </div>
            <div className="space-y-3">
              {[
                { key: "small", label: t("small") || "Small" },
                { key: "medium", label: t("medium") || "Medium" },
                { key: "large", label: t("large") || "Large" },
              ].map((option) => (
                <button
                  key={option.key}
                  onClick={() => handleFontSizeChange(option.key as "small" | "medium" | "large")}
                  className={`w-full rounded-xl border-2 py-3 text-sm font-medium transition-all ${
                    fontSize === option.key
                      ? "border-teal-500 bg-teal-500/20 text-teal-400"
                      : "border-white/10 bg-white/5 text-gray-400 hover:border-white/20"
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

