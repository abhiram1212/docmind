import { useState } from 'react'
import UploadSection from './UploadSection'
import ChatSection from './ChatSection'

function App() {
  const [sessionId, setSessionId] = useState(null)

  if (sessionId) {
    return <ChatSection sessionId={sessionId} onNewPDF={setSessionId} />
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-center mb-8">DocMind</h1>
      <p className="text-center text-gray-500 text-sm -mt-6 mb-8">Upload a PDF to start chatting</p>
      <UploadSection onUploadSuccess={setSessionId} />
    </div>
  )
}

export default App