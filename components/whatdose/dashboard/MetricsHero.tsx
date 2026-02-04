"use client"

import { motion } from "framer-motion"

interface MetricsHeroProps {
  streak: number
  completed: number
  total: number
  weeklyCompliance: number
  totalSupplements: number
}

export function MetricsHero({
  streak,
  completed,
  total,
  weeklyCompliance,
  totalSupplements,
}: MetricsHeroProps) {
  const dailyProgress = total > 0 ? Math.round((completed / total) * 100) : 0
  const remaining = total - completed

  return (
    <div className="mb-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {/* Streak */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">🔥</span>
            <span className="text-sm text-[rgba(230,237,243,0.6)]">Streak</span>
          </div>
          <div className="text-2xl font-bold text-[#e6edf3]">{streak}</div>
        </motion.div>

        {/* Today */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.05 }}
          className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">⚡</span>
            <span className="text-sm text-[rgba(230,237,243,0.6)]">Today</span>
          </div>
          <div className="text-2xl font-bold text-[#e6edf3]">
            {completed}/{total}
          </div>
        </motion.div>

        {/* Week */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">📊</span>
            <span className="text-sm text-[rgba(230,237,243,0.6)]">Week</span>
          </div>
          <div className="text-2xl font-bold text-[#e6edf3]">{weeklyCompliance}%</div>
        </motion.div>

        {/* Supplements */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.15 }}
          className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-4"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-lg">💊</span>
            <span className="text-sm text-[rgba(230,237,243,0.6)]">Supps</span>
          </div>
          <div className="text-2xl font-bold text-[#e6edf3]">{totalSupplements}</div>
        </motion.div>
      </div>

      {/* Progress Bar */}
      <div className="rounded-xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-[#e6edf3]">{dailyProgress}%</span>
          <span className="text-sm text-[rgba(230,237,243,0.6)]">
            {remaining} to go
          </span>
        </div>
        <div className="h-2 bg-[rgba(255,255,255,0.05)] rounded-full overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${dailyProgress}%` }}
            transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
            className="h-full bg-gradient-to-r from-[#60efff] to-[#00d4ff] rounded-full"
          />
        </div>
      </div>
    </div>
  )
}
