from fastapi import FastAPI, UploadFile, File, HTTPException
from anthropic import Anthropic
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter
import psycopg2
import uuid
import PyPDF2
import io
import os
from dotenv import load_dotenv
import hashlib
from pydantic import BaseModel

load_dotenv()

app = FastAPI()
client = Anthropic()
embedding_model = SentenceTransformer('all-MiniLM-L6-v2')

class AskRequest(BaseModel):
    session_id: str
    question: str

def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))

@app.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")

    # Step 1: Extract text page by page
    pdf_bytes = await file.read()

    #file hash
    file_hash = hashlib.sha256(pdf_bytes).hexdigest()
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute(
    "SELECT session_id FROM pdfs WHERE file_hash = %s",
    (file_hash,)
    )
    existing = cur.fetchone()
    if existing:
        return {"session_id": existing[0], "chunks_stored": 0, "duplicate": True}

    reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))

    pages = []
    for i, page in enumerate(reader.pages):
        text = page.extract_text()
        pages.append({"page_number": i + 1, "text": text})

    # check for content in pdf    
    total_text = " ".join([p["text"] for p in pages if p["text"]])
    if len(total_text.strip()) < 50:
        raise HTTPException(status_code=400, detail="PDF appears to have no extractable text")

    # Step 2: Split into chunks
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50
    )

    chunks = []
    for page in pages:
        split_texts = splitter.split_text(page["text"])
        for text in split_texts:
            chunks.append({
                "text": text,
                "page_number": page["page_number"]
            })

    # Step 3: Generate embeddings
    all_text = [i['text'] for i in chunks]
    embeddings = embedding_model.encode(all_text)

    for i, j in enumerate(chunks):
        j['embedding'] = embeddings[i]

    # Step 4: Save to database
    session_id = str(uuid.uuid4())

    cur.execute(
        "INSERT INTO pdfs (filename, session_id, file_hash) VALUES (%s, %s, %s) RETURNING id",
        (file.filename, session_id, file_hash)
    )
    result = cur.fetchone()
    if result is None:
        raise HTTPException(status_code=404, detail="PDF not found")
    pdf_id = result[0]

    for chunk in chunks:
        cur.execute(
            "INSERT INTO chunks (pdf_id, text, embedding, page_number) VALUES (%s, %s, %s, %s)",
            (pdf_id, chunk["text"], chunk["embedding"].tolist(), chunk["page_number"])
        )

    conn.commit()
    cur.close()
    conn.close()

    return {"session_id": session_id, "chunks_stored": len(chunks)}


@app.post("/ask")
async def ask_question(request: AskRequest):

    # Step 1: Embed the question
    question_embedding = embedding_model.encode(request.question).tolist()

    # Step 2: Get pdf_id from session_id
    conn = get_db_connection()
    cur = conn.cursor()
    cur.execute("SELECT id FROM pdfs WHERE session_id = %s", (request.session_id,))

    result = cur.fetchone()
    if result is None:
        raise HTTPException(status_code=404, detail="PDF not found")
    pdf_id = result[0]

    # Step 3: Similarity search
    cur.execute(
    "SELECT text, page_number FROM chunks WHERE pdf_id = %s ORDER BY embedding <=> %s::vector LIMIT 5",
    (pdf_id, question_embedding)
    )

    chunks = cur.fetchall()

    # Step 4: Combine chunk texts
    context = ""
    for row in chunks:
        context = context + " " + row[0]
    
    cur.close()
    conn.close()

    # Step 5: Call Claude with system prompt + context + question
    try:
        message = client.messages.create(
            model="claude-haiku-4-5",
            max_tokens=10000,
            system="You are a helpful assistant. Answer questions only based on the conext provided. If the answer is not in the context, say so.",
            messages=[
                {
                    'role':'user',
                    "content": f"Context: {context}\n\nQuestion: {request.question}"
                }
            ]
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI service error: {str(e)}") 

    # Step 6: Return answer
    answer = message.content[0].text
    return {
    "answer": answer,
    "sources": [{"page": row[1]} for row in chunks]
}