"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { HelpCircle, ChevronDown, Mail, MessageCircle, Book } from "lucide-react"
import { useTranslation, type Language } from "@/lib/translations"

interface FAQItem {
  question: string
  answer: string
}

const faqItems: FAQItem[] = [
  {
    question: "How do I add supplements to my stack?",
    answer:
      "You can add supplements from the Library page. Search for a supplement and click 'Add to My Stack' in the detail modal.",
  },
  {
    question: "How do I track my supplement intake?",
    answer:
      "Use the Daily Check-in feature on the Dashboard to log your daily supplement intake and track your progress.",
  },
  {
    question: "Can I edit my supplement dosages?",
    answer:
      "Yes! Go to My Stack and click the edit icon next to any supplement to modify its dosage or timing.",
  },
  {
    question: "How do I log effects from supplements?",
    answer:
      "Navigate to Log Effect from the Dashboard or Quick Access menu. Select a supplement, choose the effect type, intensity, and add notes.",
  },
  {
    question: "What does the DNA Profile do?",
    answer:
      "The DNA Profile allows you to connect genetic data to get personalized supplement recommendations based on your genetics.",
  },
  {
    question: "How do I share my stack with the community?",
    answer:
      "You can share your stack from the Community page. Other users can then clone your stack to their own.",
  },
]

export function Help() {
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)
  const [openFAQ, setOpenFAQ] = useState<number | null>(null)

  useEffect(() => {
    const stored = localStorage.getItem("language") as Language
    if (stored) setLanguage(stored)

    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLanguage(e.detail)
    }

    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1f1f] via-[#0a1a1a] to-[#0a0f0f] pb-24 text-white">
      <div className="mx-auto max-w-md px-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="mb-2 text-2xl font-bold">{t("helpSupport") || "Help & Support"}</h1>
          <p className="text-sm text-gray-400">
            {t("helpDescription") || "Find answers to common questions and get support"}
          </p>
        </motion.div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-3"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10"
            >
              <Mail className="h-6 w-6 text-teal-400" />
              <span className="text-sm font-medium">{t("contactSupport") || "Contact Support"}</span>
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.95 }}
              className="flex flex-col items-center gap-2 rounded-xl bg-white/5 p-4 transition-colors hover:bg-white/10"
            >
              <MessageCircle className="h-6 w-6 text-teal-400" />
              <span className="text-sm font-medium">{t("liveChat") || "Live Chat"}</span>
            </motion.button>
          </motion.div>

          {/* FAQ Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="h-5 w-5 text-teal-400" />
              <h2 className="text-lg font-semibold">{t("frequentlyAskedQuestions") || "FAQ"}</h2>
            </div>
            <div className="space-y-2">
              {faqItems.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 + index * 0.05 }}
                  className="rounded-xl bg-white/5"
                >
                  <button
                    onClick={() => setOpenFAQ(openFAQ === index ? null : index)}
                    className="flex w-full items-center justify-between p-4 text-left"
                  >
                    <span className="flex-1 font-medium">{item.question}</span>
                    <ChevronDown
                      className={`h-5 w-5 text-gray-400 transition-transform ${
                        openFAQ === index ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  <AnimatePresence>
                    {openFAQ === index && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <p className="px-4 pb-4 text-sm text-gray-300">{item.answer}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* User Guide */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="rounded-2xl bg-gradient-to-r from-teal-500/20 to-cyan-500/20 p-4"
          >
            <div className="flex items-center gap-3">
              <Book className="h-6 w-6 text-teal-400" />
              <div>
                <h3 className="font-semibold">{t("userGuide") || "User Guide"}</h3>
                <p className="text-sm text-gray-300">
                  {t("userGuideDescription") || "Learn how to get the most out of WhatDose"}
                </p>
              </div>
            </div>
          </motion.div>

          {/* Contact Information */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="rounded-2xl bg-white/5 p-4"
          >
            <h3 className="mb-3 font-semibold">{t("contactUs") || "Contact Us"}</h3>
            <div className="space-y-2 text-sm text-gray-300">
              <p>
                <span className="font-medium">Email:</span> support@whatdose.com
              </p>
              <p>
                <span className="font-medium">{t("responseTime") || "Response Time"}:</span>{" "}
                {t("within24Hours") || "Within 24 hours"}
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

