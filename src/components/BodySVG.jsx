import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

// ─── ViewBox: 0 0 240 548 │ Centre x=120 ──────────────────────────────
// y-landmarks: Head top 6 │ Chin 82 │ Neck 82-104 │ Shoulders 115
//   Armpit 148 │ Elbow 210 │ Wrist 268
//   Hip 292 │ Knee 390 │ Ankle 492 │ Foot 520

// ── Body outline paths (reused as skin base) ──────────────────────────
const SILHOUETTE = {
  torso: `M 84,100 Q 62,104 50,116 48,130 48,148 52,154 70,156
    L 84,158 Q 84,200 86,238 86,262 88,282 92,292
    L 148,292 Q 152,282 154,262 154,238 156,200 156,158
    L 170,156 Q 188,154 192,148 192,130 190,116 178,104 156,100 Z`,
  leftArm: `M 56,118 Q 48,112 40,114 32,120 24,134 20,158 18,182
    18,206 20,222 24,234 28,252 28,268 28,280
    Q 30,290 36,296 44,298 52,298 60,292 64,282
    Q 66,270 66,256 64,240 62,224 66,208
    Q 70,196 72,180 72,158 70,136 62,120 56,118 Z`,
  rightArm: `M 184,118 Q 192,112 200,114 208,120 216,134 220,158 222,182
    222,206 220,222 216,234 212,252 212,268 212,280
    Q 210,290 204,296 196,298 188,298 180,292 176,282
    Q 174,270 174,256 176,240 178,224 174,208
    Q 170,196 168,180 168,158 170,136 178,120 184,118 Z`,
  leftLeg: `M 80,292 L 116,292
    Q 116,308 116,328 114,350 112,372 110,392
    110,408 112,424 114,442 114,460 112,478
    Q 110,494 106,508 100,516 96,516 90,512
    Q 84,506 82,496 80,480 80,462 82,444 84,426
    84,410 82,394 80,372 78,350 76,328 76,308 80,292 Z`,
  rightLeg: `M 160,292 L 124,292
    Q 124,308 124,328 126,350 128,372 130,392
    130,408 128,424 126,442 126,460 128,478
    Q 130,494 134,508 140,516 144,516 150,512
    Q 156,506 158,496 160,480 160,462 158,444 156,426
    156,410 158,394 160,372 162,350 164,328 164,308 160,292 Z`,
}

// ── Zone definitions (IDs, coords, labels — do not change) ────────────
export const ZONES = [
  { id: 'head',           label: 'Head',        count: 3,  shape: 'ellipse', cx: 120, cy:  44, rx: 32, ry: 38, lx: 158, ly:  40, la: 'start', lside: 'right', lline: [[152,44],[156,41]] },
  { id: 'neck',           label: 'Neck',        count: 3,  shape: 'ellipse', cx: 120, cy:  92, rx: 11, ry: 12, lx: 158, ly:  88, la: 'start', lside: 'right', lline: [[131,92],[156,89]] },
  { id: 'left-shoulder',  label: 'L. Shoulder', count: 4,  shape: 'ellipse', cx:  68, cy: 122, rx: 24, ry: 20, lx:  18, ly: 116, la: 'end',   lside: 'left',  lline: [[44,122],[20,117]] },
  { id: 'right-shoulder', label: 'R. Shoulder', count: 4,  shape: 'ellipse', cx: 172, cy: 122, rx: 24, ry: 20, lx: 222, ly: 116, la: 'start', lside: 'right', lline: [[196,122],[220,117]] },
  { id: 'chest',          label: 'Chest',       count: 3,  shape: 'path',    d: 'M88,106 Q120,102 152,106 L154,162 Q120,168 86,162 Z', lx: 158, ly: 135, la: 'start', lside: 'right', lline: [[150,138],[156,136]] },
  { id: 'left-upper-arm', label: 'L. Arm',      count: 2,  shape: 'path',    d: 'M64,120 Q50,130 42,156 36,178 34,200 36,216 42,222 50,224 60,220 68,212 72,196 74,174 74,150 70,128 66,118 Z', lx: 14, ly: 170, la: 'end', lside: 'left', lline: [[36,172],[16,171]] },
  { id: 'right-upper-arm',label: 'R. Arm',      count: 2,  shape: 'path',    d: 'M176,120 Q190,130 198,156 204,178 206,200 204,216 198,222 190,224 180,220 172,212 168,196 166,174 166,150 170,128 174,118 Z', lx: 226, ly: 170, la: 'start', lside: 'right', lline: [[204,172],[224,171]] },
  { id: 'left-elbow',     label: 'L. Elbow',    count: 3,  shape: 'ellipse', cx:  42, cy: 214, rx: 14, ry: 13, lx:  14, ly: 210, la: 'end',   lside: 'left',  lline: [[28,214],[16,211]] },
  { id: 'right-elbow',    label: 'R. Elbow',    count: 3,  shape: 'ellipse', cx: 198, cy: 214, rx: 14, ry: 13, lx: 226, ly: 210, la: 'start', lside: 'right', lline: [[212,214],[224,211]] },
  { id: 'left-wrist',     label: 'L. Wrist',    count: 3,  shape: 'ellipse', cx:  36, cy: 268, rx: 13, ry: 11, lx:  14, ly: 264, la: 'end',   lside: 'left',  lline: [[23,268],[16,265]] },
  { id: 'right-wrist',    label: 'R. Wrist',    count: 3,  shape: 'ellipse', cx: 204, cy: 268, rx: 13, ry: 11, lx: 226, ly: 264, la: 'start', lside: 'right', lline: [[217,268],[224,265]] },
  { id: 'abdomen',        label: 'Abdomen',     count: 3,  shape: 'path',    d: 'M86,162 Q120,168 154,162 L156,236 Q120,242 84,236 Z', lx: 158, ly: 200, la: 'start', lside: 'right', lline: [[152,202],[156,201]] },
  { id: 'hip',            label: 'Hip / Pelvis',count: 3,  shape: 'path',    d: 'M84,236 Q120,242 156,236 L158,284 Q120,292 82,284 Z', lx: 158, ly: 262, la: 'start', lside: 'right', lline: [[154,264],[156,263]] },
  { id: 'left-knee',      label: 'L. Knee',     count: 4,  shape: 'ellipse', cx:  98, cy: 392, rx: 20, ry: 19, lx:  14, ly: 388, la: 'end',   lside: 'left',  lline: [[78,392],[16,389]] },
  { id: 'right-knee',     label: 'R. Knee',     count: 4,  shape: 'ellipse', cx: 142, cy: 392, rx: 20, ry: 19, lx: 226, ly: 388, la: 'start', lside: 'right', lline: [[162,392],[224,389]] },
  { id: 'left-ankle',     label: 'L. Ankle',    count: 4,  shape: 'ellipse', cx:  94, cy: 492, rx: 15, ry: 12, lx:  14, ly: 488, la: 'end',   lside: 'left',  lline: [[79,492],[16,489]] },
  { id: 'right-ankle',    label: 'R. Ankle',    count: 4,  shape: 'ellipse', cx: 146, cy: 492, rx: 15, ry: 12, lx: 226, ly: 488, la: 'start', lside: 'right', lline: [[161,492],[224,489]] },
]

