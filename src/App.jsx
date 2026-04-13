import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Header from './components/Header'
import Footer from './components/Footer'
import BodySVG from './components/BodySVG'
import DetailPanel from './components/DetailPanel'

// ── Front / Back toggle ───────────────────────────────────────────────
function ViewToggle({ bodyView, onChange }) {
  return (
    <div style={{
      display: 'flex',
      background: '#0d1320',
      border: '1px solid #1e2d4a',
      borderRadius: '8px',
      padding: '3px',
      gap: '2px',
    }}>
      {['Front', 'Back'].map((label) => (
        <button
          key={label}
          onClick={() => onChange(label)}
          style={{
            padding: '4px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            fontWeight: 500,
            border: 'none',
            cursor: 'pointer',
            background: bodyView === label ? 'rgba(56,189,248,0.12)' : 'transparent',
            color:      bodyView === label ? '#38bdf8' : '#4a6080',
            transition: 'background 0.18s ease, color 0.18s ease',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  )
}

// ── App ───────────────────────────────────────────────────────────────
export default function App() {
  const [selectedZone, setSelectedZone] = useState(null)
  const [bodyView, setBodyView]         = useState('Front')

  // Ref for the detail panel section — used for smooth scroll on mobile
  const detailRef = useRef(null)

  const handleZoneSelect = useCallback((zoneId) => {
    setSelectedZone(zoneId)

    // On mobile the layout is stacked; scroll the detail panel into view
    if (window.innerWidth < 768 && detailRef.current) {
      // requestAnimationFrame lets React flush the state update first
      requestAnimationFrame(() => {
        detailRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
      })
    }
  }, [])

  const handleViewChange = useCallback((view) => {
    setBodyView(view)
    setSelectedZone(null)   // clear selection when switching views
  }, [])

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: '#0a0e17' }}>

      {/* ── Header ── */}
      <Header />

      {/* ── Two-column main area ── */}
      <main className="main-layout">

        {/* ── LEFT: sticky body SVG column ── */}
        <aside className="body-column">

          {/* Toggle bar */}
          <div style={{
            padding: '12px 20px',
            borderBottom: '1px solid #1e2d4a',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0,
          }}>
            <span style={{ fontSize: '11px', letterSpacing: '0.1em', textTransform: 'uppercase', color: '#4a6080' }}>
              Human Anatomy
            </span>
            <ViewToggle bodyView={bodyView} onChange={handleViewChange} />
          </div>

          {/* SVG area — key={bodyView} remounts BodySVG, re-triggering the draw animation */}
          <div style={{
            flex: 1, padding: '20px 16px',
            display: 'flex', justifyContent: 'center', alignItems: 'flex-start',
            overflowY: 'auto',
          }}>
            <BodySVG
              key={bodyView}
              onZoneClick={handleZoneSelect}
              activeZone={selectedZone}
              bodyView={bodyView}
            />
          </div>
        </aside>

        {/* ── RIGHT: detail panel column ── */}
        <section className="detail-column" ref={detailRef}>
          <AnimatePresence mode="wait">
            <DetailPanel
              key={selectedZone ?? '__empty__'}
              activeZone={selectedZone}
            />
          </AnimatePresence>
        </section>

      </main>

      {/* ── Footer ── */}
      <Footer />

      {/* ── Layout + responsive styles ── */}
      <style>{`
        /* ── Two-column layout ── */
        .main-layout {
          flex: 1;
          max-width: 1440px;
          width: 100%;
          margin: 0 auto;
          display: flex;
          align-items: stretch;
        }

        /* Left column */
        .body-column {
          width: 400px;
          flex-shrink: 0;
          position: sticky;
          top: 64px;               /* sits below the 64 px header */
          height: calc(100vh - 64px);
          display: flex;
          flex-direction: column;
          border-right: 1px solid #1e2d4a;
        }

        /* Right column */
        .detail-column {
          flex: 1;
          min-width: 0;
          position: sticky;
          top: 64px;
          height: calc(100vh - 64px);
          overflow-y: auto;
        }

        /* ── Tablet (769 – 1024 px) ── */
        @media (min-width: 769px) and (max-width: 1024px) {
          .body-column {
            width: 300px;
          }
        }

        /* ── Mobile (≤ 768 px) — stack vertically ── */
        @media (max-width: 768px) {
          .main-layout {
            flex-direction: column;
          }

          /* Aside becomes normal flow, auto height */
          .body-column {
            width: 100%;
            position: static;
            height: auto;
            border-right: none;
            border-bottom: 1px solid #1e2d4a;
          }

          /* Detail panel becomes normal flow, auto height */
          .detail-column {
            position: static;
            height: auto;
            overflow-y: visible;
          }
        }
      `}</style>
    </div>
  )
}
