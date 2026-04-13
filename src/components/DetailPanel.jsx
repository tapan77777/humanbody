import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search, ChevronDown, AlertTriangle, Clock,
  Zap, Stethoscope, Plus, Activity, X,
} from 'lucide-react'
import injuries from '../data/injuries.js'
import { ZONES } from './BodySVG.jsx'

// ── Severity config ───────────────────────────────────────────────────
const SEVERITY = {
  mild: {
    label: 'Mild',
    color: '#34d399',
    bg: 'rgba(52,211,153,0.10)',
    border: 'rgba(52,211,153,0.30)',
  },
  moderate: {
    label: 'Moderate',
    color: '#fbbf24',
    bg: 'rgba(251,191,36,0.10)',
    border: 'rgba(251,191,36,0.32)',
  },
  severe: {
    label: 'Severe',
    color: '#f87171',
    bg: 'rgba(248,113,113,0.10)',
    border: 'rgba(248,113,113,0.32)',
  },
}

// ── Recovery phases derived from severity ─────────────────────────────
function getPhases(severity) {
  if (severity === 'mild') return [
    { phase: 'Rest & Ice',         portion: 0.25, color: '#ef4444' },
    { phase: 'Early Rehab',        portion: 0.40, color: '#f59e0b' },
    { phase: 'Return to Activity', portion: 0.35, color: '#34d399' },
  ]
  if (severity === 'moderate') return [
    { phase: 'Protection',       portion: 0.20, color: '#ef4444' },
    { phase: 'Repair',           portion: 0.30, color: '#f59e0b' },
    { phase: 'Strengthening',    portion: 0.30, color: '#34d399' },
    { phase: 'Return to Sport',  portion: 0.20, color: '#38bdf8' },
  ]
  return [
    { phase: 'Acute / Surgery', portion: 0.15, color: '#ef4444' },
    { phase: 'Healing',         portion: 0.25, color: '#f97316' },
    { phase: 'Rehabilitation',  portion: 0.35, color: '#f59e0b' },
    { phase: 'Strengthening',   portion: 0.15, color: '#34d399' },
    { phase: 'Return to Sport', portion: 0.10, color: '#38bdf8' },
  ]
}

// ── Empty states ──────────────────────────────────────────────────────
function EmptyState() {
  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', height: '100%', minHeight: '420px',
      gap: '14px', padding: '40px', textAlign: 'center',
    }}>
      <div style={{
        width: '68px', height: '68px', borderRadius: '50%',
        border: '1px solid #1e2d4a',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Activity size={26} color="#2a3d6b" strokeWidth={1.5} />
      </div>
      <p className="font-heading" style={{ fontSize: '21px', color: '#4a6080', fontWeight: 600 }}>
        Select a body zone
      </p>
      <p style={{ fontSize: '13px', color: '#2a3d6b', maxWidth: '250px', lineHeight: 1.7 }}>
        Click any highlighted region on the body diagram to explore injuries,
        symptoms, and recovery guides.
      </p>
    </div>
  )
}

function NoDataState({ label }) {
  return (
    <div style={{ padding: '56px 32px', textAlign: 'center', color: '#4a6080' }}>
      <p style={{ fontSize: '14px' }}>
        No injury data available for{' '}
        <strong style={{ color: '#94a3b8' }}>{label}</strong>.
      </p>
    </div>
  )
}

// ── Section heading ───────────────────────────────────────────────────
function SectionHead({ icon: Icon, label, color }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '9px' }}>
      <Icon size={12} color={color} strokeWidth={2.2} />
      <span style={{
        fontSize: '10px', letterSpacing: '0.1em',
        textTransform: 'uppercase', color: '#4a6080', fontWeight: 700,
      }}>
        {label}
      </span>
    </div>
  )
}

// ── Bullet list ───────────────────────────────────────────────────────
function BulletList({ items, dotColor }) {
  return (
    <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '7px' }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <span style={{
            width: '5px', height: '5px', borderRadius: '50%',
            background: dotColor, flexShrink: 0, marginTop: '6px',
          }} />
          <span style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.6 }}>{item}</span>
        </li>
      ))}
    </ul>
  )
}

