"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { User, ArrowLeft, Save, Loader2 } from "lucide-react"
import { useTranslation, type Language } from "@/lib/translations"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { useProfile } from "@/hooks/use-profile"

export function EditProfile() {
  const router = useRouter()
  const { user } = useAuth()
  const { profile, loading: profileLoading, updateProfile } = useProfile(user?.id || null)
  const [language, setLanguage] = useState<Language>("en")
  const { t } = useTranslation(language)
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    age: "",
    weight: "",
    gender: "",
  })
  const [saving, setSaving] = useState(false)

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
    // Load profile data from Supabase
    if (profile) {
      setFormData({
        name: profile.first_name ?? "",
        username: profile.username ?? "",
        email: user?.email ?? "",
        age: profile.age != null ? profile.age.toString() : "",
        weight: profile.weight_kg != null ? profile.weight_kg.toString() : "",
        gender: profile.gender ?? "",
      })
    }
  }, [profile, user])

  const handleSave = async () => {
    if (!user?.id) {
      alert(t("pleaseSignIn") || "Please sign in to update your profile")
      return
    }

    setSaving(true)
    try {
      const { error } = await updateProfile({
        first_name: formData.name.trim() || null,
        username: formData.username.trim() || null,
        age: formData.age ? parseInt(formData.age) : null,
        weight_kg: formData.weight ? parseFloat(formData.weight) : null,
        gender: formData.gender || null,
      })

      if (error) {
        alert(t("errorUpdatingProfile") || `Error updating profile: ${error}`)
      } else {
        alert(t("profileUpdated") || "Profile updated successfully!")
        router.back()
      }
    } catch (err) {
      console.error("Error saving profile:", err)
      alert(t("errorUpdatingProfile") || "Failed to update profile")
    } finally {
      setSaving(false)
    }
  }

  if (profileLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0d1f1f]">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-teal-500/30 border-t-teal-500" />
      </div>
    )
  }

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
          <h1 className="text-2xl font-bold">{t("editProfile") || "Edit Profile"}</h1>
        </motion.div>

        <div className="space-y-6">
          {/* Profile Picture */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col items-center"
          >
            <div className="mb-4 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-teal-400 to-cyan-500">
              <User className="h-12 w-12 text-white" />
            </div>
            <button className="text-sm text-teal-400 hover:text-teal-300">
              {t("changePhoto") || "Change Photo"}
            </button>
          </motion.div>

          {/* Form Fields */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400">
                {t("name") || "Name"}
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400">
                {t("username") || "Username"}
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                placeholder={t("usernamePlaceholder") || "Choose a username"}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none"
              />
              <p className="mt-1 text-xs text-gray-500">{t("usernameDescription") || "This will be shown in the community"}</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400">
                {t("email") || "Email"}
              </label>
              <input
                type="email"
                value={formData.email}
                disabled
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-gray-500 cursor-not-allowed"
              />
              <p className="mt-1 text-xs text-gray-500">{t("emailCannotBeChanged") || "Email cannot be changed"}</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400">
                {t("age") || "Age"}
              </label>
              <input
                type="number"
                value={formData.age}
                onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                placeholder="30"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400">
                {t("weight") || "Weight"} (kg)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                placeholder="75"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-gray-500 focus:border-teal-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-400">
                {t("gender") || "Gender"}
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: "male", label: t("male") || "Male" },
                  { key: "female", label: t("female") || "Female" },
                  { key: "other", label: t("other") || "Other" },
                ].map((gender) => (
                  <button
                    key={gender.key}
                    onClick={() => setFormData({ ...formData, gender: gender.label })}
                    className={`rounded-xl border py-3 text-sm transition-all ${
                      formData.gender === gender.label
                        ? "border-teal-500 bg-teal-500/10 text-teal-400"
                        : "border-white/10 bg-white/5 hover:border-white/20"
                    }`}
                  >
                    {gender.label}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.button
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            disabled={saving || profileLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 py-4 font-medium transition-all hover:opacity-90 disabled:opacity-50"
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                {t("saving") || "Saving..."}
              </>
            ) : (
              <>
                <Save className="h-5 w-5" />
                {t("save") || "Save Changes"}
              </>
            )}
          </motion.button>
        </div>
      </div>
    </div>
  )
}

