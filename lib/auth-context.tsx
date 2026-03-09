"use client"

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"

interface User {
  id: string
  name: string
  email: string
  initials: string
  role: "user" | "admin"
  createdAt: number
}

interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isAdmin: boolean
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ success: boolean; error?: string }>
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>
  adminLogin: (email: string, password: string) => Promise<{ success: boolean; error?: string }>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Admin credentials (hidden from UI)
const ADMIN_CREDENTIALS = {
  email: "admin@neuroshieldai",
  password: "12345678"
}

// Helper to get users from localStorage
const getStoredUsers = (): User[] => {
  if (typeof window === "undefined") return []
  try {
    const users = localStorage.getItem("neuroshield_users")
    return users ? JSON.parse(users) : []
  } catch {
    return []
  }
}

// Helper to get stored passwords
const getStoredPasswords = (): Record<string, string> => {
  if (typeof window === "undefined") return {}
  try {
    const passwords = localStorage.getItem("neuroshield_passwords")
    return passwords ? JSON.parse(passwords) : {}
  } catch {
    return {}
  }
}

// Helper to save user
const saveUser = (user: User, password: string) => {
  const users = getStoredUsers()
  const existingIndex = users.findIndex(u => u.email === user.email)
  if (existingIndex >= 0) {
    users[existingIndex] = user
  } else {
    users.push(user)
  }
  localStorage.setItem("neuroshield_users", JSON.stringify(users))
  
  const passwords = getStoredPasswords()
  passwords[user.email] = password
  localStorage.setItem("neuroshield_passwords", JSON.stringify(passwords))
}

// Generate initials from name
const getInitials = (name: string): string => {
  return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
}

// Generate unique ID
const generateId = (): string => {
  return "user_" + Date.now() + "_" + Math.random().toString(36).substring(2, 9)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const router = useRouter()
  const pathname = usePathname()

  const isAdmin = user?.role === "admin"

  // Check session validity
  const checkSession = useCallback(() => {
    if (typeof window === "undefined") return false
    
    const userStr = localStorage.getItem("neuroshield_user")
    const token = localStorage.getItem("neuroshield_token")
    const expiry = localStorage.getItem("neuroshield_expiry")
    
    if (userStr && token && expiry && Date.now() < parseInt(expiry)) {
      try {
        const parsedUser = JSON.parse(userStr)
        setUser(parsedUser)
        setIsAuthenticated(true)
        return true
      } catch {
        clearSession()
        return false
      }
    }
    
    clearSession()
    return false
  }, [])

  const clearSession = () => {
    localStorage.removeItem("neuroshield_user")
    localStorage.removeItem("neuroshield_token")
    localStorage.removeItem("neuroshield_expiry")
    setUser(null)
    setIsAuthenticated(false)
  }

  // Initial session check
  useEffect(() => {
    const isValid = checkSession()
    const publicPaths = ["/login", "/signup", "/admin/login"]
    if (!isValid && !publicPaths.includes(pathname)) {
      router.replace("/login")
    }
  }, [checkSession, pathname, router])

  const login = async (email: string, password: string, rememberMe: boolean): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const users = getStoredUsers()
    const passwords = getStoredPasswords()
    
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.role === "user")
    
    if (!existingUser) {
      return { success: false, error: "No account found with this email. Please sign up first." }
    }
    
    if (passwords[existingUser.email] !== password) {
      return { success: false, error: "Incorrect password. Please try again." }
    }
    
    localStorage.setItem("neuroshield_user", JSON.stringify(existingUser))
    localStorage.setItem("neuroshield_token", "ns-" + Date.now())
    localStorage.setItem("neuroshield_expiry", String(Date.now() + (rememberMe ? 2592000000 : 28800000)))
    
    setUser(existingUser)
    setIsAuthenticated(true)
    return { success: true }
  }

  const signup = async (name: string, email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    const users = getStoredUsers()
    const existingUser = users.find(u => u.email.toLowerCase() === email.toLowerCase())
    
    if (existingUser) {
      return { success: false, error: "An account with this email already exists. Please login instead." }
    }
    
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." }
    }
    
    const newUser: User = {
      id: generateId(),
      name: name.trim(),
      email: email.toLowerCase().trim(),
      initials: getInitials(name),
      role: "user",
      createdAt: Date.now()
    }
    
    saveUser(newUser, password)
    
    localStorage.setItem("neuroshield_user", JSON.stringify(newUser))
    localStorage.setItem("neuroshield_token", "ns-" + Date.now())
    localStorage.setItem("neuroshield_expiry", String(Date.now() + 28800000)) // 8 hours
    
    setUser(newUser)
    setIsAuthenticated(true)
    return { success: true }
  }

  const adminLogin = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 600))
    
    if (email.toLowerCase() === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
      const adminUser: User = {
        id: "admin_001",
        name: "System Administrator",
        email: ADMIN_CREDENTIALS.email,
        initials: "SA",
        role: "admin",
        createdAt: Date.now()
      }
      
      localStorage.setItem("neuroshield_user", JSON.stringify(adminUser))
      localStorage.setItem("neuroshield_token", "ns-admin-" + Date.now())
      localStorage.setItem("neuroshield_expiry", String(Date.now() + 28800000)) // 8 hours
      
      setUser(adminUser)
      setIsAuthenticated(true)
      return { success: true }
    }
    
    return { success: false, error: "Invalid admin credentials." }
  }

  const logout = () => {
    ["neuroshield_user", "neuroshield_token", "neuroshield_expiry", "neuroshield_theme"].forEach(k => 
      localStorage.removeItem(k)
    )
    setUser(null)
    setIsAuthenticated(false)
    window.location.replace("/login")
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isAdmin, login, signup, adminLogin, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function useAuthGuard() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const user = localStorage.getItem("neuroshield_user")
    const token = localStorage.getItem("neuroshield_token")
    const expiry = localStorage.getItem("neuroshield_expiry")
    const isValid = user && token && expiry && Date.now() < parseInt(expiry)
    
    const publicPaths = ["/login", "/signup", "/admin/login"]
    if (!isValid && !publicPaths.includes(pathname)) {
      localStorage.removeItem("neuroshield_user")
      localStorage.removeItem("neuroshield_token")
      localStorage.removeItem("neuroshield_expiry")
      router.replace("/login")
    }
  }, [pathname, router])
}
