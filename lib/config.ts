// Speed configuration for all animations and updates
export const SPEEDS = {
  packetFeedNewRow: 2500,
  timelineChart: 3500,
  sparklines: 4000,
  donutChart: 5000,
  threatGauge: 4000,
  alertPopups: 7000,
  metricCards: 5000,
}

// Attack types with their styling
export const ATTACK_TYPES = {
  DoS: { color: "#EF4444", class: "attack-dos", label: "DoS" },
  Probe: { color: "#F59E0B", class: "attack-probe", label: "Probe" },
  R2L: { color: "#F97316", class: "attack-r2l", label: "R2L" },
  U2R: { color: "#8B5CF6", class: "attack-u2r", label: "U2R" },
  Normal: { color: "#10B981", class: "attack-normal", label: "Normal" },
} as const

export type AttackType = keyof typeof ATTACK_TYPES

// Severity levels
export const SEVERITIES = {
  CRITICAL: { color: "#EF4444", class: "badge-critical", label: "CRITICAL" },
  HIGH: { color: "#F97316", class: "badge-high", label: "HIGH" },
  MEDIUM: { color: "#F59E0B", class: "badge-medium", label: "MEDIUM" },
  LOW: { color: "#3B82F6", class: "badge-low", label: "LOW" },
  NORMAL: { color: "#10B981", class: "badge-normal", label: "NORMAL" },
} as const

export type Severity = keyof typeof SEVERITIES

// Attack origin countries for threat map
export const ATTACK_ORIGINS = {
  China: { coords: [104, 35] as [number, number], iso: "156", label: "CN" },
  Russia: { coords: [105, 61] as [number, number], iso: "643", label: "RU" },
  USA: { coords: [-95, 38] as [number, number], iso: "840", label: "US" },
  Brazil: { coords: [-51, -14] as [number, number], iso: "076", label: "BR" },
  India: { coords: [78, 21] as [number, number], iso: "356", label: "IN" },
  Germany: { coords: [10, 51] as [number, number], iso: "276", label: "DE" },
  UK: { coords: [-1, 52] as [number, number], iso: "826", label: "GB" },
  "North Korea": { coords: [127, 40] as [number, number], iso: "408", label: "KP" },
  Iran: { coords: [53, 32] as [number, number], iso: "364", label: "IR" },
  Nigeria: { coords: [8, 10] as [number, number], iso: "566", label: "NG" },
} as const

export type OriginCountry = keyof typeof ATTACK_ORIGINS

// Target location
export const TARGET_COORDS: [number, number] = [0, 51]

// Country colors for map
export const COUNTRY_COLORS: Record<string, string> = {
  "124": "#D4845A", "840": "#5D9E6E", "484": "#C9A84C", "076": "#E8CC60",
  "170": "#C07A5A", "604": "#8DC870", "032": "#C06858", "152": "#8878B8",
  "826": "#5A8FB8", "250": "#D87070", "276": "#6EA870", "380": "#D49050",
  "724": "#C07890", "643": "#9678C8", "566": "#48A870", "710": "#ECA050",
  "818": "#E4CC50", "156": "#E07840", "356": "#ECC8A0", "392": "#C07090",
  "410": "#6AA8C8", "408": "#C85050", "364": "#88C878", "682": "#ECD878",
  "036": "#C4D850", "554": "#DC7878", "348": "#A4D8A0", "040": "#D4A870",
  "616": "#8CC4E0", "528": "#ECBC60", "752": "#C4A4D8", "756": "#E4DC80",
  "056": "#ECA480", "620": "#7CC4A0", "300": "#D4BC80", "792": "#E4A060",
  "050": "#9CD470", "764": "#ECAC90", "704": "#7CB4D0", "116": "#DCBC70",
  "458": "#8CD4B0", "144": "#ECD4A0", "404": "#CCA870", "800": "#6CC890",
  "834": "#E4BC50", "024": "#C47A5A", "012": "#D4B870", "504": "#A4C4E0",
}

export const DEFAULT_COUNTRY_COLOR = "#8AA0B4"

// Protocols
export const PROTOCOLS = ["TCP", "UDP", "ICMP"] as const
export type Protocol = typeof PROTOCOLS[number]

// Generate random IP
export function generateIP(): string {
  return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
}

// Generate random port
export function generatePort(): number {
  const commonPorts = [22, 23, 25, 53, 80, 110, 143, 443, 445, 993, 995, 3306, 3389, 5432, 8080]
  return Math.random() > 0.3 ? commonPorts[Math.floor(Math.random() * commonPorts.length)] : Math.floor(Math.random() * 65535)
}

// Get greeting based on time
export function getGreeting(name: string): string {
  const hour = new Date().getHours()
  if (hour < 12) return `Good morning, ${name}`
  if (hour < 17) return `Good afternoon, ${name}`
  return `Good evening, ${name}`
}

// Animate number value
export function animateValue(
  from: number,
  to: number,
  duration: number,
  onUpdate: (value: number) => void
): void {
  const start = performance.now()
  const tick = (now: number) => {
    const p = Math.min((now - start) / duration, 1)
    const eased = 1 - Math.pow(1 - p, 4)
    onUpdate(Math.floor(from + (to - from) * eased))
    if (p < 1) requestAnimationFrame(tick)
  }
  requestAnimationFrame(tick)
}

// Format number with commas
export function formatNumber(num: number): string {
  return num.toLocaleString()
}

// Generate mock packet data
export interface PacketData {
  id: string
  timestamp: Date
  protocol: Protocol
  sourceIP: string
  destIP: string
  srcPort: number
  dstPort: number
  attackType: AttackType
  confidence: number
  risk: number
  severity: Severity
  status: "BLOCKED" | "DETECTED" | "NORMAL"
  sourceCountry: OriginCountry
}

export function generateMockPacket(): PacketData {
  const countries = Object.keys(ATTACK_ORIGINS) as OriginCountry[]
  const attackTypes = Object.keys(ATTACK_TYPES) as AttackType[]
  const severities = Object.keys(SEVERITIES) as Severity[]
  
  const attackType = attackTypes[Math.floor(Math.random() * attackTypes.length)]
  const isNormal = attackType === "Normal"
  
  return {
    id: `pkt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date(),
    protocol: PROTOCOLS[Math.floor(Math.random() * PROTOCOLS.length)],
    sourceIP: generateIP(),
    destIP: `192.168.1.${Math.floor(Math.random() * 255)}`,
    srcPort: generatePort(),
    dstPort: generatePort(),
    attackType,
    confidence: isNormal ? 95 + Math.random() * 5 : 60 + Math.random() * 40,
    risk: isNormal ? Math.random() * 20 : 40 + Math.random() * 60,
    severity: isNormal ? "NORMAL" : severities[Math.floor(Math.random() * (severities.length - 1))],
    status: isNormal ? "NORMAL" : Math.random() > 0.3 ? "BLOCKED" : "DETECTED",
    sourceCountry: countries[Math.floor(Math.random() * countries.length)],
  }
}
