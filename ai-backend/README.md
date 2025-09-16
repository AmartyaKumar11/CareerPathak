# CareerPathak AI Backend (Python)

## Features
- OCR marksheet parsing (Tesseract, regex)
- Psychometric question generation (Langchain-ready)
- Answer storage (DB-ready)
- Stream recommendations (placeholder)

## Quickstart

### 1. Install dependencies
```bash
pip install -r requirements.txt
```

### 2. Run locally
```bash
uvicorn main:app --reload --port 8000
```

### 3. Run with Docker
```bash
docker build -t careerpathak-ai .
docker run -p 8000:8000 careerpathak-ai
```

### 4. Endpoints
- `POST /ocr-upload` (form-data: marksheet)
- `POST /generate-psychometric` (JSON: marks)
- `POST /submit-answers` (JSON: user_id, answers)
- `POST /recommend-streams` (JSON: user_id, answers)

## Next Steps
- Connect to PostgreSQL for persistent storage
- Integrate Langchain/OpenAI for dynamic question generation
- Update frontend to use these endpoints
