"use client"

import { useState } from "react"
import { DNAHelix3D } from "./dna-helix-3d"

/**
 * Example usage of DNAHelix3D component
 * 
 * This demonstrates different ways to use the 3D DNA Helix:
 * 1. Manual fill progress control
 * 2. Auto-fill animation
 * 3. Custom rotation speed
 */
export function DNAHelix3DExample() {
  const [fillProgress, setFillProgress] = useState(0)

  return (
    <div className="flex flex-col items-center gap-8 p-8 bg-black min-h-screen">
      <h1 className="text-3xl font-bold text-white">3D DNA Double Helix Examples</h1>

      {/* Example 1: Manual fill control */}
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-xl text-white">Manual Fill Control</h2>
        <DNAHelix3D fillProgress={fillProgress} autoRotate={true} size={400} />
        <div className="flex gap-4 items-center">
          <input
            type="range"
            min="0"
            max="100"
            value={fillProgress}
            onChange={(e) => setFillProgress(Number(e.target.value))}
            className="w-64"
          />
          <span className="text-white">{fillProgress}%</span>
        </div>
      </div>

      {/* Example 2: Auto-fill animation */}
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-xl text-white">Auto-Fill Animation</h2>
        <DNAHelix3D fillProgress={0} autoRotate={true} fillSpeed={0.3} size={400} />
        <p className="text-gray-400">Automatically fills and empties with smooth animation</p>
      </div>

      {/* Example 3: Fast rotation */}
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-xl text-white">Fast Rotation</h2>
        <DNAHelix3D fillProgress={75} autoRotate={true} rotationSpeed={2} size={400} />
        <p className="text-gray-400">Rotates at 2x speed</p>
      </div>

      {/* Example 4: Static with full fill */}
      <div className="flex flex-col items-center gap-4">
        <h2 className="text-xl text-white">Static - Fully Filled</h2>
        <DNAHelix3D fillProgress={100} autoRotate={false} size={400} />
        <p className="text-gray-400">No rotation, fully filled</p>
      </div>
    </div>
  )
}

