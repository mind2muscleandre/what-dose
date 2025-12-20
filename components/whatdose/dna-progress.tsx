"use client"

import { motion } from "framer-motion"

interface DNAProgressProps {
  progress: number // 0-100
  size?: number
}

export function DNAProgress({ progress, size = 64 }: DNAProgressProps) {
  // Generate 3D helix segments with individual Z-positions
  // This creates a true 3D structure where each segment has depth
  const numSegments = 30 // Number of segments along the helix
  const helixRadius = 12 // Radius of the helix
  const helixTurns = 3 // Number of full turns

  // Generate 3D points for left and right strands
  const generate3DPoints = (phase: number) => {
    const points: Array<{ x: number; y: number; z: number }> = []
    for (let i = 0; i <= numSegments; i++) {
      const t = i / numSegments
      const y = t * 100
      const angle = t * Math.PI * helixTurns + phase
      const x = 25 + Math.sin(angle) * helixRadius
      const z = Math.cos(angle) * helixRadius // Z-position based on helix position
      points.push({ x, y, z })
    }
    return points
  }

  const leftStrandPoints = generate3DPoints(0)
  const rightStrandPoints = generate3DPoints(Math.PI)

  // Generate base pair connections with 3D positions
  const basePairs = Array.from({ length: 8 }).map((_, i) => {
    const t = (i + 0.5) / 8
    const y = t * 100
    const angle = t * Math.PI * helixTurns
    const leftX = 25 + Math.sin(angle) * helixRadius
    const rightX = 25 + Math.sin(angle + Math.PI) * helixRadius
    const z = Math.cos(angle) * helixRadius
    return { y, leftX, rightX, z }
  })

  return (
    <div 
      className="relative flex items-center justify-center" 
      style={{ 
        width: size, 
        height: size,
        transformStyle: "preserve-3d",
      }}
    >
      {/* Glow effect when complete */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{
            opacity: [0.3, 0.6, 0.3],
            scale: [1, 1.1, 1],
          }}
          transition={{
            duration: 2,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute inset-0 rounded-full"
          style={{
            background: "radial-gradient(circle, rgba(16, 185, 129, 0.3) 0%, transparent 70%)",
            filter: "blur(8px)",
            transform: "translateZ(0)",
          }}
        />
      )}

      {/* Render 3D segments - each segment has its own Z-position */}
      {leftStrandPoints.slice(0, -1).map((point, i) => {
        const nextPoint = leftStrandPoints[i + 1]
        const rightPoint = rightStrandPoints[i]
        const rightNextPoint = rightStrandPoints[i + 1]
        
        // Calculate average Z for this segment
        const avgZ = (point.z + nextPoint.z + rightPoint.z + rightNextPoint.z) / 4
        
        // Normalize Z to 0-1 range for opacity and scale
        const normalizedZ = (avgZ + helixRadius) / (helixRadius * 2)
        const segmentOpacity = Math.round((0.3 + normalizedZ * 0.7) * 1000) / 1000
        const segmentScale = Math.round((0.94 + normalizedZ * 0.06) * 100) / 100
        
        // Check if this segment should be filled
        const segmentY = point.y
        const isFilled = segmentY <= progress
        
        // Create unique IDs for this segment
        const segmentId = `seg-${i}`
        
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              transform: `translateZ(${Math.round(avgZ * 100) / 100}px) scale(${segmentScale})`,
              transformStyle: "preserve-3d",
            }}
          >
            <svg viewBox="0 0 50 100" className="h-full w-full" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id={`dnaGradient-${segmentId}`} x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#00f260" />
                  <stop offset="50%" stopColor="#0dd3ce" />
                  <stop offset="100%" stopColor="#0575e6" />
                </linearGradient>

                <filter id={`neonGlow-${segmentId}`} x="-50%" y="-50%" width="200%" height="200%">
                  <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>

                <mask id={`liquidMask-${segmentId}`}>
                  <rect x="0" y="0" width="50" height="100" fill="black" />
                  {isFilled && (
                    <motion.rect
                      x="0"
                      y={segmentY}
                      width="50"
                      height={nextPoint.y - segmentY}
                      fill="white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </mask>
              </defs>

              {/* Background - inactive strands */}
              <g opacity={segmentOpacity * 0.3}>
                <line
                  x1={point.x}
                  y1={point.y}
                  x2={nextPoint.x}
                  y2={nextPoint.y}
                  stroke="#333333"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
                <line
                  x1={rightPoint.x}
                  y1={rightPoint.y}
                  x2={rightNextPoint.x}
                  y2={rightNextPoint.y}
                  stroke="#333333"
                  strokeWidth="3"
                  strokeLinecap="round"
                />
              </g>

              {/* Active strands with fill mask */}
              {isFilled && (
                <g mask={`url(#liquidMask-${segmentId})`} filter={`url(#neonGlow-${segmentId})`}>
                  <line
                    x1={point.x}
                    y1={point.y}
                    x2={nextPoint.x}
                    y2={nextPoint.y}
                    stroke={`url(#dnaGradient-${segmentId})`}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                  <line
                    x1={rightPoint.x}
                    y1={rightPoint.y}
                    x2={rightNextPoint.x}
                    y2={rightNextPoint.y}
                    stroke={`url(#dnaGradient-${segmentId})`}
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </g>
              )}

              {/* Extra glow when highly filled */}
              {isFilled && progress > 50 && (
                <g mask={`url(#liquidMask-${segmentId})`} opacity="0.5">
                  <line
                    x1={point.x}
                    y1={point.y}
                    x2={nextPoint.x}
                    y2={nextPoint.y}
                    stroke="#0dd3ce"
                    strokeWidth="5"
                    strokeLinecap="round"
                    style={{ filter: "blur(3px)" }}
                  />
                  <line
                    x1={rightPoint.x}
                    y1={rightPoint.y}
                    x2={rightNextPoint.x}
                    y2={rightNextPoint.y}
                    stroke="#0dd3ce"
                    strokeWidth="5"
                    strokeLinecap="round"
                    style={{ filter: "blur(3px)" }}
                  />
                </g>
              )}
            </svg>
          </div>
        )
      })}

      {/* Render base pair connections with 3D positions */}
      {basePairs.map((pair, i) => {
        const normalizedZ = (pair.z + helixRadius) / (helixRadius * 2)
        const pairOpacity = Math.round((0.3 + normalizedZ * 0.7) * 1000) / 1000
        const isFilled = pair.y <= progress
        const pairId = `pair-${i}`
        
        return (
          <div
            key={`pair-${i}`}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              transform: `translateZ(${Math.round(pair.z * 100) / 100}px)`,
              transformStyle: "preserve-3d",
            }}
          >
            <svg viewBox="0 0 50 100" className="h-full w-full" style={{ overflow: "visible" }}>
              <defs>
                <linearGradient id={`dnaGradient-${pairId}`} x1="0%" y1="100%" x2="0%" y2="0%">
                  <stop offset="0%" stopColor="#00f260" />
                  <stop offset="50%" stopColor="#0dd3ce" />
                  <stop offset="100%" stopColor="#0575e6" />
                </linearGradient>

                <mask id={`liquidMask-${pairId}`}>
                  <rect x="0" y="0" width="50" height="100" fill="black" />
                  {isFilled && (
                    <motion.rect
                      x="0"
                      y={pair.y - 2}
                      width="50"
                      height="4"
                      fill="white"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </mask>
              </defs>

              <g opacity={pairOpacity * 0.3}>
                <line
                  x1={pair.leftX}
                  y1={pair.y}
                  x2={pair.rightX}
                  y2={pair.y}
                  stroke="#333333"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </g>

              {isFilled && (
                <g mask={`url(#liquidMask-${pairId})`}>
                  <line
                    x1={pair.leftX}
                    y1={pair.y}
                    x2={pair.rightX}
                    y2={pair.y}
                    stroke={`url(#dnaGradient-${pairId})`}
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </g>
              )}
            </svg>
          </div>
        )
      })}

      {/* Percentage overlay when complete */}
      {progress === 100 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
          className="absolute inset-0 flex items-center justify-center"
          style={{
            transform: "translateZ(20px)",
          }}
        >
          <span
            className="text-xs font-bold"
            style={{
              color: "#0dd3ce",
              textShadow: "0 0 8px rgba(13, 211, 206, 0.8)",
            }}
          >
            100%
          </span>
        </motion.div>
      )}
    </div>
  )
}
