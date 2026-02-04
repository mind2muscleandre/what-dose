"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"
import { TaskItem } from "./TaskItem"
import { isTimeActive, getTimePeriodEmoji, getTimePeriodLabel, type TimePeriod } from "@/lib/utils/time-helpers"
import type { TimelineBlock, SupplementItem } from "@/lib/whatdose-data"

interface TaskGroupProps {
  id: string
  label: string
  icon: string
  time: string
  tasks: SupplementItem[]
  currentTime: Date
  onToggleItem: (itemId: string) => void
  onInfoClick: (itemId: string) => void
}

export function TaskGroup({
  id,
  label,
  icon,
  time,
  tasks,
  currentTime,
  onToggleItem,
  onInfoClick,
}: TaskGroupProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const allCompleted = tasks.every(task => task.is_completed)
  const incompleteCount = tasks.filter(task => !task.is_completed).length
  const isActive = isTimeActive(time, currentTime)
  const showCheckAll = incompleteCount >= 2

  // Auto-collapse when all tasks complete
  useEffect(() => {
    if (allCompleted) {
      setIsExpanded(false)
    }
  }, [allCompleted])

  const handleCheckAll = () => {
    const incompleteTasks = tasks.filter(task => !task.is_completed)
    incompleteTasks.forEach((task, index) => {
      setTimeout(() => {
        onToggleItem(task.item_id)
      }, index * 50) // 50ms delay between each
    })
  }

  const handleHeaderClick = () => {
    setIsExpanded(!isExpanded)
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`
        rounded-2xl border-2 p-4 mb-4
        transition-all duration-300
        ${allCompleted
          ? 'bg-[rgba(255,255,255,0.02)] border-[rgba(255,255,255,0.06)] opacity-60'
          : isActive
            ? 'bg-[rgba(255,255,255,0.03)] border-[#60efff]/50 shadow-[0_0_20px_rgba(96,239,255,0.1)]'
            : 'bg-[rgba(255,255,255,0.03)] border-[rgba(255,255,255,0.06)]'
        }
      `}
      data-testid={`task-group-${id}`}
    >
      {/* Header */}
      <button
        onClick={handleHeaderClick}
        className="w-full flex items-center justify-between mb-3 focus:outline-none focus:ring-2 focus:ring-[#60efff] focus:ring-offset-2 focus:ring-offset-[#0a0e14] rounded-lg p-2 -m-2"
        aria-expanded={isExpanded}
        aria-label={`${isExpanded ? 'Collapse' : 'Expand'} ${label} tasks`}
      >
        <div className="flex items-center gap-3">
          <span className="text-xl">{icon}</span>
          <div className="flex flex-col items-start">
            <span className="text-base font-semibold text-[#e6edf3]">{label}</span>
            <span className="text-xs text-[rgba(230,237,243,0.6)]">{time}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {allCompleted ? (
            <span className="text-xs text-[rgba(230,237,243,0.6)]">✓ Done</span>
          ) : (
            <span className="text-xs text-[rgba(230,237,243,0.6)] bg-[rgba(255,255,255,0.1)] px-2 py-1 rounded-full">
              {incompleteCount} left
            </span>
          )}
          <motion.div
            animate={{ rotate: isExpanded ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-4 w-4 text-[rgba(230,237,243,0.6)]" />
          </motion.div>
        </div>
      </button>

      {/* Tasks */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="space-y-2 pt-2">
              {tasks.map((task, index) => (
                <motion.div
                  key={task.item_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <TaskItem
                    id={task.item_id}
                    name={task.name}
                    dose={task.dosage_display}
                    completed={task.is_completed}
                    disabled={false}
                    onToggle={onToggleItem}
                    onInfoClick={onInfoClick}
                  />
                </motion.div>
              ))}
            </div>

            {/* Check All Button */}
            {showCheckAll && !allCompleted && (
              <motion.button
                onClick={handleCheckAll}
                className="mt-3 w-full py-2 px-4 rounded-lg bg-[rgba(96,239,255,0.1)] border border-[#60efff]/30 text-sm font-medium text-[#60efff] hover:bg-[rgba(96,239,255,0.15)] transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#60efff] focus:ring-offset-2 focus:ring-offset-[#0a0e14]"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Check All ({incompleteCount})
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
