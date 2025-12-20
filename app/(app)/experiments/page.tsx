"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, Beaker, Calendar, TrendingUp } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useExperiments } from "@/hooks/use-experiments"

export default function ExperimentsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { experiments, loading, error } = useExperiments(user?.id || null)

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1f1f]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500/30 border-t-teal-500" />
      </div>
    )
  }

  if (!user) {
    router.push("/auth/login")
    return null
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1f1f] text-white">
        <div className="text-center">
          <p className="text-red-400">Error: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1f1f] via-[#0a1a1a] to-[#0a0f0f] pb-24 text-white">
      <div className="px-4 pt-6">
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">N-of-1 Experiments</h1>
            <p className="text-gray-400">Track your personal supplement experiments</p>
          </div>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => router.push("/experiments/create")}
            className="flex items-center gap-2 rounded-xl bg-teal-500/20 px-4 py-2 text-sm font-medium text-teal-400 hover:bg-teal-500/30"
          >
            <Plus className="h-4 w-4" />
            New Experiment
          </motion.button>
        </div>

        {experiments.length === 0 ? (
          <div className="text-center py-12">
            <Beaker className="mx-auto mb-4 h-12 w-12 text-gray-400" />
            <p className="mb-2 text-lg font-semibold text-gray-300">No experiments yet</p>
            <p className="mb-6 text-sm text-gray-400">
              Create your first N-of-1 experiment to track supplement effects
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/experiments/create")}
              className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 font-medium"
            >
              Create Experiment
            </motion.button>
          </div>
        ) : (
          <div className="space-y-4">
            {experiments.map((experiment, i) => (
              <motion.div
                key={experiment.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-white/5 p-4"
              >
                <div className="mb-3 flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="mb-1 text-lg font-semibold">{experiment.title}</h3>
                    {experiment.description && (
                      <p className="text-sm text-gray-400">{experiment.description}</p>
                    )}
                  </div>
                  <span className="rounded-full bg-teal-500/20 px-3 py-1 text-xs text-teal-400">
                    {experiment.design}
                  </span>
                </div>

                <div className="mb-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Calendar className="h-4 w-4" />
                    <span>
                      {new Date(experiment.start_date).toLocaleDateString()} -{" "}
                      {new Date(experiment.end_date).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <TrendingUp className="h-4 w-4" />
                    <span>{experiment.current_phase}</span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div className="mb-1 flex items-center justify-between text-xs text-gray-400">
                    <span>Progress</span>
                    <span>{Math.round(experiment.progress_percentage || 0)}%</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${experiment.progress_percentage || 0}%` }}
                      className="h-full bg-gradient-to-r from-teal-500 to-cyan-500"
                    />
                  </div>
                </div>

                <button
                  onClick={() => router.push(`/experiments/${experiment.id}`)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 py-2 text-sm font-medium transition-colors hover:bg-white/10"
                >
                  View Details
                </button>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
