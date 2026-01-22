"use client"

import { useState, useEffect } from "react"
import dynamic from "next/dynamic"
import { motion, useScroll, useTransform, useMotionValueEvent } from "framer-motion"
import { ArrowRight, Search, Shield, Flame, Sparkles, AlertTriangle, Check, Star } from "lucide-react"
import Link from "next/link"
import { useRef } from "react"
import { DNAProgress } from "./dna-progress"
import { LanguageToggle } from "./language-toggle"
import { useTranslation, type Language } from "@/lib/translations"
import { supabase } from "@/lib/supabase"
import type { SupplementSearchResult } from "@/lib/database.types"

// Dynamic import with no SSR for better performance - cached after first load
const DNAHelix3D = dynamic(() => import("./dna-helix-3d").then((mod) => ({ default: mod.DNAHelix3D })), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <div className="h-16 w-16 animate-spin rounded-full border-4 border-teal-500/30 border-t-teal-500" />
    </div>
  ),
})

export function LandingPage() {
  const [ctaHovered, setCtaHovered] = useState(false)
  const [searchValue, setSearchValue] = useState("")
  const [searchResults, setSearchResults] = useState<SupplementSearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [supplementCount, setSupplementCount] = useState<number | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const heroRef = useRef<HTMLElement>(null)

  const [language, setLanguage] = useState<Language>("en")
  const [helixSize, setHelixSize] = useState(500)
  const { t } = useTranslation(language)

  useEffect(() => {
    const saved = localStorage.getItem("whatdose-language") as Language
    if (saved) setLanguage(saved)

    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLanguage(e.detail)
    }

    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener)
  }, [])

  // Calculate responsive helix size
  useEffect(() => {
    const updateSize = () => {
      const width = window.innerWidth
      if (width < 640) {
        // Mobile
        setHelixSize(Math.min(width * 1.2, 500))
      } else if (width < 1024) {
        // Tablet
        setHelixSize(600)
      } else {
        // Desktop
        setHelixSize(700)
      }
    }

    updateSize()
    window.addEventListener("resize", updateSize)
    return () => window.removeEventListener("resize", updateSize)
  }, [])

  // Scroll progress based on entire page
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  })

  // Fill progress: 0% at top, 100% at bottom of page
  const dnaFillProgress = useTransform(scrollYProgress, [0, 1], [0, 100])
  
  // Convert MotionValue to number for 3D component
  const [fillProgressValue, setFillProgressValue] = useState(0)
  
  useMotionValueEvent(dnaFillProgress, "change", (latest) => {
    setFillProgressValue(latest)
  })

  // Fetch supplement count on mount
  useEffect(() => {
    const fetchSupplementCount = async () => {
      const { count, error } = await supabase
        .from('supplements')
        .select('*', { count: 'exact', head: true })
        .eq('is_parent', true)
      
      if (!error && count !== null) {
        setSupplementCount(count)
      }
    }
    fetchSupplementCount()
  }, [])

  // Search supplements when user types
  useEffect(() => {
    const searchSupplements = async () => {
      if (searchValue.trim().length < 2) {
        setSearchResults([])
        return
      }

      setSearchLoading(true)
      try {
        const { data, error } = await supabase.rpc('search_supplements', {
          search_term: searchValue.trim()
        })

        if (error) {
          console.error('Search error:', error)
          setSearchResults([])
        } else {
          setSearchResults(data || [])
        }
      } catch (err) {
        console.error('Search error:', err)
        setSearchResults([])
      } finally {
        setSearchLoading(false)
      }
    }

    const timeoutId = setTimeout(searchSupplements, 300) // Debounce
    return () => clearTimeout(timeoutId)
  }, [searchValue])

  const testimonials = [
    {
      name: t("testimonial1Name"),
      role: t("testimonial1Role"),
      text: t("testimonial1Text"),
    },
    {
      name: t("testimonial2Name"),
      role: t("testimonial2Role"),
      text: t("testimonial2Text"),
    },
    {
      name: t("testimonial3Name"),
      role: t("testimonial3Role"),
      text: t("testimonial3Text"),
    },
  ]

  return (
    <div ref={containerRef} className="relative min-h-screen overflow-x-hidden bg-[#0a0a0a] text-white">
      {/* Background Effects */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute left-[10%] top-[10%] h-[500px] w-[500px] rounded-full bg-gradient-to-br from-teal-500/30 to-transparent blur-3xl"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.15, 0.25, 0.15] }}
          transition={{ duration: 10, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          className="absolute right-[5%] top-[30%] h-[600px] w-[600px] rounded-full bg-gradient-to-bl from-purple-500/20 to-transparent blur-3xl"
        />
      </div>

      <div className="relative mx-auto max-w-6xl px-6 py-12 z-10">
        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-20 flex items-center justify-between relative z-10"
        >
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-cyan-600 shadow-lg shadow-teal-500/50">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-2xl font-bold">{t("appName")}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageToggle />
            <Link href="/dashboard" className="text-sm text-gray-400 transition-colors hover:text-teal-400">
              {t("loginButton")}
            </Link>
          </div>
        </motion.header>

        {/* DNA Helix Background - spans over hero and next section */}
        <div className="fixed inset-0 pointer-events-none z-[1] flex items-center justify-center overflow-hidden">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative w-full h-full"
            style={{
              maxWidth: "800px",
              maxHeight: "1200px",
            }}
          >
            <motion.div
              animate={ctaHovered ? { scale: [1, 1.05, 1] } : {}}
              transition={{ duration: 0.8, ease: "easeInOut" }}
              className="absolute inset-0 flex items-center justify-center"
            >
              <div className="w-full h-full flex items-center justify-center">
                <DNAHelix3D 
                  fillProgress={ctaHovered ? 100 : fillProgressValue} 
                  autoRotate={true}
                  rotationSpeed={1}
                  size={helixSize}
                />
              </div>

              {/* Glow ring */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  ease: "easeInOut",
                }}
                className="absolute inset-0 rounded-full pointer-events-none"
                style={{
                  background: "radial-gradient(circle, rgba(20, 184, 166, 0.4) 0%, transparent 70%)",
                  filter: "blur(40px)",
                  transform: "translateZ(0)",
                }}
              />
            </motion.div>
          </motion.div>
        </div>

        {/* 1. HERO SECTION - Split Screen */}
        <section ref={heroRef} className="mb-32 relative z-10 grid gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left: Copy */}
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="flex flex-col justify-center"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mb-4 inline-flex items-center gap-2 self-start rounded-full border border-teal-500/30 bg-teal-500/10 px-4 py-2 text-sm text-teal-400"
            >
              <Flame className="h-4 w-4" />
              {t("usedByBiohackers")}
            </motion.div>

            <h1 className="mb-6 text-balance text-5xl font-bold leading-[1.1] tracking-tight lg:text-6xl">
              {t("heroTitle")}{" "}
              <span className="bg-gradient-to-r from-teal-400 via-cyan-400 to-purple-400 bg-clip-text text-transparent">
                {t("heroTitleHighlight")}
              </span>
            </h1>

            <p className="mb-8 text-pretty text-xl leading-relaxed text-gray-300">
              {t("heroDescription")} <span className="font-semibold text-white">{t("heroDescriptionBold")}</span>{" "}
              {t("heroDescriptionContinued")}
            </p>

            {/* CTA Button */}
            <Link href="/onboarding">
              <motion.button
                onHoverStart={() => setCtaHovered(true)}
                onHoverEnd={() => setCtaHovered(false)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="group relative inline-flex items-center justify-center gap-3 overflow-hidden rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-10 py-5 text-lg font-bold text-white shadow-2xl shadow-teal-500/50 transition-all hover:shadow-teal-500/70"
                style={{
                  boxShadow: ctaHovered
                    ? "0 0 60px rgba(20, 184, 166, 0.8), 0 0 100px rgba(20, 184, 166, 0.4)"
                    : "0 20px 40px rgba(20, 184, 166, 0.3)",
                }}
              >
                <span className="relative z-10">{t("ctaButton")}</span>
                <ArrowRight className="relative z-10 h-5 w-5 transition-transform group-hover:translate-x-2" />
                {/* Animated shine effect */}
                <motion.div
                  animate={ctaHovered ? { x: ["-100%", "200%"] } : {}}
                  transition={{ duration: 0.6 }}
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                />
              </motion.button>
            </Link>

            <p className="mt-4 text-sm text-gray-400">{t("ctaSubtext")}</p>
          </motion.div>
        </section>

        {/* 2. OLD WAY VS NEW WAY */}
        <motion.section
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="mb-32 relative z-10"
        >
          <h2 className="mb-12 text-center text-3xl font-bold lg:text-4xl">{t("oldWayVsNewWayTitle")}</h2>

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Old Way */}
            <motion.div
              initial={{ opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.2 }}
              className="rounded-3xl border border-red-500/30 bg-gradient-to-br from-red-950/20 to-gray-900/20 p-8 backdrop-blur-sm"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-red-500/20 px-4 py-2 text-sm font-semibold text-red-400">
                <AlertTriangle className="h-4 w-4" />
                {t("oldWayTitle")}
              </div>
              <ul className="space-y-4 text-gray-400">
                {[t("oldWayItem1"), t("oldWayItem2"), t("oldWayItem3"), t("oldWayItem4")].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 1, x: 0 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className="mt-1 h-2 w-2 rounded-full bg-red-500/50" />
                    <span>{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {/* New Way */}
            <motion.div
              initial={{ opacity: 1, x: 0 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.2 }}
              className="relative overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-br from-teal-950/30 to-cyan-950/20 p-8 backdrop-blur-sm"
            >
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-4 py-2 text-sm font-semibold text-teal-400">
                <Check className="h-4 w-4" />
                {t("newWayTitle")}
              </div>
              <ul className="space-y-4 text-gray-200">
                {[t("newWayItem1"), t("newWayItem2"), t("newWayItem3"), t("newWayItem4")].map((item, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 1, x: 0 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.3 + i * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-teal-400" />
                    <span className="font-medium">{item}</span>
                  </motion.li>
                ))}
              </ul>

              {/* Animated glow */}
              <motion.div
                animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY }}
                className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-teal-500/30 blur-3xl"
              />
            </motion.div>
          </div>

          <p className="mt-8 text-center text-xl text-gray-300">{t("oldWayVsNewWayDescription")}</p>
        </motion.section>

        {/* 3. INTERACTIVE FEATURE SHOWCASE */}
        <motion.section
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          className="mb-32 relative z-10"
        >
          <h2 className="mb-4 text-center text-3xl font-bold lg:text-4xl">{t("interactiveFeatureShowcaseTitle")}</h2>
          <p className="mb-16 text-center text-xl text-gray-400">{t("interactiveFeatureShowcaseDescription")}</p>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Feature 1: Database Search */}
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.1 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-sm transition-all hover:border-teal-500/50"
            >
              <Search className="mb-4 h-10 w-10 text-teal-400" />
              <h3 className="mb-3 text-2xl font-bold">{t("feature1Title")}</h3>
              <p className="mb-6 text-gray-400">
                {supplementCount !== null 
                  ? `${Math.max(supplementCount, 550)}+ tillskott i databasen`
                  : "550+ tillskott i databasen"
                }
              </p>

              {/* Animated search demo */}
              <div className="relative">
                <motion.input
                  initial={{ opacity: 1 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: false }}
                  transition={{ delay: 0.5 }}
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  placeholder={t("searchPlaceholder")}
                  className="w-full rounded-xl border border-white/20 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-gray-500 focus:border-teal-500/50 focus:outline-none"
                />
                {searchLoading && (
                  <div className="mt-3 text-center text-xs text-gray-400">Söker...</div>
                )}
                {!searchLoading && searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-3 space-y-2 max-h-48 overflow-y-auto"
                  >
                    {searchResults.slice(0, 3).map((result) => (
                      <div
                        key={result.parent_id}
                        className="rounded-xl border border-green-500/30 bg-green-500/10 p-3"
                      >
                        <div className="mb-1 flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-green-500" />
                          <span className="text-xs font-semibold text-green-400">
                            {result.parent_research_status === "Green" ? "Verifierad" : 
                             result.parent_research_status === "Blue" ? "Begränsad" : "Låg"}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300">
                          <span className="font-bold">
                            {language === "sv" && result.parent_name_sv 
                              ? result.parent_name_sv 
                              : result.parent_name_en}
                          </span>
                          {result.variants.length > 0 && (
                            <span className="text-gray-400"> • {result.variants.length} variant{result.variants.length > 1 ? "er" : ""}</span>
                          )}
                        </p>
                      </div>
                    ))}
                  </motion.div>
                )}
                {!searchLoading && searchValue.length >= 2 && searchResults.length === 0 && (
                  <div className="mt-3 text-center text-xs text-gray-400">Inga resultat hittades</div>
                )}
                {!searchLoading && searchValue.length < 2 && (
                  <motion.div
                    initial={{ opacity: 1, y: 0 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: false }}
                    transition={{ delay: 0.8 }}
                    className="mt-3 rounded-xl border border-green-500/30 bg-green-500/10 p-4"
                  >
                    <div className="mb-2 flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-green-500" />
                      <span className="text-sm font-semibold text-green-400">{t("feature1Status")}</span>
                    </div>
                    <p className="text-sm text-gray-300">
                      <span className="font-bold">{t("feature1Supplement")}</span> • {t("feature1Dose")}
                    </p>
                  </motion.div>
                )}
              </div>
            </motion.div>

            {/* Feature 2: Interaction Checker */}
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.2 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-sm transition-all hover:border-purple-500/50"
            >
              <Shield className="mb-4 h-10 w-10 text-purple-400" />
              <h3 className="mb-3 text-2xl font-bold">{t("feature2Title")}</h3>
              <p className="mb-6 text-gray-400">{t("feature2Description")}</p>

              {/* Collision animation */}
              <div className="relative h-24 w-full flex items-center justify-center">
                <div className="relative w-[240px] h-12 flex items-center justify-center gap-2">
                  <motion.div
                    animate={{ 
                      x: [-120, 0, 0], 
                      opacity: [1, 1, 1] 
                    }}
                    transition={{ 
                      duration: 2, 
                      times: [0, 0.5, 1],
                      repeat: Number.POSITIVE_INFINITY, 
                      repeatDelay: 1 
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-blue-600 text-xs font-bold text-white"
                  >
                    Zn
                  </motion.div>
                  <motion.div
                    animate={{ 
                      scale: [0, 1.2, 1], 
                      opacity: [0, 1, 1] 
                    }}
                    transition={{
                      duration: 2,
                      times: [0, 0.5, 1],
                      repeat: Number.POSITIVE_INFINITY,
                      repeatDelay: 1,
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/20"
                  >
                    <AlertTriangle className="h-6 w-6 text-amber-400" />
                  </motion.div>
                  <motion.div
                    animate={{ 
                      x: [120, 0, 0], 
                      opacity: [1, 1, 1] 
                    }}
                    transition={{ 
                      duration: 2, 
                      times: [0, 0.5, 1],
                      repeat: Number.POSITIVE_INFINITY, 
                      repeatDelay: 1 
                    }}
                    className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-xs font-bold text-white"
                  >
                    Mg
                  </motion.div>
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: [0, 1, 1, 0] }}
                transition={{
                  duration: 3,
                  times: [0, 0.7, 0.95, 1],
                  repeat: Number.POSITIVE_INFINITY,
                  repeatDelay: 0,
                }}
                className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/10 p-3"
              >
                <p className="text-sm font-semibold text-amber-400">{t("feature2Warning")}</p>
                <p className="text-xs text-gray-300">{t("feature2Rescheduling")}</p>
              </motion.div>
            </motion.div>

            {/* Feature 3: Gamification */}
            <motion.div
              initial={{ opacity: 1, y: 0 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false }}
              transition={{ delay: 0.3 }}
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/5 to-white/[0.02] p-8 backdrop-blur-sm transition-all hover:border-cyan-500/50"
            >
              <Flame className="mb-4 h-10 w-10 text-orange-400" />
              <h3 className="mb-3 text-2xl font-bold">{t("feature3Title")}</h3>
              <p className="mb-6 text-gray-400">{t("feature3Description")}</p>

              {/* Counting animation */}
              <div className="flex items-center gap-4">
                <DNAProgress progress={70} size={80} />
                <div>
                  <motion.p
                    initial={{ opacity: 1 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: false }}
                    className="text-4xl font-bold text-teal-400"
                  >
                    <motion.span initial={{ opacity: 1 }} whileInView={{ opacity: 1 }} viewport={{ once: false }}>
                      7
                    </motion.span>
                  </motion.p>
                  <p className="text-sm text-gray-400">{t("feature3DayStreak")}</p>
                </div>
              </div>

              <div className="mt-4 space-y-2">
                {[
                  { label: t("feature3Consistency"), value: 85 },
                  { label: t("feature3Progress"), value: 70 },
                ].map((stat) => (
                  <div key={stat.label}>
                    <div className="mb-1 flex justify-between text-xs">
                      <span className="text-gray-400">{stat.label}</span>
                      <span className="font-semibold text-teal-400">{stat.value}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${stat.value}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1, delay: 0.5 }}
                        className="h-full rounded-full bg-gradient-to-r from-teal-500 to-cyan-500"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* 4. SOCIAL PROOF */}
        <motion.section
          initial={{ opacity: 1 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: false }}
          className="mb-32 relative z-10"
        >
          <h2 className="mb-12 text-center text-3xl font-bold lg:text-4xl">{t("socialProofTitle")}</h2>

          <div className="grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 1, y: 0 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false }}
                transition={{ delay: i * 0.1 }}
                className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm"
              >
                <div className="mb-4 flex gap-1">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-gray-300">{`"${testimonial.text}"`}</p>
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 font-bold text-white">
                    {testimonial.name[0]}
                  </div>
                  <div>
                    <p className="font-medium">{testimonial.name}</p>
                    <p className="text-sm text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* 5. FINAL CTA */}
        <motion.section
          initial={{ opacity: 1, y: 0 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false }}
          className="relative z-10 overflow-hidden rounded-3xl border border-teal-500/30 bg-gradient-to-br from-teal-950/50 to-cyan-950/30 p-12 text-center backdrop-blur-sm"
        >
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY }}
            className="absolute left-1/2 top-1/2 h-[400px] w-[400px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-teal-500/20 blur-3xl"
          />

          <div className="relative">
            <h2 className="mb-4 text-3xl font-bold lg:text-4xl">{t("finalCTATitle")}</h2>
            <p className="mb-8 text-xl text-gray-300">{t("finalCTADescription")}</p>

            <Link href="/onboarding">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="group inline-flex items-center gap-3 rounded-2xl bg-gradient-to-r from-teal-500 to-cyan-500 px-10 py-5 text-lg font-bold shadow-2xl shadow-teal-500/50 transition-all hover:shadow-teal-500/70"
              >
                {t("finalCTAButton")}
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-2" />
              </motion.button>
            </Link>

            <p className="mt-4 text-sm text-gray-400">{t("finalCTASubtext")}</p>
          </div>
        </motion.section>
      </div>
    </div>
  )
}
