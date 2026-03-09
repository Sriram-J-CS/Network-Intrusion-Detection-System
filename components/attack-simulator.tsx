"use client"

import { useState } from "react"
import { XIcon, ActivityIcon, ForensicsIcon, LockIcon, ArrowUpIcon, ShieldIcon, KeyIcon, CloudUploadIcon, CircleIcon } from "@/components/icons"

interface AttackScenario {
  id: string
  name: string
  severity: "CRITICAL" | "HIGH" | "MEDIUM"
  color: string
  icon: React.ReactNode
  description: string
}

const ATTACK_SCENARIOS: AttackScenario[] = [
  { 
    id: "dos_flood", 
    name: "DDoS Flood", 
    severity: "CRITICAL", 
    color: "#EF4444",
    icon: <ActivityIcon style={{ color: "#EF4444" }} />,
    description: "Simulate a distributed denial-of-service attack with high-volume traffic flood targeting your network infrastructure."
  },
  { 
    id: "port_scan", 
    name: "Port Scan Probe", 
    severity: "MEDIUM", 
    color: "#F59E0B",
    icon: <ForensicsIcon style={{ color: "#F59E0B" }} />,
    description: "Execute reconnaissance-style port scanning to identify open services and potential entry points."
  },
  { 
    id: "brute_force", 
    name: "Brute Force R2L", 
    severity: "HIGH", 
    color: "#F97316",
    icon: <LockIcon style={{ color: "#F97316" }} />,
    description: "Attempt remote-to-local access via credential brute force attacks against authentication services."
  },
  { 
    id: "priv_esc", 
    name: "Privilege Escalation", 
    severity: "CRITICAL", 
    color: "#8B5CF6",
    icon: <ArrowUpIcon style={{ color: "#8B5CF6" }} />,
    description: "Simulate user-to-root privilege escalation exploiting system vulnerabilities."
  },
  { 
    id: "apt", 
    name: "APT Campaign", 
    severity: "CRITICAL", 
    color: "#EF4444",
    icon: <ShieldIcon style={{ color: "#EF4444" }} />,
    description: "Multi-stage advanced persistent threat simulation with reconnaissance, initial access, and lateral movement."
  },
  { 
    id: "ransomware", 
    name: "Ransomware", 
    severity: "CRITICAL", 
    color: "#EF4444",
    icon: <KeyIcon style={{ color: "#EF4444" }} />,
    description: "Simulate ransomware behavior patterns including file encryption indicators and C2 communication."
  },
  { 
    id: "exfil", 
    name: "Data Exfiltration", 
    severity: "HIGH", 
    color: "#F59E0B",
    icon: <CloudUploadIcon style={{ color: "#F59E0B" }} />,
    description: "Test detection of unauthorized data transfer attempts using various exfiltration techniques."
  },
  { 
    id: "mitm", 
    name: "Man-in-the-Middle", 
    severity: "HIGH", 
    color: "#F97316",
    icon: <CircleIcon style={{ color: "#F97316" }} />,
    description: "Simulate network interception attacks including ARP spoofing and traffic manipulation."
  },
]

interface AttackSimulatorModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AttackSimulatorModal({ isOpen, onClose }: AttackSimulatorModalProps) {
  const [selectedScenario, setSelectedScenario] = useState<AttackScenario | null>(null)
  const [isRunning, setIsRunning] = useState(false)

  if (!isOpen) return null

