"use client"

import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Check } from "lucide-react"
import type { TimelineBlock } from "@/lib/whatdose-data"
import { useTranslation, type Language } from "@/lib/translations"

interface DailyCheckInProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
  timelineBlocks: TimelineBlock[]
}

interface Message {
  id: string
  type: "ai" | "user"
  content: string
  inputType?: "slider" | "chips" | "multiselect" | "adherence" | "summary"
  options?: string[]
  isComplete?: boolean
}

interface CheckInData {
  date: string
  sleep_score: number
  energy_tag: string
  reported_side_effects: string[]
  adherence_update: { item_id: string; status: string } | null
}

const SLEEP_ICONS = ["😫", "😔", "😐", "😊", "🤩"]

export function DailyCheckIn({ isOpen, onClose, userName = "User", timelineBlocks }: DailyCheckInProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [currentStep, setCurrentStep] = useState(0)
  const [isTyping, setIsTyping] = useState(false)
  const [sleepScore, setSleepScore] = useState(50)
  const [selectedEnergy, setSelectedEnergy] = useState<string | null>(null)
  const [selectedSideEffects, setSelectedSideEffects] = useState<string[]>([])
  const [isComplete, setIsComplete] = useState(false)
  const [checkInData, setCheckInData] = useState<CheckInData>({
    date: new Date().toISOString().split("T")[0],
    sleep_score: 0,
    energy_tag: "",
    reported_side_effects: [],
    adherence_update: null,
  })

  const messagesEndRef = useRef<HTMLDivElement>(null)

  const [lang, setLang] = useState<Language>("en")
  const { t } = useTranslation(lang)

  useEffect(() => {
    const storedLang = localStorage.getItem("language") as Language
    if (storedLang) setLang(storedLang)

    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLang(e.detail)
    }

    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener)
  }, [])

  const ENERGY_OPTIONS = [t("lowSluggish"), t("stable"), t("highPumped"), t("jitteryStressed")]
  const SIDE_EFFECT_OPTIONS = [
    t("noneOption"),
    t("stomachIssues"),
    t("headacheOption"),
    t("nauseaOption"),
    t("heartPalpitations"),
  ]

  const uncompletedItem = timelineBlocks.flatMap((block) => block.items).find((item) => !item.is_completed)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, isTyping])

  useEffect(() => {
    if (isOpen) {
      setMessages([])
      setCurrentStep(0)
      setIsTyping(false)
      setSleepScore(50)
      setSelectedEnergy(null)
      setSelectedSideEffects([])
      setIsComplete(false)
      setCheckInData({
        date: new Date().toISOString().split("T")[0],
        sleep_score: 0,
        energy_tag: "",
        reported_side_effects: [],
        adherence_update: null,
      })
      setTimeout(() => addAIMessage(0), 500)
    }
  }, [isOpen])

  const addAIMessage = (step: number) => {
    setIsTyping(true)

    setTimeout(() => {
      setIsTyping(false)

      let message: Message

      switch (step) {
        case 0:
          message = {
            id: `ai-${step}`,
            type: "ai",
            content: `${t("goodMorning")} ${userName}! ${t("howWasSleep")}`,
            inputType: "slider",
          }
          break
        case 1:
          message = {
            id: `ai-${step}`,
            type: "ai",
            content: t("howIsEnergy"),
            inputType: "chips",
            options: ENERGY_OPTIONS,
          }
          break
        case 2:
          message = {
            id: `ai-${step}`,
            type: "ai",
            content: t("anySideEffects"),
            inputType: "multiselect",
            options: SIDE_EFFECT_OPTIONS,
          }
          break
        case 3:
          if (uncompletedItem) {
            message = {
              id: `ai-${step}`,
              type: "ai",
              content: `${t("seeMissing")} ${uncompletedItem.name} ${t("inYourList")}`,
              inputType: "adherence",
              options: [t("yesTookIt"), t("noSkipping"), t("remindLater")],
            }
          } else {
            addAIMessage(4)
            return
          }
          break
        case 4:
          const summary = generateSummary()
          message = {
            id: `ai-${step}`,
            type: "ai",
            content: summary,
            inputType: "summary",
            isComplete: true,
          }
          setIsComplete(true)
          console.log("Daily Check-In Data:", checkInData)
          break
        default:
          return
      }

      setMessages((prev) => [...prev, message])
      setCurrentStep(step)
    }, 600)
  }

  const generateSummary = (): string => {
    const sleepText =
      sleepScore >= 70 ? t("goodSleepSummary") : sleepScore >= 40 ? t("okaySleepSummary") : t("poorSleepSummary")
    const energyText = selectedEnergy?.toLowerCase() || t("stable").toLowerCase()
    const sideEffectText =
      selectedSideEffects.includes(t("noneOption")) || selectedSideEffects.length === 0
        ? t("noSideEffectsSummary")
        : `${t("someSideEffectsSummary")} ${selectedSideEffects
            .filter((s) => s !== t("noneOption"))
            .join(", ")
            .toLowerCase()}`

    return `${t("summaryPrefix")} ${sleepText.charAt(0).toUpperCase() + sleepText.slice(1)}, ${energyText} ${t("summarySuffix")} ${sideEffectText}. ${t("summaryEnd")}`
  }

  const handleSleepSubmit = () => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-sleep`,
        type: "user",
        content: `${SLEEP_ICONS[Math.floor(sleepScore / 25)]} ${sleepScore}%`,
      },
    ])
    setCheckInData((prev) => ({ ...prev, sleep_score: sleepScore }))
    setTimeout(() => addAIMessage(1), 300)
  }

  const handleEnergySelect = (energy: string) => {
    setSelectedEnergy(energy)
    setMessages((prev) => [
      ...prev,
      {
        id: `user-energy`,
        type: "user",
        content: energy,
      },
    ])
    setCheckInData((prev) => ({ ...prev, energy_tag: energy }))
    setTimeout(() => addAIMessage(2), 300)
  }

  const handleSideEffectsSubmit = () => {
    const effects = selectedSideEffects.length > 0 ? selectedSideEffects : [t("noneOption")]
    setMessages((prev) => [
      ...prev,
      {
        id: `user-sideeffects`,
        type: "user",
        content: effects.join(", "),
      },
    ])
    setCheckInData((prev) => ({ ...prev, reported_side_effects: effects }))
    setTimeout(() => addAIMessage(3), 300)
  }

  const handleAdherenceSelect = (option: string) => {
    setMessages((prev) => [
      ...prev,
      {
        id: `user-adherence`,
        type: "user",
        content: option,
      },
    ])

    const status = option === t("yesTookIt") ? "taken" : option === t("noSkipping") ? "skipped" : "remind"
    setCheckInData((prev) => ({
      ...prev,
      adherence_update: uncompletedItem ? { item_id: uncompletedItem.item_id, status } : null,
    }))
    setTimeout(() => addAIMessage(4), 300)
  }

  const toggleSideEffect = (effect: string) => {
    if (effect === t("noneOption")) {
      setSelectedSideEffects([t("noneOption")])
    } else {
      setSelectedSideEffects((prev) => {
        const filtered = prev.filter((e) => e !== t("noneOption"))
        if (filtered.includes(effect)) {
          return filtered.filter((e) => e !== effect)
        }
        return [...filtered, effect]
      })
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-md"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: "10%" }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-x-0 bottom-0 z-[100] h-[90%] overflow-hidden rounded-t-3xl bg-[#0d1f1f]/95 backdrop-blur-xl"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <h2 className="text-lg font-semibold text-white">{t("dailyAnalysis")}</h2>
              <button
                onClick={onClose}
                className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex h-[calc(100%-4rem)] flex-col overflow-y-auto overscroll-contain p-4 pb-24">
              <div className="flex-1 space-y-4">
                <AnimatePresence mode="popLayout">
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ type: "spring", damping: 20, stiffness: 300 }}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      {message.type === "ai" ? (
                        <div className="max-w-[85%] space-y-3">
                          <div className="rounded-2xl rounded-tl-sm bg-[#1a3a3a]/80 p-4 ring-1 ring-cyan-500/30 backdrop-blur-sm">
                            <p className="text-sm leading-relaxed text-gray-100">{message.content}</p>
                          </div>

                          {message.inputType === "slider" && currentStep === 0 && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-4 rounded-2xl bg-[#1a3a3a]/60 p-4"
                            >
                              <div className="flex justify-between px-2">
                                {SLEEP_ICONS.map((icon, i) => (
                                  <button
                                    key={i}
                                    onClick={() => setSleepScore(i * 25)}
                                    className={`text-2xl transition-all ${
                                      Math.floor(sleepScore / 25) === i ? "scale-125" : "opacity-50"
                                    }`}
                                  >
                                    {icon}
                                  </button>
                                ))}
                              </div>
                              <input
                                type="range"
                                min="0"
                                max="100"
                                value={sleepScore}
                                onChange={(e) => setSleepScore(Number(e.target.value))}
                                className="w-full accent-cyan-500"
                              />
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-400">{sleepScore}%</span>
                                <button
                                  onClick={handleSleepSubmit}
                                  className="rounded-full bg-cyan-500 px-4 py-2 text-sm font-medium text-black transition-all hover:bg-cyan-400"
                                >
                                  {t("confirm")}
                                </button>
                              </div>
                            </motion.div>
                          )}

                          {message.inputType === "chips" && currentStep === 1 && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-wrap gap-2"
                            >
                              {message.options?.map((option) => (
                                <button
                                  key={option}
                                  onClick={() => handleEnergySelect(option)}
                                  className="rounded-full bg-[#1a3a3a] px-4 py-2 text-sm text-white ring-1 ring-white/10 transition-all hover:bg-cyan-500/20 hover:ring-cyan-500/50"
                                >
                                  {option}
                                </button>
                              ))}
                            </motion.div>
                          )}

                          {message.inputType === "multiselect" && currentStep === 2 && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="space-y-3"
                            >
                              <div className="grid grid-cols-2 gap-2">
                                {message.options?.map((option) => (
                                  <button
                                    key={option}
                                    onClick={() => toggleSideEffect(option)}
                                    className={`rounded-xl px-3 py-2.5 text-sm transition-all ${
                                      selectedSideEffects.includes(option)
                                        ? "bg-cyan-500/20 text-cyan-400 ring-1 ring-cyan-500/50"
                                        : "bg-[#1a3a3a] text-white ring-1 ring-white/10 hover:ring-white/30"
                                    }`}
                                  >
                                    {option}
                                  </button>
                                ))}
                              </div>
                              <button
                                onClick={handleSideEffectsSubmit}
                                className="w-full rounded-full bg-cyan-500 py-2.5 text-sm font-medium text-black transition-all hover:bg-cyan-400"
                              >
                                {t("continueBtn")}
                              </button>
                            </motion.div>
                          )}

                          {message.inputType === "adherence" && currentStep === 3 && (
                            <motion.div
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className="flex flex-col gap-2"
                            >
                              {message.options?.map((option) => (
                                <button
                                  key={option}
                                  onClick={() => handleAdherenceSelect(option)}
                                  className="rounded-xl bg-[#1a3a3a] px-4 py-3 text-left text-sm text-white ring-1 ring-white/10 transition-all hover:bg-cyan-500/20 hover:ring-cyan-500/50"
                                >
                                  {option}
                                </button>
                              ))}
                            </motion.div>
                          )}

                          {message.inputType === "summary" && message.isComplete && (
                            <motion.div
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              transition={{ type: "spring", delay: 0.3 }}
                              className="flex flex-col items-center gap-3 py-4"
                            >
                              <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", delay: 0.5 }}
                                className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-emerald-600"
                              >
                                <Check className="h-8 w-8 text-white" />
                              </motion.div>
                              <span className="text-sm font-medium text-green-400">{t("checkInCompleteTitle")}</span>
                              <button
                                onClick={onClose}
                                className="mt-2 rounded-full bg-white/10 px-6 py-2 text-sm text-white transition-all hover:bg-white/20"
                              >
                                {t("close")}
                              </button>
                            </motion.div>
                          )}
                        </div>
                      ) : (
                        <div className="max-w-[75%] rounded-2xl rounded-tr-sm bg-gradient-to-br from-cyan-500 to-teal-600 p-4">
                          <p className="text-sm font-medium text-white">{message.content}</p>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>

                <AnimatePresence>
                  {isTyping && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex justify-start"
                    >
                      <div className="rounded-2xl rounded-tl-sm bg-[#1a3a3a]/80 px-4 py-3 ring-1 ring-cyan-500/30">
                        <div className="flex gap-1">
                          {[0, 1, 2].map((i) => (
                            <motion.div
                              key={i}
                              animate={{ y: [0, -4, 0] }}
                              transition={{
                                duration: 0.5,
                                repeat: Number.POSITIVE_INFINITY,
                                delay: i * 0.1,
                              }}
                              className="h-2 w-2 rounded-full bg-cyan-400"
                            />
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                <div ref={messagesEndRef} />
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
