import { useState } from 'react'

function UploadSection({ onUploadSuccess }){
    const [file, setFile] = useState(null)
    const [loading, setLoading] = useState(false)
    const[error, setError] = useState(null)


    async function handleUpload() {
        if(!file){
            setError("No File Selected!")
            return
        }
        if (file.size > 10 * 1024 * 1024) {
            setError("File too large. Maximum size is 10MB.")
            return
        }
        try{
    // 1. tell React we are loading
    setLoading(true)

    // 2. build the form data
    const formData = new FormData()
    formData.append("file", file)

    // 3. send to your FastAPI backend
    const response = await fetch("https://23.23.6.53.nip.io/upload", {
        method: "POST",
        body: formData
    })

    // 4. parse the JSON response
    const data = await response.json()

    if (!response.ok){
        throw new Error(data.detail)
    }

    // 5. pass session_id up to App
    onUploadSuccess(data.session_id)

    // 6. loading is done
    setLoading(false)
    }
    catch (err){
        setError(err.message)
        setLoading(false)
        }
    }

    return(
        <div className="max-w-md mx-auto bg-white rounded-xl border border-gray-200 p-8">

            <label htmlFor="fileInput" className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center mb-4 w-full block cursor-pointer'>
                <input
                type="file"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="fileInput"
                accept='.pdf'
            />
                <div className="flex justify-center mb-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    </div>
                Drop your PDF here or click to browse
            </label>
            {file 
                ? <p className="text-sm text-gray-600 mt-1">{file.name}</p>
                : <p className="text-sm text-gray-400 mt-1">PDF files only</p>
            }
            <button onClick={handleUpload} disabled = {loading} className = "w-full bg-gray-900 text-white py-2.5 rounded-lg font-medium">
            {loading ? "Uploading..." : "Upload PDF"}
            </button>
            {error ? (
                <p className="text-red-500 text-sm mt-2">Error: {error}</p>
            ) : (
                null
            )}
        </div>
    )

    
}



export default UploadSection