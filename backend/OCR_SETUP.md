# OCR Service Setup

## Google Vision API Setup (Recommended for high accuracy)

### 1. Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing project
3. Enable the Vision API

### 2. Create Service Account
1. Go to IAM & Admin > Service Accounts
2. Click "Create Service Account"
3. Give it a name like "vision-api-service"
4. Grant it the "Cloud Vision API Service Agent" role
5. Create and download the JSON key file

### 3. Setup Environment Variables
Add to your backend/.env file:
```
# Option 1: Use service account key file path
GOOGLE_APPLICATION_CREDENTIALS=./path/to/your/service-account-key.json

# Option 2: Use the JSON content directly (for production/docker)
GOOGLE_CLOUD_KEY_JSON={"type":"service_account","project_id":"your-project",...}
```

### 4. Alternative: Application Default Credentials
If you have gcloud CLI installed:
```bash
gcloud auth application-default login
```

## Tesseract.js Fallback

The system will automatically fall back to Tesseract.js if Google Vision fails. 
Tesseract.js works offline and doesn't require API keys, but has lower accuracy.

## PDF Support

PDFs are converted to images using pdf-poppler before OCR processing.
Each page is processed separately and results are combined.

## Usage

The OCR service is automatically used when files are uploaded to `/api/streams/upload-marksheets`.

### Supported File Types:
- PDF (.pdf)
- JPEG (.jpg, .jpeg)  
- PNG (.png)

### Confidence Scoring:
- Above 0.7: Auto-extracted marks are used directly
- Below 0.7: Manual entry required for verification

## Testing

To test without Google Vision setup, the system will automatically use Tesseract.js fallback.

## Cost Considerations

Google Vision API pricing (as of 2024):
- First 1,000 requests/month: Free
- Additional requests: $1.50 per 1,000 requests

For development, Tesseract.js can be used without any costs.