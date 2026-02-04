"use client"

import { motion } from "framer-motion"
import { Check, Info } from "lucide-react"

interface TaskItemProps {
  id: string
  name: string
  dose: string
  completed: boolean
  disabled: boolean
  onToggle: (id: string) => void
  onInfoClick: (id: string) => void
}

export function TaskItem({
  id,
  name,
  dose,
  completed,
  disabled,
  onToggle,
  onInfoClick,
}: TaskItemProps) {
  const handleToggle = () => {
    if (disabled) return
    
    // Haptic feedback on mobile
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(10)
    }
    
    onToggle(id)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: completed ? 0.5 : disabled ? 0.3 : 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={`
        flex items-center gap-3 p-3 rounded-xl
        ${completed 
          ? 'bg-[rgba(255,255,255,0.02)]' 
          : disabled 
            ? 'opacity-30 pointer-events-none' 
            : 'bg-[rgba(255,255,255,0.03)] hover:bg-[rgba(96,239,255,0.08)] border border-transparent hover:border-[#60efff]/30'
        }
        transition-all duration-200
      `}
    >
      {/* Custom Checkbox */}
      <motion.button
        onClick={handleToggle}
        disabled={disabled}
        className={`
          flex h-6 w-6 shrink-0 items-center justify-center rounded-md
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[#60efff] focus:ring-offset-2 focus:ring-offset-[#0a0e14]
          ${completed
            ? 'bg-[#60efff] border-transparent'
            : 'border-2 border-[rgba(230,237,243,0.3)] hover:border-[#60efff]'
          }
          ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-checked={completed}
        aria-label={`${completed ? 'Uncheck' : 'Check'} ${name}`}
        data-testid={`task-checkbox-${id}`}
        whileTap={disabled ? {} : { scale: 0.9 }}
      >
        {completed && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <Check className="h-4 w-4 text-[#0a0e14]" strokeWidth={3} />
          </motion.div>
        )}
      </motion.button>

      {/* Supplement Name */}
      <div className="flex-1 min-w-0">
        <span
          className={`
            font-medium text-sm
            ${completed 
              ? 'text-[rgba(230,237,243,0.4)] line-through' 
              : 'text-[#e6edf3]'
            }
          `}
        >
          {name}
        </span>
      </div>

      {/* Dose Amount */}
      <span className="text-xs text-[rgba(230,237,243,0.6)] shrink-0">
        {dose}
      </span>

      {/* Info Button */}
      <motion.button
        onClick={(e) => {
          e.stopPropagation()
          onInfoClick(id)
        }}
        disabled={disabled}
        className={`
          flex h-6 w-6 shrink-0 items-center justify-center rounded-md
          text-[rgba(230,237,243,0.6)] hover:text-[#60efff] hover:bg-[rgba(96,239,255,0.1)]
          transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-[#60efff] focus:ring-offset-2 focus:ring-offset-[#0a0e14]
          ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}
        `}
        aria-label={`View details for ${name}`}
        whileTap={disabled ? {} : { scale: 0.9 }}
      >
        <Info className="h-4 w-4" />
      </motion.button>
    </motion.div>
  )
}
