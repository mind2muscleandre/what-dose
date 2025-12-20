"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Home, Search, Users, User } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useTranslation, type Language } from "@/lib/translations"

export function BottomNavigation() {
  const pathname = usePathname()
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language
    if (saved) setLanguage(saved)

    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLanguage(e.detail)
    }

    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener)
  }, [])

  const navItems = [
    { href: "/dashboard", icon: Home, label: t("home") },
    { href: "/library", icon: Search, label: t("library") },
    { href: "/community", icon: Users, label: t("community") },
    { href: "/profile", icon: User, label: t("profile") },
  ]

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-white/5 bg-[#0a1a1a]/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-md items-center justify-around px-4 py-3">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link key={item.href} href={item.href} className="relative flex flex-col items-center gap-1">
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`relative rounded-xl p-2 transition-colors ${
                  isActive ? "bg-teal-500/20" : "hover:bg-white/5"
                }`}
              >
                <item.icon className={`h-6 w-6 transition-colors ${isActive ? "text-teal-400" : "text-gray-500"}`} />
                {isActive && (
                  <motion.div
                    layoutId="navGlow"
                    className="absolute inset-0 rounded-xl bg-teal-400/20 blur-md"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </motion.div>
              <span className={`text-xs transition-colors ${isActive ? "text-teal-400" : "text-gray-500"}`}>
                {item.label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
