import { Link, useLocation } from 'react-router-dom'

export default function NavBar() {
  const { pathname } = useLocation()

  const linkStyle = (path) => ({
    padding: '6px 14px',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: 500,
    color: pathname === path ? '#fff' : 'var(--text-muted)',
    background: pathname === path ? 'var(--primary)' : 'transparent',
    transition: 'all 0.2s',
  })

  return (
    <nav style={{
      background: 'var(--surface)',
      borderBottom: '1px solid var(--border)',
      padding: '0 24px',
      height: '60px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span style={{ fontSize: '1.4rem' }}>🎤</span>
        <span style={{ fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
          AI Music Assessor
        </span>
      </Link>
      <div style={{ display: 'flex', gap: '8px' }}>
        <Link to="/" style={linkStyle('/')}>Upload</Link>
        <Link to="/history" style={linkStyle('/history')}>History</Link>
      </div>
    </nav>
  )
}
