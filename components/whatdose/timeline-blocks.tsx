"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import { Check, Clock, AlertTriangle } from "lucide-react"
import type { TimelineBlock } from "@/lib/whatdose-data"

interface TimelineBlocksProps {
  blocks: TimelineBlock[]
  onToggleItem: (blockId: string, itemId: string) => void
}

export function TimelineBlocks({ blocks, onToggleItem }: TimelineBlocksProps) {
  // Sort blocks: completed blocks at the bottom, active blocks at the top
  const sortedBlocks = [...blocks].sort((a, b) => {
    const aCompleted = a.items.every(item => item.is_completed)
    const bCompleted = b.items.every(item => item.is_completed)
    
    // If both are completed or both are active, maintain original order
    if (aCompleted === bCompleted) {
      return 0
    }
    
    // Active blocks (not all completed) come first
    return aCompleted ? 1 : -1
  })
  
  // Track which blocks are newly completed for animation
  const [newlyCompleted, setNewlyCompleted] = useState<Set<string>>(new Set())
  const prevCompletedBlocksRef = useRef<Set<string>>(new Set())
  
  useEffect(() => {
    // Check for newly completed blocks (blocks that just became completed)
    const currentCompletedBlocks = new Set(
      sortedBlocks
        .filter(block => block.items.every(item => item.is_completed))
        .map(block => block.block_id)
    )
    
    // Find blocks that are newly completed (in current but not in previous)
    const newlyCompletedBlocks = new Set(
      Array.from(currentCompletedBlocks).filter(id => !prevCompletedBlocksRef.current.has(id))
    )
    
    if (newlyCompletedBlocks.size > 0) {
      setNewlyCompleted(newlyCompletedBlocks)
      
      // Clear the "newly completed" highlight after animation
      const timer = setTimeout(() => {
        setNewlyCompleted(new Set())
      }, 800)
      
      prevCompletedBlocksRef.current = currentCompletedBlocks
      return () => clearTimeout(timer)
    } else {
      prevCompletedBlocksRef.current = currentCompletedBlocks
    }
  }, [sortedBlocks])

  return (
    <motion.div 
      className="space-y-4"
      layout
    >
      {sortedBlocks.map((block, blockIndex) => {
        const allCompleted = block.items.every(item => item.is_completed)
        const hasItems = block.items.length > 0
        
        if (!hasItems) return null

        return (
          <motion.div
            key={block.block_id}
            layout
            layoutId={`block-${block.block_id}`}
            initial={{ opacity: 0 }}
            animate={{ 
              opacity: allCompleted ? 0.6 : 1,
            }}
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
            className={`space-y-2 rounded-2xl border-2 p-4 backdrop-blur-sm ${
              allCompleted
                ? newlyCompleted.has(block.block_id)
                  ? "border-teal-500/50 bg-teal-500/10" // Highlight when newly completed
                  : "border-gray-700/50 bg-gray-800/30"
                : "border-teal-500/30 bg-[#1a3a3a]/60"
            }`}
          >
            {/* Block Header */}
            <div className="flex items-center gap-2 mb-2">
              <Clock className={`h-4 w-4 ${allCompleted ? "text-gray-500" : "text-teal-400"}`} />
              <h3 className={`text-lg font-semibold ${allCompleted ? "text-gray-500" : "text-white"}`}>
                {block.title}
              </h3>
              {allCompleted && (
                <span className="ml-auto text-xs text-gray-500">Completed</span>
              )}
            </div>

            {/* Block Items */}
            <div className="space-y-2">
              {block.items.map((item, itemIndex) => (
                <motion.div
                  key={item.item_id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.15 + blockIndex * 0.05 + itemIndex * 0.02 }}
                  className={`flex items-center gap-3 rounded-xl p-3 transition-all ${
                    item.is_completed
                      ? "bg-gray-800/20"
                      : "bg-white/5 hover:bg-white/10"
                  }`}
                >
                  {/* Checkbox */}
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onToggleItem(block.block_id, item.item_id)}
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                      item.is_completed
                        ? "border-transparent bg-gradient-to-br from-teal-400 to-cyan-500"
                        : "border-gray-500 hover:border-gray-400"
                    }`}
                  >
                    {item.is_completed && (
                      <Check className="h-4 w-4 text-white" />
                    )}
                  </motion.button>

                  {/* Task Content */}
                  <div className="flex-1 min-w-0">
                    <span
                      className={`font-medium transition-colors ${
                        item.is_completed ? "text-gray-500 line-through" : "text-white"
                      }`}
                    >
                      {item.name}
                    </span>
                    {item.notes && (
                      <p className="mt-0.5 text-sm text-gray-400">{item.notes}</p>
                    )}
                  </div>

                  {/* Dosage */}
                  <span className="rounded-full bg-white/10 px-2 py-0.5 text-xs text-gray-300">
                    {item.dosage_display}
                  </span>
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
                      <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
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
