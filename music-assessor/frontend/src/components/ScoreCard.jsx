function scoreColor(score) {
  if (score >= 80) return '#22c55e'
  if (score >= 60) return '#f59e0b'
  return '#ef4444'
}

function scoreLabel(score) {
  if (score >= 85) return 'Excellent'
  if (score >= 70) return 'Good'
  if (score >= 55) return 'Fair'
  return 'Needs Work'
}

export default function ScoreCard({ label, score, icon }) {
  const color = scoreColor(score)
  const pct = Math.min(100, Math.max(0, score))

  return (
    <div style={{
      background: 'var(--surface2)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--radius)',
      padding: '24px',
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {icon} {label}
        </span>
        <span style={{ fontSize: '0.8rem', color, fontWeight: 600 }}>{scoreLabel(score)}</span>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px' }}>
        <span style={{ fontSize: '2.8rem', fontWeight: 700, color, lineHeight: 1 }}>
          {score.toFixed(0)}
        </span>
        <span style={{ fontSize: '1rem', color: 'var(--text-muted)', marginBottom: '4px' }}>/100</span>
      </div>

      <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
        <div style={{
          width: `${pct}%`,
          height: '100%',
          background: color,
          borderRadius: '99px',
          transition: 'width 1s ease',
        }} />
      </div>
    </div>
  )
}
