'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'

// ─── Types ────────────────────────────────────────────────────────────────────
type Phase = 0 | 1 | 2 | 3   // 0 = not started, 1-3 = phases, 3+ = done

const PHASES = [
  { label: 'Initializing Neural Guard...', duration: 800 },
  { label: 'Verifying API Handshake & SSL...', duration: 800 },
  { label: 'Securing AI Persona: Gamma Edison.', duration: 900 },
]

// ─── SVG Shield Icon ──────────────────────────────────────────────────────────
function ShieldIcon() {
  return (
    <svg viewBox="0 0 64 72" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10">
      <path
        d="M32 4L6 16v20c0 14.5 11.1 28 26 31.5C47.9 64 59 50.5 59 36V16L32 4z"
        stroke="#32CD32"
        strokeWidth="2.5"
        strokeLinejoin="round"
        fill="rgba(50,205,50,0.08)"
        className="shield-path"
      />
      {/* checkmark */}
      <path
        d="M21 36l8 8 14-16"
        stroke="#32CD32"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// ─── Scan-ring SVG ────────────────────────────────────────────────────────────
function ScanRing({ active }: { active: boolean }) {
  return (
    <svg
      className={`absolute inset-0 w-full h-full ${active ? 'scan-ring-active' : ''}`}
      viewBox="0 0 120 120"
      fill="none"
    >
      {/* outer decorative ring */}
      <circle
        cx="60" cy="60" r="55"
        stroke="rgba(50,205,50,0.15)"
        strokeWidth="1"
        strokeDasharray="4 8"
      />
      {/* spinning arc */}
      <circle
        cx="60" cy="60" r="48"
        stroke="#32CD32"
        strokeWidth="2"
        strokeDasharray="80 222"
        strokeLinecap="round"
        className="scan-arc"
      />
      {/* tick markers */}
      {[0, 60, 120, 180, 240, 300].map(deg => (
        <line
          key={deg}
          x1="60" y1="6"
          x2="60" y2="14"
          stroke="rgba(50,205,50,0.4)"
          strokeWidth="1.5"
          style={{ transformOrigin: '60px 60px', transform: `rotate(${deg}deg)` }}
        />
      ))}
    </svg>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function SecurityHandshake({ children }: { children: React.ReactNode }) {
  const [phase, setPhase] = useState<Phase>(1)
  const [done, setDone] = useState(false)
  const [exiting, setExiting] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null)
  const [particles] = useState(() =>
    Array.from({ length: 28 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: 1 + Math.random() * 1.5,
      delay: Math.random() * 3,
      dur: 6 + Math.random() * 8,
    }))
  )

  const supabase = createClient()

  // ── Auth check runs in parallel with the visual sequence ──────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsLoggedIn(!!data.session?.user)
    })
  }, [])

  // ── Advance through phases ─────────────────────────────────────────────────
  useEffect(() => {
    let p = 1 as Phase
    let timer: ReturnType<typeof setTimeout>

    const advance = () => {
      if (p < 3) {
        p = (p + 1) as Phase
        setPhase(p)
        timer = setTimeout(advance, PHASES[p - 1].duration)
      } else {
        // All phases complete at exactly 2.5s
        setExiting(true)
        setTimeout(() => setDone(true), 500)
      }
    }

    timer = setTimeout(advance, PHASES[0].duration)
    return () => clearTimeout(timer)
  }, [])

  if (done) return <>{children}</>

  const currentPhaseLabel = PHASES[Math.min(phase - 1, 2)].label
  const progress = (phase / 3) * 100

  return (
    <>
      {/* Render children underneath so Supabase cache pre-fetch can happen */}
      <div className="sr-only" aria-hidden="true">{children}</div>

      {/* ── Security overlay ── */}
      <div
        className={`security-overlay ${exiting ? 'security-overlay--exit' : ''}`}
        role="status"
        aria-live="polite"
        aria-label="Security verification in progress"
      >
        {/* floating particles */}
        {particles.map(p => (
          <span
            key={p.id}
            className="security-particle"
            style={{
              left: `${p.x}%`,
              top: `${p.y}%`,
              width: `${p.size}px`,
              height: `${p.size}px`,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
            }}
          />
        ))}

        {/* grid lines */}
        <div className="security-grid" aria-hidden="true" />

        {/* ── Card ── */}
        <div className={`security-card ${exiting ? 'security-card--exit' : 'security-card--enter'}`}>

          {/* corner decorations */}
          {['tl', 'tr', 'bl', 'br'].map(pos => (
            <span key={pos} className={`security-corner security-corner--${pos}`} />
          ))}

          {/* shield + scan ring */}
          <div className="security-shield-wrap">
            <ScanRing active />
            <div className="security-shield">
              <ShieldIcon />
            </div>
          </div>

          {/* brand */}
          <p className="security-brand">TUTOR TWIN SECURITY LAYER</p>

          {/* phase label */}
          <div className="security-phase-wrap">
            <span className="security-cursor" />
            <p className="security-phase-label" key={phase}>
              {currentPhaseLabel}
            </p>
          </div>

          {/* progress bar */}
          <div className="security-bar-wrap" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
            <div className="security-bar-track">
              <div
                className="security-bar-fill"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="security-bar-pct">{Math.round(progress)}%</span>
          </div>

          {/* phase dots */}
          <div className="security-dots">
            {PHASES.map((_, i) => (
              <span
                key={i}
                className={`security-dot ${i + 1 <= phase ? 'security-dot--active' : ''}`}
              />
            ))}
          </div>

          {/* auth status badge */}
          <div className={`security-auth-badge ${isLoggedIn === null ? 'security-auth-badge--checking' : isLoggedIn ? 'security-auth-badge--ok' : 'security-auth-badge--guest'}`}>
            <span className="security-auth-dot" />
            {isLoggedIn === null
              ? 'Checking session...'
              : isLoggedIn
                ? 'Session Authenticated'
                : 'Guest Mode — Read Only'
            }
          </div>

          {/* footer trust line */}
          <p className="security-footer">
            Powered by Tutor Twin Guard&nbsp;|&nbsp;Encrypted Peer-to-Peer AI Tunnel
          </p>
        </div>
      </div>
    </>
  )
}
