# OCR Setup for Marksheet Processing

## Overview
This system automatically extracts marks from uploaded marksheet images/PDFs using Google Cloud Vision API with Tesseract.js as a fallback.

## Setup Status ✅
- **Google Cloud Vision API**: Configured with service account credentials
- **Tesseract.js**: Installed as fallback OCR solution  
- **PDF Processing**: pdf-poppler installed for PDF to image conversion
- **AI Parsing**: Gemini 2.0 Flash integrated for intelligent marks extraction

## Current Implementation

### 1. OCR Service (`src/services/ocrService.js`)
- **Primary OCR**: Google Vision API with service account authentication
- **Fallback OCR**: Tesseract.js for when Google Vision fails
- **PDF Support**: Converts PDF pages to images before OCR
- **AI Integration**: Uses Gemini API to parse structured marks from OCR text

### 2. API Endpoint (`src/routes/streams.js`)
- **POST** `/api/streams/upload-marksheets` - Upload and process multiple marksheets
- Handles up to 5 files (PDF/JPG/PNG), 10MB each
- Returns parsed marks with confidence scores
- Flags files that require manual entry

### 3. Frontend Integration (`src/pages/StreamRecommendations.tsx`)
- Auto-extraction display with confidence indicators
- Manual entry overlay for verification/correction
- Smart UI that skips manual entry for high-confidence extractions

## How It Works

### Step 1: File Upload
```javascript
// Multiple marksheet uploads with validation
const formData = new FormData();
files.forEach(file => formData.append('marksheets', file));
```

### Step 2: OCR Processing
1. **PDF Conversion**: PDFs converted to PNG images
2. **Google Vision OCR**: Extracts raw text from images
3. **Fallback**: Uses Tesseract.js if Google Vision fails
4. **Text Cleaning**: Preprocesses OCR output

### Step 3: AI Parsing
```javascript
// Gemini AI analyzes OCR text and extracts structured marks
{
  "subjects": [
    {
      "name": "Physics",
      "marks": 85,
      "maxMarks": 100,
      "confidence": 0.95
    }
  ],
  "totalMarks": 425,
  "percentage": 85.0,
  "confidence": 0.90
}
```

### Step 4: User Verification
- High confidence (>0.7): Auto-filled, optional verification
- Low confidence (<0.7): Manual entry required
- User can edit all extracted values

## Configuration

### Google Cloud Credentials
Service account key stored in `backend/google-credentials.json`:
- Project: `mfe-2-422911` 
- Service: `vision-api-service@mfe-2-422911.iam.gserviceaccount.com`

### Environment Variables (Optional)
```bash
# Alternative credential methods
GOOGLE_APPLICATION_CREDENTIALS=/path/to/credentials.json
GOOGLE_CLOUD_KEY_JSON={"type":"service_account"...}

# Gemini API (required for AI parsing)
GEMINI_API_KEY=your-gemini-api-key
```

## Supported Features

✅ **File Formats**: PDF, JPG, PNG  
✅ **Multiple Files**: Up to 5 marksheets per upload  
✅ **OCR Accuracy**: Google Vision API (high accuracy)  
✅ **AI Parsing**: Gemini 2.0 Flash for intelligent extraction  
✅ **Confidence Scoring**: Per-subject and overall confidence  
✅ **Fallback OCR**: Tesseract.js when Google Vision fails  
✅ **Manual Override**: Users can edit all extracted values  
✅ **Smart UI**: Conditionally shows manual entry based on confidence

## Testing the System

### 1. Start Servers
```bash
# Backend (port 3001)
cd backend && npm run dev

# Frontend (port 8080)  
cd .. && npm run dev
```

### 2. Upload Test Marksheets
1. Navigate to `http://localhost:8080/stream-recommendations`
2. Upload marksheet image/PDF files
3. System will automatically extract marks
4. Verify or edit extracted values
5. Proceed to psychometric test

### 3. Expected Behavior
- **High-quality marksheets**: Auto-extraction with minimal manual entry
- **Poor-quality images**: Falls back to manual entry with OCR text available
- **PDF marksheets**: Converted to images and processed page by page

## Error Handling

### OCR Failures
- Google Vision API errors → Tesseract.js fallback
- Both OCR methods fail → Manual entry only
- PDF processing errors → Skip to manual entry

### AI Parsing Failures  
- Gemini API errors → Raw OCR text provided for manual entry
- Low confidence scores → Manual verification required
- No structured data found → Manual entry with OCR hints

## Future Enhancements

🔄 **OCR Accuracy**: Fine-tune for Indian marksheet formats  
🔄 **Batch Processing**: Background processing for large uploads  
🔄 **Format Recognition**: Auto-detect different board marksheet formats  
🔄 **Image Preprocessing**: Enhance image quality before OCR  
🔄 **Caching**: Store OCR results to avoid reprocessing

---

**Status**: ✅ Ready for Testing  
**Last Updated**: September 16, 2025  
**Dependencies**: Google Vision API, Tesseract.js, Gemini 2.0 Flash