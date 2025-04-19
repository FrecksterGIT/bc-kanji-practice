import { Routes, Route, Navigate } from 'react-router-dom'
import Navigation from './components/Navigation'
import Kanji from './components/Kanji'
import Vocabulary from './components/Vocabulary'
import Settings from './components/Settings'

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <Navigation />
      <div className="flex-grow container mx-auto">
        <Routes>
          <Route path="/" element={<Navigate to="/kanji" replace />} />
          <Route path="/kanji" element={<Kanji />} />
          <Route path="/vocabulary" element={<Vocabulary />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </div>
    </div>
  )
}

export default App
