"use client"

import { useEffect, useState } from "react"
import { AlertsIcon } from "@/components/icons"
import { useNotifications, type Notification } from "@/lib/notification-context"

interface ToastProps {
  notification: Notification
  onDismiss: () => void
}

function Toast({ notification, onDismiss }: ToastProps) {
  const [isExiting, setIsExiting] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true)
      setTimeout(onDismiss, 300)
    }, 5000)
    return () => clearTimeout(timer)
  }, [onDismiss])

  const colors = {
    critical: "#EF4444",
    high: "#F97316",
    medium: "#F59E0B",
    low: "#3B82F6",
  }
  const color = notification.severity ? colors[notification.severity] : 
    (notification.type === "success" ? "#10B981" : 
     notification.type === "warning" ? "#F59E0B" : 
     notification.type === "alert" ? "#EF4444" : "#0EA5E9")

  return (
    <div
      className="flex items-start gap-3 px-4 py-3 rounded-lg shadow-2xl max-w-sm"
      style={{
        background: "var(--bg-elevated)",
        border: `1px solid ${color}30`,
        boxShadow: `0 8px 32px rgba(0,0,0,0.3), 0 0 20px ${color}15`,
        animation: isExiting ? "slideOutRight 0.3s ease forwards" : "slideInRight 0.3s ease forwards"
      }}
    >
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
        style={{ 
          background: `${color}15`,
          border: `1px solid ${color}30`
        }}
      >
        <AlertsIcon style={{ color, width: 14, height: 14 }} />
      </div>
      <div className="flex-1 min-w-0">
        <div 
          className="font-semibold text-sm truncate"
          style={{ color: "var(--text-primary)" }}
        >
          {notification.title}
        </div>
        <div 
          className="text-xs mt-0.5 line-clamp-2"
          style={{ color: "var(--text-secondary)" }}
        >
          {notification.message}
        </div>
      </div>
      <button
        onClick={() => {
          setIsExiting(true)
          setTimeout(onDismiss, 300)
        }}
        className="flex-shrink-0 w-6 h-6 rounded flex items-center justify-center transition-colors"
        style={{ 
          color: "var(--text-muted)",
          background: "transparent",
          border: "none",
          cursor: "pointer"
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
      </button>
    </div>
  )
}

export function NotificationToasts() {
  const { notifications } = useNotifications()
  const [visibleToasts, setVisibleToasts] = useState<Notification[]>([])
  const [seenIds, setSeenIds] = useState<Set<string>>(new Set())

  // Show toast for new unread notifications
  useEffect(() => {
    const newNotifications = notifications.filter(n => !n.read && !seenIds.has(n.id))
    if (newNotifications.length > 0) {
      const newest = newNotifications[0]
      setSeenIds(prev => new Set([...prev, newest.id]))
      setVisibleToasts(prev => [newest, ...prev].slice(0, 3))
    }
  }, [notifications, seenIds])

  const dismissToast = (id: string) => {
    setVisibleToasts(prev => prev.filter(t => t.id !== id))
  }

  if (visibleToasts.length === 0) return null

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 flex flex-col gap-3"
      style={{ pointerEvents: "none" }}
    >
      {visibleToasts.map((toast) => (
        <div key={toast.id} style={{ pointerEvents: "auto" }}>
          <Toast notification={toast} onDismiss={() => dismissToast(toast.id)} />
        </div>
      ))}
    </div>
  )
}
