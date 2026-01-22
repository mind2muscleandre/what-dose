"use client"

import { useState, useEffect, useMemo } from "react"
import dynamic from "next/dynamic"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Settings, HelpCircle, ArrowRight, Pill, Search, Activity, ShoppingCart, CheckSquare, CheckCircle2, Target, Flame } from "lucide-react"
import { TaskList } from "./task-list"
import { TimelineBlocks } from "./timeline-blocks"
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
  
  // Calculate real-time metrics from timeline blocks
  // This updates automatically when timelineBlocks changes (e.g., when tasks are checked)
  const realTimeMetrics = useMemo(() => {
    if (!timelineBlocks || timelineBlocks.length === 0) {
      return {
        total_tasks: 0,
        completed_tasks: 0,
        completion_percentage: 0,
        streak_days: progressMetrics.streak_days, // Keep streak from database
      }
    }
    
    const allItems = timelineBlocks.flatMap(block => block.items)
    if (allItems.length === 0) {
      return {
        total_tasks: 0,
        completed_tasks: 0,
        completion_percentage: 0,
        streak_days: progressMetrics.streak_days,
      }
    }
    
    const completedItems = allItems.filter(item => item.is_completed).length
    const totalItems = allItems.length
    const percentage = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0
    
    return {
      total_tasks: totalItems,
      completed_tasks: completedItems,
      completion_percentage: percentage,
      streak_days: progressMetrics.streak_days, // Keep streak from database
    }
  }, [timelineBlocks, progressMetrics.streak_days])
  
  // Use real-time metrics if available, otherwise fall back to database metrics
  const displayMetrics = timelineBlocks.length > 0 ? realTimeMetrics : progressMetrics
  
  // Calculate completion percentage for DNA helix
  const completionPercentage = displayMetrics.completion_percentage

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

        {/* Progress Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-6 relative z-10"
        >
          <div className="grid grid-cols-2 gap-3">
            {/* Total Tasks with Visual Indicator */}
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="rounded-2xl bg-[#1a3a3a]/60 backdrop-blur-sm p-4 border border-teal-500/20 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">Total Tasks</div>
                <CheckSquare className="h-4 w-4 text-teal-400" />
              </div>
              <div className="text-3xl font-bold text-white mb-2">{displayMetrics.total_tasks}</div>
              {/* Visual indicator bar */}
              <div className="h-1.5 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-teal-400 to-cyan-500"
                />
              </div>
            </motion.div>
            
            {/* Completed Tasks with Progress Bar */}
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="rounded-2xl bg-[#1a3a3a]/60 backdrop-blur-sm p-4 border border-teal-500/20 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">Completed</div>
                <CheckCircle2 className="h-4 w-4 text-green-400" />
              </div>
              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-bold text-green-400">{displayMetrics.completed_tasks}</span>
                <span className="text-sm text-gray-500">/ {displayMetrics.total_tasks}</span>
              </div>
              {/* Progress bar */}
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ 
                    width: displayMetrics.total_tasks > 0 
                      ? `${(displayMetrics.completed_tasks / displayMetrics.total_tasks) * 100}%` 
                      : "0%"
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-green-400 to-teal-400"
                />
              </div>
            </motion.div>
            
            {/* Compliance Percentage with Circular Progress */}
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="rounded-2xl bg-[#1a3a3a]/60 backdrop-blur-sm p-4 border border-teal-500/20 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-400">Compliance</div>
                <Target className="h-4 w-4 text-teal-400" />
              </div>
              <div className="relative flex items-center justify-center">
                {/* Circular progress */}
                <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 64 64">
                  <circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth="4"
                    fill="none"
                  />
                  <motion.circle
                    cx="32"
                    cy="32"
                    r="28"
                    stroke="url(#compliance-gradient)"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: displayMetrics.completion_percentage / 100 }}
                    transition={{ duration: 1, ease: "easeOut" }}
                  />
                  <defs>
                    <linearGradient id="compliance-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#2dd4bf" />
                      <stop offset="100%" stopColor="#06b6d4" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xl font-bold text-white">{displayMetrics.completion_percentage}%</span>
                </div>
              </div>
            </motion.div>
            
            {/* Streak Days with Visual Fire */}
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              className="rounded-2xl bg-gradient-to-br from-orange-500/20 to-red-500/20 backdrop-blur-sm p-4 border border-orange-500/30 relative overflow-hidden"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-300">Streak</div>
                <Flame className="h-4 w-4 text-orange-400" />
              </div>
              <div className="flex items-center gap-2">
                <motion.div
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0]
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="text-3xl"
                >
                  🔥
                </motion.div>
                <div>
                  <div className="text-3xl font-bold text-orange-400">{displayMetrics.streak_days}</div>
                  <div className="text-xs text-gray-400">days in a row</div>
                </div>
              </div>
              {/* Visual streak indicator */}
              <div className="mt-2 flex gap-1">
                {Array.from({ length: Math.min(displayMetrics.streak_days, 7) }).map((_, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="h-1.5 flex-1 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"
                  />
                ))}
                {displayMetrics.streak_days > 7 && (
                  <div className="h-1.5 flex-1 bg-white/10 rounded-full" />
                )}
              </div>
            </motion.div>
          </div>
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

        {/* Today's Tasks - Timeline Blocks */}
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          transition={{ delay: 0.35 }}
          className="relative z-10"
        >
          <h2 className="mb-4 text-center text-lg font-semibold text-white">{t("todaysTasks")}</h2>
          <TimelineBlocks blocks={timelineBlocks} onToggleItem={handleToggleItem} />
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
