"use client"

import { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Header } from "@/components/header"
import { Sidebar } from "@/components/sidebar"
import { AttackSimulatorModal } from "@/components/attack-simulator"
import { NotificationProvider, useNotifications } from "@/lib/notification-context"
import { ThemeProvider } from "@/lib/theme-context"
import { NotificationToasts } from "@/components/notification-toast"

function DashboardContent({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [user, setUser] = useState<{ name: string; email: string; initials: string } | null>(null)
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false)
  const { unreadCount, addNotification } = useNotifications()

  // Auth guard
  useEffect(() => {
    const userStr = localStorage.getItem("neuroshield_user")
    const token = localStorage.getItem("neuroshield_token")
    const expiry = localStorage.getItem("neuroshield_expiry")
    const isValid = userStr && token && expiry && Date.now() < parseInt(expiry)
    
    if (!isValid) {
      localStorage.removeItem("neuroshield_user")
      localStorage.removeItem("neuroshield_token")
      localStorage.removeItem("neuroshield_expiry")
      router.replace("/login")
    } else {
      try {
        setUser(JSON.parse(userStr))
      } catch {
        router.replace("/login")
      }
    }
  }, [router])

  // Simulate real-time notifications
  useEffect(() => {
    const threats = [
      { type: "alert" as const, title: "Anomalous Traffic Detected", message: "Unusual outbound traffic pattern detected from internal server. Investigating potential data exfiltration.", severity: "high" as const, source: "10.0.0.45" },
      { type: "warning" as const, title: "Failed Login Attempts", message: "5 consecutive failed login attempts detected for admin account.", severity: "medium" as const, source: "Auth Service" },
      { type: "info" as const, title: "Firewall Rule Updated", message: "New blocking rule added for IP range 185.220.0.0/16 based on threat intelligence.", severity: "low" as const, source: "Firewall" },
      { type: "alert" as const, title: "Malware Signature Match", message: "File upload blocked - matches known ransomware signature (Win32.WannaCry.B).", severity: "critical" as const, source: "Endpoint Protection" },
      { type: "success" as const, title: "Vulnerability Patched", message: "Critical CVE-2024-1234 successfully patched across all production servers.", severity: "low" as const, source: "Patch Management" },
    ]

    const interval = setInterval(() => {
      // 20% chance of new notification every 30 seconds
      if (Math.random() < 0.2) {
        const threat = threats[Math.floor(Math.random() * threats.length)]
        addNotification(threat)
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [addNotification])

  const handleLogout = useCallback(() => {
    ["neuroshield_user", "neuroshield_token", "neuroshield_expiry", "neuroshield_theme"].forEach(k => 
      localStorage.removeItem(k)
    )
    window.location.replace("/login")
  }, [])

  if (!user) {
    return (
      <div 
        className="min-h-screen flex items-center justify-center"
        style={{ background: "var(--bg-base)" }}
      >
        <div className="animate-pulse">
          <div 
            className="w-12 h-12 rounded-full"
            style={{ background: "var(--brand-gradient)" }}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ background: "var(--bg-base)" }}>
      <Header 
        userInitials={user.initials}
        onLogout={handleLogout}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
      />
      
      <div className="flex">
        <Sidebar unreadAlerts={unreadCount} />
        
        <main 
          className="flex-1 p-6 overflow-auto"
          style={{ 
            minHeight: "calc(100vh - 60px)",
            background: "var(--bg-base)"
          }}
        >
          {children}
        </main>
      </div>

      <AttackSimulatorModal 
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
      />

      <NotificationToasts />
    </div>
  )
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider>
      <NotificationProvider>
        <DashboardContent>{children}</DashboardContent>
      </NotificationProvider>
    </ThemeProvider>
  )
}
