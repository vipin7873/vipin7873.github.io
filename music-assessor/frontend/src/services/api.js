import axios from 'axios'

const api = axios.create({
  baseURL: '/api',
  timeout: 120000,
})

export async function uploadAudio(file, onProgress) {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post('/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: (e) => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total))
      }
    },
  })
  return response.data
}

export async function getResult(id) {
  const response = await api.get(`/result/${id}`)
  return response.data
}

export async function getHistory() {
  const response = await api.get('/assessments')
  return response.data
}