// ── Recovery timeline ─────────────────────────────────────────────────
function RecoveryTimeline({ severity, recoveryWeeks }) {
  const phases = getPhases(severity)
  return (
    <div>
      {/* Label row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '9px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Clock size={12} color="#4a6080" strokeWidth={2} />
          <span style={{
            fontSize: '10px', letterSpacing: '0.1em',
            textTransform: 'uppercase', color: '#4a6080', fontWeight: 700,
          }}>
            Recovery Timeline
          </span>
        </div>
        <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 600 }}>
          ~{recoveryWeeks} {recoveryWeeks === 1 ? 'week' : 'weeks'}
        </span>
      </div>

      {/* Segmented bar */}
      <div style={{
        display: 'flex', borderRadius: '6px', overflow: 'hidden',
        height: '9px', gap: '2px', background: '#0d1320',
      }}>
        {phases.map((p, i) => (
          <motion.div
            key={i}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.5, delay: i * 0.08, ease: 'easeOut' }}
            style={{
              flex: p.portion,
              background: p.color,
              opacity: 0.80,
              transformOrigin: 'left',
            }}
          />
        ))}
      </div>

      {/* Phase labels */}
      <div style={{ display: 'flex', gap: '2px', marginTop: '7px' }}>
        {phases.map((p, i) => (
          <div key={i} style={{ flex: p.portion, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
              <span style={{
                width: '5px', height: '5px', borderRadius: '50%',
                background: p.color, flexShrink: 0, display: 'inline-block',
              }} />
              <span style={{
                fontSize: '9px', color: '#4a6080',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              }}>
                {p.phase}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Injury card ───────────────────────────────────────────────────────
function InjuryCard({ injury, isExpanded, onToggle }) {
  const sev = SEVERITY[injury.severity] ?? SEVERITY.mild

  return (
    <div style={{
      background: isExpanded ? '#162035' : '#111827',
      border: `1px solid ${isExpanded ? '#2a3d6b' : '#1e2d4a'}`,
      borderRadius: '12px',
      overflow: 'hidden',
      transition: 'background 0.22s, border-color 0.22s',
    }}>
      {/* ── Always-visible header ── */}
      <button
        onClick={onToggle}
        style={{
          width: '100%', display: 'flex', alignItems: 'center',
          gap: '12px', padding: '15px 16px',
          background: 'transparent', border: 'none', textAlign: 'left', cursor: 'pointer',
        }}
      >
        {/* Severity colour strip */}
        <div style={{
          width: '3px', alignSelf: 'stretch', minHeight: '32px',
          borderRadius: '2px', background: sev.color, flexShrink: 0,
        }} />

        {/* Name + collapsed overview */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0', lineHeight: 1.3 }}>
            {injury.name}
          </p>
          {!isExpanded && (
            <p style={{
              fontSize: '11.5px', color: '#4a6080', marginTop: '3px',
              overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis',
            }}>
              {injury.overview}
            </p>
          )}
        </div>

        {/* Severity badge */}
        <span style={{
          fontSize: '9.5px', fontWeight: 700, letterSpacing: '0.08em',
          textTransform: 'uppercase', color: sev.color,
          background: sev.bg, border: `1px solid ${sev.border}`,
          borderRadius: '20px', padding: '3px 9px', flexShrink: 0,
        }}>
          {sev.label}
        </span>

        {/* Chevron */}
        <motion.div
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          style={{ flexShrink: 0, display: 'flex', color: '#4a6080' }}
        >
          <ChevronDown size={15} />
        </motion.div>
      </button>

      {/* ── Expandable body ── */}
      <AnimatePresence initial={false}>
        {isExpanded && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{
              height:  { duration: 0.30, ease: 'easeInOut' },
              opacity: { duration: 0.22 },
            }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ borderTop: '1px solid #1e2d4a', padding: '16px 16px 18px' }}>

              {/* Overview */}
              <p style={{
                fontSize: '12.5px', color: '#94a3b8', lineHeight: 1.7,
                fontStyle: 'italic', marginBottom: '18px',
              }}>
                {injury.overview}
              </p>

              {/* Symptoms + Causes — two columns */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px', marginBottom: '18px' }}>
                <div>
                  <SectionHead icon={Stethoscope} label="Symptoms" color="#38bdf8" />
                  <BulletList items={injury.symptoms} dotColor="#38bdf8" />
                </div>
                <div>
                  <SectionHead icon={Zap} label="Causes" color="#fbbf24" />
                  <BulletList items={injury.causes} dotColor="#fbbf24" />
                </div>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: '#1e2d4a', margin: '0 0 18px' }} />

              {/* First aid */}
              <div style={{ marginBottom: '20px' }}>
                <SectionHead icon={Plus} label="First Aid Steps" color="#34d399" />
                <ol style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {injury.firstAid.map((step, i) => (
                    <li key={i} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                      <span className="step-number">{i + 1}</span>
                      <span style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.65, paddingTop: '2px' }}>
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>

              {/* Divider */}
              <div style={{ height: '1px', background: '#1e2d4a', margin: '0 0 18px' }} />

              {/* Recovery timeline */}
              <div style={{ marginBottom: '16px' }}>
                <RecoveryTimeline severity={injury.severity} recoveryWeeks={injury.recoveryWeeks} />
              </div>

              {/* Warning box */}
              <div className="warning-box" style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                <AlertTriangle size={13} color="#fbbf24" style={{ flexShrink: 0, marginTop: '2px' }} />
                <p style={{ fontSize: '12px', color: '#94a3b8', lineHeight: 1.65 }}>
                  <span style={{ color: '#fbbf24', fontWeight: 600 }}>When to see a doctor: </span>
                  {injury.warningSign}
                </p>
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Main export ───────────────────────────────────────────────────────
export default function DetailPanel({ activeZone }) {
  const [query, setQuery]       = useState('')
  const [expandedId, setExpandedId] = useState(null)

  // Reset search + expanded card whenever the zone changes
  useEffect(() => {
    setQuery('')
    setExpandedId(null)
  }, [activeZone])

  const zone         = ZONES.find(z => z.id === activeZone)
  const zoneInjuries = activeZone ? (injuries[activeZone] ?? []) : []

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return zoneInjuries
    return zoneInjuries.filter(i => i.name.toLowerCase().includes(q))
  }, [zoneInjuries, query])

  const handleToggle = (id) => setExpandedId(prev => (prev === id ? null : id))

  if (!activeZone) return <EmptyState />
  if (zoneInjuries.length === 0) return <NoDataState label={zone?.label ?? activeZone} />

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={activeZone}
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.24, ease: 'easeOut' }}
        style={{ padding: '28px 24px', maxWidth: '700px' }}
      >
        {/* ── Zone header ── */}
        <div style={{ marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <div style={{ height: '1px', width: '28px', background: 'linear-gradient(90deg, #38bdf8, transparent)' }} />
            <span style={{ fontSize: '10px', letterSpacing: '0.12em', textTransform: 'uppercase', color: '#4a6080' }}>
              Zone
            </span>
          </div>
          <h2
            className="font-heading"
            style={{
              fontSize: '26px', fontWeight: 700, lineHeight: 1.2, marginBottom: '5px',
              background: 'linear-gradient(90deg, #e2e8f0 40%, #38bdf8 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {zone?.label ?? activeZone}
          </h2>
          <p style={{ fontSize: '12.5px', color: '#4a6080' }}>
            {zoneInjuries.length} {zoneInjuries.length === 1 ? 'injury' : 'injuries'} documented
          </p>
        </div>

        {/* ── Search bar ── */}
        <div style={{ position: 'relative', marginBottom: '18px' }}>
          <Search
            size={13}
            color="#4a6080"
            style={{ position: 'absolute', left: '13px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
          />
          <input
            type="text"
            placeholder="Search injuries…"
            value={query}
            onChange={e => { setQuery(e.target.value); setExpandedId(null) }}
            style={{
              width: '100%',
              background: '#0d1320',
              border: '1px solid #1e2d4a',
              borderRadius: '10px',
              padding: '9px 36px',
              fontSize: '13px',
              color: '#e2e8f0',
              outline: 'none',
              transition: 'border-color 0.18s',
            }}
            onFocus={e => { e.target.style.borderColor = '#2a3d6b' }}
            onBlur={e  => { e.target.style.borderColor = '#1e2d4a' }}
          />
          <AnimatePresence>
            {query && (
              <motion.button
                initial={{ opacity: 0, scale: 0.7 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.7 }}
                transition={{ duration: 0.14 }}
                onClick={() => setQuery('')}
                style={{
                  position: 'absolute', right: '11px', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  display: 'flex', padding: '2px', color: '#4a6080',
                }}
              >
                <X size={13} />
              </motion.button>
            )}
          </AnimatePresence>
        </div>

        {/* ── Cards or no-results ── */}
        <AnimatePresence mode="wait">
          {filtered.length === 0 ? (
            <motion.p
              key="no-results"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ fontSize: '13px', color: '#4a6080', padding: '28px 0', textAlign: 'center' }}
            >
              No injuries match{' '}
              <strong style={{ color: '#94a3b8' }}>"{query}"</strong>
            </motion.p>
          ) : (
            <motion.div
              key="cards"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
            >
              {filtered.map(injury => (
                <InjuryCard
                  key={injury.id}
                  injury={injury}
                  isExpanded={expandedId === injury.id}
                  onToggle={() => handleToggle(injury.id)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </AnimatePresence>
  )
}
