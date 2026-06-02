import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { getResult } from '../services/api'
import ScoreCard from '../components/ScoreCard'
import OverallScore from '../components/OverallScore'

export default function ResultPage() {
  const { id } = useParams()
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getResult(id)
      .then(setResult)
      .catch(() => setError('Could not load results. The assessment may not exist.'))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>⏳</div>
        <p style={{ color: 'var(--text-muted)' }}>Loading results...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '80px 24px' }}>
        <div style={{ fontSize: '2rem', marginBottom: '16px' }}>❌</div>
        <p style={{ color: '#ef4444', marginBottom: '16px' }}>{error}</p>
        <Link to="/" style={{
          padding: '10px 20px',
          background: 'var(--primary)',
          borderRadius: '8px',
          color: '#fff',
          fontWeight: 500,
        }}>
          Try Again
        </Link>
      </div>
    )
  }

  const formatDuration = (s) => {
    const m = Math.floor(s / 60)
    const sec = Math.round(s % 60)
    return m > 0 ? `${m}m ${sec}s` : `${sec}s`
  }

  return (
    <div style={{ maxWidth: '860px', margin: '40px auto', padding: '0 24px' }}>
      <div style={{ marginBottom: '32px' }}>
        <Link to="/" style={{
          display: 'inline-flex', alignItems: 'center', gap: '6px',
          color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px',
        }}>
          ← New Analysis
        </Link>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 700, marginBottom: '6px' }}>
          Performance Results
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {result.filename}
          {result.duration && ` · ${formatDuration(result.duration)}`}
          {result.tempo_bpm > 0 && ` · ${result.tempo_bpm.toFixed(0)} BPM`}
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: '24px', marginBottom: '24px', alignItems: 'start' }}>
        <OverallScore score={result.overall_score} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
          <ScoreCard label="Pitch" score={result.pitch_score} icon="🎵" />
          <ScoreCard label="Tempo" score={result.tempo_score} icon="🥁" />
          <ScoreCard label="Consistency" score={result.consistency_score} icon="📊" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
        {result.strengths.length > 0 && (
          <div style={{
            background: '#22c55e0c',
            border: '1px solid #22c55e33',
            borderRadius: 'var(--radius)',
            padding: '20px',
          }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              ✓ Strengths
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {result.strengths.map((s, i) => (
                <li key={i} style={{ fontSize: '0.9rem', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#22c55e', marginTop: '2px' }}>•</span>
                  {s}
                </li>
              ))}
            </ul>
          </div>
        )}

        {result.weaknesses.length > 0 && (
          <div style={{
            background: '#f59e0b0c',
            border: '1px solid #f59e0b33',
            borderRadius: 'var(--radius)',
            padding: '20px',
          }}>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
              ↗ Areas for Improvement
            </h3>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {result.weaknesses.map((w, i) => (
                <li key={i} style={{ fontSize: '0.9rem', display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                  <span style={{ color: '#f59e0b', marginTop: '2px' }}>•</span>
                  {w}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
        padding: '24px',
        marginBottom: '32px',
      }}>
        <h3 style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '12px' }}>
          AI Feedback Summary
        </h3>
        <p style={{ lineHeight: 1.7, fontSize: '0.95rem' }}>{result.feedback}</p>
      </div>

      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
        <Link to="/" style={{
          padding: '12px 28px',
          background: 'linear-gradient(135deg, var(--primary), var(--primary-light))',
          borderRadius: '10px',
          color: '#fff',
          fontWeight: 600,
          fontSize: '0.95rem',
        }}>
          Analyze Another Recording
        </Link>
        <Link to="/history" style={{
          padding: '12px 28px',
          background: 'var(--surface2)',
          border: '1px solid var(--border)',
          borderRadius: '10px',
          color: 'var(--text)',
          fontWeight: 500,
          fontSize: '0.95rem',
        }}>
          View History
        </Link>
      </div>
    </div>
  )
}
