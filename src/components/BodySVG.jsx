import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── ViewBox: 0 0 240 548 │ Centre x=120 ───────────────────────────────
// All y-landmarks (px):
//   Head top 6  │ Chin 82  │ Neck 82-104  │ Shoulders 115
//   Armpit 148  │ Elbow 210  │ Wrist 268
//   Hip/crotch 292  │ Knee 390  │ Ankle 492  │ Foot 520

// ── Silhouette shapes (decorative background outline) ─────────────────
const SILHOUETTE = {
  // Main body trunk (torso + shoulder bumps)
  torso: `
    M 84,100
    Q 62,104 50,116 48,130 48,148 52,154 70,156
    L 84,158
    Q 84,200 86,238 86,262 88,282 92,292
    L 148,292
    Q 152,282 154,262 154,238 156,200 156,158
    L 170,156
    Q 188,154 192,148 192,130 190,116 178,104 156,100
    Z
  `,
  // Left arm (outer left of torso, hanging at ~x 24-72)
  leftArm: `
    M 56,118
    Q 48,112 40,114 32,120 24,134 20,158 18,182
    18,206 20,222 24,234 28,252 28,268 28,280
    Q 30,290 36,296 44,298 52,298 60,292 64,282
    Q 66,270 66,256 64,240 62,224 66,208
    Q 70,196 72,180 72,158 70,136 62,120 56,118
    Z
  `,
  // Right arm (mirror: new_x = 240 − old_x)
  rightArm: `
    M 184,118
    Q 192,112 200,114 208,120 216,134 220,158 222,182
    222,206 220,222 216,234 212,252 212,268 212,280
    Q 210,290 204,296 196,298 188,298 180,292 176,282
    Q 174,270 174,256 176,240 178,224 174,208
    Q 170,196 168,180 168,158 170,136 178,120 184,118
    Z
  `,
  // Left leg (outer: ~x 76-80, inner: ~x 112-116)
  leftLeg: `
    M 80,292 L 116,292
    Q 116,308 116,328 114,350 112,372 110,392
    110,408 112,424 114,442 114,460 112,478
    Q 110,494 106,508 100,516  96,516  90,512
    Q 84,506 82,496 80,480 80,462 82,444 84,426
    84,410 82,394 80,372 78,350 76,328 76,308 80,292
    Z
  `,
  // Right leg (mirror: new_x = 240 − old_x)
  rightLeg: `
    M 160,292 L 124,292
    Q 124,308 124,328 126,350 128,372 130,392
    130,408 128,424 126,442 126,460 128,478
    Q 130,494 134,508 140,516 144,516 150,512
    Q 156,506 158,496 160,480 160,462 158,444 156,426
    156,410 158,394 160,372 162,350 164,328 164,308 160,292
    Z
  `,
}

