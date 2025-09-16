const vision = require('@google-cloud/vision');
const Tesseract = require('tesseract.js');
const pdf = require('pdf-poppler');
const path = require('path');
const fs = require('fs');

class OCRService {
  constructor() {
    this.visionClient = null;
    this.isVisionAvailable = false;
    
    // Initialize Google Vision client if credentials are available
    this.initializeVisionClient();
  }

  initializeVisionClient() {
    try {
      const credentialsPath = path.join(__dirname, '../../google-credentials.json');
      
      if (fs.existsSync(credentialsPath)) {
        // Use the provided service account credentials
        this.visionClient = new vision.ImageAnnotatorClient({
          keyFilename: credentialsPath,
          projectId: 'mfe-2-422911'
        });
        this.isVisionAvailable = true;
        console.log('Google Vision API client initialized with service account credentials');
      } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS || process.env.GOOGLE_CLOUD_KEY_JSON) {
        // Fallback to environment variables
        const clientConfig = {};
        
        if (process.env.GOOGLE_CLOUD_KEY_JSON) {
          // Use JSON key content directly
          clientConfig.credentials = JSON.parse(process.env.GOOGLE_CLOUD_KEY_JSON);
        }
        // If GOOGLE_APPLICATION_CREDENTIALS is set, it will be used automatically
        
        this.visionClient = new vision.ImageAnnotatorClient(clientConfig);
        this.isVisionAvailable = true;
        console.log('Google Vision API client initialized with environment credentials');
      } else {
        console.log('Google Vision API credentials not found, will use Tesseract.js fallback');
      }
    } catch (error) {
      console.error('Failed to initialize Google Vision API:', error.message);
      console.log('Will use Tesseract.js fallback');
      this.isVisionAvailable = false;
    }
  }

  async extractTextFromFile(fileBuffer, mimeType, filename) {
    try {
      let textResults = [];

      if (mimeType === 'application/pdf') {
        // Convert PDF to images first
        const images = await this.convertPdfToImages(fileBuffer, filename);
        for (const imagePath of images) {
          const text = await this.extractTextFromImage(imagePath);
          textResults.push(text);
          // Clean up temporary image
          fs.unlinkSync(imagePath);
        }
      } else if (mimeType.startsWith('image/')) {
        // Direct image processing
        const text = await this.extractTextFromImageBuffer(fileBuffer);
        textResults.push(text);
      } else {
        throw new Error('Unsupported file type for OCR');
      }

      return {
        success: true,
        extractedText: textResults.join('\n\n'),
        pages: textResults.length,
        method: this.isVisionAvailable ? 'google_vision' : 'tesseract'
      };
    } catch (error) {
      console.error('OCR extraction failed:', error);
      
      // Fallback to Tesseract.js for images
      if (mimeType.startsWith('image/')) {
        try {
          const fallbackResult = await this.fallbackOCR(fileBuffer);
          return fallbackResult;
        } catch (fallbackError) {
          console.error('Fallback OCR also failed:', fallbackError);
        }
      }
      
      return {
        success: false,
        error: error.message,
        extractedText: ''
      };
    }
  }

  async extractTextFromImageBuffer(imageBuffer) {
    // Try Google Vision API first if available
    if (this.isVisionAvailable && this.visionClient) {
      try {
        const [result] = await this.visionClient.textDetection({
          image: {
            content: imageBuffer
          }
        });

        const detections = result.textAnnotations;
        const extractedText = detections && detections.length > 0 ? detections[0].description : '';
        console.log('Google Vision API extraction successful');
        return extractedText;
      } catch (error) {
        console.error('Google Vision API error, falling back to Tesseract:', error.message);
      }
    }

    // Fallback to Tesseract.js
    console.log('Using Tesseract.js for OCR');
    const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng', {
      logger: m => console.log('Tesseract:', m)
    });
    
    return text;
  }

  async extractTextFromImage(imagePath) {
    try {
      const imageBuffer = fs.readFileSync(imagePath);
      return await this.extractTextFromImageBuffer(imageBuffer);
    } catch (error) {
      console.error('Error reading image file:', error);
      throw error;
    }
  }

  async convertPdfToImages(pdfBuffer, filename) {
    const tempDir = path.join(__dirname, '../../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const tempPdfPath = path.join(tempDir, `temp_${Date.now()}_${filename}`);
    
    try {
      // Save PDF buffer to temporary file
      fs.writeFileSync(tempPdfPath, pdfBuffer);

      // Convert PDF pages to images
      const options = {
        format: 'png',
        out_dir: tempDir,
        out_prefix: `pdf_${Date.now()}`,
        page: null // Convert all pages
      };

      const imageInfo = await pdf.convert(tempPdfPath, options);
      
      // Get list of generated image files
      const imageFiles = [];
      for (let i = 1; i <= imageInfo.length || 1; i++) {
        const imagePath = path.join(tempDir, `${options.out_prefix}-${i}.png`);
        if (fs.existsSync(imagePath)) {
          imageFiles.push(imagePath);
        }
      }

      return imageFiles;
    } finally {
      // Clean up temporary PDF file
      if (fs.existsSync(tempPdfPath)) {
        fs.unlinkSync(tempPdfPath);
      }
    }
  }

  async fallbackOCR(imageBuffer) {
    try {
      const { data: { text } } = await Tesseract.recognize(imageBuffer, 'eng', {
        logger: m => console.log('Tesseract:', m)
      });

      return {
        success: true,
        extractedText: text,
        method: 'tesseract_fallback'
      };
    } catch (error) {
      throw new Error(`Fallback OCR failed: ${error.message}`);
    }
  }

  // Parse marks from extracted text using AI or free regex fallback
  async parseMarksFromText(extractedText, useFree = false) {
    // If useFree is true or Gemini API key is missing, use regex-based parser
    if (useFree || !process.env.GEMINI_API_KEY) {
      try {
        // Simple regex to match lines like "Physics 85" or "Mathematics: 92"
        const subjectRegex = /(Physics|Chemistry|Mathematics|Maths|Biology|English|Economics|Accountancy|Business Studies|Geography|History|Political Science|Sociology)[\s:]+(\d{1,3})/gi;
        const subjects = [];
        let totalMarks = 0;
        let totalMaxMarks = 0;
        let match;
        while ((match = subjectRegex.exec(extractedText)) !== null) {
          subjects.push({
            name: match[1],
            marks: parseInt(match[2]),
            maxMarks: 100,
            confidence: 0.7
          });
          totalMarks += parseInt(match[2]);
          totalMaxMarks += 100;
        }
        const percentage = totalMaxMarks > 0 ? (totalMarks / totalMaxMarks) * 100 : null;
        return {
          success: subjects.length > 0,
          parsedMarks: {
            subjects,
            totalMarks,
            totalMaxMarks,
            percentage,
            confidence: subjects.length > 0 ? 0.7 : 0.3
          }
        };
      } catch (error) {
        return {
          success: false,
          error: error.message,
          rawText: extractedText
        };
      }
    }
    // Otherwise, use Gemini AI parsing
    try {
      const { GoogleGenerativeAI } = require('@google/generative-ai');
      const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-exp" });
      const prompt = `Parse the following marksheet text and extract subject names and marks in JSON format...\nMarksheet Text:\n${extractedText}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedData = JSON.parse(jsonMatch[0]);
        return {
          success: true,
          parsedMarks: parsedData
        };
      }
      return {
        success: false,
        error: 'Could not parse marks from OCR text',
        rawText: extractedText
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        rawText: extractedText
      };
    }
  }
}

module.exports = new OCRService();