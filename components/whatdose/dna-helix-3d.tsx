"use client"

import { useRef, useMemo, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, PerspectiveCamera } from "@react-three/drei"
import * as THREE from "three"

interface DNAHelix3DProps {
  fillProgress?: number // 0-100, controls fill from bottom to top
  autoRotate?: boolean // Auto rotate the helix
  rotationSpeed?: number // Rotation speed multiplier
  fillSpeed?: number // Auto fill speed (0 = no auto fill)
  size?: number // Size of the component
}

// Individual sphere component for backbone atoms
function BackboneSphere({ 
  position, 
  fillProgress, 
  fillSpeed 
}: { 
  position: [number, number, number]
  fillProgress: number
  fillSpeed: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const timeRef = useRef(0)

  useFrame((state, delta) => {
    if (materialRef.current) {
      let currentFill = fillProgress
      
      if (fillSpeed > 0) {
        timeRef.current += delta * fillSpeed
        currentFill = (Math.sin(timeRef.current) * 0.5 + 0.5) * 100
      }

      // Normalize y from -4 to 4 to 0-1
      const normalizedY = (position[1] + 4) / 8
      const fillThreshold = currentFill / 100

      if (normalizedY <= fillThreshold && fillThreshold > 0) {
        const localProgress = normalizedY / fillThreshold
        const r = Math.floor(localProgress * 255)
        const g = Math.floor((1 - localProgress) * 255)
        const b = 255
        materialRef.current.color.setRGB(r / 255, g / 255, b / 255)
        materialRef.current.emissive.setRGB(r * 0.4 / 255, g * 0.4 / 255, b * 0.4 / 255)
      } else {
        materialRef.current.color.setRGB(0.2, 0.2, 0.2)
        materialRef.current.emissive.setRGB(0.04, 0.04, 0.04)
      }
    }
  })

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.15, 16, 16]} />
      <meshStandardMaterial
        ref={materialRef}
        emissiveIntensity={0.5}
        metalness={0.3}
        roughness={0.2}
      />
    </mesh>
  )
}

// Base pair connection component
function BasePair({ 
  startPos, 
  endPos, 
  fillProgress, 
  fillSpeed 
}: { 
  startPos: [number, number, number]
  endPos: [number, number, number]
  fillProgress: number
  fillSpeed: number
}) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const timeRef = useRef(0)

  const midPoint: [number, number, number] = [
    (startPos[0] + endPos[0]) / 2,
    (startPos[1] + endPos[1]) / 2,
    (startPos[2] + endPos[2]) / 2,
  ]

  const distance = Math.sqrt(
    Math.pow(endPos[0] - startPos[0], 2) + Math.pow(endPos[1] - startPos[1], 2) + Math.pow(endPos[2] - startPos[2], 2)
  )

  const direction = new THREE.Vector3(endPos[0] - startPos[0], endPos[1] - startPos[1], endPos[2] - startPos[2]).normalize()
  const up = new THREE.Vector3(0, 1, 0)
  const quaternion = new THREE.Quaternion().setFromUnitVectors(up, direction)

  useFrame((state, delta) => {
    if (materialRef.current) {
      let currentFill = fillProgress
      
      if (fillSpeed > 0) {
        timeRef.current += delta * fillSpeed
        currentFill = (Math.sin(timeRef.current) * 0.5 + 0.5) * 100
      }

      const normalizedY = (midPoint[1] + 4) / 8
      const fillThreshold = currentFill / 100

      if (normalizedY <= fillThreshold && fillThreshold > 0) {
        const localProgress = normalizedY / fillThreshold
        const r = Math.floor(localProgress * 255)
        const g = Math.floor((1 - localProgress) * 255)
        const b = 255
        materialRef.current.color.setRGB(r / 255, g / 255, b / 255)
        materialRef.current.emissive.setRGB(r * 0.4 / 255, g * 0.4 / 255, b * 0.4 / 255)
      } else {
        materialRef.current.color.setRGB(0.2, 0.2, 0.2)
        materialRef.current.emissive.setRGB(0.04, 0.04, 0.04)
      }
    }
  })

  return (
    <mesh ref={meshRef} position={midPoint} quaternion={quaternion}>
      <cylinderGeometry args={[0.05, 0.05, distance, 8]} />
      <meshStandardMaterial
        ref={materialRef}
        emissiveIntensity={0.4}
        metalness={0.3}
        roughness={0.2}
      />
    </mesh>
  )
}

