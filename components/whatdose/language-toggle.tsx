"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Languages } from "lucide-react"
import type { Language } from "@/lib/translations"

export function LanguageToggle() {
  const [language, setLanguage] = useState<Language>("en")
  const [isOpen, setIsOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language
    if (saved) setLanguage(saved)
  }, [])

  const handleToggle = (lang: Language) => {
    setLanguage(lang)
    localStorage.setItem("language", lang)
    window.dispatchEvent(new CustomEvent("languageChange", { detail: lang }))
    setIsOpen(false)
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
      >
        <Languages className="h-5 w-5" />
        <span className="text-sm uppercase">{language}</span>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute right-0 top-12 z-50 w-32 overflow-hidden rounded-xl border border-white/10 bg-[#0d1f1f] shadow-xl backdrop-blur-md"
          >
            <button
              onClick={() => handleToggle("en")}
              className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-white/10 ${
                language === "en" ? "bg-teal-500/20 text-teal-400" : "text-white"
              }`}
            >
              English
            </button>
            <button
              onClick={() => handleToggle("sv")}
              className={`w-full px-4 py-3 text-left text-sm transition-colors hover:bg-white/10 ${
                language === "sv" ? "bg-teal-500/20 text-teal-400" : "text-white"
              }`}
            >
              Svenska
            </button>
          </motion.div>
        </>
      )}
    </div>
  )
}
