"use client"

import { useEffect } from "react"
import { useState } from "react"
import { useTheme } from "next-themes"
import { createClient } from "@/lib/supabase/client"
import {
  User, Palette, Shield, Camera, Check,
  Eye, EyeOff, AlertTriangle, ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface SettingsViewProps {
  userName: string
  userEmail: string
}

type Section = "profile" | "appearance" | "security"

const ACCENT_COLORS = [
  { name: "Orange",  value: "orange",  light: "oklch(0.7 0.2 45)",  cls: "bg-orange-500" },
  { name: "Blue",    value: "blue",    light: "oklch(0.55 0.2 240)",   cls: "bg-blue-500"   },
  { name: "Green",   value: "green",   light: "oklch(0.55 0.18 145)",  cls: "bg-green-500"  },
  { name: "Purple",  value: "purple",  light: "oklch(0.55 0.2 290)",   cls: "bg-purple-500" },
  { name: "Rose",    value: "rose",    light: "oklch(0.6 0.22 10)",    cls: "bg-rose-500"   },
  { name: "Cyan",    value: "cyan",    light: "oklch(0.6 0.15 200)",   cls: "bg-cyan-500"   },
]

export function SettingsView({ userName, userEmail }: SettingsViewProps) {
  const { theme, setTheme } = useTheme()
  const supabase = createClient()
  const [activeSection, setActiveSection] = useState<Section>("profile")

  // Profile
  const [displayName, setDisplayName] = useState(userName)
  const [profileSaved, setProfileSaved] = useState(false)

  // Appearance
  const [accentColor, setAccentColor] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("accent-color") || "orange"
    }
    return "orange"
  })

  // Security
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword]         = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent]         = useState(false)
  const [showNew, setShowNew]                 = useState(false)
  const [passwordMsg, setPasswordMsg]         = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [deleteConfirm, setDeleteConfirm]     = useState("")
  const [showDeletePanel, setShowDeletePanel] = useState(false)
  const [isDeleting, setIsDeleting]           = useState(false)

  const navItems: { id: Section; label: string; icon: React.ReactNode }[] = [
    { id: "profile",    label: "Profile",            icon: <User className="h-4 w-4" /> },
    { id: "appearance", label: "Appearance",         icon: <Palette className="h-4 w-4" /> },
    { id: "security",   label: "Account & Security", icon: <Shield className="h-4 w-4" /> },
  ]

  useEffect(() => {
    const saved = localStorage.getItem("accent-color")
    if (saved) {
      const color = ACCENT_COLORS.find(c => c.value === saved)
      if (color) {
        document.documentElement.style.setProperty("--primary", color.light)
        document.documentElement.style.setProperty("--ring", color.light)
      }
    }
  }, [])

  const handleSaveProfile = async () => {
    const { error } = await supabase.auth.updateUser({
      data: { full_name: displayName }
    })
    if (!error) {
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2500)
    }
  }

    const applyAccent = (color: typeof ACCENT_COLORS[number]) => {
      setAccentColor(color.value)
      document.documentElement.style.setProperty("--primary", color.light)
      // document.documentElement.style.setProperty("--sidebar-primary", color.light)
      document.documentElement.style.setProperty("--ring", color.light)
      localStorage.setItem("accent-color", color.value)
    }

  const handleChangePassword = async () => {
    setPasswordMsg(null)
    if (!newPassword || newPassword.length < 6) {
      setPasswordMsg({ type: "error", text: "New password must be at least 6 characters." })
      return
    }
    if (newPassword !== confirmPassword) {
      setPasswordMsg({ type: "error", text: "Passwords don't match." })
      return
    }
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) {
      setPasswordMsg({ type: "error", text: error.message })
    } else {
      setPasswordMsg({ type: "success", text: "Password updated successfully!" })
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("")
    }
  }

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== userEmail) return
    setIsDeleting(true)
    await supabase.auth.signOut()
    window.location.href = "/auth/login"
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Page header */}
      <div>
        <h2 className="text-2xl font-bold">Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage your profile, appearance, and account.
        </p>
      </div>

      {/* ── FIX 1: flex-col on mobile, flex-row on desktop */}
      <div className="flex flex-col gap-4 lg:flex-row lg:gap-6 lg:items-start">

        {/* ── FIX 2: horizontal scrolling tabs on mobile, vertical sidebar on desktop */}
        <nav className="w-full lg:w-48 lg:flex-shrink-0 lg:sticky lg:top-8 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-1 lg:pb-0">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={cn(
                // FIX 3: flex-shrink-0 on mobile so tabs don't compress, full-width on desktop
                "flex-shrink-0 lg:w-full flex items-center gap-2 lg:gap-3 px-3 py-2 lg:py-2.5 rounded-xl text-sm font-medium transition-colors text-left whitespace-nowrap",
                activeSection === item.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              {item.icon}
              {item.label}
              {/* FIX 4: hide arrow on mobile (horizontal layout) */}
              {activeSection !== item.id && (
                <ChevronRight className="h-3.5 w-3.5 ml-auto opacity-40 hidden lg:block" />
              )}
            </button>
          ))}
        </nav>

        {/* ── Content */}
        <div className="flex-1 min-w-0 space-y-4">

          {/* ════ PROFILE ════ */}
          {activeSection === "profile" && (
            <SettingsCard title="Profile Information" description="Update your display name and avatar.">
              <div className="flex items-center gap-5 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-2xl bg-primary flex items-center justify-center text-primary-foreground text-2xl font-bold">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <button className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full bg-card border-2 border-border flex items-center justify-center hover:bg-muted transition-colors">
                    <Camera className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                </div>
                <div>
                  <p className="font-semibold">{displayName}</p>
                  <p className="text-sm text-muted-foreground">{userEmail}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">Pro Plan</p>
                </div>
              </div>

              <div className="space-y-4">
                <Field label="Display name">
                  <input
                    type="text"
                    value={displayName}
                    onChange={e => setDisplayName(e.target.value)}
                    className="et-input"
                    placeholder="Your name"
                  />
                </Field>
                <Field label="Email address">
                  <input
                    type="email"
                    value={userEmail}
                    disabled
                    className="et-input opacity-50 cursor-not-allowed"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">
                    Email cannot be changed here. Contact support if needed.
                  </p>
                </Field>
              </div>

              <div className="mt-6 flex items-center gap-3">
                <Button onClick={handleSaveProfile} className="gap-2">
                  {profileSaved && <Check className="h-4 w-4" />}
                  {profileSaved ? "Saved!" : "Save changes"}
                </Button>
                {profileSaved && (
                  <span className="text-sm text-accent font-medium flex items-center gap-1.5">
                    <Check className="h-3.5 w-3.5" /> Profile updated
                  </span>
                )}
              </div>
            </SettingsCard>
          )}

          {/* ════ APPEARANCE ════ */}
          {activeSection === "appearance" && (
            <>
              <SettingsCard title="Theme" description="Choose between light and dark mode.">
                {/* 3 cols on mobile too — they're small enough */}
                <div className="grid grid-cols-3 gap-2 lg:gap-3">
                  {(["light", "dark", "system"] as const).map(t => (
                    <button
                      key={t}
                      onClick={() => setTheme(t)}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 lg:p-4 rounded-xl border-2 transition-all",
                        theme === t
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/40 hover:bg-muted/40"
                      )}
                    >
                      <div className={cn(
                        "w-full h-10 rounded-lg overflow-hidden flex",
                        t === "dark"   ? "bg-zinc-900" :
                        t === "light"  ? "bg-zinc-100" :
                        "bg-gradient-to-r from-zinc-100 to-zinc-900"
                      )}>
                        <div className={cn(
                          "w-1/3 h-full",
                          t === "dark"  ? "bg-zinc-800" :
                          t === "light" ? "bg-zinc-200" :
                          "bg-gradient-to-b from-zinc-200 to-zinc-800"
                        )} />
                        <div className="flex-1 p-1.5 space-y-1">
                          <div className={cn("h-1.5 w-3/4 rounded-full", t === "dark" ? "bg-zinc-700" : "bg-zinc-300")} />
                          <div className={cn("h-1.5 w-1/2 rounded-full", t === "dark" ? "bg-zinc-700" : "bg-zinc-300")} />
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {theme === t && <Check className="h-3 w-3 text-primary" />}
                        <span className="text-xs font-medium capitalize">{t}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </SettingsCard>

              <SettingsCard title="Accent Color" description="Personalize your primary color across the app.">
                {/* 3 cols on mobile, 6 on desktop */}
                <div className="grid grid-cols-3 lg:grid-cols-6 gap-2 lg:gap-3">
                  {ACCENT_COLORS.map(color => (
                    <button
                      key={color.value}
                      onClick={() => applyAccent(color)}
                      title={color.name}
                      className={cn(
                        "flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all",
                        accentColor === color.value
                          ? "border-foreground"
                          : "border-transparent hover:border-border"
                      )}
                    >
                      <span className={cn("w-8 h-8 rounded-full flex items-center justify-center", color.cls)}>
                        {accentColor === color.value && (
                          <Check className="h-4 w-4 text-white" />
                        )}
                      </span>
                      <span className="text-xs text-muted-foreground">{color.name}</span>
                    </button>
                  ))}
                </div>
              </SettingsCard>
            </>
          )}

          {/* ════ SECURITY ════ */}
          {activeSection === "security" && (
            <>
              <SettingsCard title="Change Password" description="Update your password to keep your account secure.">
                <div className="space-y-4">
                  <Field label="Current password">
                    <PasswordInput
                      value={currentPassword}
                      onChange={setCurrentPassword}
                      show={showCurrent}
                      onToggle={() => setShowCurrent(p => !p)}
                      placeholder="Enter current password"
                    />
                  </Field>
                  <Field label="New password">
                    <PasswordInput
                      value={newPassword}
                      onChange={setNewPassword}
                      show={showNew}
                      onToggle={() => setShowNew(p => !p)}
                      placeholder="Min. 6 characters"
                    />
                    {newPassword.length > 0 && (
                      <div className="mt-2 space-y-1">
                        <div className="flex gap-1">
                          {[1,2,3,4].map(i => (
                            <div key={i} className={cn(
                              "h-1 flex-1 rounded-full transition-colors",
                              newPassword.length >= i * 3
                                ? i <= 1 ? "bg-destructive"
                                : i <= 2 ? "bg-yellow-500"
                                : i <= 3 ? "bg-accent"
                                : "bg-green-500"
                                : "bg-muted"
                            )} />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {newPassword.length < 4  ? "Too short" :
                           newPassword.length < 7  ? "Weak" :
                           newPassword.length < 10 ? "Good" : "Strong"}
                        </p>
                      </div>
                    )}
                  </Field>
                  <Field label="Confirm new password">
                    <PasswordInput
                      value={confirmPassword}
                      onChange={setConfirmPassword}
                      show={showNew}
                      onToggle={() => setShowNew(p => !p)}
                      placeholder="Repeat new password"
                    />
                  </Field>

                  {passwordMsg && (
                    <p className={cn(
                      "text-sm font-medium flex items-center gap-1.5",
                      passwordMsg.type === "success" ? "text-accent" : "text-destructive"
                    )}>
                      {passwordMsg.type === "success"
                        ? <Check className="h-4 w-4" />
                        : <AlertTriangle className="h-4 w-4" />}
                      {passwordMsg.text}
                    </p>
                  )}

                  <Button onClick={handleChangePassword}>Update password</Button>
                </div>
              </SettingsCard>

              <SettingsCard
                title="Danger Zone"
                description="Permanently delete your account and all your data."
                danger
              >
                {!showDeletePanel ? (
                  <Button
                    variant="destructive"
                    onClick={() => setShowDeletePanel(true)}
                    className="gap-2"
                  >
                    <AlertTriangle className="h-4 w-4" />
                    Delete my account
                  </Button>
                ) : (
                  <div className="space-y-4">
                    <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/30 text-sm text-destructive">
                      This will permanently delete your account, all tasks, and data.
                      This action <strong>cannot be undone</strong>.
                    </div>
                    <Field label={`Type your email to confirm: ${userEmail}`}>
                      <input
                        type="email"
                        value={deleteConfirm}
                        onChange={e => setDeleteConfirm(e.target.value)}
                        placeholder={userEmail}
                        className="et-input border-destructive/50 focus:border-destructive"
                      />
                    </Field>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button
                        variant="destructive"
                        disabled={deleteConfirm !== userEmail || isDeleting}
                        onClick={handleDeleteAccount}
                      >
                        {isDeleting ? "Deleting…" : "Yes, delete my account"}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => { setShowDeletePanel(false); setDeleteConfirm("") }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </SettingsCard>
            </>
          )}
        </div>
      </div>

      <style>{`
        .et-input {
          width: 100%;
          background: var(--color-background);
          border: 1.5px solid var(--color-border);
          border-radius: 0.625rem;
          padding: 0.55rem 0.875rem;
          font-size: 0.875rem;
          color: var(--color-foreground);
          outline: none;
          transition: border-color 0.15s;
          font-family: inherit;
        }
        .et-input:focus {
          border-color: var(--color-primary);
        }
      `}</style>
    </div>
  )
}

function SettingsCard({
  title, description, children, danger,
}: {
  title: string
  description: string
  children: React.ReactNode
  danger?: boolean
}) {
  return (
    <div className={cn(
      "bg-card border rounded-2xl p-4 lg:p-6",
      danger ? "border-destructive/40" : "border-border"
    )}>
      <div className="mb-4 lg:mb-5">
        <h3 className={cn("font-semibold text-base", danger && "text-destructive")}>{title}</h3>
        <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
      </div>
      {children}
    </div>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-foreground uppercase tracking-wide mb-1.5">
        {label}
      </label>
      {children}
    </div>
  )
}

function PasswordInput({
  value, onChange, show, onToggle, placeholder,
}: {
  value: string
  onChange: (v: string) => void
  show: boolean
  onToggle: () => void
  placeholder: string
}) {
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="et-input pr-10"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </button>
    </div>
  )
}
