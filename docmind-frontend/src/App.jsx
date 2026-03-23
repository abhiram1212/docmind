import { useState } from 'react'
import UploadSection from './UploadSection'
import ChatSection from './ChatSection'
import Logo from './Logo'

const fadeStyles = `
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(24px); }
    to { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  .fade-up { animation: fadeUp 0.6s ease forwards; opacity: 0; }
  .fade-in { animation: fadeIn 0.8s ease forwards; opacity: 0; }
  .delay-1 { animation-delay: 0.1s; }
  .delay-2 { animation-delay: 0.2s; }
  .delay-3 { animation-delay: 0.3s; }
  .delay-4 { animation-delay: 0.4s; }
  .delay-5 { animation-delay: 0.5s; }
  .feature-card { transition: transform 0.2s ease, box-shadow 0.2s ease; }
  .feature-card:hover { transform: translateY(-4px); box-shadow: 0 12px 32px rgba(0,0,0,0.08); }
  .cta-btn { transition: transform 0.15s ease, box-shadow 0.15s ease; }
  .cta-btn:hover { transform: translateY(-1px); box-shadow: 0 4px 16px rgba(0,0,0,0.15); }
`

function App() {
  const [sessionId, setSessionId] = useState(null)

  if (sessionId) {
    return <ChatSection sessionId={sessionId} onNewPDF={setSessionId} />
  }

  const features = [
    { title: "Fast AI Answers", desc: "Get instant streaming answers from your documents powered by AI.", color: "bg-amber-50", accent: "text-amber-600" },
    { title: "Secure Processing", desc: "Your documents are processed safely and never shared with third parties.", color: "bg-indigo-50", accent: "text-indigo-600" },
    { title: "Multi-PDF Support", desc: "Switch between documents mid-conversation without losing context.", color: "bg-emerald-50", accent: "text-emerald-600" }
  ]

  const steps = [
    { step: "01", title: "Upload your PDF", desc: "Select any PDF document from your computer.", color: "bg-indigo-500" },
    { step: "02", title: "Ask anything", desc: "Type your question in plain English.", color: "bg-indigo-400" },
    { step: "03", title: "Get answers", desc: "DocMind finds the exact answer instantly.", color: "bg-indigo-300" }
  ]

  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'Georgia, serif' }}>
      <style>{fadeStyles}</style>

      <nav className="fade-in flex items-center justify-between px-8 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Logo size={32} />
          <span className="text-lg font-semibold tracking-tight text-gray-900">DocMind</span>
        </div>
        <a href="#upload" className="text-sm text-gray-500 hover:text-gray-900 transition-colors font-sans">
          Get Started
        </a>
      </nav>

      <section className="max-w-3xl mx-auto text-center px-8 pt-24 pb-20">
        <p className="fade-up delay-1 text-xs uppercase tracking-widest text-indigo-500 mb-5 font-sans">
          AI-Powered PDF Chat
        </p>
        <h1 className="fade-up delay-2 text-6xl font-bold text-gray-900 leading-tight mb-6">
          Your documents,<br />
          <span className="text-indigo-500">now conversational</span>
        </h1>
        <p className="fade-up delay-3 text-lg text-gray-500 mb-10 max-w-lg mx-auto font-sans leading-relaxed">
          Upload any PDF and start asking questions. DocMind finds the answers instantly using AI.
        </p>
        <div className="fade-up delay-4">
          <a href="#upload" className="cta-btn inline-block bg-gray-900 text-white px-10 py-3.5 rounded-xl text-sm font-medium font-sans">
            Upload your PDF
          </a>
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-8 py-20 border-t border-gray-100">
        <p className="fade-up text-xs uppercase tracking-widest text-gray-400 text-center mb-14 font-sans">
          Features
        </p>
        <div className="grid grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className={`feature-card fade-up delay-${i + 2} ${f.color} rounded-2xl p-8`}>
              <h3 className={`text-sm font-semibold mb-2 font-sans ${f.accent}`}>{f.title}</h3>
              <p className="text-sm text-gray-600 leading-relaxed font-sans">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-8 py-20 border-t border-gray-100">
        <p className="fade-up text-xs uppercase tracking-widest text-gray-400 text-center mb-14 font-sans">
          How it works
        </p>
        <div className="grid grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <div key={i} className={`fade-up delay-${i + 2} text-center`}>
              <div className={`w-12 h-12 ${s.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                <span className="text-white text-sm font-bold font-sans">{s.step}</span>
              </div>
              <h3 className="text-sm font-semibold text-gray-900 mb-2 font-sans">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed font-sans">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="upload" className="max-w-5xl mx-auto px-8 py-20 border-t border-gray-100">
        <p className="fade-up text-xs uppercase tracking-widest text-gray-400 text-center mb-10 font-sans">
          Get started
        </p>
        <UploadSection onUploadSuccess={setSessionId} />
      </section>

      <footer className="border-t border-gray-100 px-8 py-8 text-center">
        <p className="text-xs text-gray-400 font-sans">
          DocMind. Built by Abhiram Mullapudi.
        </p>
      </footer>

    </div>
  )
}

export default App