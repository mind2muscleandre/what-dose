"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Settings, HelpCircle, ArrowRight, Pill, Search, Activity, ShoppingCart } from "lucide-react"
import { TaskList } from "./task-list"
import { DailyCheckIn } from "./daily-check-in"
import { LanguageToggle } from "./language-toggle"
import { useTranslation, type Language } from "@/lib/translations"
import { usePreloadHelix } from "@/hooks/use-preload-helix"
import { useAuth } from "@/contexts/auth-context"
import { useProgressMetrics } from "@/hooks/use-progress-metrics"
import { useTimelineBlocks } from "@/hooks/use-timeline-blocks"
import { supabase } from "@/lib/supabase"

// Dynamic import with no SSR for better performance
// This will be cached by Next.js after first load
const DNAHelix3D = dynamic(() => import("./dna-helix-3d").then((mod) => ({ default: mod.DNAHelix3D })), {
  ssr: false,
  loading: () => (
    <div className="flex h-20 w-20 items-center justify-center">
      <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500/30 border-t-teal-500" />
    </div>
  ),
})

export function Dashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)
  const isHelixPreloaded = usePreloadHelix()

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language
    if (saved) setLanguage(saved)

    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLanguage(e.detail)
    }

    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener)
  }, [])

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/auth/login")
    }
  }, [user, authLoading, router])

  // Check if onboarding is completed
  useEffect(() => {
    const checkOnboarding = async () => {
      if (!user?.id || authLoading) return

      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('onboarding_completed')
          .eq('id', user.id)
          .single()

        if (error) {
          console.error('Error checking onboarding status:', error)
          return
        }

        // If onboarding is not completed, redirect to onboarding
        if (data && !data.onboarding_completed) {
          router.push("/onboarding")
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
      }
    }

    checkOnboarding()
  }, [user?.id, authLoading, router])

  const { metrics: progressMetrics, loading: metricsLoading } = useProgressMetrics(user?.id || null)
  const { blocks: timelineBlocks, loading: blocksLoading, updateCompletion } = useTimelineBlocks(user?.id || null)
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)
  const [helixSize, setHelixSize] = useState(400)
  
  // Calculate completion percentage from timeline blocks
  // This updates automatically when timelineBlocks changes (e.g., when tasks are checked)
  const completionPercentage = useMemo(() => {
    if (!timelineBlocks || timelineBlocks.length === 0) return 0
    
    const allItems = timelineBlocks.flatMap(block => block.items)
    if (allItems.length === 0) return 0
    
    const completedItems = allItems.filter(item => item.is_completed).length
    const totalItems = allItems.length
    
    return totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
  }, [timelineBlocks])

  // All hooks must be called before any conditional returns
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth
      const height = window.innerHeight
      // Calculate size to fit within viewport minus bottom nav (90px)
      const availableHeight = height - 90
      // Use smaller size to ensure it fits and doesn't extend behind bottom nav
      setHelixSize(Math.min(width * 1.2, availableHeight * 0.9))
    }
    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  const handleToggleItem = async (blockId: string, itemId: string) => {
    const item = timelineBlocks
      .find(b => b.block_id === blockId)
      ?.items.find(i => i.item_id === itemId)
    
    if (item) {
      await updateCompletion(itemId, !item.is_completed)
    }
  }

  const handleQuickAccess = (id: string) => {
    switch (id) {
      case "stack":
        router.push("/stack")
        break
      case "search":
        router.push("/library")
        break
      case "log":
        router.push("/log-effect")
        break
      case "refill":
        router.push("/refill")
        break
    }
  }

  const quickAccessItems = [
    { id: "stack", label: t("myStack"), icon: Pill },
    { id: "search", label: t("searchDatabase"), icon: Search },
    { id: "log", label: t("logEffect"), icon: Activity },
    { id: "refill", label: t("refill"), icon: ShoppingCart },
  ]

  if (authLoading || metricsLoading || blocksLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500/30 border-t-teal-500" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#0a0a0a] text-white">
      {/* DNA Helix Background - covers page but stops at bottom navigation */}
      <div 
        className="fixed top-0 left-0 right-0 pointer-events-none z-[1] flex items-center justify-center"
        style={{ 
          bottom: '90px', 
          height: 'calc(100vh - 90px)',
          overflow: 'hidden',
          clipPath: 'inset(0 0 0 0)'
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="relative w-full h-full flex items-center justify-center"
          style={{ 
            maxHeight: 'calc(100vh - 90px)',
            position: 'relative'
          }}
        >
          <DNAHelix3D 
            fillProgress={completionPercentage} 
            autoRotate={true}
            rotationSpeed={1}
            size={helixSize}
          />
          {/* Glow effect */}
          <motion.div
            animate={{
              scale: [1, 1.1, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
            }}
            className="absolute inset-0 rounded-full pointer-events-none"
            style={{
              background: "radial-gradient(circle, rgba(20, 184, 166, 0.3) 0%, transparent 70%)",
              filter: "blur(60px)",
            }}
          />
        </motion.div>
      </div>

      <div className="relative mx-auto max-w-md px-4 pb-24 pt-6 z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500 to-teal-600">
              <Pill className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">{t("appName")}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => router.push("/help")}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button
              onClick={() => router.push("/settings")}
              className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </motion.header>

        {/* Streak Display */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 flex items-center gap-3 relative z-10"
        >
          <div className="text-3xl">🔥</div>
          <span className="text-2xl font-bold text-white">
            {t("dailyStreak")}: {progressMetrics.streak_days}
          </span>
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => setIsCheckInOpen(true)}
          className="mb-6 flex w-full items-center justify-between rounded-2xl bg-[#1a3a3a]/80 px-4 py-4 backdrop-blur-sm transition-colors hover:bg-[#1a4040]/80 relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10">
              <span className="text-sm">💬</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-lg">🤖</span>
              <span className="font-medium text-white">{t("myDailyCheckIn")}</span>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 text-gray-400" />
        </motion.button>

        {/* Quick Access Grid */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <div className="grid grid-cols-2 gap-3">
            {quickAccessItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => handleQuickAccess(item.id)}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="flex flex-col items-center justify-center gap-2 rounded-2xl border-2 border-teal-400 bg-transparent p-6 transition-all hover:border-teal-300 hover:bg-teal-400/10"
              >
                <item.icon className="h-7 w-7 text-teal-400" />
                <span className="text-sm font-medium text-teal-400">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Today's Tasks */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.35 }}
          className="relative z-10"
        >
          <h2 className="mb-4 text-center text-lg font-semibold text-white">{t("todaysTasks")}</h2>
          <TaskList blocks={timelineBlocks} onToggleItem={handleToggleItem} />
        </motion.div>
      </div>

      <DailyCheckIn
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        userName="User"
        timelineBlocks={timelineBlocks}
      />
    </div>
  )
}
