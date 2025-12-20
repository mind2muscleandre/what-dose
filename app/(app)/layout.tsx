"use client"

import type React from "react"
import { BottomNavigation } from "@/components/whatdose/bottom-navigation"
import { usePageView } from "@/hooks/use-page-view"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  usePageView()

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1f1f] via-[#0a1a1a] to-[#0a0f0f]">
      {children}
      <BottomNavigation />
    </div>
  )
}
