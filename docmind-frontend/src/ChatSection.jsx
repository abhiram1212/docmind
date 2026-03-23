import { useState, useRef, useEffect } from 'react'

function ChatSection({ sessionId, onNewPDF }) {
    const [messages, setMessages] = useState([])
    const [input, setInput] = useState("")
    const [loading, setLoading] = useState(false)
    const [pendingFile, setPendingFile] = useState(null)
    const [uploading, setUploading] = useState(false)
    const messagesEndRef = useRef(null)
    const messagesContainerRef = useRef(null)
    const [error, setError] = useState(null)
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

async function handelAsk(){
    if (!input.trim()) return
    
    try {
        setMessages(prev => [...prev, { role: "user", content: input }])
        setLoading(true)
        const currentInput = input
        setInput("")

        let activeSessionId = sessionId

        if (pendingFile) {
            setUploading(true)
            const formData = new FormData()
            formData.append("file", pendingFile)

            const uploadResponse = await fetch("http://23.23.6.53:8000/upload", {
                method: "POST",
                body: formData
            })

            const uploadData = await uploadResponse.json()

            if (!uploadResponse.ok) {
                throw new Error(uploadData.detail)
            }

            activeSessionId = uploadData.session_id
            onNewPDF(uploadData.session_id)
            setPendingFile(null)
            setUploading(false)
        }

        const response = await fetch("http://23.23.6.53:8000/ask", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ session_id: activeSessionId, question: currentInput })
        })
        setMessages(prev => [...prev, { role: "assistant", content: "" }])
        setLoading(false)
        const reader = response.body.getReader()
        const decoder = new TextDecoder()

        let buffer = ""

        while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const decoded = decoder.decode(value, { stream: true })
            buffer += decoded
            const lines = buffer.split("\n")
            buffer = lines.pop()

            for (const line of lines) {
                if (line.startsWith("data: ")) {
                    const data = line.slice(6).trim()
                    if (data === "[DONE]") break
                    try {
                        const parsed = JSON.parse(data)
                        setMessages(prev => {
                            const updated = [...prev]
                            updated[updated.length - 1].content += parsed.text
                            return updated
                        })
                    } catch {
                        // skip malformed chunks
                    }
                }
            }
        }
    } catch(err) {
    setError(err.message)
    setLoading(false)
    setUploading(false)
}
}

return (
    <div className="flex flex-col h-screen px-4 py-4">

        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto bg-white rounded-xl border border-gray-200 p-4 mb-4">
            
            {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <h1 className="text-lg font-semibold">DocMind</h1>
                    <p className="text-gray-400 text-sm">Ask anything about your PDF</p>
                </div>
            )}

            {messages.map((message, index) => (
                <div key={index} className={`p-3 rounded-lg mb-2 text-sm ${message.role === "user" ? "bg-blue-100 ml-8 text-right" : "bg-gray-100 mr-8 text-left"}`}>
                    <p className="text-xs text-gray-400 mb-1">{message.role === "user" ? "You" : "DocMind"}</p>
                    <p>{message.content}</p>
                </div>
            ))}

            {loading && (
                <div className="bg-gray-100 mr-8 p-3 rounded-lg mb-2">
                    <p className="text-xs text-gray-400 mb-1">DocMind</p>
                    <p className="text-sm text-gray-400">Thinking...</p>
                </div>
            )}

            <div ref={messagesEndRef} />

        </div>

        {pendingFile && (
            <div className="flex items-center gap-2 px-2 mb-1">
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded-lg">
                    {uploading ? "Uploading..." : pendingFile.name}
                </span>
                {!uploading && (
                    <button onClick={() => {
                        setPendingFile(null)
                        document.getElementById('newPdfInput').value = ''
                    }} className="text-xs text-gray-400 hover:text-gray-600">
                        x
                    </button>
                )}
            </div>
        )}
        {error && (
            <p className="text-red-500 text-xs px-2 mb-1">{error}</p>
        )}

        <div className="bg-white border border-gray-200 rounded-xl px-4 py-2 flex gap-2 items-center mb-2">
            <input 
                type="file" 
                id="newPdfInput" 
                accept=".pdf"
                className="hidden"
                onChange={(e) => setPendingFile(e.target.files[0])}
            />
            <label htmlFor="newPdfInput" className="cursor-pointer text-gray-400 hover:text-gray-600 font-bold text-xl px-1">
                +
            </label>
            <input
                className="flex-1 outline-none text-sm py-1"
                type="text"
                placeholder="Ask a question about your PDF..."
                value={input}
                onChange={(e) => {
                    setInput(e.target.value)
                    setError(null)
                }}
                onKeyDown={(e) => e.key === "Enter" && handelAsk()}
            />
            <button
                onClick={handelAsk}
                disabled={loading}
                className="bg-gray-900 text-white px-4 py-1.5 rounded-lg font-medium text-sm disabled:opacity-50">
                Send
            </button>
        </div>

    </div>
)
}


export default ChatSection