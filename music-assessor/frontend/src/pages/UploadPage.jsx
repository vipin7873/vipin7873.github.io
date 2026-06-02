import { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { useNavigate } from 'react-router-dom'
import { uploadAudio } from '../services/api'

const ACCEPTED = {
  'audio/mpeg': ['.mp3'],
  'audio/wav': ['.wav'],
  'audio/ogg': ['.ogg'],
  'audio/flac': ['.flac'],
  'audio/mp4': ['.m4a'],
  'audio/aac': ['.aac'],
  'audio/webm': ['.webm'],
}

export default function UploadPage() {
  const navigate = useNavigate()
  const [file, setFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [stage, setStage] = useState('')
  const [error, setError] = useState('')

  const onDrop = useCallback((accepted, rejected) => {
    setError('')
    if (rejected.length > 0) {
      setError('Unsupported file type. Please upload MP3, WAV, OGG, FLAC, M4A, or AAC.')
      return
    }
    if (accepted.length > 0) {
      setFile(accepted[0])
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED,
    maxSize: 50 * 1024 * 1024,
    multiple: false,
  })

  async function handleSubmit() {
    if (!file) return
    setUploading(true)
    setProgress(0)
    setError('')

    try {
      setStage('Uploading audio...')
      const data = await uploadAudio(file, (pct) => {
        setProgress(pct)
        if (pct === 100) setStage('Analyzing performance...')
      })
      navigate(`/result/${data.id}`)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Upload failed. Please try again.'
      setError(msg)
      setUploading(false)
      setStage('')
    }
  }

  const formatSize = (bytes) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(1)} MB`
  }

  return (
    <div style={{ maxWidth: '640px', margin: '60px auto', padding: '0 24px' }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>🎤</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '8px' }}>
          Assess Your Vocal Performance
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1rem' }}>
          Upload a recording and get instant AI-powered feedback on your singing
        </p>
      </div>

      <div
        {...getRootProps()}
        style={{
          border: `2px dashed ${isDragActive ? 'var(--primary-light)' : file ? '#22c55e' : 'var(--border)'}`,
          borderRadius: 'var(--radius)',
          padding: '48px 24px',
          textAlign: 'center',
          cursor: 'pointer',
          background: isDragActive ? '#7c3aed11' : file ? '#22c55e08' : 'var(--surface)',
          transition: 'all 0.2s',
          outline: 'none',
        }}
      >
        <input {...getInputProps()} />
        {file ? (
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '12px' }}>🎵</div>
            <p style={{ fontWeight: 600, marginBottom: '4px' }}>{file.name}</p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>{formatSize(file.size)}</p>
            <p style={{ color: '#22c55e', fontSize: '0.85rem', marginTop: '8px' }}>
              ✓ Ready to analyze
            </p>
          </div>
        ) : (
          <div>
            <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>
              {isDragActive ? '📥' : '📁'}
            </div>
            <p style={{ fontWeight: 600, marginBottom: '8px', fontSize: '1.05rem' }}>
              {isDragActive ? 'Drop it here!' : 'Drag & drop your audio file'}
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px' }}>
              or click to browse
            </p>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
              Supports MP3, WAV, OGG, FLAC, M4A, AAC · Max 50 MB
            </p>
          </div>
        )}
      </div>

      {error && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: '#ef444418',
          border: '1px solid #ef444444',
          borderRadius: '8px',
          color: '#ef4444',
          fontSize: '0.9rem',
        }}>
          {error}
        </div>
      )}

      {uploading && (
        <div style={{ marginTop: '24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>{stage}</span>
            <span style={{ color: 'var(--primary-light)' }}>{progress}%</span>
          </div>
          <div style={{ height: '6px', background: 'var(--border)', borderRadius: '99px', overflow: 'hidden' }}>
            <div style={{
              width: `${progress}%`,
              height: '100%',
              background: 'linear-gradient(90deg, var(--primary), var(--primary-light))',
              borderRadius: '99px',
              transition: 'width 0.3s ease',
            }} />
          </div>
          {progress === 100 && (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '12px' }}>
              AI analysis in progress — this may take 15–60 seconds...
            </p>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
        {file && !uploading && (
          <button
            onClick={() => { setFile(null); setError('') }}
            style={{
              flex: 1,
              padding: '14px',
              background: 'var(--surface2)',
              border: '1px solid var(--border)',
              borderRadius: '10px',
              color: 'var(--text-muted)',
              fontWeight: 500,
              fontSize: '0.95rem',
            }}
          >
            Clear
          </button>
        )}
        <button
          onClick={handleSubmit}
          disabled={!file || uploading}
          style={{
            flex: 2,
            padding: '14px',
            background: file && !uploading
              ? 'linear-gradient(135deg, var(--primary), var(--primary-light))'
              : 'var(--surface2)',
            border: 'none',
            borderRadius: '10px',
            color: file && !uploading ? '#fff' : 'var(--text-muted)',
            fontWeight: 600,
            fontSize: '1rem',
            transition: 'all 0.2s',
            cursor: file && !uploading ? 'pointer' : 'not-allowed',
          }}
        >
          {uploading ? 'Analyzing...' : 'Analyze Performance'}
        </button>
      </div>

      <div style={{
        marginTop: '48px',
        padding: '20px',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius)',
      }}>
        <h3 style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '12px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          What gets analyzed
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          {[
            { icon: '🎵', label: 'Pitch Accuracy', desc: 'Stability & precision' },
            { icon: '🥁', label: 'Tempo', desc: 'Beat consistency' },
            { icon: '📊', label: 'Consistency', desc: 'Amplitude & rhythm' },
            { icon: '⭐', label: 'Overall Score', desc: 'Weighted average' },
          ].map(({ icon, label, desc }) => (
            <div key={label} style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.2rem' }}>{icon}</span>
              <div>
                <p style={{ fontWeight: 600, fontSize: '0.9rem' }}>{label}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