// ── Zone overlay colours — very transparent so anatomy shows through ──
const IDLE_FILL     = 'rgba(56,189,248,0.03)'
const HOVER_FILL    = 'rgba(56,189,248,0.15)'
const ACTIVE_FILL   = 'rgba(56,189,248,0.28)'
const IDLE_STROKE   = 'rgba(56,189,248,0.18)'
const HOVER_STROKE  = 'rgba(56,189,248,0.65)'
const ACTIVE_STROKE = 'rgba(56,189,248,0.90)'

// ── ZoneShape renderer ────────────────────────────────────────────────
function ZoneShape({ zone, fill, stroke, strokeWidth, ...rest }) {
  const common = { fill, stroke, strokeWidth, ...rest }
  if (zone.shape === 'ellipse')
    return <ellipse cx={zone.cx} cy={zone.cy} rx={zone.rx} ry={zone.ry} {...common} />
  if (zone.shape === 'path')
    return <path d={zone.d} {...common} />
  if (zone.shape === 'rect')
    return <rect x={zone.x} y={zone.y} width={zone.width} height={zone.height} rx={zone.rx_r ?? 4} {...common} />
  return null
}

// ── Tooltip ───────────────────────────────────────────────────────────
function Tooltip({ zone, svgPoint }) {
  if (!zone || !svgPoint) return null
  return (
    <AnimatePresence>
      <motion.g key={zone.id} initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15 }}>
        <rect x={svgPoint.x - 38} y={svgPoint.y - 26} width={76} height={22} rx={5} fill="#0f1928" stroke="rgba(56,189,248,0.45)" strokeWidth="0.8" />
        <text x={svgPoint.x} y={svgPoint.y - 11} textAnchor="middle" fontSize="7" fontFamily="DM Sans,system-ui,sans-serif" fontWeight="600" letterSpacing="0.04em" fill="#38bdf8">{zone.label.toUpperCase()}</text>
        <text x={svgPoint.x} y={svgPoint.y - 3}  textAnchor="middle" fontSize="6" fontFamily="DM Sans,system-ui,sans-serif" fill="rgba(148,163,184,0.8)">{zone.count} injur{zone.count === 1 ? 'y' : 'ies'}</text>
      </motion.g>
    </AnimatePresence>
  )
}

// ── Rounded-rect abs segment helper ──────────────────────────────────
function AbsSegment({ x, y, w, h, r = 3, fill }) {
  const d = `M${x+r},${y} h${w-2*r} Q${x+w},${y} ${x+w},${y+r} v${h-2*r} Q${x+w},${y+h} ${x+w-r},${y+h} h${-(w-2*r)} Q${x},${y+h} ${x},${y+h-r} v${-(h-2*r)} Q${x},${y} ${x+r},${y} Z`
  return <path d={d} fill={fill} />
}

