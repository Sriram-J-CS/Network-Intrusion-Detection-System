"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export interface Notification {
  id: string
  type: "alert" | "info" | "warning" | "success"
  title: string
  message: string
  timestamp: Date
  read: boolean
  severity?: "critical" | "high" | "medium" | "low"
  source?: string
}

interface NotificationContextType {
  notifications: Notification[]
  unreadCount: number
  addNotification: (notification: Omit<Notification, "id" | "timestamp" | "read">) => void
  markAsRead: (id: string) => void
  markAllAsRead: () => void
  removeNotification: (id: string) => void
  clearAll: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

// Initial demo notifications
const initialNotifications: Notification[] = [
  {
    id: "1",
    type: "alert",
    title: "Critical: DDoS Attack Detected",
    message: "High-volume traffic surge detected from multiple IP addresses targeting port 443. Automated mitigation engaged.",
    timestamp: new Date(Date.now() - 120000),
    read: false,
    severity: "critical",
    source: "192.168.1.100"
  },
  {
    id: "2",
    type: "warning",
    title: "Suspicious Port Scan",
    message: "Sequential port scanning activity detected from external IP. 847 ports probed in last 5 minutes.",
    timestamp: new Date(Date.now() - 300000),
    read: false,
    severity: "high",
    source: "45.33.32.156"
  },
  {
    id: "3",
    type: "alert",
    title: "Brute Force Attempt",
    message: "Multiple failed SSH login attempts detected on server ns-prod-01. IP has been temporarily blocked.",
    timestamp: new Date(Date.now() - 600000),
    read: false,
    severity: "high",
    source: "103.214.56.78"
  },
  {
    id: "4",
    type: "info",
    title: "AI Model Updated",
    message: "Threat detection model v3.2.1 successfully deployed. Detection accuracy improved by 2.3%.",
    timestamp: new Date(Date.now() - 1800000),
    read: false,
    severity: "low",
    source: "System"
  },
  {
    id: "5",
    type: "success",
    title: "Threat Neutralized",
    message: "SQL injection attempt blocked and source IP quarantined. Attack signature added to blocklist.",
    timestamp: new Date(Date.now() - 3600000),
    read: true,
    severity: "medium",
    source: "Web Application Firewall"
  }
]

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>(initialNotifications)

  const unreadCount = notifications.filter(n => !n.read).length

  const addNotification = useCallback((notification: Omit<Notification, "id" | "timestamp" | "read">) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }, [])

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }, [])

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
  }, [])

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const clearAll = useCallback(() => {
    setNotifications([])
  }, [])

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      addNotification,
      markAsRead,
      markAllAsRead,
      removeNotification,
      clearAll
    }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
