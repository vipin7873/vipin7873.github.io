import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getHistory } from '../services/api'

function scoreColor(score) {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

export default function HistoryPage() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getHistory()
      .then(setItems)
      .finally(() => setLoading(false))
  }, [])

  const formatDate = (iso) => new Date(iso).toLocaleString()

  return (
    <div style={{ maxWidth: '720px', margin: '40px auto', padding: '0 24px' }}>
      <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '8px' }}>Assessment History</h1>
      <p style={{ color: 'var(--text-muted)', marginBottom: '32px' }}>Your recent vocal performance analyses</p>

      {loading && (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '40px' }}>Loading...</p>
      )}

      {!loading && items.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', background: 'var(--surface)', borderRadius: 'var(--radius)' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎤</div>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>No assessments yet</p>
          <Link to="/" style={{
            padding: '10px 22px',
            background: 'var(--primary)',
            borderRadius: '8px',
            color: '#fff',
            fontWeight: 500,
          }}>
            Upload Your First Recording
          </Link>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {items.map((item) => {
          const color = scoreColor(item.overall_score)
          return (
            <Link key={item.id} to={`/result/${item.id}`} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '16px 20px',
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              transition: 'border-color 0.2s',
            }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--primary)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
            >
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{
                  width: '42px', height: '42px',
                  borderRadius: '50%',
                  background: `${color}22`,
                  border: `2px solid ${color}66`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontWeight: 700, color, fontSize: '0.95rem',
                }}>
                  {item.overall_score.toFixed(0)}
                </div>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.95rem', marginBottom: '2px' }}>
                    {item.filename}
                  </p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {formatDate(item.created_at)}
                  </p>
                </div>
              </div>
              <span style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>→</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
