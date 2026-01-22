"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Plus, Heart, GitFork, User, ChevronRight } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { useProtocols } from "@/hooks/use-protocols"

export default function ProtocolsPage() {
  const router = useRouter()
  const { user, loading: authLoading } = useAuth()
  const { protocols, loading, error, forkProtocol, toggleLike } = useProtocols(user?.id || null)

  if (authLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1f1f]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500/30 border-t-teal-500" />
      </div>
    )
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
            <h1 className="text-2xl font-bold">Protocols</h1>
            <p className="text-gray-400">Discover and fork supplement protocols</p>
          </div>
          {user && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/protocols/create")}
              className="flex items-center gap-2 rounded-xl bg-teal-500/20 px-4 py-2 text-sm font-medium text-teal-400 hover:bg-teal-500/30"
            >
              <Plus className="h-4 w-4" />
              Create
            </motion.button>
          )}
        </div>

        {protocols.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-400">No protocols yet. Be the first to create one!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {protocols.map((protocol, i) => (
              <motion.div
                key={protocol.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl bg-white/5 p-4"
              >
                <div className="mb-3 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-purple-500">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{protocol.title}</p>
                    <p className="text-sm text-gray-400">by {protocol.author_name}</p>
                  </div>
                  {protocol.forked_from_id && (
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <GitFork className="h-3 w-3" />
                      Forked
                    </div>
                  )}
                </div>

                {protocol.description && (
                  <p className="mb-4 text-sm text-gray-300">{protocol.description}</p>
                )}

                <div className="flex items-center justify-between border-t border-white/10 pt-3">
                  <div className="flex items-center gap-4">
                    <motion.button
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleLike(protocol.id)}
                      className={`flex items-center gap-1 transition-colors ${
                        protocol.is_liked ? "text-pink-400" : "text-gray-400 hover:text-pink-400"
                      }`}
                    >
                      <Heart className={`h-5 w-5 ${protocol.is_liked ? "fill-current" : ""}`} />
                      <span className="text-sm">{protocol.like_count}</span>
                    </motion.button>
                    <div className="flex items-center gap-1 text-gray-400">
                      <GitFork className="h-5 w-5" />
                      <span className="text-sm">{protocol.fork_count}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {user && (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={async () => {
                          const title = prompt("Enter a name for your fork:")
                          if (title) {
                            const result = await forkProtocol(protocol.id, title, "")
                            if (result.error) {
                              alert(result.error)
                            } else {
                              alert("Protocol forked successfully!")
                            }
                          }
                        }}
                        className="flex items-center gap-2 rounded-lg bg-teal-500/20 px-3 py-2 text-sm font-medium text-teal-400 hover:bg-teal-500/30"
                      >
                        <GitFork className="h-4 w-4" />
                        Fork
                      </motion.button>
                    )}
                    <button
                      onClick={() => router.push(`/protocols/${protocol.id}`)}
                      className="rounded-lg bg-white/10 p-2 hover:bg-white/15"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

