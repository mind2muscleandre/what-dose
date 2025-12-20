"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { ShoppingCart, CheckCircle, AlertCircle, Link as LinkIcon, Plus } from "lucide-react"
import { useTranslation, type Language } from "@/lib/translations"
import { useRouter } from "next/navigation"

interface RefillItem {
  id: string
  name: string
  dosage: string
  stockLevel: "low" | "medium" | "good"
  ordered: boolean
  productLink?: string
}

export function Refill() {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)
  const [refillItems, setRefillItems] = useState<RefillItem[]>([])

  useEffect(() => {
    const stored = localStorage.getItem("language") as Language
    if (stored) setLanguage(stored)

    const handleLanguageChange = (e: CustomEvent<Language>) => {
      setLanguage(e.detail)
    }

    window.addEventListener("languageChange", handleLanguageChange as EventListener)
    return () => window.removeEventListener("languageChange", handleLanguageChange as EventListener)
  }, [])

  useEffect(() => {
    // Load refill items from localStorage or generate from stack
    const stored = localStorage.getItem("refillItems")
    if (stored) {
      try {
        setRefillItems(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to load refill items:", e)
      }
    } else {
      // Generate from stack if available
      const stack = localStorage.getItem("userStack")
      if (stack) {
        try {
          const stackItems = JSON.parse(stack)
          const items: RefillItem[] = stackItems.map((item: { id: string; name: string; dosage: string }) => ({
            id: item.id,
            name: item.name,
            dosage: item.dosage,
            stockLevel: "medium" as const,
            ordered: false,
          }))
          setRefillItems(items)
          localStorage.setItem("refillItems", JSON.stringify(items))
        } catch (e) {
          console.error("Failed to generate refill items:", e)
        }
      }
    }
  }, [])

  const handleToggleOrdered = (id: string) => {
    const newItems = refillItems.map((item) =>
      item.id === id ? { ...item, ordered: !item.ordered } : item
    )
    setRefillItems(newItems)
    localStorage.setItem("refillItems", JSON.stringify(newItems))
  }

  const handleUpdateStockLevel = (id: string, level: "low" | "medium" | "good") => {
    const newItems = refillItems.map((item) => (item.id === id ? { ...item, stockLevel: level } : item))
    setRefillItems(newItems)
    localStorage.setItem("refillItems", JSON.stringify(newItems))
  }

  const handleAddLink = (id: string, link: string) => {
    const newItems = refillItems.map((item) => (item.id === id ? { ...item, productLink: link } : item))
    setRefillItems(newItems)
    localStorage.setItem("refillItems", JSON.stringify(newItems))
  }

  const lowStockItems = refillItems.filter((item) => item.stockLevel === "low" && !item.ordered)
  const orderedItems = refillItems.filter((item) => item.ordered)
  const otherItems = refillItems.filter(
    (item) => item.stockLevel !== "low" && !item.ordered
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1f1f] via-[#0a1a1a] to-[#0a0f0f] pb-24 text-white">
      <div className="mx-auto max-w-md px-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="mb-2 text-2xl font-bold">{t("refill")}</h1>
          <p className="text-sm text-gray-400">
            {t("refillDescription") || "Track your supplement inventory and refills"}
          </p>
        </motion.div>

        {refillItems.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center"
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <ShoppingCart className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-300">
              {t("noRefillItems") || "No items to track"}
            </h3>
            <p className="mb-6 text-sm text-gray-400">
              {t("noRefillItemsDescription") || "Add supplements to your stack to track inventory"}
            </p>
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push("/stack")}
              className="rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 px-6 py-3 font-medium"
            >
              {t("goToStack") || "Go to My Stack"}
            </motion.button>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {/* Low Stock Alert */}
            {lowStockItems.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4"
              >
                <div className="mb-2 flex items-center gap-2 text-amber-400">
                  <AlertCircle className="h-5 w-5" />
                  <span className="font-medium">
                    {lowStockItems.length} {t("lowStock") || "items low in stock"}
                  </span>
                </div>
                <p className="text-sm text-gray-300">
                  {t("lowStockDescription") || "Consider ordering these supplements soon"}
                </p>
              </motion.div>
            )}

            {/* Ordered Items */}
            {orderedItems.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">{t("ordered") || "Ordered"}</h2>
                {orderedItems.map((item) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="rounded-2xl bg-white/5 p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="mb-1 flex items-center gap-2">
                          <h3 className="font-medium">{item.name}</h3>
                          <CheckCircle className="h-4 w-4 text-emerald-400" />
                        </div>
                        <p className="text-sm text-gray-400">{item.dosage}</p>
                        {item.productLink && (
                          <a
                            href={item.productLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300"
                          >
                            <LinkIcon className="h-3 w-3" />
                            {t("viewProduct") || "View Product"}
                          </a>
                        )}
                      </div>
                      <button
                        onClick={() => handleToggleOrdered(item.id)}
                        className="rounded-lg bg-white/10 px-3 py-1 text-xs hover:bg-white/15"
                      >
                        {t("markAsReceived") || "Mark as Received"}
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}

            {/* All Items */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold">{t("allSupplements") || "All Supplements"}</h2>
              {refillItems.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="rounded-2xl bg-white/5 p-4"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-400">{item.dosage}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <select
                        value={item.stockLevel}
                        onChange={(e) =>
                          handleUpdateStockLevel(item.id, e.target.value as "low" | "medium" | "good")
                        }
                        className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white"
                      >
                        <option value="low">{t("low") || "Low"}</option>
                        <option value="medium">{t("medium") || "Medium"}</option>
                        <option value="good">{t("good") || "Good"}</option>
                      </select>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleOrdered(item.id)}
                      className={`flex-1 rounded-lg py-2 text-sm font-medium transition-all ${
                        item.ordered
                          ? "bg-emerald-500/20 text-emerald-400"
                          : "bg-white/10 text-gray-300 hover:bg-white/15"
                      }`}
                    >
                      {item.ordered ? t("ordered") || "Ordered" : t("markAsOrdered") || "Mark as Ordered"}
                    </button>
                    <button
                      onClick={() => {
                        const link = prompt(t("enterProductLink") || "Enter product link:")
                        if (link) handleAddLink(item.id, link)
                      }}
                      className="rounded-lg bg-white/10 p-2 hover:bg-white/15"
                    >
                      <LinkIcon className="h-4 w-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

