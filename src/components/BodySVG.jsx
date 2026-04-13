import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── ViewBox: 0 0 240 548 │ Centre x=120 ─────────────────────────────
// Slightly slimmer silhouette vs original — zones unchanged.

const SILHOUETTE = {
  torso: `M 90,100 Q 66,104 55,116 53,130 53,148 57,154 75,156
    L 90,158 Q 90,200 91,238 91,262 93,282 97,292
    L 143,292 Q 147,282 149,262 149,238 150,200 150,158
    L 165,156 Q 183,154 187,148 187,130 185,116 174,104 150,100 Z`,
  leftArm: `M 57,118 Q 49,112 41,114 33,120 25,134 21,158 19,182
    19,206 21,222 25,234 27,252 27,268 27,280
    Q 29,290 35,296 43,298 51,298 59,292 63,282
    Q 65,270 65,256 63,240 61,224 65,208
    Q 69,196 71,180 71,158 69,136 61,120 57,118 Z`,
  rightArm: `M 183,118 Q 191,112 199,114 207,120 215,134 219,158 221,182
    221,206 219,222 215,234 213,252 213,268 213,280
    Q 211,290 205,296 197,298 189,298 181,292 177,282
    Q 175,270 175,256 177,240 179,224 175,208
    Q 171,196 169,180 169,158 171,136 179,120 183,118 Z`,
  leftLeg: `M 80,292 L 116,292
    Q 116,308 115,328 113,350 110,372 108,392
    108,408 110,424 112,442 112,460 110,478
    Q 108,494 104,508 98,516 94,516 88,512
    Q 82,506 80,496 78,480 78,462 80,444 82,426
    82,410 80,394 78,372 76,350 74,328 74,308 80,292 Z`,
  rightLeg: `M 160,292 L 124,292
    Q 124,308 125,328 127,350 130,372 132,392
    132,408 130,424 128,442 128,460 130,478
    Q 132,494 136,508 142,516 146,516 152,512
    Q 158,506 160,496 162,480 162,462 160,444 158,426
    158,410 160,394 162,372 164,350 166,328 166,308 160,292 Z`,
}

// ── Zone definitions — do not change ─────────────────────────────────
export const ZONES = [
  { id: 'head',           label: 'Head',         count: 3, shape: 'ellipse', cx: 120, cy:  44, rx: 32, ry: 38, lx: 158, ly:  40, la: 'start', lside: 'right', lline: [[152,44],[156,41]] },
  { id: 'neck',           label: 'Neck',         count: 3, shape: 'ellipse', cx: 120, cy:  92, rx: 11, ry: 12, lx: 158, ly:  88, la: 'start', lside: 'right', lline: [[131,92],[156,89]] },
  { id: 'left-shoulder',  label: 'L. Shoulder',  count: 4, shape: 'ellipse', cx:  68, cy: 122, rx: 24, ry: 20, lx:  18, ly: 116, la: 'end',   lside: 'left',  lline: [[44,122],[20,117]] },
  { id: 'right-shoulder', label: 'R. Shoulder',  count: 4, shape: 'ellipse', cx: 172, cy: 122, rx: 24, ry: 20, lx: 222, ly: 116, la: 'start', lside: 'right', lline: [[196,122],[220,117]] },
  { id: 'chest',          label: 'Chest',        count: 3, shape: 'path',    d: 'M88,106 Q120,102 152,106 L154,162 Q120,168 86,162 Z',          lx: 158, ly: 135, la: 'start', lside: 'right', lline: [[150,138],[156,136]] },
  { id: 'left-upper-arm', label: 'L. Arm',       count: 2, shape: 'path',    d: 'M64,120 Q50,130 42,156 36,178 34,200 36,216 42,222 50,224 60,220 68,212 72,196 74,174 74,150 70,128 66,118 Z', lx: 14, ly: 170, la: 'end', lside: 'left', lline: [[36,172],[16,171]] },
  { id: 'right-upper-arm',label: 'R. Arm',       count: 2, shape: 'path',    d: 'M176,120 Q190,130 198,156 204,178 206,200 204,216 198,222 190,224 180,220 172,212 168,196 166,174 166,150 170,128 174,118 Z', lx: 226, ly: 170, la: 'start', lside: 'right', lline: [[204,172],[224,171]] },
  { id: 'left-elbow',     label: 'L. Elbow',     count: 3, shape: 'ellipse', cx:  42, cy: 214, rx: 14, ry: 13, lx:  14, ly: 210, la: 'end',   lside: 'left',  lline: [[28,214],[16,211]] },
  { id: 'right-elbow',    label: 'R. Elbow',     count: 3, shape: 'ellipse', cx: 198, cy: 214, rx: 14, ry: 13, lx: 226, ly: 210, la: 'start', lside: 'right', lline: [[212,214],[224,211]] },
  { id: 'left-wrist',     label: 'L. Wrist',     count: 3, shape: 'ellipse', cx:  36, cy: 268, rx: 13, ry: 11, lx:  14, ly: 264, la: 'end',   lside: 'left',  lline: [[23,268],[16,265]] },
  { id: 'right-wrist',    label: 'R. Wrist',     count: 3, shape: 'ellipse', cx: 204, cy: 268, rx: 13, ry: 11, lx: 226, ly: 264, la: 'start', lside: 'right', lline: [[217,268],[224,265]] },
  { id: 'abdomen',        label: 'Abdomen',      count: 3, shape: 'path',    d: 'M86,162 Q120,168 154,162 L156,236 Q120,242 84,236 Z',          lx: 158, ly: 200, la: 'start', lside: 'right', lline: [[152,202],[156,201]] },
  { id: 'hip',            label: 'Hip / Pelvis', count: 3, shape: 'path',    d: 'M84,236 Q120,242 156,236 L158,284 Q120,292 82,284 Z',          lx: 158, ly: 262, la: 'start', lside: 'right', lline: [[154,264],[156,263]] },
  { id: 'left-knee',      label: 'L. Knee',      count: 4, shape: 'ellipse', cx:  98, cy: 392, rx: 20, ry: 19, lx:  14, ly: 388, la: 'end',   lside: 'left',  lline: [[78,392],[16,389]] },
  { id: 'right-knee',     label: 'R. Knee',      count: 4, shape: 'ellipse', cx: 142, cy: 392, rx: 20, ry: 19, lx: 226, ly: 388, la: 'start', lside: 'right', lline: [[162,392],[224,389]] },
  { id: 'left-ankle',     label: 'L. Ankle',     count: 4, shape: 'ellipse', cx:  94, cy: 492, rx: 15, ry: 12, lx:  14, ly: 488, la: 'end',   lside: 'left',  lline: [[79,492],[16,489]] },
  { id: 'right-ankle',    label: 'R. Ankle',     count: 4, shape: 'ellipse', cx: 146, cy: 492, rx: 15, ry: 12, lx: 226, ly: 488, la: 'start', lside: 'right', lline: [[161,492],[224,489]] },
]

