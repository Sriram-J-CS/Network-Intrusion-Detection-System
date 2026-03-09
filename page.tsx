"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { LogoShield, CheckIcon } from "@/components/icons"

interface User {
  id: string
  name: string
  email: string
  initials: string
  role: "user" | "admin"
  createdAt: number
}

export default function SignupPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    const user = localStorage.getItem("neuroshield_user")
    const token = localStorage.getItem("neuroshield_token")
    const expiry = localStorage.getItem("neuroshield_expiry")
    const isValid = user && token && expiry && Date.now() < parseInt(expiry)
    if (isValid) {
      router.replace("/dashboard")
    }
  }, [router])

  const getStoredUsers = (): User[] => {
    try {
      const users = localStorage.getItem("neuroshield_users")
      return users ? JSON.parse(users) : []
    } catch {
      return []
    }
  }

  const getStoredPasswords = (): Record<string, string> => {
    try {
      const passwords = localStorage.getItem("neuroshield_passwords")
      return passwords ? JSON.parse(passwords) : {}
    } catch {
      return {}
    }
  }

  const getInitials = (name: string): string => {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  const generateId = (): string => {
    return "user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("Please enter your name.")
      return
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 600))

    const users = getStoredUsers()
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())

    if (existingUser) {
      setError("An account with this email already exists. Please login instead.")
      setIsLoading(false)
      return
    }

    const newUser: User = {
      id: generateId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      initials: getInitials(name),
      role: "user",
      createdAt: Date.now()
    }

    // Save user
    users.push(newUser)
    localStorage.setItem("neuroshield_users", JSON.stringify(users))

    // Save password
    const passwords = getStoredPasswords()
    passwords[newUser.email] = password
    localStorage.setItem("neuroshield_passwords", JSON.stringify(passwords))

    // Auto login
    localStorage.setItem("neuroshield_user", JSON.stringify(newUser))
    localStorage.setItem("neuroshield_token", "ns-" + Date.now())
    localStorage.setItem("neuroshield_expiry", String(Date.now() + 28800000))

    setSuccess(true)
    setTimeout(() => {
      router.push("/dashboard")
    }, 1000)
  }

  return (
    <div className="min-h-screen flex" style={{ background: "var(--bg-base)" }}>
      {/* Left Panel - Branding */}
      <div 
        className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, rgba(14,165,233,0.08) 0%, rgba(99,102,241,0.08) 100%)" }}
      >
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `
              linear-gradient(rgba(14,165,233,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(14,165,233,0.1) 1px, transparent 1px)
            `,
            backgroundSize: "50px 50px",
            animation: "moveGrid 20s linear infinite",
          }}
        />
        
        <div className="relative z-10 text-center px-8">
          <div className="mb-8 flex justify-center">
            <div style={{ animation: "floatLogo 6s ease-in-out infinite" }}>
              <svg width="120" height="120" viewBox="0 0 28 28" fill="none">
                <path 
                  d="M14 2L4 7v7c0 5.5 4.3 10.7 10 12 5.7-1.3 10-6.5 10-12V7L14 2z"
                  fill="url(#shieldGradLgSignup)" 
                  stroke="none"
                  style={{ filter: "drop-shadow(0 0 30px rgba(14,165,233,0.4))" }}
                />
                <path d="M9 14l3 3 7-7" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <defs>
                  <linearGradient id="shieldGradLgSignup" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0EA5E9"/>
                    <stop offset="100%" stopColor="#6366F1"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
          </div>
          
          <h1 className="text-4xl font-bold mb-4" style={{ fontFamily: "var(--font-heading)", color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
            NeuroShield AI
          </h1>
          
          <p className="text-xl mb-6" style={{ fontFamily: "var(--font-heading)", color: "var(--brand-primary)", fontWeight: 600, letterSpacing: "2px" }}>
            Detect. Explain. Protect.
          </p>
          
          <p style={{ color: "var(--text-secondary)", lineHeight: 1.7, maxWidth: 400 }}>
            Join thousands of security professionals using AI-powered threat detection 
            to protect their networks in real-time.
          </p>
        </div>
      </div>

      {/* Right Panel - Signup Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center mb-8 gap-3">
            <LogoShield />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: 20, color: "var(--text-primary)" }}>
              NeuroShield
            </span>
          </div>

          <div className="ns-card p-8" style={{ background: "var(--bg-surface)", border: "1px solid var(--border-subtle)" }}>
            <h2 className="text-2xl mb-2" style={{ fontFamily: "var(--font-heading)", fontWeight: 800, color: "var(--text-primary)" }}>
              Create an account
            </h2>
            <p className="mb-6" style={{ color: "var(--text-secondary)" }}>
              Start protecting your network with AI-powered security
            </p>

            {success ? (
              <div className="flex flex-col items-center justify-center py-12 animate-fade-in-scale">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mb-4"
                  style={{ background: "rgba(16,185,129,0.15)", border: "2px solid var(--success)" }}
                >
                  <CheckIcon width={32} height={32} style={{ color: "var(--success)" }} />
                </div>
                <p style={{ color: "var(--success)", fontFamily: "var(--font-heading)", fontWeight: 700 }}>
                  Account created successfully
                </p>
                <p style={{ color: "var(--text-muted)", fontSize: 13, marginTop: 4 }}>
                  Redirecting to dashboard...
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                {error && (
                  <div 
                    className="mb-4 p-3 rounded-lg text-sm animate-slide-down"
                    style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "var(--danger)" }}
                  >
                    {error}
                  </div>
                )}

                <div className="mb-4">
                  <label 
                    className="block mb-2 text-sm"
                    style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 11 }}
                  >
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 rounded-lg focus-ring"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                      fontSize: 14,
                      outline: "none",
                    }}
                    required
                    suppressHydrationWarning
                  />
                </div>

                <div className="mb-4">
                  <label 
                    className="block mb-2 text-sm"
                    style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 11 }}
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full px-4 py-3 rounded-lg focus-ring"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                      fontSize: 14,
                      outline: "none",
                    }}
                    required
                    suppressHydrationWarning
                  />
                </div>

                <div className="mb-4">
                  <label 
                    className="block mb-2 text-sm"
                    style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 11 }}
                  >
                    Password
                  </label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password (min. 6 characters)"
                    className="w-full px-4 py-3 rounded-lg focus-ring"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                      fontSize: 14,
                      outline: "none",
                    }}
                    required
                    suppressHydrationWarning
                  />
                </div>

                <div className="mb-6">
                  <label 
                    className="block mb-2 text-sm"
                    style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.5px", fontSize: 11 }}
                  >
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm your password"
                    className="w-full px-4 py-3 rounded-lg focus-ring"
                    style={{
                      background: "var(--bg-elevated)",
                      border: "1px solid var(--border-default)",
                      color: "var(--text-primary)",
                      fontSize: 14,
                      outline: "none",
                    }}
                    required
                    suppressHydrationWarning
                  />
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3 rounded-lg font-semibold transition-all"
                  style={{
                    background: isLoading ? "var(--bg-elevated)" : "var(--brand-gradient)",
                    color: isLoading ? "var(--text-muted)" : "#fff",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: 14,
                    letterSpacing: "0.5px",
                    border: "none",
                    cursor: isLoading ? "not-allowed" : "pointer",
                  }}
                  suppressHydrationWarning
                >
                  {isLoading ? "Creating account..." : "Create Account"}
                </button>
              </form>
            )}

            {!success && (
              <div className="mt-6 text-center">
                <p style={{ color: "var(--text-secondary)", fontSize: 14 }}>
                  Already have an account?{" "}
                  <Link href="/login" className="hover:underline" style={{ color: "var(--brand-primary)", fontWeight: 600 }}>
                    Sign in
                  </Link>
                </p>
              </div>
            )}
          </div>

          <p className="text-center mt-6" style={{ color: "var(--text-muted)", fontSize: 12 }}>
            NeuroShield AI v2.0 - Enterprise Security Platform
          </p>
        </div>
      </div>

      <style jsx>{`
        @keyframes floatLogo {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes moveGrid {
          0% { transform: translateX(0) translateY(0); }
          100% { transform: translateX(50px) translateY(50px); }
        }
      `}</style>
    </div>
  )
}
