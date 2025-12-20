"use client"

import { useEffect } from "react"
import { usePreloadHelix } from "@/hooks/use-preload-helix"

/**
 * Preloads Three.js and React Three Fiber dependencies early
 * Place this component in the root layout for faster helix loading
 */
export function HelixPreloader() {
  usePreloadHelix()
  return null // This component doesn't render anything
}