// ── Transparent zone overlays — anatomy must show through ─────────────
const IDLE_FILL     = 'rgba(56,189,248,0.03)'
const HOVER_FILL    = 'rgba(56,189,248,0.14)'
const ACTIVE_FILL   = 'rgba(56,189,248,0.26)'
const IDLE_STROKE   = 'rgba(56,189,248,0.16)'
const HOVER_STROKE  = 'rgba(56,189,248,0.60)'
const ACTIVE_STROKE = 'rgba(56,189,248,0.88)'

// ── ZoneShape ─────────────────────────────────────────────────────────
function ZoneShape({ zone, fill, stroke, strokeWidth, ...rest }) {
  const c = { fill, stroke, strokeWidth, ...rest }
  if (zone.shape === 'ellipse') return <ellipse cx={zone.cx} cy={zone.cy} rx={zone.rx} ry={zone.ry} {...c} />
  if (zone.shape === 'path')    return <path d={zone.d} {...c} />
  if (zone.shape === 'rect')    return <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} rx={zone.rx_r ?? 4} {...c} />
  return null
}

// ── Tooltip ───────────────────────────────────────────────────────────
function Tooltip({ zone, svgPoint }) {
  if (!zone || !svgPoint) return null
  return (
    <AnimatePresence>
      <motion.g key={zone.id} initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
        <rect x={svgPoint.x-38} y={svgPoint.y-26} width={76} height={22} rx={5} fill="#0a0e17" stroke="rgba(56,189,248,0.40)" strokeWidth="0.8" />
        <text x={svgPoint.x} y={svgPoint.y-11} textAnchor="middle" fontSize="7"  fontFamily="DM Sans,system-ui,sans-serif" fontWeight="600" letterSpacing="0.04em" fill="#38bdf8">{zone.label.toUpperCase()}</text>
        <text x={svgPoint.x} y={svgPoint.y-3}  textAnchor="middle" fontSize="6"  fontFamily="DM Sans,system-ui,sans-serif" fill="rgba(148,163,184,0.8)">{zone.count} injur{zone.count===1?'y':'ies'}</text>
      </motion.g>
    </AnimatePresence>
  )
}

// ── Rounded-rect abs-cell helper ──────────────────────────────────────
function Cell({ x, y, w, h, r = 3, fill }) {
  const d = `M${x+r},${y} h${w-r*2} Q${x+w},${y} ${x+w},${y+r} v${h-r*2} Q${x+w},${y+h} ${x+w-r},${y+h} h${r*2-w} Q${x},${y+h} ${x},${y+h-r} v${r*2-h} Q${x},${y} ${x+r},${y} Z`
  return <path d={d} fill={fill} />
}