  const handleLaunch = () => {
    if (!selectedScenario) return
    setIsRunning(true)
    // Simulate attack for 5 seconds
    setTimeout(() => {
      setIsRunning(false)
      setSelectedScenario(null)
    }, 5000)
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-[100]"
        style={{ background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[101] w-full max-w-4xl max-h-[90vh] overflow-auto rounded-xl animate-fade-in-scale"
        style={{
          background: "var(--bg-surface)",
          border: isRunning ? "2px solid rgba(239,68,68,0.5)" : "1px solid var(--border-default)",
          boxShadow: isRunning 
            ? "0 0 40px rgba(239,68,68,0.3), 0 20px 60px rgba(0,0,0,0.5)"
            : "0 20px 60px rgba(0,0,0,0.5)",
          animation: isRunning ? "pulseRedBorder 1.5s ease-in-out infinite" : undefined
        }}
      >
        {/* Header */}
        <div 
          className="flex items-center justify-between px-6 py-4"
          style={{ borderBottom: "1px solid var(--border-subtle)" }}
        >
          <div className="flex items-center gap-3">
            <h2 
              style={{ 
                fontFamily: "var(--font-heading)", 
                fontWeight: 800, 
                fontSize: 18,
                color: "var(--text-primary)"
              }}
            >
              ATTACK SIMULATOR
            </h2>
            <span 
              className="px-2 py-1 rounded text-xs"
              style={{
                background: "rgba(245,158,11,0.12)",
                border: "1px solid rgba(245,158,11,0.25)",
                color: "#F59E0B",
                fontFamily: "var(--font-heading)",
                fontWeight: 700,
                letterSpacing: "0.5px"
              }}
            >
              LAB MODE
            </span>
            {isRunning && (
              <span 
                className="px-2 py-1 rounded text-xs"
                style={{
                  background: "rgba(239,68,68,0.12)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "#EF4444",
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  letterSpacing: "0.5px",
                  animation: "pulse 1s ease-in-out infinite"
                }}
              >
                SIMULATION ACTIVE
              </span>
            )}
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
            style={{ 
              background: "var(--bg-elevated)",
              border: "1px solid var(--border-default)",
              color: "var(--text-muted)",
              cursor: "pointer"
            }}
          >
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p 
            className="mb-6"
            style={{ color: "var(--text-secondary)", lineHeight: 1.6 }}
          >
            Select an attack scenario to simulate against your network. All simulations run in a 
            sandboxed environment and will not affect real network traffic.
          </p>

          {/* Scenario Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {ATTACK_SCENARIOS.map((scenario) => (
              <button
                key={scenario.id}
                onClick={() => setSelectedScenario(scenario)}
                disabled={isRunning}
                className="p-4 rounded-lg text-left transition-all"
                style={{
                  background: selectedScenario?.id === scenario.id 
                    ? `${scenario.color}15` 
                    : "var(--bg-elevated)",
                  border: selectedScenario?.id === scenario.id 
                    ? `2px solid ${scenario.color}40` 
                    : "1px solid var(--border-subtle)",
                  cursor: isRunning ? "not-allowed" : "pointer",
                  opacity: isRunning && selectedScenario?.id !== scenario.id ? 0.5 : 1
                }}
              >
                <div className="mb-2">{scenario.icon}</div>
                <div 
                  style={{ 
                    fontFamily: "var(--font-heading)",
                    fontWeight: 700,
                    fontSize: 12,
                    color: "var(--text-primary)",
                    marginBottom: 4
                  }}
                >
                  {scenario.name}
                </div>
                <span 
                  className="badge"
                  style={{
                    background: `${scenario.color}15`,
                    color: scenario.color,
                    border: `1px solid ${scenario.color}30`,
                    fontSize: 9
                  }}
                >
                  {scenario.severity}
                </span>
              </button>
            ))}
          </div>

          {/* AI Briefing */}
          {selectedScenario && (
            <div 
              className="p-4 rounded-lg mb-6 animate-slide-down"
              style={{
                background: "rgba(99,102,241,0.06)",
                borderLeft: "3px solid var(--brand-secondary)",
                border: "1px solid rgba(99,102,241,0.2)"
              }}
            >
              <div 
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 700,
                  fontSize: 11,
                  color: "var(--brand-secondary)",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px",
                  marginBottom: 8
                }}
              >
                AI RED TEAM BRIEFING
              </div>
              <p style={{ color: "var(--text-primary)", lineHeight: 1.6 }}>
                {selectedScenario.description}
              </p>
            </div>
          )}

          {/* Launch Button */}
          <button
            onClick={handleLaunch}
            disabled={!selectedScenario || isRunning}
            className="w-full py-3 rounded-lg transition-all"
            style={{
              background: !selectedScenario || isRunning 
                ? "var(--bg-elevated)" 
                : "rgba(239,68,68,0.15)",
              border: !selectedScenario || isRunning 
                ? "1px solid var(--border-default)"
                : "1px solid rgba(239,68,68,0.3)",
              color: !selectedScenario || isRunning 
                ? "var(--text-muted)" 
                : "#EF4444",
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: "0.5px",
              cursor: !selectedScenario || isRunning ? "not-allowed" : "pointer"
            }}
          >
            {isRunning 
              ? `Running ${selectedScenario?.name} Simulation...` 
              : selectedScenario 
                ? `Launch ${selectedScenario.name} Simulation`
                : "Select an attack scenario above"
            }
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulseRedBorder {
          0%, 100% { border-color: rgba(239,68,68,0.5); box-shadow: 0 0 40px rgba(239,68,68,0.3), 0 20px 60px rgba(0,0,0,0.5); }
          50% { border-color: rgba(239,68,68,0.2); box-shadow: 0 0 20px rgba(239,68,68,0.1), 0 20px 60px rgba(0,0,0,0.5); }
        }
      `}</style>
    </>
  )
}
