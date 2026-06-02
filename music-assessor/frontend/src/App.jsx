import { Routes, Route } from 'react-router-dom'
import UploadPage from './pages/UploadPage'
import ResultPage from './pages/ResultPage'
import HistoryPage from './pages/HistoryPage'
import NavBar from './components/NavBar'

export default function App() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <NavBar />
      <main style={{ flex: 1 }}>
        <Routes>
          <Route path="/" element={<UploadPage />} />
          <Route path="/result/:id" element={<ResultPage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>
    </div>
  )
}
