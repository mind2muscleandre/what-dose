"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, Clock, AlertTriangle } from "lucide-react"
import type { TimelineBlock } from "@/lib/whatdose-data"

interface TaskListProps {
  blocks: TimelineBlock[]
  onToggleItem: (blockId: string, itemId: string) => void
}

export function TaskList({ blocks, onToggleItem }: TaskListProps) {
  // Flatten all items from all blocks into a single list with block info
  const allTasks = blocks.flatMap((block) =>
    block.items.map((item) => ({
      ...item,
      blockId: block.block_id,
      blockTitle: block.title,
      blockColor: block.ui_color_hex,
      suggestedTime: block.suggested_time,
    })),
  )

  return (
    <div className="space-y-3">
      {allTasks.map((task, index) => (
        <motion.div
          key={task.item_id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 + index * 0.05 }}
          className="overflow-hidden rounded-2xl bg-[#1a3a3a]/60 backdrop-blur-sm"
        >
          <div className="flex items-center gap-4 p-4">
            {/* Checkbox */}
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => onToggleItem(task.blockId, task.item_id)}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                task.is_completed
                  ? "border-transparent bg-gradient-to-br from-teal-400 to-cyan-500"
                  : "border-gray-500 hover:border-gray-400"
              }`}
            >
              <AnimatePresence>
                {task.is_completed && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
                    <Check className="h-4 w-4 text-white" />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>

            {/* Task Content */}
            <div className="flex-1 min-w-0">
              <span
                className={`font-medium transition-colors ${
                  task.is_completed ? "text-gray-500 line-through" : "text-white"
                }`}
              >
                {task.name}
              </span>
              {task.notes && <p className="mt-0.5 text-sm text-gray-400">{task.notes}</p>}
            </div>

            {/* Time & Dosage */}
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1 text-sm text-gray-400">
                <Clock className="h-3.5 w-3.5" />
                <span>{task.suggestedTime}</span>
              </div>
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-300">{task.dosage_display}</span>
            </div>
          </div>

          {/* Critical Instruction */}
          {task.critical_instruction && (
            <div className="border-t border-white/5 bg-amber-500/10 px-4 py-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                <span className="text-xs text-amber-400">{task.critical_instruction}</span>
              </div>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  )
}
