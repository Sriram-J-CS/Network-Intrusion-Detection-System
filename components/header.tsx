"use client"

import { useState, useRef, useEffect } from "react"
import { LogoShield, SunIcon, MoonIcon, AlertsIcon, CheckCircleIcon } from "@/components/icons"
import { useNotifications, type Notification } from "@/lib/notification-context"
import { useTheme } from "@/lib/theme-context"

interface HeaderProps {
  userInitials: string
  onLogout: () => void
  onOpenSimulator: () => void
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return "Just now"
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  return `${days}d ago`
}

function getNotificationIcon(type: Notification["type"], severity?: Notification["severity"]) {
  const colors = {
    critical: "#EF4444",
    high: "#F97316",
    medium: "#F59E0B",
    low: "#3B82F6",
  }
  const color = severity ? colors[severity] : (type === "success" ? "#10B981" : type === "warning" ? "#F59E0B" : type === "alert" ? "#EF4444" : "#0EA5E9")
  
  return (
    <div 
      className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
      style={{ 
        background: `${color}15`,
        border: `1px solid ${color}30`
      }}
    >
      <AlertsIcon style={{ color, width: 14, height: 14 }} />
    </div>
  )
}

export function Header({ userInitials, onLogout, onOpenSimulator }: HeaderProps) {
  const { theme, toggleTheme } = useTheme()
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications()
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [showNotifications, setShowNotifications] = useState(false)
  const notificationRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <header 
      className="sticky top-0 z-50 flex items-center px-6 h-[60px]"
      style={{
        background: theme === "dark" ? "rgba(7,11,20,0.96)" : "rgba(248,250,252,0.96)",
        borderBottom: "1px solid var(--border-subtle)",
        backdropFilter: "blur(16px)",
        gap: 16
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2.5 mr-auto">
        <LogoShield />
        <span 
          style={{ 
            fontFamily: "var(--font-heading)", 
            fontWeight: 800, 
            fontSize: 17, 
            color: "var(--text-primary)", 
            letterSpacing: "-0.3px" 
          }}
        >
          NeuroShield
        </span>
      </div>

      {/* Status indicator */}
      <div 
        className="flex items-center gap-1.5 rounded-full px-3 py-1.5"
        style={{ 
          background: "rgba(16,185,129,0.08)", 
          border: "1px solid rgba(16,185,129,0.2)" 
        }}
      >
        <div 
          className="w-1.5 h-1.5 rounded-full"
          style={{ 
            background: "#10B981", 
            boxShadow: "0 0 8px #10B981",
            animation: "statusPulse 2s ease-in-out infinite"
          }}
        />
        <span 
          style={{ 
            fontFamily: "var(--font-heading)", 
            fontWeight: 700, 
            fontSize: 11, 
            color: "#10B981", 
            letterSpacing: "0.8px", 
            textTransform: "uppercase" 
          }}
        >
          Monitoring
        </span>
      </div>

      {/* Attack Simulator button */}
      <button 
        onClick={onOpenSimulator}
        className="px-4 py-1.5 rounded-lg transition-all"
        style={{ 
          background: "rgba(239,68,68,0.1)", 
          border: "1px solid rgba(239,68,68,0.25)", 
          color: "#EF4444", 
          fontFamily: "var(--font-heading)", 
          fontWeight: 700, 
          fontSize: 12, 
          letterSpacing: "0.5px",
          cursor: "pointer"
        }}
        onMouseEnter={(e) => (e.target as HTMLElement).style.background = "rgba(239,68,68,0.15)"}
        onMouseLeave={(e) => (e.target as HTMLElement).style.background = "rgba(239,68,68,0.1)"}
      >
        ATTACK SIMULATOR
      </button>

      {/* Theme toggle */}
      <button 
        onClick={toggleTheme}
        className="w-9 h-9 rounded-lg flex items-center justify-center transition-all"
        style={{ 
          background: "var(--bg-elevated)", 
          border: "1px solid var(--border-default)", 
          color: "var(--text-secondary)",
          cursor: "pointer"
        }}
        title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      >
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </button>

      {/* Notification bell */}
      <div className="relative" ref={notificationRef}>
        <button 
          onClick={() => setShowNotifications(!showNotifications)}
          className="relative w-9 h-9 rounded-lg flex items-center justify-center transition-all"
          style={{ 
            background: showNotifications ? "var(--bg-overlay)" : "var(--bg-elevated)", 
            border: "1px solid var(--border-default)", 
            color: "var(--text-secondary)",
            cursor: "pointer"
          }}
        >
          <AlertsIcon />
          {unreadCount > 0 && (
            <span 
              className="absolute flex items-center justify-center"
              style={{ 
                top: 4, 
                right: 4, 
                width: 18, 
                height: 18, 
                borderRadius: "50%", 
                background: "#EF4444", 
                color: "#fff", 
                fontSize: 10, 
                fontFamily: "var(--font-heading)", 
                fontWeight: 700,
                boxShadow: "0 0 8px rgba(239,68,68,0.5)"
              }}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>

        {/* Notification dropdown */}
        {showNotifications && (
          <div 
            className="absolute right-0 top-full mt-2 w-96 rounded-xl overflow-hidden z-50 animate-slide-down"
            style={{
              background: "var(--bg-surface)",
              border: "1px solid var(--border-default)",
              boxShadow: "0 16px 48px rgba(0,0,0,0.4)"
            }}
          >
            {/* Header */}
            <div 
              className="flex items-center justify-between px-4 py-3"
              style={{ borderBottom: "1px solid var(--border-subtle)" }}
            >
              <div className="flex items-center gap-2">
                <span 
                  style={{ 
                    fontFamily: "var(--font-heading)", 
                    fontWeight: 700, 
                    fontSize: 14,
                    color: "var(--text-primary)" 
                  }}
                >
                  Notifications
                </span>
                {unreadCount > 0 && (
                  <span 
                    className="px-2 py-0.5 rounded-full"
                    style={{ 
                      background: "rgba(14,165,233,0.15)",
                      color: "#0EA5E9",
                      fontSize: 11,
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700
                    }}
                  >
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="flex items-center gap-1.5 text-xs transition-colors"
                  style={{ 
                    color: "var(--brand-primary)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer"
                  }}
                >
                  <CheckCircleIcon style={{ width: 12, height: 12 }} />
                  Mark all read
                </button>
              )}
            </div>

            {/* Notification list */}
            <div 
              className="overflow-y-auto"
              style={{ maxHeight: 400 }}
            >
              {notifications.length === 0 ? (
                <div 
                  className="flex flex-col items-center justify-center py-12"
                  style={{ color: "var(--text-muted)" }}
                >
                  <AlertsIcon style={{ width: 32, height: 32, marginBottom: 8, opacity: 0.5 }} />
                  <span style={{ fontSize: 13 }}>No notifications</span>
                </div>
              ) : (
                notifications.slice(0, 10).map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => markAsRead(notification.id)}
                    className="flex gap-3 px-4 py-3 cursor-pointer transition-all"
                    style={{
                      background: notification.read ? "transparent" : theme === "dark" ? "rgba(14,165,233,0.04)" : "rgba(14,165,233,0.06)",
                      borderBottom: "1px solid var(--border-subtle)"
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "var(--bg-overlay)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = notification.read ? "transparent" : theme === "dark" ? "rgba(14,165,233,0.04)" : "rgba(14,165,233,0.06)")}
                  >
                    {getNotificationIcon(notification.type, notification.severity)}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <span 
                          className="truncate"
                          style={{ 
                            fontSize: 13, 
                            fontWeight: notification.read ? 500 : 600,
                            color: "var(--text-primary)"
                          }}
                        >
                          {notification.title}
                        </span>
                        {!notification.read && (
                          <div 
                            className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                            style={{ background: "#0EA5E9" }}
                          />
                        )}
                      </div>
                      <p 
                        className="line-clamp-2 mt-0.5"
                        style={{ 
                          fontSize: 12, 
                          color: "var(--text-secondary)",
                          lineHeight: 1.4
                        }}
                      >
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          {formatTimeAgo(notification.timestamp)}
                        </span>
                        {notification.source && (
                          <>
                            <span style={{ color: "var(--text-muted)" }}>·</span>
                            <span 
                              style={{ 
                                fontSize: 11, 
                                color: "var(--text-muted)",
                                fontFamily: "var(--font-mono)"
                              }}
                            >
                              {notification.source}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {notifications.length > 0 && (
              <div 
                className="px-4 py-2.5 text-center"
                style={{ 
                  borderTop: "1px solid var(--border-subtle)",
                  background: "var(--bg-elevated)"
                }}
              >
                <button
                  onClick={() => {
                    setShowNotifications(false)
                    window.location.href = "/alerts"
                  }}
                  className="text-xs transition-colors"
                  style={{ 
                    color: "var(--brand-primary)",
                    background: "transparent",
                    border: "none",
                    cursor: "pointer",
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600
                  }}
                >
                  View all alerts
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* User avatar */}
      <div className="relative" ref={userMenuRef}>
        <button 
          onClick={() => setShowUserMenu(!showUserMenu)}
          className="w-9 h-9 rounded-full flex items-center justify-center transition-transform"
          style={{ 
            background: "var(--brand-gradient)", 
            color: "#fff", 
            fontFamily: "var(--font-heading)", 
            fontWeight: 800, 
            fontSize: 13, 
            border: "none",
            cursor: "pointer",
            transform: showUserMenu ? "scale(0.95)" : "scale(1)"
          }}
        >
          {userInitials}
        </button>

        {/* User dropdown */}
        {showUserMenu && (
          <div 
            className="absolute right-0 top-full mt-2 w-48 rounded-lg py-2 z-50 animate-slide-down"
            style={{
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              boxShadow: "0 8px 32px rgba(0,0,0,0.4)"
            }}
          >
            <button
              onClick={() => {
                setShowUserMenu(false)
                window.location.href = "/settings"
              }}
              className="w-full text-left px-4 py-2 text-sm transition-all"
              style={{ 
                color: "var(--text-secondary)",
                background: "transparent",
                border: "none",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.background = "var(--bg-overlay)"
                ;(e.target as HTMLElement).style.color = "var(--text-primary)"
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.background = "transparent"
                ;(e.target as HTMLElement).style.color = "var(--text-secondary)"
              }}
            >
              Profile Settings
            </button>
            <div 
              className="mx-3 my-2"
              style={{ height: 1, background: "var(--border-subtle)" }}
            />
            <button
              onClick={() => {
                setShowUserMenu(false)
                onLogout()
              }}
              className="w-full text-left px-4 py-2 text-sm transition-all"
              style={{ 
                color: "var(--danger)",
                background: "transparent",
                border: "none",
                cursor: "pointer"
              }}
              onMouseEnter={(e) => (e.target as HTMLElement).style.background = "rgba(239,68,68,0.1)"}
              onMouseLeave={(e) => (e.target as HTMLElement).style.background = "transparent"}
            >
              Sign Out
            </button>
          </div>
        )}
      </div>
    </header>
  )
}
