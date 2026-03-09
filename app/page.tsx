"use client"

import { useState, useEffect } from "react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts"

interface AnomalyData {
  time: string
  score: number
  baseline: number
}

interface Hypothesis {
  hypothesis: string
  possibleTarget: string
  stage: string
  mitreTactic: string
  confidence: string
  similarKnownAttack: string
}

const KILL_CHAIN_STAGES = [
  "Reconnaissance",
  "Initial Access", 
  "Execution",
  "Persistence",
  "Exfiltration"
]

export default function ZeroDayPage() {
  const [anomalyData, setAnomalyData] = useState<AnomalyData[]>([])
  const [currentScore, setCurrentScore] = useState(0)
  const [hypothesis, setHypothesis] = useState<Hypothesis | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [stageStatus, setStageStatus] = useState<Record<string, "CLEAR" | "SUSPECTED" | "DETECTED">>({})

  // Generate anomaly data
  useEffect(() => {
    const generateData = () => {
      const now = new Date()
      const data: AnomalyData[] = Array.from({ length: 24 }, (_, i) => {
        const time = new Date(now.getTime() - (23 - i) * 5 * 60000)
        const baseline = 30
        const score = Math.max(0, baseline + (Math.random() - 0.3) * 40 + (i > 18 ? (i - 18) * 5 : 0))
        return {
          time: time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          score: Math.min(100, score),
          baseline
        }
      })
      setAnomalyData(data)
      setCurrentScore(data[data.length - 1].score)
    }

    generateData()
    const interval = setInterval(generateData, 5000)
    return () => clearInterval(interval)
  }, [])

  // Generate hypothesis when score > 70
  useEffect(() => {
    if (currentScore > 70 && !hypothesis && !isGenerating) {
      generateHypothesis()
    }
  }, [currentScore])

  // Update kill chain stages
  useEffect(() => {
    const status: Record<string, "CLEAR" | "SUSPECTED" | "DETECTED"> = {}
    KILL_CHAIN_STAGES.forEach((stage, i) => {
      if (currentScore > 80 && i < 3) status[stage] = "DETECTED"
      else if (currentScore > 60 && i < 2) status[stage] = "SUSPECTED"
      else if (currentScore > 40 && i === 0) status[stage] = "SUSPECTED"
      else status[stage] = "CLEAR"
    })
    setStageStatus(status)
  }, [currentScore])

  const generateHypothesis = async () => {
    setIsGenerating(true)
    await new Promise(resolve => setTimeout(resolve, 1500))

    const hypotheses: Hypothesis[] = [
      {
        hypothesis: "Potential zero-day exploitation of CVE-2024-XXXX in web application framework, showing characteristics of memory corruption attacks.",
        possibleTarget: "Application Layer",
        stage: "Execution",
        mitreTactic: "Exploitation for Client Execution (T1203)",
        confidence: `${Math.floor(Math.random() * 20) + 75}%`,
        similarKnownAttack: "Log4Shell exploitation pattern"
      },
      {
        hypothesis: "Novel lateral movement technique detected using undocumented SMB protocol extension, possibly targeting domain controllers.",
        possibleTarget: "Network Infrastructure",
        stage: "Lateral Movement",
        mitreTactic: "Remote Services (T1021)",
        confidence: `${Math.floor(Math.random() * 20) + 70}%`,
        similarKnownAttack: "EternalBlue variant"
      },
      {
        hypothesis: "Anomalous DNS exfiltration pattern detected using novel encoding scheme, bypassing traditional DLP signatures.",
        possibleTarget: "Data Store",
        stage: "Exfiltration",
        mitreTactic: "Exfiltration Over Alternative Protocol (T1048)",
        confidence: `${Math.floor(Math.random() * 20) + 65}%`,
        similarKnownAttack: "DNSCat2 derivative"
      }
    ]

    setHypothesis(hypotheses[Math.floor(Math.random() * hypotheses.length)])
    setIsGenerating(false)
  }

  const handleInvestigate = () => {
    // Simulate investigation action
    alert("Opening detailed investigation view...")
  }

  const handleDismiss = () => {
    setHypothesis(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 
          className="text-2xl mb-1"
          style={{ 
            fontFamily: "var(--font-heading)",
            fontWeight: 800,
            color: "var(--text-primary)"
          }}
        >
          Zero Day Detection
        </h1>
        <p style={{ color: "var(--text-secondary)" }}>
          AI-powered anomaly detection and unknown threat identification
        </p>
      </div>

      {/* Anomaly Score Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <div 
          className="ns-card p-5 flex flex-col items-center justify-center"
          style={{
            background: currentScore > 70 
              ? "rgba(239,68,68,0.08)" 
              : currentScore > 40 
              ? "rgba(245,158,11,0.08)" 
              : "var(--bg-surface)",
            border: currentScore > 70 
              ? "1px solid rgba(239,68,68,0.3)" 
              : "1px solid var(--border-subtle)"
          }}
        >
          <div 
            className="text-xs mb-2"
            style={{ 
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.8px"
            }}
          >
            Anomaly Score
          </div>
          <div 
            className="text-5xl"
            style={{ 
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: currentScore > 70 ? "#EF4444" : currentScore > 40 ? "#F59E0B" : "#10B981"
            }}
          >
            {currentScore.toFixed(0)}
          </div>
          <div 
            className="text-xs mt-2"
            style={{ color: "var(--text-muted)" }}
          >
            Threshold: 70
          </div>
        </div>

        {/* Anomaly Timeline */}
        <div className="lg:col-span-3 ns-card p-5">
          <h3 
            className="mb-4"
            style={{ 
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              color: "var(--text-primary)"
            }}
          >
            Anomaly Score Timeline
          </h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={anomalyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis 
                  dataKey="time" 
                  stroke="var(--text-muted)" 
                  tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                />
                <YAxis 
                  domain={[0, 100]}
                  stroke="var(--text-muted)" 
                  tick={{ fontSize: 10, fontFamily: "var(--font-mono)" }}
                />
                <Tooltip 
                  contentStyle={{ 
                    background: "var(--bg-elevated)", 
                    border: "1px solid var(--border-default)",
                    borderRadius: 8,
                    fontFamily: "var(--font-mono)",
                    fontSize: 12
                  }}
                />
                <ReferenceLine y={70} stroke="#EF4444" strokeDasharray="5 5" label={{ value: "Threshold", position: "insideTopRight", fill: "#EF4444", fontSize: 10 }} />
                <Line 
                  type="monotone" 
                  dataKey="baseline" 
                  stroke="var(--text-muted)" 
                  strokeWidth={1}
                  strokeDasharray="3 3"
                  dot={false}
                  name="Baseline"
                />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#0EA5E9" 
                  strokeWidth={2}
                  dot={false}
                  animationDuration={1400}
                  name="Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* AI Hypothesis Card */}
      {(hypothesis || isGenerating) && (
        <div 
          className="p-5 rounded-xl animate-fade-in-scale"
          style={{
            background: "rgba(99,102,241,0.06)",
            borderLeft: "3px solid #6366F1",
            border: "1px solid rgba(99,102,241,0.3)"
          }}
        >
          <div className="flex justify-between items-center mb-4">
            <div>
              <div 
                style={{
                  fontFamily: "var(--font-heading)",
                  fontWeight: 800,
                  fontSize: 13,
                  color: "#6366F1",
                  textTransform: "uppercase",
                  letterSpacing: "0.8px"
                }}
              >
                ZERO DAY HYPOTHESIS
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 2 }}>
                Auto-generated when anomaly score exceeds 70
              </div>
            </div>
            <span 
              className="badge"
              style={{
                background: "rgba(239,68,68,0.12)",
                border: "1px solid rgba(239,68,68,0.25)",
                color: "#EF4444"
              }}
            >
              ACTIVE INVESTIGATION
            </span>
          </div>

          {isGenerating ? (
            <div 
              className="h-32 rounded"
              style={{
                background: "linear-gradient(90deg, var(--bg-elevated), var(--bg-overlay), var(--bg-elevated))",
                backgroundSize: "200% 100%",
                animation: "shimmer 1.5s infinite"
              }}
            />
          ) : hypothesis && (
            <>
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                {[
                  ["Hypothesis", hypothesis.hypothesis, "var(--text-primary)"],
                  ["Target", hypothesis.possibleTarget, "var(--text-primary)"],
                  ["Attack Stage", hypothesis.stage, "#F59E0B"],
                  ["MITRE Tactic", hypothesis.mitreTactic, "#6366F1"],
                  ["Confidence", hypothesis.confidence, "#0EA5E9"],
                  ["Resembles", hypothesis.similarKnownAttack, "var(--text-primary)"],
                ].map(([label, value, color]) => (
                  <div key={label}>
                    <div 
                      className="text-xs mb-1"
                      style={{ 
                        fontFamily: "var(--font-heading)",
                        fontWeight: 700,
                        color: "var(--text-muted)",
                        textTransform: "uppercase",
                        letterSpacing: "0.5px"
                      }}
                    >
                      {label}
                    </div>
                    <div 
                      style={{ 
                        fontSize: 13, 
                        color: color,
                        fontWeight: 500,
                        lineHeight: label === "Hypothesis" ? 1.5 : undefined
                      }}
                    >
                      {value}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3">
                {["Investigate", "Dismiss", "Add to Report"].map(action => (
                  <button
                    key={action}
                    onClick={action === "Investigate" ? handleInvestigate : action === "Dismiss" ? handleDismiss : undefined}
                    className="px-4 py-2 rounded-lg transition-all"
                    style={{
                      background: "rgba(99,102,241,0.1)",
                      border: "1px solid rgba(99,102,241,0.25)",
                      color: "#6366F1",
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      fontSize: 11,
                      cursor: "pointer",
                      letterSpacing: "0.5px",
                      textTransform: "uppercase"
                    }}
                  >
                    {action}
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* MITRE ATT&CK Kill Chain */}
      <div className="ns-card p-5">
        <h3 
          className="mb-4"
          style={{ 
            fontFamily: "var(--font-heading)",
            fontWeight: 700,
            color: "var(--text-primary)"
          }}
        >
          MITRE ATT&CK Kill Chain Analysis
        </h3>
        
        <div className="flex items-center gap-2">
          {KILL_CHAIN_STAGES.map((stage, i) => {
            const status = stageStatus[stage] || "CLEAR"
            const colors = {
              CLEAR: { bg: "var(--bg-elevated)", border: "var(--border-subtle)", text: "var(--text-muted)" },
              SUSPECTED: { bg: "rgba(245,158,11,0.12)", border: "rgba(245,158,11,0.3)", text: "#F59E0B" },
              DETECTED: { bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.3)", text: "#EF4444" }
            }
            const c = colors[status]

            return (
              <div key={stage} className="flex items-center">
                <div 
                  className="px-4 py-3 rounded-lg text-center min-w-[120px]"
                  style={{
                    background: c.bg,
                    border: `1px solid ${c.border}`
                  }}
                >
                  <div 
                    className="text-xs mb-1"
                    style={{ 
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      color: c.text,
                      fontSize: 11
                    }}
                  >
                    {stage}
                  </div>
                  <div 
                    className="text-xs"
                    style={{ 
                      fontFamily: "var(--font-heading)",
                      fontWeight: 700,
                      color: c.text,
                      textTransform: "uppercase",
                      letterSpacing: "0.5px",
                      fontSize: 9
                    }}
                  >
                    {status}
                  </div>
                </div>
                {i < KILL_CHAIN_STAGES.length - 1 && (
                  <div 
                    className="w-8 h-0.5 mx-1"
                    style={{ 
                      background: status === "DETECTED" || stageStatus[KILL_CHAIN_STAGES[i + 1]] === "DETECTED"
                        ? "#EF4444"
                        : status === "SUSPECTED"
                        ? "#F59E0B"
                        : "var(--border-subtle)"
                    }}
                  />
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Detection Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="ns-card p-5">
          <div 
            className="text-xs mb-2"
            style={{ 
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.8px"
            }}
          >
            Zero Days Detected
          </div>
          <div 
            className="text-3xl"
            style={{ 
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: "#EF4444"
            }}
          >
            {hypothesis ? 1 : 0}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>
            Last 24 hours
          </div>
        </div>

        <div className="ns-card p-5">
          <div 
            className="text-xs mb-2"
            style={{ 
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.8px"
            }}
          >
            Anomalies Analyzed
          </div>
          <div 
            className="text-3xl"
            style={{ 
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: "#0EA5E9"
            }}
          >
            {Math.floor(Math.random() * 500) + 1247}
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>
            Total patterns checked
          </div>
        </div>

        <div className="ns-card p-5">
          <div 
            className="text-xs mb-2"
            style={{ 
              fontFamily: "var(--font-heading)",
              fontWeight: 700,
              color: "var(--text-muted)",
              textTransform: "uppercase",
              letterSpacing: "0.8px"
            }}
          >
            Model Confidence
          </div>
          <div 
            className="text-3xl"
            style={{ 
              fontFamily: "var(--font-mono)",
              fontWeight: 700,
              color: "#10B981"
            }}
          >
            94.2%
          </div>
          <div style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 4 }}>
            Detection accuracy
          </div>
        </div>
      </div>
    </div>
  )
}
