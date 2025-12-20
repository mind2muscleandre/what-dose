"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { User, Bell, Moon, Shield, HelpCircle, LogOut, ChevronRight, Dna } from "lucide-react"
import { useTranslation, type Language, type translations } from "@/lib/translations"
import { DNAConnectModal } from "./dna-connect-modal"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/hooks/use-profile"

export function Profile() {
  const router = useRouter()
  const { user, signOut, loading: authLoading } = useAuth()
  const { profile, stats, loading: profileLoading } = useProfile(user?.id || null)
  const [lang, setLang] = useState<Language>("en")
  const { t } = useTranslation(lang)
  const [isDNAModalOpen, setIsDNAModalOpen] = useState(false)

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  useEffect(() => {
    const storedLang = localStorage.getItem("language") as Language
    if (storedLang) setLang(storedLang)

    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLang(e.detail)
    }

    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener)
  }, [])

  const handleLogout = async () => {
    if (confirm(t("confirmLogout") || "Are you sure you want to logout?")) {
      await signOut()
      router.push("/")
    }
  }

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1f1f]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500/30 border-t-teal-500" />
      </div>
    )
  }

  const settingsItems = [
    { icon: User, labelKey: "editProfile", href: "/profile/edit" },
    { icon: Bell, labelKey: "notifications", href: "/notifications" },
    { icon: Moon, labelKey: "appearance", href: "/appearance" },
    { icon: Shield, labelKey: "privacy", href: "/privacy" },
    { icon: HelpCircle, labelKey: "helpSupport", href: "/help" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1f1f] via-[#0a1a1a] to-[#0a0f0f] pb-24 text-white">
      <div className="px-4 pt-6">
        <h1 className="mb-6 text-2xl font-bold">{t("profileTitle")}</h1>

        {/* User Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 rounded-2xl bg-white/5 p-6"
        >
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold">
                {profile?.first_name || user?.email?.split('@')[0] || 'User'}
              </h2>
              <p className="text-gray-400">{user?.email || ''}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-teal-400">{stats.streak_days}</p>
              <p className="text-xs text-gray-400">{t("daysStreak")}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-400">{stats.supplements_count}</p>
              <p className="text-xs text-gray-400">{t("supplements")}</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-teal-400">{Math.round(stats.compliance_percentage)}%</p>
              <p className="text-xs text-gray-400">{t("compliance")}</p>
            </div>
          </div>
        </motion.div>

        {/* DNA Profile */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 rounded-2xl bg-gradient-to-r from-purple-500/20 to-teal-500/20 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/30">
                <Dna className="h-5 w-5 text-purple-400" />
              </div>
              <div>
                <p className="font-medium">{t("dnaProfile")}</p>
                <p className="text-sm text-gray-400">{t("notConnected")}</p>
              </div>
            </div>
            <button
              onClick={() => setIsDNAModalOpen(true)}
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/15"
            >
              {t("connect")}
            </button>
          </div>
        </motion.div>

        {/* Settings List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="rounded-2xl bg-white/5"
        >
          {settingsItems.map((item, i) => (
            <button
              key={item.labelKey}
              onClick={() => router.push(item.href)}
              className={`flex w-full items-center justify-between px-4 py-4 hover:bg-white/5 ${
                i !== settingsItems.length - 1 ? "border-b border-white/5" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <item.icon className="h-5 w-5 text-gray-400" />
                <span>{t(item.labelKey as keyof typeof translations.en)}</span>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-500" />
            </button>
          ))}
        </motion.div>

        {/* Logout */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={handleLogout}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-red-500/10 py-4 text-red-400 hover:bg-red-500/20"
        >
          <LogOut className="h-5 w-5" />
          {t("logout")}
        </motion.button>
      </div>

      <DNAConnectModal isOpen={isDNAModalOpen} onClose={() => setIsDNAModalOpen(false)} />
    </div>
  )
}