// Main DNA Helix component
function DNAHelix({ fillProgress = 0, autoRotate = true, rotationSpeed = 1, fillSpeed = 0 }: DNAHelix3DProps) {
  const groupRef = useRef<THREE.Group>(null)

  // Update rotation
  useFrame((state, delta) => {
    if (groupRef.current && autoRotate) {
      groupRef.current.rotation.y += delta * 0.5 * rotationSpeed
    }
  })

  // Generate helix points
  const helixData = useMemo(() => {
    const numSegments = 60 // Number of backbone spheres per strand
    const helixHeight = 8 // Total height of helix
    const helixRadius = 0.8 // Radius of the helix
    const turns = 3 // Number of full turns
    const basePairSpacing = helixHeight / 12 // Spacing between base pairs

    const leftStrand: Array<{ pos: [number, number, number]; index: number }> = []
    const rightStrand: Array<{ pos: [number, number, number]; index: number }> = []
    const basePairs: Array<{ leftIndex: number; rightIndex: number; y: number }> = []

    // Generate backbone points
    for (let i = 0; i <= numSegments; i++) {
      const t = i / numSegments
      const y = (t - 0.5) * helixHeight
      const angle = t * Math.PI * 2 * turns

      // Left strand
      const leftX = Math.cos(angle) * helixRadius
      const leftZ = Math.sin(angle) * helixRadius
      leftStrand.push({ pos: [leftX, y, leftZ], index: i })

      // Right strand (opposite phase)
      const rightAngle = angle + Math.PI
      const rightX = Math.cos(rightAngle) * helixRadius
      const rightZ = Math.sin(rightAngle) * helixRadius
      rightStrand.push({ pos: [rightX, y, rightZ], index: i })
    }

    // Generate base pairs
    for (let i = 0; i < 12; i++) {
      const y = (i / 11 - 0.5) * helixHeight
      const t = (y + helixHeight / 2) / helixHeight
      const angle = t * Math.PI * 2 * turns

      const leftX = Math.cos(angle) * helixRadius
      const leftZ = Math.sin(angle) * helixRadius
      const rightX = Math.cos(angle + Math.PI) * helixRadius
      const rightZ = Math.sin(angle + Math.PI) * helixRadius

      // Find closest indices
      const leftIndex = Math.round(t * numSegments)
      const rightIndex = Math.round(t * numSegments)

      basePairs.push({ leftIndex, rightIndex, y })
    }

    return { leftStrand, rightStrand, basePairs }
  }, [])

  return (
    <group ref={groupRef}>
      {/* Left strand */}
      {helixData.leftStrand.map((point, i) => (
        <BackboneSphere 
          key={`left-${i}`} 
          position={point.pos} 
          fillProgress={fillProgress}
          fillSpeed={fillSpeed}
        />
      ))}

      {/* Right strand */}
      {helixData.rightStrand.map((point, i) => (
        <BackboneSphere 
          key={`right-${i}`} 
          position={point.pos} 
          fillProgress={fillProgress}
          fillSpeed={fillSpeed}
        />
      ))}

      {/* Base pairs */}
      {helixData.basePairs.map((pair, i) => {
        const leftPoint = helixData.leftStrand[pair.leftIndex]
        const rightPoint = helixData.rightStrand[pair.rightIndex]
        if (!leftPoint || !rightPoint) return null

        return (
          <BasePair
            key={`pair-${i}`}
            startPos={leftPoint.pos}
            endPos={rightPoint.pos}
            fillProgress={fillProgress}
            fillSpeed={fillSpeed}
          />
        )
      })}
    </group>
  )
}

// Main export component
export function DNAHelix3D({ fillProgress = 0, autoRotate = true, rotationSpeed = 1, fillSpeed = 0, size = 400 }: DNAHelix3DProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  
  useEffect(() => {
    // Use ResizeObserver to ensure Canvas knows about container position changes
    if (!containerRef.current) return
    
    const resizeObserver = new ResizeObserver(() => {
      // Trigger resize event to update Canvas position
      window.dispatchEvent(new Event('resize'))
    })
    
    resizeObserver.observe(containerRef.current)
    
    // Also trigger resize after mount to ensure initial positioning
    const triggerResize = () => {
      window.dispatchEvent(new Event('resize'))
    }
    
    // Trigger with delays to ensure DOM is ready
    setTimeout(triggerResize, 0)
    setTimeout(triggerResize, 100)
    setTimeout(triggerResize, 300)
    
    return () => {
      resizeObserver.disconnect()
    }
  }, [])
  
  return (
    <div ref={containerRef} style={{ width: size, height: size, position: 'relative' }}>
      <Canvas 
        gl={{ alpha: true, antialias: true }}
        onCreated={() => {
          // Trigger resize when canvas is created to ensure correct positioning
          requestAnimationFrame(() => {
            window.dispatchEvent(new Event('resize'))
          })
        }}
      >
        <PerspectiveCamera makeDefault position={[0, 0, 6]} fov={50} />
        <ambientLight intensity={0.3} />
        <pointLight position={[5, 5, 5]} intensity={0.5} />
        <pointLight position={[-5, -5, -5]} intensity={0.3} color="#00ffff" />
        <DNAHelix fillProgress={fillProgress} autoRotate={autoRotate} rotationSpeed={rotationSpeed} fillSpeed={fillSpeed} />
        <OrbitControls enableZoom={false} enablePan={false} autoRotate={false} />
      </Canvas>
    </div>
  )
}

