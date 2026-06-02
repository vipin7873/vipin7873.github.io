# AI Music Performance Assessor

AI-powered vocal performance analysis. Upload a singing recording and receive instant scores and feedback.

## Quick Start

```bash
cd music-assessor
docker compose up --build
```

Open **http://localhost:3000**

## What It Analyzes

| Metric | Method | Weight |
|--------|--------|--------|
| Pitch Score | pYIN pitch estimation via librosa, voiced ratio + stability | 40% |
| Tempo Score | Beat tracking, inter-beat interval variance | 30% |
| Consistency Score | RMS amplitude CV + onset rhythm CV | 30% |

Overall = Pitch×0.4 + Tempo×0.3 + Consistency×0.3

## Supported Formats

MP3 · WAV · OGG · FLAC · M4A · AAC · WEBM (max 50 MB)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/health` | Health check |
| POST | `/api/upload` | Upload & analyze audio |
| GET | `/api/result/{id}` | Fetch assessment result |
| GET | `/api/assessments` | List recent assessments |

## Stack

- **Backend**: FastAPI + Python 3.12 + librosa + SQLite
- **Frontend**: React 18 + Vite + react-dropzone
- **Deployment**: Docker Compose
