import { Activity } from 'lucide-react'

export default function Header() {
  return (
    <header
      style={{
        background: 'linear-gradient(180deg, #0a0e17 0%, rgba(10,14,23,0.96) 100%)',
        borderBottom: '1px solid #1e2d4a',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          padding: '0 24px',
          height: '64px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        {/* Logo + title */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Glowing icon */}
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, rgba(56,189,248,0.2), rgba(129,140,248,0.2))',
              border: '1px solid rgba(56,189,248,0.35)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 0 16px rgba(56,189,248,0.18)',
            }}
          >
            <Activity size={18} color="#38bdf8" strokeWidth={2.2} />
          </div>

          <div>
            <h1
              className="font-heading"
              style={{
                fontSize: '20px',
                fontWeight: 700,
                letterSpacing: '-0.3px',
                lineHeight: 1,
                background: 'linear-gradient(90deg, #e2e8f0 30%, #38bdf8 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              BodyWise
            </h1>
            <p
              style={{
                fontSize: '10px',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#4a6080',
                marginTop: '1px',
              }}
            >
              Anatomy &amp; Injury Explorer
            </p>
          </div>
        </div>

        {/* Right: gradient accent bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              fontSize: '11px',
              color: '#4a6080',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            Educational Tool
          </span>
          <div
            className="gradient-animated"
            style={{
              width: '40px',
              height: '3px',
              borderRadius: '2px',
            }}
          />
        </div>
      </div>
    </header>
  )
}