// ── Main component ────────────────────────────────────────────────────
export default function BodySVG({ onZoneClick, activeZone, bodyView = 'Front' }) {
  const [hoveredZone, setHoveredZone] = useState(null)
  const [tooltipPt, setTooltipPt]    = useState(null)
  const isFront = bodyView === 'Front'

  const toSVGPoint = useCallback((e, svgEl) => {
    if (!svgEl) return null
    const pt = svgEl.createSVGPoint()
    pt.x = e.clientX; pt.y = e.clientY
    return pt.matrixTransform(svgEl.getScreenCTM().inverse())
  }, [])

  const handleMouseEnter = useCallback((zone, e) => {
    setHoveredZone(zone)
    setTooltipPt(toSVGPoint(e, e.currentTarget.closest('svg')))
  }, [toSVGPoint])

  const handleMouseMove = useCallback((zone, e) => {
    setTooltipPt(toSVGPoint(e, e.currentTarget.closest('svg')))
  }, [toSVGPoint])

  const handleMouseLeave = useCallback(() => { setHoveredZone(null); setTooltipPt(null) }, [])
  const handleClick      = useCallback((zone) => { onZoneClick?.(zone.id) }, [onZoneClick])

  return (
    <div style={{ width: '100%', maxWidth: '340px', margin: '0 auto' }}>
      <svg
        viewBox="0 0 240 548"
        width="100%" height="auto"
        style={{ display: 'block', overflow: 'visible' }}
        aria-label={isFront ? 'Anatomy chart — front view' : 'Anatomy chart — back view'}
      >
        <defs>
          {/* ── Body drop shadow ── */}
          <filter id="body-shadow" x="-18%" y="-4%" width="136%" height="112%">
            <feDropShadow dx="0" dy="5" stdDeviation="7" floodColor="#000" floodOpacity="0.52" />
          </filter>

          {/* ── Zone glow filters ── */}
          <filter id="zone-glow" x="-30%" y="-30%" width="160%" height="160%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="zone-glow-active" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>

          {/* ── Skin gradients ── */}
          {/* Body base — warm skin tone, darker toward edges */}
          <linearGradient id="grad-skin" x1="30%" y1="0%" x2="70%" y2="100%">
            <stop offset="0%"   stopColor="#d4a574" />
            <stop offset="55%"  stopColor="#c89460" />
            <stop offset="100%" stopColor="#b8956a" />
          </linearGradient>
          {/* Face — slightly lighter/pinker */}
          <radialGradient id="grad-face" cx="45%" cy="38%" r="62%">
            <stop offset="0%"   stopColor="#ddb882" />
            <stop offset="100%" stopColor="#c49060" />
          </radialGradient>
          {/* Ear */}
          <linearGradient id="grad-ear" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%"   stopColor="#b88050" />
            <stop offset="100%" stopColor="#c89060" />
          </linearGradient>

          {/* ── Muscle gradients (radial, objectBoundingBox default) ──
               Lighter highlight near top-centre → darker edges = 3-D depth */}
          <radialGradient id="mg-deltoid" cx="50%" cy="32%" r="65%">
            <stop offset="0%"   stopColor="#e86060" />
            <stop offset="55%"  stopColor="#c0392b" />
            <stop offset="100%" stopColor="#7b241c" />
          </radialGradient>
          <radialGradient id="mg-pec-l" cx="35%" cy="38%" r="68%">
            <stop offset="0%"   stopColor="#d44848" />
            <stop offset="55%"  stopColor="#a93226" />
            <stop offset="100%" stopColor="#7b241c" />
          </radialGradient>
          <radialGradient id="mg-pec-r" cx="65%" cy="38%" r="68%">
            <stop offset="0%"   stopColor="#d44848" />
            <stop offset="55%"  stopColor="#a93226" />
            <stop offset="100%" stopColor="#7b241c" />
          </radialGradient>
          <radialGradient id="mg-bicep" cx="50%" cy="38%" r="62%">
            <stop offset="0%"   stopColor="#e06060" />
            <stop offset="55%"  stopColor="#c0392b" />
            <stop offset="100%" stopColor="#922b21" />
          </radialGradient>
          <radialGradient id="mg-forearm" cx="50%" cy="42%" r="60%">
            <stop offset="0%"   stopColor="#cc4848" />
            <stop offset="55%"  stopColor="#b03a2e" />
            <stop offset="100%" stopColor="#7b241c" />
          </radialGradient>
          <radialGradient id="mg-abs" cx="50%" cy="50%" r="58%">
            <stop offset="0%"   stopColor="#cc4040" />
            <stop offset="55%"  stopColor="#a93226" />
            <stop offset="100%" stopColor="#7b241c" />
          </radialGradient>
          <radialGradient id="mg-oblique" cx="50%" cy="50%" r="58%">
            <stop offset="0%"   stopColor="#b83434" />
            <stop offset="55%"  stopColor="#922b21" />
            <stop offset="100%" stopColor="#6c1d1d" />
          </radialGradient>
          <radialGradient id="mg-quad-outer" cx="50%" cy="42%" r="65%">
            <stop offset="0%"   stopColor="#e06060" />
            <stop offset="55%"  stopColor="#c0392b" />
            <stop offset="100%" stopColor="#922b21" />
          </radialGradient>
          <radialGradient id="mg-quad-center" cx="50%" cy="40%" r="62%">
            <stop offset="0%"   stopColor="#e87070" />
            <stop offset="55%"  stopColor="#c0392b" />
            <stop offset="100%" stopColor="#922b21" />
          </radialGradient>
          <radialGradient id="mg-quad-inner" cx="50%" cy="60%" r="62%">
            <stop offset="0%"   stopColor="#d05050" />
            <stop offset="55%"  stopColor="#b03030" />
            <stop offset="100%" stopColor="#922b21" />
          </radialGradient>
          <radialGradient id="mg-adductor" cx="50%" cy="50%" r="58%">
            <stop offset="0%"   stopColor="#b03434" />
            <stop offset="55%"  stopColor="#922b21" />
            <stop offset="100%" stopColor="#6c1d1d" />
          </radialGradient>
          <radialGradient id="mg-tibialis" cx="50%" cy="42%" r="60%">
            <stop offset="0%"   stopColor="#cc4040" />
            <stop offset="55%"  stopColor="#b03a2e" />
            <stop offset="100%" stopColor="#7b241c" />
          </radialGradient>
          <radialGradient id="mg-trap" cx="50%" cy="35%" r="65%">
            <stop offset="0%"   stopColor="#cc4444" />
            <stop offset="55%"  stopColor="#a93226" />
            <stop offset="100%" stopColor="#7b241c" />
          </radialGradient>
          <radialGradient id="mg-neck-muscle" cx="50%" cy="40%" r="60%">
            <stop offset="0%"   stopColor="#c09070" />
            <stop offset="100%" stopColor="#a07050" />
          </radialGradient>

          {/* Active zone highlight */}
          <radialGradient id="active-zone-fill" cx="50%" cy="50%" r="50%">
            <stop offset="0%"   stopColor="rgba(56,189,248,0.30)" />
            <stop offset="100%" stopColor="rgba(56,189,248,0.12)" />
          </radialGradient>
        </defs>

        {/* ═══════════════════════════════════════════════════════════
            ANATOMY LAYER — drop shadow on the whole body group
            ═══════════════════════════════════════════════════════════ */}
        <g filter="url(#body-shadow)" opacity={isFront ? 1 : 0.42} style={{ transition: 'opacity 0.35s ease' }}>

          {/* ── Base skin shapes (body outline) ── */}
          {/* Head */}
          <ellipse cx={120} cy={44} rx={32} ry={38} fill="url(#grad-face)" />
          {/* Ears */}
          <ellipse cx={88} cy={46} rx={3.5} ry={7}  fill="url(#grad-ear)" />
          <ellipse cx={152} cy={46} rx={3.5} ry={7}  fill="url(#grad-ear)" />
          {/* Neck */}
          <path d="M110,80 Q108,84 108,92 108,102 110,104 L130,104 Q132,102 132,92 132,84 130,80 Z" fill="url(#grad-skin)" />
          {/* Torso */}
          <path d={SILHOUETTE.torso}     fill="url(#grad-skin)" className="svg-draw" />
          {/* Arms */}
          <path d={SILHOUETTE.leftArm}   fill="url(#grad-skin)" className="svg-draw" />
          <path d={SILHOUETTE.rightArm}  fill="url(#grad-skin)" className="svg-draw" />
          {/* Legs */}
          <path d={SILHOUETTE.leftLeg}   fill="url(#grad-skin)" className="svg-draw" />
          <path d={SILHOUETTE.rightLeg}  fill="url(#grad-skin)" className="svg-draw" />

          {/* ── Front-view muscles ── */}
          {isFront && (
            <g>
              {/* ─ Deltoids ─ */}
              {/* Left deltoid — anterior cap */}
              <path d="M48,112 Q46,100 60,100 Q76,102 88,114 Q90,128 84,140 Q74,148 60,146 Q46,142 46,126 Q46,118 48,112 Z"
                    fill="url(#mg-deltoid)" />
              {/* Right deltoid */}
              <path d="M192,112 Q194,100 180,100 Q164,102 152,114 Q150,128 156,140 Q166,148 180,146 Q194,142 194,126 Q194,118 192,112 Z"
                    fill="url(#mg-deltoid)" />

              {/* ─ Pectorals ─ */}
              {/* Left pec */}
              <path d="M88,108 Q84,118 84,136 Q86,152 92,160 Q106,166 120,162 L120,106 Q104,104 88,108 Z"
                    fill="url(#mg-pec-l)" />
              {/* Right pec */}
              <path d="M152,108 Q156,118 156,136 Q154,152 148,160 Q134,166 120,162 L120,106 Q136,104 152,108 Z"
                    fill="url(#mg-pec-r)" />

              {/* ─ External obliques ─ */}
              {/* Left oblique */}
              <path d="M84,164 Q80,174 78,190 Q76,206 78,220 Q80,232 84,238 Q90,244 92,238 L92,168 Q88,166 84,164 Z"
                    fill="url(#mg-oblique)" />
              {/* Right oblique */}
              <path d="M156,164 Q160,174 162,190 Q164,206 162,220 Q160,232 156,238 Q150,244 148,238 L148,168 Q152,166 156,164 Z"
                    fill="url(#mg-oblique)" />

              {/* ─ Rectus abdominis (6-pack) ─ */}
              {/* Left column */}
              <AbsSegment x={93}  y={170} w={24} h={18} fill="url(#mg-abs)" />
              <AbsSegment x={93}  y={192} w={24} h={18} fill="url(#mg-abs)" />
              <AbsSegment x={93}  y={214} w={24} h={17} fill="url(#mg-abs)" />
              {/* Right column */}
              <AbsSegment x={123} y={170} w={24} h={18} fill="url(#mg-abs)" />
              <AbsSegment x={123} y={192} w={24} h={18} fill="url(#mg-abs)" />
              <AbsSegment x={123} y={214} w={24} h={17} fill="url(#mg-abs)" />

              {/* ─ Serratus anterior (side rib fingers) ─ */}
              <path d="M84,163 Q79,167 80,172 Q84,171 86,163 Z" fill="url(#mg-oblique)" opacity="0.8" />
              <path d="M82,174 Q77,178 78,184 Q82,183 84,174 Z" fill="url(#mg-oblique)" opacity="0.8" />
              <path d="M80,186 Q75,190 76,196 Q80,195 82,186 Z" fill="url(#mg-oblique)" opacity="0.7" />
              <path d="M156,163 Q161,167 160,172 Q156,171 154,163 Z" fill="url(#mg-oblique)" opacity="0.8" />
              <path d="M158,174 Q163,178 162,184 Q158,183 156,174 Z" fill="url(#mg-oblique)" opacity="0.8" />
              <path d="M160,186 Q165,190 164,196 Q160,195 158,186 Z" fill="url(#mg-oblique)" opacity="0.7" />

              {/* ─ Biceps ─ */}
              {/* Left bicep — anterior upper arm */}
              <path d="M44,132 Q36,148 32,168 Q28,188 32,206 Q38,220 48,224 Q58,224 64,216 Q70,204 68,182 Q64,158 54,140 Q48,130 44,132 Z"
                    fill="url(#mg-bicep)" />
              {/* Right bicep */}
              <path d="M196,132 Q204,148 208,168 Q212,188 208,206 Q202,220 192,224 Q182,224 176,216 Q170,204 172,182 Q176,158 186,140 Q192,130 196,132 Z"
                    fill="url(#mg-bicep)" />

              {/* ─ Forearms ─ */}
              {/* Left forearm */}
              <path d="M30,226 Q22,244 20,260 Q20,272 22,282 Q26,292 36,296 Q46,298 54,294 Q62,288 64,278 Q66,266 64,252 Q60,236 54,224 Q46,218 38,220 Q32,222 30,226 Z"
                    fill="url(#mg-forearm)" />
              {/* Right forearm */}
              <path d="M210,226 Q218,244 220,260 Q220,272 218,282 Q214,292 204,296 Q194,298 186,294 Q178,288 176,278 Q174,266 176,252 Q180,236 186,224 Q194,218 202,220 Q208,222 210,226 Z"
                    fill="url(#mg-forearm)" />

              {/* ─ Hip flexors / tensor fasciae latae ─ */}
              {/* Left */}
              <path d="M84,238 Q80,248 80,262 Q80,276 84,284 Q88,288 96,290 Q88,292 84,286 Q78,276 78,260 Q78,246 82,238 Z"
                    fill="url(#mg-oblique)" opacity="0.7" />
              {/* Right */}
              <path d="M156,238 Q160,248 160,262 Q160,276 156,284 Q152,288 144,290 Q152,292 156,286 Q162,276 162,260 Q162,246 158,238 Z"
                    fill="url(#mg-oblique)" opacity="0.7" />

              {/* ─ Quadriceps ─ */}
              {/* LEFT — vastus lateralis (outer) */}
              <path d="M80,294 Q76,312 76,334 Q76,358 78,376 Q80,388 87,393 Q96,396 96,390 Q90,378 90,362 Q88,342 90,322 Q92,308 96,296 Q88,292 80,294 Z"
                    fill="url(#mg-quad-outer)" />
              {/* LEFT — rectus femoris (central, most prominent) */}
              <path d="M96,294 Q92,308 90,328 Q88,350 90,372 Q93,386 100,392 Q107,396 110,390 Q114,380 114,360 Q114,338 112,318 Q108,302 104,294 Q100,292 96,294 Z"
                    fill="url(#mg-quad-center)" />
              {/* LEFT — vastus medialis (inner, teardrop near knee) */}
              <path d="M110,294 Q114,312 116,334 Q118,356 116,374 Q114,386 110,390 Q116,390 120,384 Q122,374 120,356 Q118,334 116,312 Q114,300 112,294 Z"
                    fill="url(#mg-quad-inner)" />

              {/* RIGHT — vastus lateralis */}
              <path d="M160,294 Q164,312 164,334 Q164,358 162,376 Q160,388 153,393 Q144,396 144,390 Q150,378 150,362 Q152,342 150,322 Q148,308 144,296 Q152,292 160,294 Z"
                    fill="url(#mg-quad-outer)" />
              {/* RIGHT — rectus femoris */}
              <path d="M144,294 Q148,308 150,328 Q152,350 150,372 Q147,386 140,392 Q133,396 130,390 Q126,380 126,360 Q126,338 128,318 Q132,302 136,294 Q140,292 144,294 Z"
                    fill="url(#mg-quad-center)" />
              {/* RIGHT — vastus medialis */}
              <path d="M130,294 Q126,312 124,334 Q122,356 124,374 Q126,386 130,390 Q124,390 120,384 Q118,374 120,356 Q122,334 124,312 Q126,300 128,294 Z"
                    fill="url(#mg-quad-inner)" />

              {/* ─ Adductors (inner thighs) ─ */}
              {/* Left adductor */}
              <path d="M116,296 Q118,314 118,336 Q118,358 116,374 Q114,386 112,392 Q118,390 122,382 Q126,370 124,350 Q122,328 120,310 Q118,298 116,296 Z"
                    fill="url(#mg-adductor)" />
              {/* Right adductor */}
              <path d="M124,296 Q122,314 122,336 Q122,358 124,374 Q126,386 128,392 Q122,390 118,382 Q114,370 116,350 Q118,328 120,310 Q122,298 124,296 Z"
                    fill="url(#mg-adductor)" />

              {/* ─ Tibialis anterior (shin) ─ */}
              {/* Left shin */}
              <path d="M84,412 Q80,432 80,454 Q80,470 82,484 Q86,494 92,496 Q98,494 100,484 Q102,468 100,450 Q98,430 96,414 Q90,408 84,412 Z"
                    fill="url(#mg-tibialis)" />
              {/* Right shin */}
              <path d="M156,412 Q160,432 160,454 Q160,470 158,484 Q154,494 148,496 Q142,494 140,484 Q138,468 140,450 Q142,430 144,414 Q150,408 156,412 Z"
                    fill="url(#mg-tibialis)" />

              {/* ─ Sternocleidomastoid (neck tendons) ─ */}
              <path d="M112,80 L108,90 L110,104 L114,104 L113,92 L116,80 Z" fill="url(#mg-neck-muscle)" opacity="0.7" />
              <path d="M128,80 L132,90 L130,104 L126,104 L127,92 L124,80 Z" fill="url(#mg-neck-muscle)" opacity="0.7" />
            </g>
          )}

          {/* ── Muscle separation lines (subtle white creases) ── */}
          {isFront && (
            <g stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" fill="none" pointerEvents="none">
              {/* Pec / deltoid groove (left) */}
              <path d="M88,108 Q80,116 78,130" />
              {/* Pec / deltoid groove (right) */}
              <path d="M152,108 Q160,116 162,130" />
              {/* Sternum (between pecs) */}
              <line x1="120" y1="106" x2="120" y2="162" />
              {/* Pec lower border */}
              <path d="M88,160 Q106,166 120,162 Q134,166 152,160" />
              {/* Bicep peak crease */}
              <path d="M34,174 Q44,162 52,162" />
              <path d="M206,174 Q196,162 188,162" />
              {/* Deltoid / bicep groove */}
              <path d="M52,136 Q46,148 40,158" />
              <path d="M188,136 Q194,148 200,158" />
              {/* Forearm extensor / flexor split */}
              <path d="M36,230 Q44,228 52,232" />
              <path d="M204,230 Q196,228 188,232" />
              {/* Linea alba (centre abs) */}
              <line x1="120" y1="162" x2="120" y2="236" />
              {/* Horizontal tendinous intersections of abs */}
              <path d="M93,188 Q106,190 117,188" />
              <path d="M123,188 Q134,190 147,188" />
              <path d="M93,210 Q106,212 117,210" />
              <path d="M123,210 Q134,212 147,210" />
              {/* Oblique / abs border */}
              <line x1="92" y1="168" x2="92"  y2="236" />
              <line x1="148" y1="168" x2="148" y2="236" />
              {/* Quad separation lines */}
              <path d="M80,300 Q86,340 88,370" />
              <path d="M96,296 Q92,340 92,374" />
              <path d="M110,296 Q114,340 114,372" />
              <path d="M160,300 Q154,340 152,370" />
              <path d="M144,296 Q148,340 148,374" />
              <path d="M130,296 Q126,340 126,372" />
              {/* Knee definition crease */}
              <path d="M86,390 Q98,396 110,390" />
              <path d="M130,390 Q142,396 154,390" />
            </g>
          )}

          {/* ── Anatomical detail lines ── */}
          {isFront && (
            <g pointerEvents="none">
              {/* Clavicles */}
              <path d="M120,104 Q102,108 84,116" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              <path d="M120,104 Q138,108 156,116" stroke="rgba(255,255,255,0.25)" strokeWidth="1.2" fill="none" strokeLinecap="round" />
              {/* Ribcage visible below pecs (serratus / lower rib hints) */}
              <path d="M90,164 Q84,168 82,174"   stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" fill="none" />
              <path d="M88,174 Q82,178 80,184"   stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" fill="none" />
              <path d="M150,164 Q156,168 158,174" stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" fill="none" />
              <path d="M152,174 Q158,178 160,184" stroke="rgba(255,255,255,0.12)" strokeWidth="0.7" fill="none" />
              {/* Navel */}
              <ellipse cx={120} cy={199} rx={2.5} ry={3} fill="#9a6a3a" stroke="rgba(0,0,0,0.3)" strokeWidth="0.5" />
              {/* Hip crest line */}
              <path d="M86,238 Q104,244 120,244 Q136,244 154,238" stroke="rgba(255,255,255,0.14)" strokeWidth="0.8" fill="none" />
              {/* Kneecap patella (left) */}
              <path d="M90,382 Q90,375 98,373 Q106,375 106,382 Q106,390 98,392 Q90,390 90,382 Z"
                    fill="rgba(200,150,100,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
              {/* Kneecap patella (right) */}
              <path d="M134,382 Q134,375 142,373 Q150,375 150,382 Q150,390 142,392 Q134,390 134,382 Z"
                    fill="rgba(200,150,100,0.5)" stroke="rgba(255,255,255,0.2)" strokeWidth="0.6" />
            </g>
          )}

          {/* ── Face features ── */}
          <g pointerEvents="none">
            {isFront && (
              <>
                {/* Eyebrows */}
                <path d="M105,32 Q110,29 115,31" stroke="#7a4a20" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                <path d="M125,31 Q130,29 135,32" stroke="#7a4a20" strokeWidth="1.4" fill="none" strokeLinecap="round" />
                {/* Eyes — whites */}
                <ellipse cx={110} cy={38} rx={4.5} ry={3.2} fill="#f0e8d8" />
                <ellipse cx={130} cy={38} rx={4.5} ry={3.2} fill="#f0e8d8" />
                {/* Irises */}
                <ellipse cx={110} cy={38} rx={2.8} ry={2.8} fill="#5a3a1a" />
                <ellipse cx={130} cy={38} rx={2.8} ry={2.8} fill="#5a3a1a" />
                {/* Pupils */}
                <ellipse cx={110} cy={38} rx={1.4} ry={1.4} fill="#1a0a04" />
                <ellipse cx={130} cy={38} rx={1.4} ry={1.4} fill="#1a0a04" />
                {/* Catchlights */}
                <ellipse cx={108.5} cy={36.8} rx={0.7} ry={0.7} fill="rgba(255,255,255,0.75)" />
                <ellipse cx={128.5} cy={36.8} rx={0.7} ry={0.7} fill="rgba(255,255,255,0.75)" />
                {/* Nose */}
                <path d="M118,46 L117,53 Q116,55 115,55 Q118,57 120,56 Q122,57 125,55 Q124,55 123,53 L122,46"
                      stroke="#9a6030" strokeWidth="0.8" fill="none" strokeLinecap="round" />
                {/* Mouth */}
                <path d="M114,60 Q120,64 126,60" stroke="#a05040" strokeWidth="1.3" fill="none" strokeLinecap="round" />
                {/* Subtle chin line */}
                <path d="M112,70 Q120,76 128,70" stroke="rgba(160,100,50,0.3)" strokeWidth="0.6" fill="none" />
              </>
            )}
            {!isFront && (
              /* Back-of-head — hair line suggestion */
              <path d="M94,16 Q120,8 146,16" stroke="rgba(120,80,40,0.4)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            )}
          </g>

          {/* ── Back-view anatomy overlay ── */}
          {!isFront && (
            <g pointerEvents="none" aria-hidden="true">
              {/* Trapezius muscle */}
              <path d="M110,104 Q94,112 80,124 Q72,136 74,152 Q80,160 96,158 Q110,152 120,138 Q130,152 144,158 Q160,160 166,152 Q168,136 160,124 Q146,112 130,104 Z"
                    fill="url(#mg-trap)" opacity="0.85" />
              {/* Spine (dashed) */}
              <line x1="120" y1="104" x2="120" y2="288" stroke="rgba(255,255,255,0.22)" strokeWidth="1" strokeDasharray="4,3" />
              {/* Cervical vertebrae dots */}
              <circle cx={120} cy={110} r={1.8} fill="rgba(255,255,255,0.35)" />
              <circle cx={120} cy={118} r={1.8} fill="rgba(255,255,255,0.35)" />
              <circle cx={120} cy={126} r={1.8} fill="rgba(255,255,255,0.35)" />
              {/* Left scapula (shoulder blade) */}
              <path d="M88,128 Q74,138 72,158 Q74,174 88,176 Q100,174 104,158 Q102,140 88,128 Z"
                    fill="url(#mg-deltoid)" opacity="0.5" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
              {/* Right scapula */}
              <path d="M152,128 Q166,138 168,158 Q166,174 152,176 Q140,174 136,158 Q138,140 152,128 Z"
                    fill="url(#mg-deltoid)" opacity="0.5" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
              {/* Posterior rib lines */}
              <path d="M90,138 Q80,144 76,150" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" fill="none" />
              <path d="M88,150 Q78,156 74,162" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" fill="none" />
              <path d="M150,138 Q160,144 164,150" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" fill="none" />
              <path d="M152,150 Q162,156 166,162" stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" fill="none" />
              {/* Lumbar detail lines */}
              <path d="M108,238 Q120,242 132,238" stroke="rgba(255,255,255,0.15)" strokeWidth="0.7" fill="none" />
              <path d="M108,250 Q120,254 132,250" stroke="rgba(255,255,255,0.15)" strokeWidth="0.7" fill="none" />
              {/* Gluteal crease */}
              <path d="M96,290 Q108,302 120,304 Q132,302 144,290" stroke="rgba(255,255,255,0.18)" strokeWidth="0.8" fill="none" />

              {/* "Coming soon" overlay */}
              <rect x={0} y={0} width={240} height={548} fill="rgba(10,14,23,0.54)" />
              <line x1={66} y1={256} x2={174} y2={256} stroke="#1e2d4a" strokeWidth="0.8" />
              <line x1={66} y1={284} x2={174} y2={284} stroke="#1e2d4a" strokeWidth="0.8" />
              <text x={120} y={265} textAnchor="middle" fontSize="10" fontFamily="DM Sans,system-ui,sans-serif" fontWeight="700" letterSpacing="0.14em" fill="#4a6080">BACK VIEW</text>
              <text x={120} y={280} textAnchor="middle" fontSize="8"  fontFamily="DM Sans,system-ui,sans-serif" fill="#2a3d6b" letterSpacing="0.06em">Coming soon</text>
            </g>
          )}
        </g>{/* end anatomy group */}

        {/* ═══════════════════════════════════════════════════════════
            INTERACTIVE ZONE OVERLAYS — sit on top of anatomy
            Transparent fills so muscles show through
            ═══════════════════════════════════════════════════════════ */}
        {isFront && (
          <g role="list" aria-label="Body zones">
            {ZONES.map((zone) => {
              const isHovered = hoveredZone?.id === zone.id
              const isActive  = activeZone === zone.id
              const fill        = isActive ? 'url(#active-zone-fill)' : isHovered ? HOVER_FILL : IDLE_FILL
              const stroke      = isActive ? ACTIVE_STROKE : isHovered ? HOVER_STROKE : IDLE_STROKE
              const strokeWidth = isActive ? 1.4 : isHovered ? 1.1 : 0.7
              const filter      = isActive ? 'url(#zone-glow-active)' : isHovered ? 'url(#zone-glow)' : undefined
              return (
                <g key={zone.id} role="listitem" aria-label={`${zone.label} — ${zone.count} injuries`}
                   style={{ cursor: 'pointer' }}
                   onClick={() => handleClick(zone)}
                   onMouseEnter={(e) => handleMouseEnter(zone, e)}
                   onMouseMove={(e)  => handleMouseMove(zone, e)}
                   onMouseLeave={handleMouseLeave}>
                  <ZoneShape zone={zone} fill={fill} stroke={stroke} strokeWidth={strokeWidth} filter={filter}
                             style={{ transition: 'fill 0.18s ease, stroke 0.18s ease' }} />
                  {/* Enlarged transparent hit area */}
                  <ZoneShape zone={zone} fill="transparent" stroke="none" strokeWidth={0} style={{ cursor: 'pointer' }} />
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
                        style={{ transition: 'stroke 0.2s ease' }} />
                  <text x={zone.lx} y={zone.ly + 4} textAnchor={zone.la}
                        fontSize="6.2" fontFamily="DM Sans,system-ui,sans-serif" fontWeight="600" letterSpacing="0.06em"
                        fill={lit ? '#38bdf8' : 'rgba(74,96,128,0.85)'}
                        style={{ transition: 'fill 0.2s ease' }}>
                    {zone.label.toUpperCase()}
                  </text>
                  {lit && <circle cx={zone.lline[0][0]} cy={zone.lline[0][1]} r="2" fill="#38bdf8" />}
                </g>
              )
            })}
          </g>
        )}

        {/* ── Hover tooltip ── */}
        {isFront && hoveredZone && tooltipPt && (
          <Tooltip zone={hoveredZone} svgPoint={{ x: tooltipPt.x, y: tooltipPt.y - 18 }} />
        )}
      </svg>

      {/* ── Legend strip below SVG ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', marginTop: '10px', padding: '0 8px' }}>
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
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: 'rgba(56,189,248,0.55)', boxShadow: '0 0 6px rgba(56,189,248,0.4)' }} />
              <span style={{ fontSize: '10px', color: '#4a6080', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {activeZone ? ZONES.find(z => z.id === activeZone)?.label ?? 'Selected' : 'None selected'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
