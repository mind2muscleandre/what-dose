import { useEffect, useState } from "react"

/**
 * Preloads Three.js and React Three Fiber dependencies
 * Call this early in the app lifecycle for faster helix loading
 */
export function usePreloadHelix() {
  const [isPreloaded, setIsPreloaded] = useState(false)

  useEffect(() => {
    // Preload Three.js and React Three Fiber
    const preload = async () => {
      try {
        // Dynamically import to trigger code splitting and caching
        await Promise.all([
          import("@react-three/fiber"),
          import("@react-three/drei"),
          import("three"),
        ])
        setIsPreloaded(true)
      } catch (error) {
        console.error("Failed to preload helix dependencies:", error)
        setIsPreloaded(true) // Set to true anyway to not block rendering
      }
    }

    preload()
  }, [])

  return isPreloaded
}