// ── Main component ────────────────────────────────────────────────────
export default function BodySVG({ onZoneClick, activeZone, bodyView = 'Front' }) {
  const [hoveredZone, setHoveredZone] = useState(null)
  const [tooltipPt,   setTooltipPt]   = useState(null)
  const isFront = bodyView === 'Front'

  const toSVGPoint = useCallback((e, svg) => {
    if (!svg) return null
    const p = svg.createSVGPoint()
    p.x = e.clientX; p.y = e.clientY
    return p.matrixTransform(svg.getScreenCTM().inverse())
  }, [])

  const onEnter = useCallback((z, e) => { setHoveredZone(z); setTooltipPt(toSVGPoint(e, e.currentTarget.closest('svg'))) }, [toSVGPoint])
  const onMove  = useCallback((z, e) => { setTooltipPt(toSVGPoint(e, e.currentTarget.closest('svg'))) }, [toSVGPoint])
  const onLeave = useCallback(() => { setHoveredZone(null); setTooltipPt(null) }, [])
  const onClick = useCallback((z) => { onZoneClick?.(z.id) }, [onZoneClick])

  return (
    <div style={{ width: '100%', maxWidth: '340px', margin: '0 auto' }}>
      <svg viewBox="0 0 240 548" width="100%" height="auto"
           style={{ display: 'block', overflow: 'visible' }}
           aria-label={isFront ? 'Anatomy chart — anterior view' : 'Anatomy chart — posterior view'}>
        <defs>
          {/* ── Drop shadow on whole figure ── */}
          <filter id="fig-shadow" x="-14%" y="-3%" width="128%" height="110%">
            <feDropShadow dx="1" dy="5" stdDeviation="7" floodColor="#000" floodOpacity="0.48" />
          </filter>

          {/* ── Zone interaction glows ── */}
          <filter id="zone-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="b" /><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="zone-glow-active" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="b" /><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>

          {/* ── Skin gradients — muted warm tone ── */}
          <linearGradient id="sk-body" x1="38%" y1="0%" x2="62%" y2="100%">
            <stop offset="0%"   stopColor="#a0826d"/>
            <stop offset="48%"  stopColor="#8b7060"/>
            <stop offset="100%" stopColor="#7a6050"/>
          </linearGradient>
          <linearGradient id="sk-head" x1="35%" y1="0%" x2="65%" y2="100%">
            <stop offset="0%"   stopColor="#a8836e"/>
            <stop offset="100%" stopColor="#907262"/>
          </linearGradient>

          {/* ── Muscle gradients — radial, lighter raised centre → dark receding edge ── */}
          {/* Deltoid */}
          <radialGradient id="mg-delt" cx="50%" cy="30%" r="65%">
            <stop offset="0%"   stopColor="#7c3636"/><stop offset="52%" stopColor="#5c2424"/><stop offset="100%" stopColor="#311212"/>
          </radialGradient>
          {/* Pec — left (highlight leans outer-left) */}
          <radialGradient id="mg-pec-l" cx="33%" cy="38%" r="70%">
            <stop offset="0%"   stopColor="#7a3535"/><stop offset="52%" stopColor="#5a2222"/><stop offset="100%" stopColor="#2e1010"/>
          </radialGradient>
          {/* Pec — right (mirror highlight) */}
          <radialGradient id="mg-pec-r" cx="67%" cy="38%" r="70%">
            <stop offset="0%"   stopColor="#7a3535"/><stop offset="52%" stopColor="#5a2222"/><stop offset="100%" stopColor="#2e1010"/>
          </radialGradient>
          {/* Oblique */}
          <radialGradient id="mg-oblq" cx="50%" cy="50%" r="62%">
            <stop offset="0%"   stopColor="#6a2e2e"/><stop offset="52%" stopColor="#4e1e1e"/><stop offset="100%" stopColor="#2a1010"/>
          </radialGradient>
          {/* Abs cell */}
          <radialGradient id="mg-abs" cx="50%" cy="45%" r="60%">
            <stop offset="0%"   stopColor="#7a3535"/><stop offset="52%" stopColor="#5a2222"/><stop offset="100%" stopColor="#2e1010"/>
          </radialGradient>
          {/* Bicep */}
          <radialGradient id="mg-bic" cx="50%" cy="40%" r="62%">
            <stop offset="0%"   stopColor="#7c3636"/><stop offset="52%" stopColor="#5c2424"/><stop offset="100%" stopColor="#301212"/>
          </radialGradient>
          {/* Brachialis (slightly darker) */}
          <radialGradient id="mg-brach" cx="50%" cy="50%" r="58%">
            <stop offset="0%"   stopColor="#622828"/><stop offset="100%" stopColor="#2a1010"/>
          </radialGradient>
          {/* Forearm */}
          <radialGradient id="mg-fore" cx="50%" cy="44%" r="60%">
            <stop offset="0%"   stopColor="#703030"/><stop offset="52%" stopColor="#521e1e"/><stop offset="100%" stopColor="#2c1010"/>
          </radialGradient>
          {/* Vastus lateralis */}
          <radialGradient id="mg-vl" cx="50%" cy="38%" r="65%">
            <stop offset="0%"   stopColor="#7a3434"/><stop offset="52%" stopColor="#592020"/><stop offset="100%" stopColor="#2e1010"/>
          </radialGradient>
          {/* Rectus femoris (brightest quad) */}
          <radialGradient id="mg-rf" cx="50%" cy="40%" r="62%">
            <stop offset="0%"   stopColor="#823838"/><stop offset="52%" stopColor="#5e2424"/><stop offset="100%" stopColor="#301212"/>
          </radialGradient>
          {/* Vastus medialis */}
          <radialGradient id="mg-vm" cx="50%" cy="58%" r="62%">
            <stop offset="0%"   stopColor="#703232"/><stop offset="52%" stopColor="#521e1e"/><stop offset="100%" stopColor="#2c1010"/>
          </radialGradient>
          {/* Adductor */}
          <radialGradient id="mg-add" cx="50%" cy="50%" r="58%">
            <stop offset="0%"   stopColor="#622828"/><stop offset="52%" stopColor="#4a1e1e"/><stop offset="100%" stopColor="#281010"/>
          </radialGradient>
          {/* Tibialis */}
          <radialGradient id="mg-tib" cx="50%" cy="44%" r="60%">
            <stop offset="0%"   stopColor="#703030"/><stop offset="52%" stopColor="#521e1e"/><stop offset="100%" stopColor="#2c1010"/>
          </radialGradient>
          {/* Trapezius upper (back view) */}
          <radialGradient id="mg-trap" cx="50%" cy="34%" r="65%">
            <stop offset="0%"   stopColor="#7a3434"/><stop offset="52%" stopColor="#592020"/><stop offset="100%" stopColor="#2e1010"/>
          </radialGradient>
          {/* SCM neck muscle */}
          <linearGradient id="mg-scm" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor="#6a2c2c"/><stop offset="100%" stopColor="#3c1616"/>
          </linearGradient>

          {/* ── Global 3-D right-side depth shading ── */}
          <linearGradient id="depth-R" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="rgba(255,255,255,0.04)"/>
            <stop offset="40%"  stopColor="rgba(255,255,255,0)"/>
            <stop offset="65%"  stopColor="rgba(0,0,0,0)"/>
            <stop offset="100%" stopColor="rgba(0,0,0,0.20)"/>
          </linearGradient>

          {/* ── Active zone fill ── */}
          <radialGradient id="active-zone-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(56,189,248,0.26)"/>
            <stop offset="100%" stopColor="rgba(56,189,248,0.10)"/>
          </radialGradient>
        </defs>

        {/* ═══════════════════════════════════════════════
            ANATOMY — full figure with drop shadow
            ═══════════════════════════════════════════════ */}
        <g filter="url(#fig-shadow)" opacity={isFront ? 1 : 0.40} style={{ transition: 'opacity 0.3s' }}>

          {/* ── Base skin ── */}
          {/* Featureless head — oval cranium tapering to chin, no facial features */}
          <path
            d="M120,6 C97,6 86,22 85,40 C84,58 90,70 97,78 C104,84 112,87 120,87
               C128,87 136,84 143,78 C150,70 156,58 155,40 C154,22 143,6 120,6 Z"
            fill="url(#sk-head)" className="svg-draw"
          />
          {/* Neck */}
          <path d="M111,85 Q109,88 109,96 109,103 111,105 L129,105 Q131,103 131,96 131,88 129,85 Z"
                fill="url(#sk-body)" />
          {/* Torso, arms, legs */}
          <path d={SILHOUETTE.torso}    fill="url(#sk-body)" className="svg-draw"/>
          <path d={SILHOUETTE.leftArm}  fill="url(#sk-body)" className="svg-draw"/>
          <path d={SILHOUETTE.rightArm} fill="url(#sk-body)" className="svg-draw"/>
          <path d={SILHOUETTE.leftLeg}  fill="url(#sk-body)" className="svg-draw"/>
          <path d={SILHOUETTE.rightLeg} fill="url(#sk-body)" className="svg-draw"/>

          {/* ── FRONT-VIEW MUSCLE LAYER ── */}
          {isFront && (<>

            {/* ─ Sternocleidomastoid (neck tendons) ─ */}
            <path d="M112,85 L107,93 L109,105 L114,105 L113,95 L117,87 Z" fill="url(#mg-scm)" opacity="0.75"/>
            <path d="M128,85 L133,93 L131,105 L126,105 L127,95 L123,87 Z" fill="url(#mg-scm)" opacity="0.75"/>

            {/* ─ Deltoids ─ */}
            {/* L anterior deltoid — triangular shoulder cap */}
            <path d="M51,112 Q48,100 63,98 Q79,100 91,113 Q93,130 85,144 Q74,152 60,150 Q46,144 46,127 Q46,118 51,112 Z"
                  fill="url(#mg-delt)"/>
            {/* R anterior deltoid */}
            <path d="M189,112 Q192,100 177,98 Q161,100 149,113 Q147,130 155,144 Q166,152 180,150 Q194,144 194,127 Q194,118 189,112 Z"
                  fill="url(#mg-delt)"/>

            {/* ─ Pectoralis major ─ */}
            {/* L pec — fan from sternum, lower border fold */}
            <path d="M91,107 Q84,115 83,132 83,150 85,162 91,166 Q105,170 120,164 L120,107 Q108,104 91,107 Z"
                  fill="url(#mg-pec-l)"/>
            {/* R pec */}
            <path d="M149,107 Q156,115 157,132 157,150 155,162 149,166 Q135,170 120,164 L120,107 Q132,104 149,107 Z"
                  fill="url(#mg-pec-r)"/>

            {/* ─ Serratus anterior — finger-like slips on lateral ribcage ─ */}
            <path d="M83,163 Q78,168 79,175 Q83,174 84,163 Z" fill="url(#mg-oblq)" opacity="0.82"/>
            <path d="M81,177 Q76,182 77,189 Q81,188 82,177 Z" fill="url(#mg-oblq)" opacity="0.78"/>
            <path d="M79,191 Q74,196 75,203 Q79,202 80,191 Z" fill="url(#mg-oblq)" opacity="0.72"/>
            <path d="M157,163 Q162,168 161,175 Q157,174 156,163 Z" fill="url(#mg-oblq)" opacity="0.82"/>
            <path d="M159,177 Q164,182 163,189 Q159,188 158,177 Z" fill="url(#mg-oblq)" opacity="0.78"/>
            <path d="M161,191 Q166,196 165,203 Q161,202 160,191 Z" fill="url(#mg-oblq)" opacity="0.72"/>

            {/* ─ External obliques ─ */}
            {/* L oblique — diagonal from ribcage to iliac crest */}
            <path d="M83,163 Q77,176 75,194 Q73,212 75,230 Q78,242 83,248 Q90,252 93,244 L93,169 Q88,166 83,163 Z"
                  fill="url(#mg-oblq)"/>
            {/* R oblique */}
            <path d="M157,163 Q163,176 165,194 Q167,212 165,230 Q162,242 157,248 Q150,252 147,244 L147,169 Q152,166 157,163 Z"
                  fill="url(#mg-oblq)"/>

            {/* ─ Rectus abdominis — 6 cells ─ */}
            {/* Left column */}
            <Cell x={94}  y={171} w={23} h={17} fill="url(#mg-abs)"/>
            <Cell x={94}  y={193} w={23} h={17} fill="url(#mg-abs)"/>
            <Cell x={94}  y={215} w={23} h={16} fill="url(#mg-abs)"/>
            {/* Right column */}
            <Cell x={123} y={171} w={23} h={17} fill="url(#mg-abs)"/>
            <Cell x={123} y={193} w={23} h={17} fill="url(#mg-abs)"/>
            <Cell x={123} y={215} w={23} h={16} fill="url(#mg-abs)"/>

            {/* ─ TFL / hip flexors (lateral hip strip) ─ */}
            <path d="M77,244 Q73,258 73,274 Q75,286 81,294 L81,308 Q74,294 72,276 72,260 76,244 Z"
                  fill="url(#mg-oblq)" opacity="0.65"/>
            <path d="M163,244 Q167,258 167,274 Q165,286 159,294 L159,308 Q166,294 168,276 168,260 164,244 Z"
                  fill="url(#mg-oblq)" opacity="0.65"/>

            {/* ─ Biceps brachii ─ */}
            {/* L bicep — elongated anterior upper arm */}
            <path d="M45,133 Q36,151 31,172 Q27,194 31,212 Q37,227 49,231 Q59,231 65,221 Q71,208 69,184 Q65,158 55,140 Q49,129 45,133 Z"
                  fill="url(#mg-bic)"/>
            {/* R bicep */}
            <path d="M195,133 Q204,151 209,172 Q213,194 209,212 Q203,227 191,231 Q181,231 175,221 Q169,208 171,184 Q175,158 185,140 Q191,129 195,133 Z"
                  fill="url(#mg-bic)"/>
            {/* L brachialis — visible inner edge below bicep */}
            <path d="M31,186 Q27,200 29,214 Q35,228 45,231 Q39,224 37,214 Q33,200 33,186 Z"
                  fill="url(#mg-brach)" opacity="0.8"/>
            {/* R brachialis */}
            <path d="M209,186 Q213,200 211,214 Q205,228 195,231 Q201,224 203,214 Q207,200 207,186 Z"
                  fill="url(#mg-brach)" opacity="0.8"/>

            {/* ─ Forearms ─ */}
            {/* L forearm — massed flexors/extensors */}
            <path d="M29,230 Q21,250 19,266 Q19,278 21,288 Q25,298 33,302 Q43,304 53,300 Q61,294 65,282 Q67,270 65,256 Q63,240 57,228 Q49,220 41,220 Q33,223 29,230 Z"
                  fill="url(#mg-fore)"/>
            {/* R forearm */}
            <path d="M211,230 Q219,250 221,266 Q221,278 219,288 Q215,298 207,302 Q197,304 187,300 Q179,294 175,282 Q173,270 175,256 Q177,240 183,228 Q191,220 199,220 Q207,223 211,230 Z"
                  fill="url(#mg-fore)"/>

            {/* ─ Quadriceps ─ */}
            {/* L vastus lateralis */}
            <path d="M79,294 Q75,314 75,336 Q75,360 77,378 Q79,392 85,398 Q93,400 97,394 Q91,380 91,362 Q89,342 91,320 Q93,306 97,296 Q87,292 79,294 Z"
                  fill="url(#mg-vl)"/>
            {/* L rectus femoris */}
            <path d="M97,294 Q93,312 91,334 Q89,358 91,378 Q95,392 103,398 Q109,398 113,392 Q117,380 117,358 Q117,334 115,314 Q111,300 107,294 Q101,292 97,294 Z"
                  fill="url(#mg-rf)"/>
            {/* L vastus medialis — teardrop near knee */}
            <path d="M113,297 Q117,318 119,342 Q121,366 119,382 Q117,394 113,398 Q119,394 123,386 Q127,372 125,352 Q123,328 119,310 Q117,299 113,297 Z"
                  fill="url(#mg-vm)"/>
            {/* R vastus lateralis */}
            <path d="M161,294 Q165,314 165,336 Q165,360 163,378 Q161,392 155,398 Q147,400 143,394 Q149,380 149,362 Q151,342 149,320 Q147,306 143,296 Q153,292 161,294 Z"
                  fill="url(#mg-vl)"/>
            {/* R rectus femoris */}
            <path d="M143,294 Q147,312 149,334 Q151,358 149,378 Q145,392 137,398 Q131,398 127,392 Q123,380 123,358 Q123,334 125,314 Q129,300 133,294 Q139,292 143,294 Z"
                  fill="url(#mg-rf)"/>
            {/* R vastus medialis */}
            <path d="M127,297 Q123,318 121,342 Q119,366 121,382 Q123,394 127,398 Q121,394 117,386 Q113,372 115,352 Q117,328 121,310 Q123,299 127,297 Z"
                  fill="url(#mg-vm)"/>

            {/* ─ Adductors (inner thigh) ─ */}
            <path d="M119,298 Q121,318 121,340 Q121,364 119,380 Q117,392 115,398 Q121,394 127,384 Q129,370 127,350 Q125,328 123,310 Q121,300 119,298 Z"
                  fill="url(#mg-add)"/>
            <path d="M121,298 Q119,318 119,340 Q119,364 121,380 Q123,392 125,398 Q119,394 113,384 Q111,370 113,350 Q115,328 117,310 Q119,300 121,298 Z"
                  fill="url(#mg-add)"/>

            {/* ─ Tibialis anterior (shin) ─ */}
            <path d="M82,416 Q78,436 78,458 Q78,476 80,490 Q84,500 90,502 Q96,500 98,490 Q100,474 98,454 Q96,432 92,418 Q88,412 82,416 Z"
                  fill="url(#mg-tib)"/>
            <path d="M158,416 Q162,436 162,458 Q162,476 160,490 Q156,500 150,502 Q144,500 142,490 Q140,474 142,454 Q144,432 148,418 Q152,412 158,416 Z"
                  fill="url(#mg-tib)"/>

          </>)}

          {/* ── FIBER DIRECTION LINES — very faint, follow real anatomy ── */}
          {isFront && (
            <g stroke="rgba(255,255,255,0.055)" strokeWidth="0.4" fill="none" pointerEvents="none">
              {/* Pec L fibers — fan from sternum outward */}
              <path d="M120,110 L94,122"/><path d="M120,120 L90,132"/>
              <path d="M120,132 L87,142"/><path d="M120,144 L87,150"/>
              <path d="M120,156 L91,162"/>
              {/* Pec R fibers */}
              <path d="M120,110 L146,122"/><path d="M120,120 L150,132"/>
              <path d="M120,132 L153,142"/><path d="M120,144 L153,150"/>
              <path d="M120,156 L149,162"/>
              {/* Deltoid L — converge toward insertion */}
              <path d="M53,112 L70,143"/><path d="M61,105 L73,143"/>
              <path d="M70,101 L77,143"/><path d="M79,104 L80,143"/>
              <path d="M87,112 L81,143"/>
              {/* Deltoid R */}
              <path d="M187,112 L170,143"/><path d="M179,105 L167,143"/>
              <path d="M170,101 L163,143"/><path d="M161,104 L160,143"/>
              <path d="M153,112 L159,143"/>
              {/* Bicep L — vertical parallel */}
              <path d="M36,150 L39,224"/><path d="M43,138 L47,226"/>
              <path d="M51,134 L55,226"/><path d="M58,136 L61,220"/>
              <path d="M63,146 L65,215"/>
              {/* Bicep R */}
              <path d="M204,150 L201,224"/><path d="M197,138 L193,226"/>
              <path d="M189,134 L185,226"/><path d="M182,136 L179,220"/>
              <path d="M177,146 L175,215"/>
              {/* Abs — vertical within cells */}
              <path d="M99,172 L99,230"/><path d="M104,172 L104,230"/><path d="M110,172 L110,230"/>
              <path d="M130,172 L130,230"/><path d="M136,172 L136,230"/><path d="M141,172 L141,230"/>
              {/* Oblique L — diagonal upper-out to lower-in */}
              <path d="M90,168 L78,206"/><path d="M90,178 L79,216"/>
              <path d="M89,190 L80,224"/><path d="M87,202 L80,234"/>
              {/* Oblique R */}
              <path d="M150,168 L162,206"/><path d="M150,178 L161,216"/>
              <path d="M151,190 L160,224"/><path d="M153,202 L160,234"/>
              {/* RF L — vertical */}
              <path d="M98,298 L99,394"/><path d="M103,296 L103,394"/><path d="M108,296 L107,394"/>
              {/* VL L */}
              <path d="M81,298 L83,394"/><path d="M87,296 L88,394"/><path d="M93,296 L92,394"/>
              {/* VM L */}
              <path d="M114,300 L115,390"/><path d="M117,308 L118,384"/>
              {/* RF R */}
              <path d="M142,298 L141,394"/><path d="M137,296 L137,394"/><path d="M132,296 L133,394"/>
              {/* VL R */}
              <path d="M159,298 L157,394"/><path d="M153,296 L152,394"/><path d="M147,296 L148,394"/>
              {/* VM R */}
              <path d="M126,300 L125,390"/><path d="M123,308 L122,384"/>
              {/* Tibialis L */}
              <path d="M84,420 L86,494"/><path d="M88,416 L90,494"/><path d="M93,416 L94,494"/>
              {/* Tibialis R */}
              <path d="M156,420 L154,494"/><path d="M152,416 L150,494"/><path d="M147,416 L146,494"/>
            </g>
          )}

          {/* ── FASCIA LINES — thin dark boundaries between muscles ── */}
          {isFront && (
            <g stroke="rgba(15,8,3,0.42)" strokeWidth="0.85" fill="none" pointerEvents="none">
              {/* Pec / deltoid groove L */}
              <path d="M91,108 Q82,120 79,136"/>
              {/* Pec / deltoid groove R */}
              <path d="M149,108 Q158,120 161,136"/>
              {/* Pec lower fold L */}
              <path d="M83,162 Q100,170 120,165"/>
              {/* Pec lower fold R */}
              <path d="M157,162 Q140,170 120,165"/>
              {/* Sternum midline (between pecs) */}
              <line x1="120" y1="107" x2="120" y2="163"/>
              {/* Pec / serratus L */}
              <path d="M83,163 Q79,175 77,190"/>
              {/* Pec / serratus R */}
              <path d="M157,163 Q161,175 163,190"/>
              {/* Linea semilunaris L (abs outer edge) */}
              <line x1="93" y1="169" x2="93" y2="233"/>
              {/* Linea semilunaris R */}
              <line x1="147" y1="169" x2="147" y2="233"/>
              {/* Linea alba (centre abs) */}
              <line x1="120" y1="163" x2="120" y2="245"/>
              {/* Tendinous intersections */}
              <path d="M93,188 Q106,190 120,188 Q134,190 147,188"/>
              <path d="M93,210 Q106,212 120,210 Q134,212 147,210"/>
              {/* Oblique / hip transition L */}
              <path d="M80,240 Q76,254 74,270"/>
              {/* Oblique / hip transition R */}
              <path d="M160,240 Q164,254 166,270"/>
              {/* Bicep / deltoid groove L */}
              <path d="M52,136 Q45,150 39,163"/>
              {/* Bicep / deltoid groove R */}
              <path d="M188,136 Q195,150 201,163"/>
              {/* Bicep peak line L */}
              <path d="M32,182 Q40,175 50,178"/>
              {/* Bicep peak line R */}
              <path d="M208,182 Q200,175 190,178"/>
              {/* Forearm extensor split L */}
              <path d="M34,234 Q42,230 52,234"/>
              {/* Forearm extensor split R */}
              <path d="M206,234 Q198,230 188,234"/>
              {/* Quad VL / RF groove L */}
              <path d="M79,300 Q85,340 89,378"/>
              {/* Quad RF / VM groove L */}
              <path d="M113,300 Q115,342 115,380"/>
              {/* Quad VL / RF groove R */}
              <path d="M161,300 Q155,340 151,378"/>
              {/* Quad RF / VM groove R */}
              <path d="M127,300 Q125,342 125,380"/>
              {/* Adductor / medial knee L */}
              <path d="M119,300 Q120,340 120,380"/>
              {/* Knee crease L */}
              <path d="M87,394 Q98,400 109,394"/>
              {/* Knee crease R */}
              <path d="M131,394 Q142,400 153,394"/>
              {/* Tibialis / fibula edge L */}
              <path d="M100,420 Q104,456 102,490"/>
              {/* Tibialis / fibula edge R */}
              <path d="M140,420 Q136,456 138,490"/>
            </g>
          )}

          {/* ── ANATOMICAL LANDMARKS ── */}
          {isFront && (
            <g pointerEvents="none">
              {/* Clavicle ridges — white bone highlight */}
              <path d="M120,105 Q102,109 84,119"  stroke="rgba(255,255,255,0.28)" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
              <path d="M120,105 Q138,109 156,119" stroke="rgba(255,255,255,0.28)" strokeWidth="1.3" fill="none" strokeLinecap="round"/>
              {/* Manubrium notch (top of sternum) */}
              <path d="M115,105 Q120,101 125,105" stroke="rgba(255,255,255,0.22)" strokeWidth="0.9" fill="none"/>
              {/* Sternum body — subtle bone suggestion */}
              <line x1="120" y1="107" x2="120" y2="162" stroke="rgba(255,255,255,0.14)" strokeWidth="0.8"/>
              {/* Linea alba — faint central tendon */}
              <line x1="120" y1="165" x2="120" y2="244" stroke="rgba(255,255,255,0.12)" strokeWidth="0.6"/>
              {/* Iliac crest L */}
              <path d="M83,238 Q77,248 75,264 Q75,278 79,288" stroke="rgba(255,255,255,0.22)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
              {/* Iliac crest R */}
              <path d="M157,238 Q163,248 165,264 Q165,278 161,288" stroke="rgba(255,255,255,0.22)" strokeWidth="1.1" fill="none" strokeLinecap="round"/>
              {/* Navel */}
              <ellipse cx={120} cy={200} rx={2.5} ry={3} fill="#6a5040" stroke="rgba(0,0,0,0.35)" strokeWidth="0.5"/>
              {/* Patella L */}
              <path d="M90,381 Q90,373 98,371 Q107,373 107,381 Q107,391 98,393 Q90,391 90,381 Z"
                    fill="rgba(160,130,100,0.45)" stroke="rgba(255,255,255,0.20)" strokeWidth="0.7"/>
              {/* Patella R */}
              <path d="M133,381 Q133,373 142,371 Q151,373 151,381 Q151,391 142,393 Q133,391 133,381 Z"
                    fill="rgba(160,130,100,0.45)" stroke="rgba(255,255,255,0.20)" strokeWidth="0.7"/>
            </g>
          )}

          {/* ── BACK VIEW anatomy ── */}
          {!isFront && (
            <g pointerEvents="none" aria-hidden="true">
              {/* Trapezius */}
              <path d="M111,105 Q94,113 80,126 Q72,138 74,154 Q80,162 96,160 Q110,154 120,140 Q130,154 144,160 Q160,162 166,154 Q168,138 160,126 Q146,113 129,105 Z"
                    fill="url(#mg-trap)" opacity="0.88"/>
              {/* Spine */}
              <line x1="120" y1="105" x2="120" y2="290" stroke="rgba(255,255,255,0.20)" strokeWidth="0.9" strokeDasharray="4,3"/>
              {/* Cervical vertebrae */}
              <circle cx={120} cy={111} r={1.8} fill="rgba(255,255,255,0.32)"/>
              <circle cx={120} cy={119} r={1.8} fill="rgba(255,255,255,0.32)"/>
              <circle cx={120} cy={127} r={1.8} fill="rgba(255,255,255,0.32)"/>
              {/* Scapulae */}
              <path d="M88,130 Q74,140 72,160 Q74,176 88,178 Q100,176 104,160 Q102,142 88,130 Z"
                    fill="url(#mg-delt)" opacity="0.55" stroke="rgba(15,8,3,0.35)" strokeWidth="0.7"/>
              <path d="M152,130 Q166,140 168,160 Q166,176 152,178 Q140,176 136,160 Q138,142 152,130 Z"
                    fill="url(#mg-delt)" opacity="0.55" stroke="rgba(15,8,3,0.35)" strokeWidth="0.7"/>
              {/* Posterior rib hints */}
              <path d="M90,140 Q80,146 76,152" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" fill="none"/>
              <path d="M88,152 Q78,158 74,164" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" fill="none"/>
              <path d="M150,140 Q160,146 164,152" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" fill="none"/>
              <path d="M152,152 Q162,158 166,164" stroke="rgba(255,255,255,0.09)" strokeWidth="0.6" fill="none"/>
              {/* Lumbar lines */}
              <path d="M108,240 Q120,244 132,240" stroke="rgba(255,255,255,0.14)" strokeWidth="0.7" fill="none"/>
              <path d="M108,252 Q120,256 132,252" stroke="rgba(255,255,255,0.14)" strokeWidth="0.7" fill="none"/>
              {/* Gluteal crease */}
              <path d="M96,292 Q108,304 120,306 Q132,304 144,292" stroke="rgba(255,255,255,0.17)" strokeWidth="0.8" fill="none"/>
              {/* Coming-soon overlay */}
              <rect x={0} y={0} width={240} height={548} fill="rgba(8,12,20,0.56)"/>
              <line x1={68} y1={258} x2={172} y2={258} stroke="#1e2d4a" strokeWidth="0.7"/>
              <line x1={68} y1={282} x2={172} y2={282} stroke="#1e2d4a" strokeWidth="0.7"/>
              <text x={120} y={268} textAnchor="middle" fontSize="10" fontFamily="DM Sans,system-ui,sans-serif" fontWeight="700" letterSpacing="0.14em" fill="#4a6080">POSTERIOR VIEW</text>
              <text x={120} y={279} textAnchor="middle" fontSize="8"  fontFamily="DM Sans,system-ui,sans-serif" fill="#2a3d6b" letterSpacing="0.06em">Coming soon</text>
            </g>
          )}
        </g>{/* end anatomy group */}

        {/* ── Global right-side 3-D depth shading ── */}
        <rect x={0} y={0} width={240} height={548} fill="url(#depth-R)" pointerEvents="none"/>

        {/* ═══════════════════════════════════════════════
            INTERACTIVE ZONES — transparent overlays
            ═══════════════════════════════════════════════ */}
        {isFront && (
          <g role="list" aria-label="Body zones">
            {ZONES.map((zone) => {
              const isH = hoveredZone?.id === zone.id
              const isA = activeZone === zone.id
              const fill   = isA ? 'url(#active-zone-fill)' : isH ? HOVER_FILL : IDLE_FILL
              const stroke = isA ? ACTIVE_STROKE : isH ? HOVER_STROKE : IDLE_STROKE
              const sw     = isA ? 1.4 : isH ? 1.1 : 0.7
              const filter = isA ? 'url(#zone-glow-active)' : isH ? 'url(#zone-glow)' : undefined
              return (
                <g key={zone.id} role="listitem" aria-label={`${zone.label} — ${zone.count} injuries`}
                   style={{ cursor: 'pointer' }}
                   onClick={() => onClick(zone)}
                   onMouseEnter={(e) => onEnter(zone, e)}
                   onMouseMove={(e)  => onMove(zone, e)}
                   onMouseLeave={onLeave}>
                  <ZoneShape zone={zone} fill={fill} stroke={stroke} strokeWidth={sw} filter={filter}
                             style={{ transition: 'fill 0.18s, stroke 0.18s' }}/>
                  <ZoneShape zone={zone} fill="transparent" stroke="none" strokeWidth={0} style={{ cursor: 'pointer' }}/>
                </g>
              )
            })}
          </g>
        )}

        {/* ── Zone labels ── */}
        {isFront && (
          <g aria-hidden="true" pointerEvents="none">
            {ZONES.map((zone) => {
              const lit = activeZone === zone.id || hoveredZone?.id === zone.id
              return (
                <g key={`lbl-${zone.id}`}>
                  <line x1={zone.lline[0][0]} y1={zone.lline[0][1]} x2={zone.lline[1][0]} y2={zone.lline[1][1]}
                        stroke={lit ? 'rgba(56,189,248,0.55)' : 'rgba(42,61,107,0.7)'}
                        strokeWidth="0.7" strokeDasharray={lit ? '' : '2,1'}
                        style={{ transition: 'stroke 0.2s' }}/>
                  <text x={zone.lx} y={zone.ly+4} textAnchor={zone.la}
                        fontSize="6.2" fontFamily="DM Sans,system-ui,sans-serif" fontWeight="600" letterSpacing="0.06em"
                        fill={lit ? '#38bdf8' : 'rgba(74,96,128,0.85)'}
                        style={{ transition: 'fill 0.2s' }}>
                    {zone.label.toUpperCase()}
                  </text>
                  {lit && <circle cx={zone.lline[0][0]} cy={zone.lline[0][1]} r="2" fill="#38bdf8"/>}
                </g>
              )
            })}
          </g>
        )}

        {/* ── Hover tooltip ── */}
        {isFront && hoveredZone && tooltipPt && (
          <Tooltip zone={hoveredZone} svgPoint={{ x: tooltipPt.x, y: tooltipPt.y - 18 }}/>
        )}
      </svg>

      {/* ── Legend strip ── */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'16px', marginTop:'10px', padding:'0 8px' }}>
        <span style={{ fontSize:'10px', color:'#4a6080', letterSpacing:'0.06em', textTransform:'uppercase' }}>
          {isFront ? `${ZONES.length} zones` : 'Posterior view'}
        </span>
        <div style={{ width:'1px', height:'10px', background:'#1e2d4a' }}/>
        <span style={{ fontSize:'10px', color:'#4a6080', letterSpacing:'0.06em', textTransform:'uppercase' }}>
          {isFront ? 'Click to explore' : 'Coming soon'}
        </span>
        {isFront && (
          <>
            <div style={{ width:'1px', height:'10px', background:'#1e2d4a' }}/>
            <div style={{ display:'flex', alignItems:'center', gap:'5px' }}>
              <span style={{ display:'inline-block', width:'8px', height:'8px', borderRadius:'50%', background:'rgba(56,189,248,0.55)', boxShadow:'0 0 6px rgba(56,189,248,0.4)' }}/>
              <span style={{ fontSize:'10px', color:'#4a6080', textTransform:'uppercase', letterSpacing:'0.06em' }}>
                {activeZone ? ZONES.find(z => z.id === activeZone)?.label ?? 'Selected' : 'None selected'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
