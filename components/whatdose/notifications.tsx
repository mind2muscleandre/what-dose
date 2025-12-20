"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Bell, Check, X, ArrowLeft } from "lucide-react"
import { useTranslation, type Language } from "@/lib/translations"
import { useRouter } from "next/navigation"

interface Notification {
  id: string
  title: string
  message: string
  time: string
  read: boolean
  type: "reminder" | "achievement" | "system"
}

export function Notifications() {
  const router = useRouter()
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)
  const [notifications, setNotifications] = useState<Notification[]>([])

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
    // Load notifications from localStorage
    const stored = localStorage.getItem("notifications")
    if (stored) {
      try {
        setNotifications(JSON.parse(stored))
      } catch (e) {
        console.error("Failed to load notifications:", e)
      }
    } else {
      // Sample notifications - only create if localStorage is empty
      const sample: Notification[] = [
        {
          id: "1",
          title: "Time to take supplements",
          message: "Don't forget your morning stack!",
          time: "2 hours ago",
          read: false,
          type: "reminder",
        },
        {
          id: "2",
          title: "7 Day Streak!",
          message: "Congratulations on maintaining your streak!",
          time: "1 day ago",
          read: false,
          type: "achievement",
        },
        {
          id: "3",
          title: "System Update",
          message: "New features are now available!",
          time: "3 days ago",
          read: true,
          type: "system",
        },
      ]
      setNotifications(sample)
      localStorage.setItem("notifications", JSON.stringify(sample))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount

  const handleMarkAsRead = (id: string) => {
    const updated = notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    setNotifications(updated)
    localStorage.setItem("notifications", JSON.stringify(updated))
  }

  const handleDelete = (id: string) => {
    const updated = notifications.filter((n) => n.id !== id)
    setNotifications(updated)
    localStorage.setItem("notifications", JSON.stringify(updated))
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0d1f1f] via-[#0a1a1a] to-[#0a0f0f] pb-24 text-white">
      <div className="mx-auto max-w-md px-4 pt-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 flex items-center gap-4"
        >
          <button
            onClick={() => router.back()}
            className="rounded-full p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold">{t("notifications") || "Notifications"}</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-gray-400">
                {unreadCount} {t("unread") || "unread"}
              </p>
            )}
          </div>
        </motion.div>

        {notifications.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 text-center"
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/5">
                <Bell className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <h3 className="mb-2 text-lg font-semibold text-gray-300">
              {t("noNotifications") || "No notifications"}
            </h3>
            <p className="text-sm text-gray-400">
              {t("noNotificationsDescription") || "You're all caught up!"}
            </p>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`rounded-2xl bg-white/5 p-4 ${!notification.read ? "border border-teal-500/30" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <h3 className="font-medium">{notification.title}</h3>
                      {!notification.read && (
                        <span className="h-2 w-2 rounded-full bg-teal-400" />
                      )}
                    </div>
                    <p className="mb-2 text-sm text-gray-300">{notification.message}</p>
                    <p className="text-xs text-gray-500">{notification.time}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {!notification.read && (
                      <button
                        onClick={() => handleMarkAsRead(notification.id)}
                        className="rounded-lg bg-white/10 p-2 hover:bg-white/15"
                      >
                        <Check className="h-4 w-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="rounded-lg bg-red-500/20 p-2 text-red-400 hover:bg-red-500/30"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

