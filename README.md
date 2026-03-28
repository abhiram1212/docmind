# DocMind - AI-Powered PDF Chat Assistant

DocMind is a full stack AI application that lets users upload PDF documents and ask questions in natural language. It uses semantic search to find relevant content and streams AI-generated answers in real time using Claude AI.

## Live Demo

[https://d1trzl7talcx36.cloudfront.net](https://d1trzl7talcx36.cloudfront.net)

---

## Features

- Upload any PDF and start chatting instantly
- Streaming AI responses powered by Anthropic Claude
- Semantic search using pgvector for accurate answers
- Multi-PDF support with mid-chat document switching
- Duplicate PDF detection via SHA-256 file hashing
- Edge case handling: empty PDFs, file size limits, network errors
- Clean minimal chat UI with auto scroll

---

## Tech Stack

### Backend
- Python, FastAPI
- PostgreSQL with pgvector extension
- sentence-transformers (all-MiniLM-L6-v2) for embeddings
- Anthropic Claude API with streaming (SSE)
- LangChain RecursiveCharacterTextSplitter
- PyPDF2 for text extraction

### Frontend
- React (Vite 5)
- Tailwind CSS v4
- Server-Sent Events for streaming responses

### Cloud (AWS)
- EC2 - FastAPI backend with systemd process management
- RDS - PostgreSQL database
- S3 - Static frontend hosting
- CloudFront - CDN with HTTPS
- Elastic IP - Fixed backend IP address

### Other
- nginx as reverse proxy
- Let's Encrypt SSL certificate
- Git, GitHub for version control

---

## Architecture

```
User Browser
    -> CloudFront (HTTPS CDN)
        -> S3 (React frontend)
    -> nginx + Let's Encrypt (HTTPS)
        -> EC2 (FastAPI backend)
            -> RDS PostgreSQL + pgvector
            -> Anthropic Claude API
```

### How it works

1. User uploads a PDF
2. Backend extracts text page by page using PyPDF2
3. Text is split into 500 token chunks with 50 token overlap
4. Chunks are embedded using sentence-transformers and stored in PostgreSQL with pgvector
5. User asks a question
6. Question is embedded and compared against stored chunks using cosine similarity
7. Top 5 relevant chunks are sent as context to Claude
8. Claude streams the answer back token by token via SSE

---

## Local Development

### Prerequisites
- Python 3.10+
- Node.js 18+
- PostgreSQL with pgvector extension
- Anthropic API key

### Backend Setup

```bash
# Clone the repo
git clone https://github.com/abhiram1212/docmind.git
cd docmind

# Create virtual environment
python3 -m venv .venv
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create .env file
cp .env.example .env
# Add your ANTHROPIC_API_KEY and DATABASE_URL

# Run the backend
uvicorn main:app --reload
```

### Database Setup

```sql
CREATE DATABASE docmind;
\c docmind
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE pdfs (
    id SERIAL PRIMARY KEY,
    filename TEXT NOT NULL,
    session_id TEXT NOT NULL,
    file_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE chunks (
    id SERIAL PRIMARY KEY,
    pdf_id INTEGER REFERENCES pdfs(id),
    text TEXT NOT NULL,
    embedding vector(384),
    page_number INTEGER
);
```

### Frontend Setup

```bash
cd docmind-frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Deployment

### Backend (EC2)

```bash
# SSH into EC2
ssh -i your-key.pem ubuntu@your-ec2-ip

# Clone and install
git clone https://github.com/abhiram1212/docmind.git
cd docmind
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Create .env with production values
nano .env

# Set up systemd service
sudo systemctl enable docmind
sudo systemctl start docmind
```

### Frontend (S3 + CloudFront)

```bash
cd docmind-frontend
npm run build
aws s3 sync dist/ s3://your-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_ID --paths "/*"
```

---

## API Endpoints

### POST /upload
Uploads and processes a PDF file.

**Request:** multipart/form-data with `file` field

**Response:**
```json
{
  "session_id": "uuid",
  "chunks_stored": 42
}
```

### POST /ask
Asks a question about an uploaded PDF.

**Request:**
```json
{
  "session_id": "uuid",
  "question": "What is this document about?"
}
```

**Response:** Server-Sent Events stream
```
data: {"text": "This"}
data: {"text": " document"}
data: [DONE]
```

---

## Environment Variables

```
ANTHROPIC_API_KEY=your_anthropic_api_key
DATABASE_URL=postgresql://user:password@host:5432/docmind
```

---

## What I Learned

Building DocMind from scratch taught me:

- Full stack AI engineering from data ingestion to LLM integration
- Vector embeddings and semantic search with pgvector
- Streaming responses with Server-Sent Events
- React fundamentals: components, state, props, hooks
- AWS deployment: EC2, RDS, S3, CloudFront
- Production concerns: CORS, HTTPS, process management, error handling

---

## Author

Abhiram Mullapudi

Built with FastAPI, pgvector, React, and Anthropic Claude API.
