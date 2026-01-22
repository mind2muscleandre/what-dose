"use client"

import { motion } from "framer-motion"
import { Clock, Edit2, Trash2 } from "lucide-react"
import type { TimelineBlock } from "@/lib/whatdose-data"

interface StackBlocksProps {
  blocks: TimelineBlock[]
  onEdit: (itemId: string) => void
  onDelete: (itemId: string) => void
  editingId: string | null
}

export function StackBlocks({ blocks, onEdit, onDelete, editingId }: StackBlocksProps) {
  // Sort blocks: maintain order (Morning, Lunch, Pre-Workout, etc.)
  const sortedBlocks = [...blocks].sort((a, b) => {
    const order = ["Morning", "Lunch", "Pre-Workout", "Post-Workout", "Dinner", "Bedtime"]
    const aIndex = order.indexOf(a.title)
    const bIndex = order.indexOf(b.title)
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex)
  })

  return (
    <motion.div 
      className="space-y-4"
      layout
    >
      {sortedBlocks.map((block, blockIndex) => {
        const hasItems = block.items.length > 0
        
        if (!hasItems) return null

        return (
          <motion.div
            key={block.block_id}
            layout
            layoutId={`stack-block-${block.block_id}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              layout: { 
                duration: 0.6, 
                ease: [0.4, 0, 0.2, 1],
              },
              opacity: { 
                duration: 0.3,
                ease: "easeInOut"
              }
            }}
            className="space-y-2 rounded-2xl border-2 border-teal-500/30 bg-[#1a3a3a]/60 p-4 backdrop-blur-sm"
          >
            {/* Block Header */}
            <div className="flex items-center gap-2 mb-2">
              <Clock className="h-4 w-4 text-teal-400" />
              <h3 className="text-lg font-semibold text-white">
                {block.title}
              </h3>
            </div>

            {/* Block Items */}
            <div className="space-y-2">
              {block.items.map((item, itemIndex) => (
                <motion.div
                  key={item.item_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + blockIndex * 0.05 + itemIndex * 0.02 }}
                  className="flex items-center gap-3 rounded-xl bg-white/5 p-3 transition-all hover:bg-white/10"
                >
                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-white">
                      {item.name}
                    </span>
                    {item.notes && (
                      <p className="mt-0.5 text-sm text-gray-400">{item.notes}</p>
                    )}
                  </div>

                  {/* Dosage Badge */}
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-300">
                    {item.dosage_display}
                  </span>

                  {/* Edit/Delete Buttons */}
                  <div className="flex items-center gap-2">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onEdit(item.item_id)}
                      className="rounded-lg bg-white/10 p-2 hover:bg-white/15 transition-colors"
                    >
                      <Edit2 className="h-4 w-4 text-white" />
                    </motion.button>
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onDelete(item.item_id)}
                      className="rounded-lg bg-red-500/20 p-2 text-red-400 hover:bg-red-500/30 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </motion.button>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Critical Instruction (if any item has one) */}
            {block.items.some(item => item.critical_instruction) && (
              <div className="mt-2 border-t border-white/5 bg-amber-500/10 px-3 py-2 rounded-lg">
                {block.items
                  .filter(item => item.critical_instruction)
                  .map((item) => (
                    <div key={item.item_id} className="flex items-center gap-2">
                      <span className="text-xs text-amber-400">{item.critical_instruction}</span>
                    </div>
                  ))}
              </div>
            )}
          </motion.div>
        )
      })}
    </motion.div>
  )
}