// ── Zone definitions ──────────────────────────────────────────────────
// shape:  'ellipse' | 'path' | 'rect'
// lx/ly:  label anchor point in SVG coordinates
// la:     text-anchor ('start' | 'end' | 'middle')
// lside:  which side the label lives on ('left' | 'right' | 'center')
// lline:  [[x1,y1],[x2,y2]] connector line coords
export const ZONES = [
  {
    id: 'head',
    label: 'Head',
    count: 3,
    shape: 'ellipse',
    cx: 120, cy: 44, rx: 32, ry: 38,
    lx: 158, ly: 40, la: 'start', lside: 'right',
    lline: [[152, 44], [156, 41]],
  },
  {
    id: 'neck',
    label: 'Neck',
    count: 3,
    shape: 'ellipse',
    cx: 120, cy: 92, rx: 11, ry: 12,
    lx: 158, ly: 88, la: 'start', lside: 'right',
    lline: [[131, 92], [156, 89]],
  },
  {
    id: 'left-shoulder',
    label: 'L. Shoulder',
    count: 4,
    shape: 'ellipse',
    cx: 68, cy: 122, rx: 24, ry: 20,
    lx: 18, ly: 116, la: 'end', lside: 'left',
    lline: [[44, 122], [20, 117]],
  },
  {
    id: 'right-shoulder',
    label: 'R. Shoulder',
    count: 4,
    shape: 'ellipse',
    cx: 172, cy: 122, rx: 24, ry: 20,
    lx: 222, ly: 116, la: 'start', lside: 'right',
    lline: [[196, 122], [220, 117]],
  },
  {
    id: 'chest',
    label: 'Chest',
    count: 3,
    shape: 'path',
    d: 'M88,106 Q120,102 152,106 L154,162 Q120,168 86,162 Z',
    lx: 158, ly: 135, la: 'start', lside: 'right',
    lline: [[150, 138], [156, 136]],
  },
  {
    id: 'left-upper-arm',
    label: 'L. Arm',
    count: 2,
    shape: 'path',
    d: 'M64,120 Q50,130 42,156 36,178 34,200 36,216 42,222 50,224 60,220 68,212 72,196 74,174 74,150 70,128 66,118 Z',
    lx: 14, ly: 170, la: 'end', lside: 'left',
    lline: [[36, 172], [16, 171]],
  },
  {
    id: 'right-upper-arm',
    label: 'R. Arm',
    count: 2,
    shape: 'path',
    d: 'M176,120 Q190,130 198,156 204,178 206,200 204,216 198,222 190,224 180,220 172,212 168,196 166,174 166,150 170,128 174,118 Z',
    lx: 226, ly: 170, la: 'start', lside: 'right',
    lline: [[204, 172], [224, 171]],
  },
  {
    id: 'left-elbow',
    label: 'L. Elbow',
    count: 3,
    shape: 'ellipse',
    cx: 42, cy: 214, rx: 14, ry: 13,
    lx: 14, ly: 210, la: 'end', lside: 'left',
    lline: [[28, 214], [16, 211]],
  },
  {
    id: 'right-elbow',
    label: 'R. Elbow',
    count: 3,
    shape: 'ellipse',
    cx: 198, cy: 214, rx: 14, ry: 13,
    lx: 226, ly: 210, la: 'start', lside: 'right',
    lline: [[212, 214], [224, 211]],
  },
  {
    id: 'left-wrist',
    label: 'L. Wrist',
    count: 3,
    shape: 'ellipse',
    cx: 36, cy: 268, rx: 13, ry: 11,
    lx: 14, ly: 264, la: 'end', lside: 'left',
    lline: [[23, 268], [16, 265]],
  },
  {
    id: 'right-wrist',
    label: 'R. Wrist',
    count: 3,
    shape: 'ellipse',
    cx: 204, cy: 268, rx: 13, ry: 11,
    lx: 226, ly: 264, la: 'start', lside: 'right',
    lline: [[217, 268], [224, 265]],
  },
  {
    id: 'abdomen',
    label: 'Abdomen',
    count: 3,
    shape: 'path',
    d: 'M86,162 Q120,168 154,162 L156,236 Q120,242 84,236 Z',
    lx: 158, ly: 200, la: 'start', lside: 'right',
    lline: [[152, 202], [156, 201]],
  },
  {
    id: 'hip',
    label: 'Hip / Pelvis',
    count: 3,
    shape: 'path',
    d: 'M84,236 Q120,242 156,236 L158,284 Q120,292 82,284 Z',
    lx: 158, ly: 262, la: 'start', lside: 'right',
    lline: [[154, 264], [156, 263]],
  },
  {
    id: 'left-knee',
    label: 'L. Knee',
    count: 4,
    shape: 'ellipse',
    cx: 98, cy: 392, rx: 20, ry: 19,
    lx: 14, ly: 388, la: 'end', lside: 'left',
    lline: [[78, 392], [16, 389]],
  },
  {
    id: 'right-knee',
    label: 'R. Knee',
    count: 4,
    shape: 'ellipse',
    cx: 142, cy: 392, rx: 20, ry: 19,
    lx: 226, ly: 388, la: 'start', lside: 'right',
    lline: [[162, 392], [224, 389]],
  },
  {
    id: 'left-ankle',
    label: 'L. Ankle',
    count: 4,
    shape: 'ellipse',
    cx: 94, cy: 492, rx: 15, ry: 12,
    lx: 14, ly: 488, la: 'end', lside: 'left',
    lline: [[79, 492], [16, 489]],
  },
  {
    id: 'right-ankle',
    label: 'R. Ankle',
    count: 4,
    shape: 'ellipse',
    cx: 146, cy: 492, rx: 15, ry: 12,
    lx: 226, ly: 488, la: 'start', lside: 'right',
    lline: [[161, 492], [224, 489]],
  },
]

