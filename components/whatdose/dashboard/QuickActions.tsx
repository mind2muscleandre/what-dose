"use client"

import { motion } from "framer-motion"
import { useRouter } from "next/navigation"

interface QuickActionsProps {
  checkedInToday: boolean
  onCheckInClick: () => void
}

export function QuickActions({ checkedInToday, onCheckInClick }: QuickActionsProps) {
  const router = useRouter()

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* Daily Check-In Button */}
      <motion.button
        onClick={onCheckInClick}
        className="relative rounded-2xl bg-gradient-to-r from-[#60efff] to-[#00d4ff] p-4 flex flex-col items-center justify-center gap-2 text-[#0a0e14] font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#60efff] focus:ring-offset-2 focus:ring-offset-[#0a0e14]"
        whileHover={{ y: -2, boxShadow: "0 8px 16px rgba(96, 239, 255, 0.3)" }}
        whileTap={{ scale: 0.98 }}
        aria-label="Daily Check-In"
      >
        <span className="text-2xl">💬</span>
        <span className="text-sm font-semibold">Daily Check-In</span>
        {!checkedInToday && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full border-2 border-[#0a0e14]"
            aria-label="Notification: Check-in not completed today"
          />
        )}
      </motion.button>

      {/* View Progress Button */}
      <motion.button
        onClick={() => router.push("/dashboard")}
        className="rounded-2xl bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.06)] p-4 flex flex-col items-center justify-center gap-2 text-[#e6edf3] font-medium transition-all duration-200 hover:bg-[rgba(255,255,255,0.05)] focus:outline-none focus:ring-2 focus:ring-[#60efff] focus:ring-offset-2 focus:ring-offset-[#0a0e14]"
        whileHover={{ y: -2, boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)" }}
        whileTap={{ scale: 0.98 }}
        aria-label="View Progress"
      >
        <span className="text-2xl">📊</span>
        <span className="text-sm font-semibold">View Progress</span>
      </motion.button>
    </div>
  )
}
