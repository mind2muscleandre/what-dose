"use client"

import { useState, useEffect, useMemo } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Settings, HelpCircle, Pill } from "lucide-react"
import { DailyCheckIn } from "./daily-check-in"
import { LanguageToggle } from "./language-toggle"
import { useTranslation, type Language } from "@/lib/translations"
import { useAuth } from "@/contexts/auth-context"
import { useProgressMetrics } from "@/hooks/use-progress-metrics"
import { useTimelineBlocks } from "@/hooks/use-timeline-blocks"
import { useWeeklyCompliance } from "@/hooks/use-weekly-compliance"
import { useCheckInStatus } from "@/hooks/use-checkin-status"
import { useProfile } from "@/hooks/use-profile"
import { supabase } from "@/lib/supabase"
import { MetricsHero } from "./dashboard/MetricsHero"
import { TaskGroup } from "./dashboard/TaskGroup"
import { QuickActions } from "./dashboard/QuickActions"
import { mapBlockToTimePeriod, getTimePeriodEmoji, getTimePeriodLabel, type TimePeriod } from "@/lib/utils/time-helpers"
import type { TimelineBlock } from "@/lib/whatdose-data"

export function Dashboard() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)
  const [currentTime, setCurrentTime] = useState(new Date())
  const [isCheckInOpen, setIsCheckInOpen] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem("language") as Language
    if (saved) setLanguage(saved)

    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLanguage(e.detail)
    }

    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener)
  }, [])

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 60000) // Update every minute

    return () => clearInterval(timer)
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
  const { weeklyCompliance } = useWeeklyCompliance(user?.id || null)
  const { checkedInToday } = useCheckInStatus(user?.id || null)
  const { stats } = useProfile(user?.id || null)
  
  // Get total supplements count
  const totalSupplements = stats?.supplements_count || 0

  // Calculate real-time metrics from timeline blocks
  const realTimeMetrics = useMemo(() => {
    if (!timelineBlocks || timelineBlocks.length === 0) {
      return {
        total_tasks: 0,
        completed_tasks: 0,
        completion_percentage: 0,
        streak_days: progressMetrics.streak_days,
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
      streak_days: progressMetrics.streak_days,
    }
  }, [timelineBlocks, progressMetrics.streak_days])

  // Use real-time metrics if available, otherwise fall back to database metrics
  const displayMetrics = timelineBlocks.length > 0 ? realTimeMetrics : progressMetrics

  // Group timeline blocks by time period
  const groupedTasks = useMemo(() => {
    const groups: Record<TimePeriod, TimelineBlock[]> = {
      morning: [],
      afternoon: [],
      evening: [],
    }

    timelineBlocks.forEach(block => {
      const period = mapBlockToTimePeriod(block)
      groups[period].push(block)
    })

    return groups
  }, [timelineBlocks])

  const handleToggleItem = async (itemId: string) => {
    await updateCompletion(itemId, !timelineBlocks
      .flatMap(block => block.items)
      .find(item => item.item_id === itemId)?.is_completed ?? false)
  }

  const handleInfoClick = (itemId: string) => {
    // Placeholder for supplement details modal
    console.log('Info clicked for item:', itemId)
  }

  if (authLoading || metricsLoading || blocksLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0e14]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[#60efff]/30 border-t-[#60efff]" />
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#0a0e14] text-[#e6edf3]">
      <div className="mx-auto max-w-[480px] px-4 py-4 md:px-6">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#60efff] to-[#00d4ff]">
              <Pill className="h-5 w-5 text-[#0a0e14]" />
            </div>
            <span className="text-xl font-bold text-[#e6edf3]">{t("appName")}</span>
          </div>
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <button
              onClick={() => router.push("/help")}
              className="rounded-full p-2 text-[rgba(230,237,243,0.6)] transition-colors hover:bg-[rgba(255,255,255,0.1)] hover:text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#60efff] focus:ring-offset-2 focus:ring-offset-[#0a0e14]"
              aria-label="Help"
            >
              <HelpCircle className="h-5 w-5" />
            </button>
            <button
              onClick={() => router.push("/settings")}
              className="rounded-full p-2 text-[rgba(230,237,243,0.6)] transition-colors hover:bg-[rgba(255,255,255,0.1)] hover:text-[#e6edf3] focus:outline-none focus:ring-2 focus:ring-[#60efff] focus:ring-offset-2 focus:ring-offset-[#0a0e14]"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5" />
            </button>
          </div>
        </motion.header>

        {/* Metrics Hero */}
        <MetricsHero
          streak={displayMetrics.streak_days}
          completed={displayMetrics.completed_tasks}
          total={displayMetrics.total_tasks}
          weeklyCompliance={weeklyCompliance}
          totalSupplements={totalSupplements}
        />

        {/* Task Groups */}
        <div className="mb-6">
          {(['morning', 'afternoon', 'evening'] as TimePeriod[]).map(period => {
            const blocks = groupedTasks[period]
            if (blocks.length === 0) return null

            // Combine all items from blocks in this period
            const allTasks = blocks.flatMap(block => block.items)
            if (allTasks.length === 0) return null

            // Use the first block's time as the group time
            const groupTime = blocks[0]?.suggested_time || '08:00'
            const groupIcon = getTimePeriodEmoji(period)
            const groupLabel = getTimePeriodLabel(period)

            return (
              <TaskGroup
                key={period}
                id={period}
                label={groupLabel}
                icon={groupIcon}
                time={groupTime}
                tasks={allTasks}
                currentTime={currentTime}
                onToggleItem={handleToggleItem}
                onInfoClick={handleInfoClick}
              />
            )
          })}
        </div>

        {/* Quick Actions */}
        <QuickActions
          checkedInToday={checkedInToday}
          onCheckInClick={() => setIsCheckInOpen(true)}
        />
      </div>

      {/* Daily Check-In Modal */}
      <DailyCheckIn
        isOpen={isCheckInOpen}
        onClose={() => setIsCheckInOpen(false)}
        userName={user?.email?.split('@')[0] || "User"}
        timelineBlocks={timelineBlocks}
      />
    </div>
  )
}