// ── Colour helpers ────────────────────────────────────────────────────
const IDLE_FILL     = 'rgba(56,189,248,0.06)'
const HOVER_FILL    = 'rgba(56,189,248,0.22)'
const ACTIVE_FILL   = 'rgba(56,189,248,0.30)'
const IDLE_STROKE   = 'rgba(56,189,248,0.18)'
const HOVER_STROKE  = 'rgba(56,189,248,0.65)'
const ACTIVE_STROKE = 'rgba(56,189,248,0.90)'

// ── Zone shape renderer ───────────────────────────────────────────────
function ZoneShape({ zone, fill, stroke, strokeWidth, ...rest }) {
  const common = { fill, stroke, strokeWidth, ...rest }

  if (zone.shape === 'ellipse') {
    return (
      <ellipse
        cx={zone.cx} cy={zone.cy}
        rx={zone.rx} ry={zone.ry}
        {...common}
      />
    )
  }
  if (zone.shape === 'path') {
    return <path d={zone.d} {...common} />
  }
  if (zone.shape === 'rect') {
    return (
      <rect
        x={zone.x} y={zone.y}
        width={zone.width} height={zone.height}
        rx={zone.rx_r ?? 4}
        {...common}
      />
    )
  }
  return null
}

// ── Tooltip ───────────────────────────────────────────────────────────
function Tooltip({ zone, svgPoint }) {
  if (!zone || !svgPoint) return null
  return (
    <AnimatePresence>
      <motion.g
        key={zone.id}
        initial={{ opacity: 0, scale: 0.88 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
      >
        {/* Box */}
        <rect
          x={svgPoint.x - 38}
          y={svgPoint.y - 26}
          width={76}
          height={22}
          rx={5}
          fill="#0f1928"
          stroke="rgba(56,189,248,0.45)"
          strokeWidth="0.8"
        />
        {/* Zone name */}
        <text
          x={svgPoint.x}
          y={svgPoint.y - 11}
          textAnchor="middle"
          fontSize="7"
          fontFamily="DM Sans,system-ui,sans-serif"
          fontWeight="600"
          letterSpacing="0.04em"
          fill="#38bdf8"
        >
          {zone.label.toUpperCase()}
        </text>
        {/* Injury count */}
        <text
          x={svgPoint.x}
          y={svgPoint.y - 3}
          textAnchor="middle"
          fontSize="6"
          fontFamily="DM Sans,system-ui,sans-serif"
          fill="rgba(148,163,184,0.8)"
        >
          {zone.count} injur{zone.count === 1 ? 'y' : 'ies'}
        </text>
      </motion.g>
    </AnimatePresence>
  )
}

// ── Main component ────────────────────────────────────────────────────
export default function BodySVG({ onZoneClick, activeZone, bodyView = 'Front' }) {
  const [hoveredZone, setHoveredZone] = useState(null)
  const [tooltipPt, setTooltipPt]    = useState(null)

  const isFront = bodyView === 'Front'

  // Convert mouse event to SVG user-space coords for tooltip placement
  const toSVGPoint = useCallback((e, svgEl) => {
    if (!svgEl) return null
    const pt = svgEl.createSVGPoint()
    pt.x = e.clientX
    pt.y = e.clientY
    const svgPt = pt.matrixTransform(svgEl.getScreenCTM().inverse())
    return { x: svgPt.x, y: svgPt.y }
  }, [])

  const handleMouseEnter = useCallback((zone, e) => {
    setHoveredZone(zone)
    const svgEl = e.currentTarget.closest('svg')
    setTooltipPt(toSVGPoint(e, svgEl))
  }, [toSVGPoint])

  const handleMouseMove = useCallback((zone, e) => {
    const svgEl = e.currentTarget.closest('svg')
    setTooltipPt(toSVGPoint(e, svgEl))
  }, [toSVGPoint])

  const handleMouseLeave = useCallback(() => {
    setHoveredZone(null)
    setTooltipPt(null)
  }, [])

  const handleClick = useCallback((zone) => {
    onZoneClick?.(zone.id)
  }, [onZoneClick])

  return (
    <div style={{ width: '100%', maxWidth: '340px', margin: '0 auto' }}>
      <svg
        viewBox="0 0 240 548"
        width="100%"
        height="auto"
        style={{ display: 'block', overflow: 'visible' }}
        aria-label={isFront ? 'Interactive human body diagram — front view' : 'Human body diagram — back view coming soon'}
      >
        <defs>
          {/* Glow filter for active/hover zones */}
          <filter id="zone-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Active glow — stronger */}
          <filter id="zone-glow-active" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          {/* Subtle radial for silhouette depth */}
          <radialGradient id="body-gradient" cx="50%" cy="40%" r="55%">
            <stop offset="0%" stopColor="#162035" />
            <stop offset="100%" stopColor="#0d1320" />
          </radialGradient>
          {/* Active zone fill gradient */}
          <radialGradient id="active-zone-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(56,189,248,0.35)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.15)" />
          </radialGradient>
        </defs>

        {/* ── Silhouette background shapes ── */}
        <g aria-hidden="true" opacity={isFront ? 1 : 0.45} style={{ transition: 'opacity 0.3s ease' }}>
          {/* Head */}
          <ellipse
            cx={120} cy={44} rx={32} ry={38}
            fill="url(#body-gradient)" stroke="#1a3050" strokeWidth="1.2"
            className="svg-draw"
          />
          {/* Neck */}
          <rect
            x={110} y={80} width={20} height={24} rx={5}
            fill="url(#body-gradient)" stroke="#1a3050" strokeWidth="1.2"
          />
          {/* Torso + shoulder bumps */}
          <path
            d={SILHOUETTE.torso}
            fill="url(#body-gradient)" stroke="#1a3050" strokeWidth="1.2"
            className="svg-draw"
          />
          {/* Left arm */}
          <path
            d={SILHOUETTE.leftArm}
            fill="url(#body-gradient)" stroke="#1a3050" strokeWidth="1.2"
            className="svg-draw"
          />
          {/* Right arm */}
          <path
            d={SILHOUETTE.rightArm}
            fill="url(#body-gradient)" stroke="#1a3050" strokeWidth="1.2"
            className="svg-draw"
          />
          {/* Left leg */}
          <path
            d={SILHOUETTE.leftLeg}
            fill="url(#body-gradient)" stroke="#1a3050" strokeWidth="1.2"
            className="svg-draw"
          />
          {/* Right leg */}
          <path
            d={SILHOUETTE.rightLeg}
            fill="url(#body-gradient)" stroke="#1a3050" strokeWidth="1.2"
            className="svg-draw"
          />

          {/* ── Front-view anatomical detail lines ── */}
          {isFront && (
            <>
              {/* Clavicle hints */}
              <path d="M120,104 Q98,108 80,116"  stroke="#1e3a60" strokeWidth="0.7" fill="none" />
              <path d="M120,104 Q142,108 160,116" stroke="#1e3a60" strokeWidth="0.7" fill="none" />
              {/* Mid-sternum line */}
              <line x1="120" y1="106" x2="120" y2="162" stroke="#1e3a60" strokeWidth="0.6" />
              {/* Rib arches */}
              <path d="M90,140 Q120,148 150,140" stroke="#1e3a60" strokeWidth="0.5" fill="none" />
              <path d="M88,155 Q120,165 152,155" stroke="#1e3a60" strokeWidth="0.5" fill="none" />
              {/* Navel */}
              <circle cx="120" cy="196" r="2.5" fill="none" stroke="#1e3a60" strokeWidth="0.8" />
              {/* Hip crease lines */}
              <path d="M92,286 Q106,295 120,296 Q134,295 148,286" stroke="#1e3a60" strokeWidth="0.7" fill="none" />
              {/* Knee caps */}
              <ellipse cx="98"  cy="385" rx="10" ry="7" fill="none" stroke="#1e3a60" strokeWidth="0.7" />
              <ellipse cx="142" cy="385" rx="10" ry="7" fill="none" stroke="#1e3a60" strokeWidth="0.7" />
              {/* Facial features */}
              <ellipse cx="112" cy="42" rx="4" ry="3" fill="#1a2e50" />
              <ellipse cx="128" cy="42" rx="4" ry="3" fill="#1a2e50" />
              <path d="M114,56 Q120,60 126,56" stroke="#1e3a60" strokeWidth="0.8" fill="none" />
            </>
          )}

          {/* ── Back-view anatomical detail lines ── */}
          {!isFront && (
            <>
              {/* Spine */}
              <line x1="120" y1="104" x2="120" y2="288" stroke="#1e3a60" strokeWidth="0.9" strokeDasharray="4,3" />
              {/* Cervical vertebrae dots */}
              <circle cx="120" cy="110" r="1.8" fill="#1e3a60" />
              <circle cx="120" cy="118" r="1.8" fill="#1e3a60" />
              <circle cx="120" cy="126" r="1.8" fill="#1e3a60" />
              {/* Left scapula */}
              <path d="M88,128 Q74,138 72,156 Q74,172 88,174 Q100,172 104,156 Q102,138 88,128 Z"
                    fill="none" stroke="#1e3a60" strokeWidth="0.9" />
              {/* Right scapula */}
              <path d="M152,128 Q166,138 168,156 Q166,172 152,174 Q140,172 136,156 Q138,138 152,128 Z"
                    fill="none" stroke="#1e3a60" strokeWidth="0.9" />
              {/* Posterior rib lines */}
              <path d="M90,138 Q80,144 76,150" stroke="#1e3a60" strokeWidth="0.5" fill="none" />
              <path d="M90,150 Q78,156 74,162" stroke="#1e3a60" strokeWidth="0.5" fill="none" />
              <path d="M150,138 Q160,144 164,150" stroke="#1e3a60" strokeWidth="0.5" fill="none" />
              <path d="M150,150 Q162,156 166,162" stroke="#1e3a60" strokeWidth="0.5" fill="none" />
              {/* Lumbar detail */}
              <path d="M108,236 Q120,240 132,236" stroke="#1e3a60" strokeWidth="0.7" fill="none" />
              <path d="M108,248 Q120,252 132,248" stroke="#1e3a60" strokeWidth="0.7" fill="none" />
              {/* Gluteal crease */}
              <path d="M96,290 Q108,302 120,304 Q132,302 144,290" stroke="#1e3a60" strokeWidth="0.8" fill="none" />
              {/* Calf muscle suggestion */}
              <path d="M88,400 Q82,430 86,460" stroke="#1e3a60" strokeWidth="0.7" fill="none" />
              <path d="M108,400 Q114,430 110,460" stroke="#1e3a60" strokeWidth="0.7" fill="none" />
              <path d="M132,400 Q126,430 130,460" stroke="#1e3a60" strokeWidth="0.7" fill="none" />
              <path d="M152,400 Q158,430 154,460" stroke="#1e3a60" strokeWidth="0.7" fill="none" />
              {/* Back of head — hair line */}
              <path d="M98,18 Q120,10 142,18" stroke="#1e3a60" strokeWidth="0.9" fill="none" />
            </>
          )}
        </g>

        {/* ── Clickable zones (front view only) ── */}
        {isFront && (
          <g role="list" aria-label="Body zones">
            {ZONES.map((zone) => {
              const isHovered = hoveredZone?.id === zone.id
              const isActive  = activeZone === zone.id

              const fill        = isActive ? 'url(#active-zone-fill)' : isHovered ? HOVER_FILL : IDLE_FILL
              const stroke      = isActive ? ACTIVE_STROKE : isHovered ? HOVER_STROKE : IDLE_STROKE
              const strokeWidth = isActive ? 1.4 : isHovered ? 1.1 : 0.7
              const filter      = isActive
                ? 'url(#zone-glow-active)'
                : isHovered
                ? 'url(#zone-glow)'
                : undefined

              return (
                <g
                  key={zone.id}
                  role="listitem"
                  aria-label={`${zone.label} — ${zone.count} injuries`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleClick(zone)}
                  onMouseEnter={(e) => handleMouseEnter(zone, e)}
                  onMouseMove={(e)  => handleMouseMove(zone, e)}
                  onMouseLeave={handleMouseLeave}
                >
                  <ZoneShape
                    zone={zone}
                    fill={fill}
                    stroke={stroke}
                    strokeWidth={strokeWidth}
                    filter={filter}
                    style={{ transition: 'fill 0.18s ease, stroke 0.18s ease' }}
                  />
                  {/* Expanded hit area */}
                  <ZoneShape
                    zone={zone}
                    fill="transparent"
                    stroke="none"
                    strokeWidth={0}
                    style={{ cursor: 'pointer' }}
                  />
                </g>
              )
            })}
          </g>
        )}

        {/* ── Zone labels (front view only) ── */}
        {isFront && (
          <g aria-hidden="true" pointerEvents="none">
            {ZONES.map((zone) => {
              const isActive  = activeZone === zone.id
              const isHovered = hoveredZone?.id === zone.id
              const lit = isActive || isHovered

              return (
                <g key={`label-${zone.id}`}>
                  <line
                    x1={zone.lline[0][0]} y1={zone.lline[0][1]}
                    x2={zone.lline[1][0]} y2={zone.lline[1][1]}
                    stroke={lit ? 'rgba(56,189,248,0.55)' : 'rgba(42,61,107,0.7)'}
                    strokeWidth="0.7"
                    strokeDasharray={lit ? '' : '2,1'}
                    style={{ transition: 'stroke 0.2s ease' }}
                  />
                  <text
                    x={zone.lx}
                    y={zone.ly + 4}
                    textAnchor={zone.la}
                    fontSize="6.2"
                    fontFamily="DM Sans,system-ui,sans-serif"
                    fontWeight="600"
                    letterSpacing="0.06em"
                    fill={lit ? '#38bdf8' : 'rgba(74,96,128,0.85)'}
                    style={{ transition: 'fill 0.2s ease' }}
                  >
                    {zone.label.toUpperCase()}
                  </text>
                  {lit && (
                    <circle
                      cx={zone.lline[0][0]} cy={zone.lline[0][1]}
                      r="2" fill="#38bdf8"
                    />
                  )}
                </g>
              )
            })}
          </g>
        )}

        {/* ── Back-view "coming soon" overlay ── */}
        {!isFront && (
          <g pointerEvents="none" aria-hidden="true">
            {/* Dark vignette */}
            <rect x="0" y="0" width="240" height="548" fill="rgba(10,14,23,0.58)" />
            {/* Decorative separator lines */}
            <line x1="68" y1="255" x2="172" y2="255" stroke="#1e2d4a" strokeWidth="0.8" />
            <line x1="68" y1="285" x2="172" y2="285" stroke="#1e2d4a" strokeWidth="0.8" />
            {/* "Back View" label */}
            <text
              x="120" y="264"
              textAnchor="middle"
              fontSize="10"
              fontFamily="DM Sans,system-ui,sans-serif"
              fontWeight="700"
              letterSpacing="0.14em"
              fill="#4a6080"
            >
              BACK VIEW
            </text>
            <text
              x="120" y="279"
              textAnchor="middle"
              fontSize="8"
              fontFamily="DM Sans,system-ui,sans-serif"
              fill="#2a3d6b"
              letterSpacing="0.06em"
            >
              Coming soon
            </text>
          </g>
        )}

        {/* ── Hover tooltip (front view only) ── */}
        {isFront && hoveredZone && tooltipPt && (
          <Tooltip
            zone={hoveredZone}
            svgPoint={{ x: tooltipPt.x, y: tooltipPt.y - 18 }}
          />
        )}
      </svg>

      {/* ── Zone count legend (below SVG) ── */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: '16px', marginTop: '10px', padding: '0 8px',
      }}>
        <span style={{ fontSize: '10px', color: '#4a6080', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {isFront ? `${ZONES.length} zones` : 'Back view'}
        </span>
        <div style={{ width: '1px', height: '10px', background: '#1e2d4a' }} />
        <span style={{ fontSize: '10px', color: '#4a6080', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
          {isFront ? 'Click to explore' : 'Coming soon'}
        </span>
        {isFront && (
          <>
            <div style={{ width: '1px', height: '10px', background: '#1e2d4a' }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span style={{
                display: 'inline-block', width: '8px', height: '8px',
                borderRadius: '50%', background: 'rgba(56,189,248,0.55)',
                boxShadow: '0 0 6px rgba(56,189,248,0.4)',
              }} />
              <span style={{ fontSize: '10px', color: '#4a6080', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {activeZone
                  ? ZONES.find(z => z.id === activeZone)?.label ?? 'Selected'
                  : 'None selected'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
