import { ShieldAlert } from 'lucide-react'

export default function Footer() {
  return (
    <footer
      style={{
        borderTop: '1px solid #1e2d4a',
        background: '#0d1320',
        padding: '20px 24px',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1440px',
          margin: '0 auto',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '10px',
        }}
      >
        <ShieldAlert
          size={16}
          color="#fbbf24"
          style={{ flexShrink: 0, marginTop: '2px' }}
        />
        <p
          style={{
            fontSize: '12px',
            color: '#4a6080',
            lineHeight: 1.65,
          }}
        >
          <span style={{ color: '#94a3b8', fontWeight: 600 }}>
            Medical Disclaimer:&nbsp;
          </span>
          BodyWise is an educational tool only. It does not provide medical
          advice, diagnosis, or treatment. Information presented here is for
          general educational purposes and should not substitute consultation
          with a qualified healthcare professional.{' '}
          <strong style={{ color: '#94a3b8' }}>
            Always consult a licensed physician or healthcare provider for any
            medical concerns.
          </strong>{' '}
          In an emergency, call your local emergency services immediately.
        </p>
      </div>
    </footer>
  )
}
