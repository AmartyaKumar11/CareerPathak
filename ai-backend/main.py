from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import pytesseract
from PIL import Image
import io
import json
from datetime import datetime

import os
from db import users_collection, marksheets_collection, answers_collection
from psychometric_ai import (
    psychometric_ai, 
    UserResponse, 
    PersonalityProfile,
    PsychometricQuestion
)
from ai_config import ai_config, get_recommended_setup

app = FastAPI()

# Allow CORS for local frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Models
class SubjectMark(BaseModel):
    name: str
    marks: int
    max_marks: int = 100
    confidence: float = 0.7

class OCRResult(BaseModel):
    text: str
    subjects: List[SubjectMark]
    total_marks: Optional[int]
    total_max_marks: Optional[int]
    percentage: Optional[float]
    confidence: float

class PsychometricAnswer(BaseModel):
    question_id: str
    answer: str
    question_text: str
    response_time: Optional[float] = None
    confidence_level: Optional[int] = None

class AssessmentRequest(BaseModel):
    user_id: str
    academic_performance: Dict[str, float]
    previous_responses: List[UserResponse] = []
    num_questions: int = 10

class AssessmentSubmission(BaseModel):
    user_id: str
    responses: List[UserResponse]
    academic_performance: Dict[str, float]

# OCR endpoint
@app.post("/ocr-upload", response_model=OCRResult)
def ocr_upload(marksheet: UploadFile = File(...)):
    # Read file
    content = marksheet.file.read()
    image = Image.open(io.BytesIO(content))
    text = pytesseract.image_to_string(image)
    # Simple regex-based parsing
    import re
    subject_regex = r"(Physics|Chemistry|Mathematics|Maths|Biology|English|Economics|Accountancy|Business Studies|Geography|History|Political Science|Sociology)[\s:]+(\d{1,3})"
    subjects = []
    total_marks = 0
    total_max_marks = 0
    for match in re.finditer(subject_regex, text, re.IGNORECASE):
        name = match.group(1)
        marks = int(match.group(2))
        subjects.append(SubjectMark(name=name, marks=marks))
        total_marks += marks
        total_max_marks += 100
    percentage = (total_marks / total_max_marks) * 100 if total_max_marks > 0 else None
    return OCRResult(
        text=text,
        subjects=subjects,
        total_marks=total_marks if subjects else None,
        total_max_marks=total_max_marks if subjects else None,
        percentage=percentage,
        confidence=0.7 if subjects else 0.3
    )

# AI-Powered Psychometric Assessment Endpoints

@app.post("/generate-adaptive-questions", response_model=List[Dict[str, Any]])
def generate_adaptive_questions(request: AssessmentRequest):
    """Generate adaptive psychometric questions using AI"""
    try:
        # Generate questions based on user's profile and previous responses
        questions = psychometric_ai.generate_adaptive_questions(
            user_responses=request.previous_responses,
            academic_performance=request.academic_performance,
            num_questions=request.num_questions
        )
        
        # Convert to dict format for JSON response
        return [
            {
                "id": q.id,
                "question": q.question,
                "question_type": q.question_type,
                "options": q.options,
                "traits_measured": q.traits_measured,
                "difficulty_level": q.difficulty_level,
                "context": q.context,
                "scenario": q.scenario
            }
            for q in questions
        ]
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate questions: {str(e)}")

@app.post("/analyze-psychometric-responses", response_model=Dict[str, Any])
def analyze_psychometric_responses(submission: AssessmentSubmission):
    """Analyze psychometric responses and generate personality profile"""
    try:
        # Analyze responses using AI
        profile = psychometric_ai.analyze_responses(
            responses=submission.responses,
            academic_performance=submission.academic_performance
        )
        
        # Set user ID
        profile.user_id = submission.user_id
        
        # Store results in database
        profile_data = {
            "user_id": submission.user_id,
            "assessment_date": datetime.utcnow(),
            "trait_scores": profile.trait_scores,
            "learning_style": profile.learning_style,
            "work_preferences": profile.work_preferences,
            "interests": profile.interests,
            "strengths": profile.strengths,
            "areas_for_development": profile.areas_for_development,
            "recommended_streams": profile.recommended_streams,
            "confidence_score": profile.confidence_score,
            "responses": [
                {
                    "question_id": r.question_id,
                    "response": r.response,
                    "response_time": r.response_time,
                    "confidence_level": r.confidence_level
                }
                for r in submission.responses
            ]
        }
        
        # Store in MongoDB
        result = answers_collection.insert_one(profile_data)
        
        return {
            "success": True,
            "assessment_id": str(result.inserted_id),
            "profile": {
                "user_id": profile.user_id,
                "trait_scores": profile.trait_scores,
                "learning_style": profile.learning_style,
                "work_preferences": profile.work_preferences,
                "interests": profile.interests,
                "strengths": profile.strengths,
                "areas_for_development": profile.areas_for_development,
                "recommended_streams": profile.recommended_streams,
                "confidence_score": profile.confidence_score
            }
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to analyze responses: {str(e)}")

@app.get("/get-user-profile/{user_id}", response_model=Dict[str, Any])
def get_user_profile(user_id: str):
    """Get user's latest psychometric profile"""
    try:
        # Find latest assessment for user
        profile = answers_collection.find_one(
            {"user_id": user_id},
            sort=[("assessment_date", -1)]
        )
        
        if not profile:
            raise HTTPException(status_code=404, detail="No assessment found for user")
        
        # Remove MongoDB ObjectId for JSON serialization
        profile.pop("_id", None)
        
        return {
            "success": True,
            "profile": profile
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve profile: {str(e)}")

@app.post("/get-stream-recommendations", response_model=Dict[str, Any])
def get_stream_recommendations(request: Dict[str, Any]):
    """Get personalized stream recommendations"""
    try:
        user_id = request.get("user_id")
        trait_scores = request.get("trait_scores", {})
        academic_performance = request.get("academic_performance", {})
        
        if not trait_scores:
            raise HTTPException(status_code=400, detail="Trait scores required")
        
        # Generate recommendations
        recommendations = psychometric_ai._recommend_streams(trait_scores, academic_performance)
        
        return {
            "success": True,
            "recommendations": recommendations,
            "generated_at": datetime.utcnow().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

# Store answers (placeholder)

class AnswersPayload(BaseModel):
    user_id: str
    answers: List[PsychometricAnswer]


@app.post("/submit-answers")
def submit_answers(payload: AnswersPayload):
    # Store answers in MongoDB
    for ans in payload.answers:
        answers_collection.insert_one({
            "user_id": payload.user_id,
            "question_id": ans.question_id,
            "answer": ans.answer,
            "question_text": ans.question_text
        })
    return {"success": True, "message": "Answers stored"}

# Recommend streams (placeholder)
@app.post("/recommend-streams")
def recommend_streams(payload: AnswersPayload):
    # TODO: Use marks + answers for real recommendations
    return {"recommendations": ["Science", "Commerce", "Arts"]}

@app.get("/ai-status", response_model=Dict[str, Any])
def get_ai_status():
    """Get AI configuration and status"""
    try:
        status_report = ai_config.get_status_report()
        setup_instructions = get_recommended_setup()
        
        return {
            "success": True,
            "ai_status": status_report,
            "setup_instructions": setup_instructions,
            "recommendations": {
                "primary": "Use OpenAI for best quality (requires API key)",
                "free_alternative": "Use Google Gemini (free tier available)",
                "fallback": "Pre-generated questions always available"
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to get AI status: {str(e)}")

@app.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "ai_providers_available": len(ai_config.enabled_providers),
        "primary_provider": ai_config.get_primary_provider().value,
        "fallback_questions": len(psychometric_ai.question_bank)
    }

@app.post("/test-gemini")
def test_gemini_generation():
    """Test Gemini AI question generation"""
    try:
        # Test with sample data
        sample_academic = {
            "Mathematics": 85,
            "Physics": 78,
            "Computer Science": 90,
            "English": 75,
            "Chemistry": 70
        }
        
        # Generate a test question
        question = psychometric_ai._try_gemini_generation(
            "analytical_thinking", 
            sample_academic, 
            1
        )
        
        if question:
            return {
                "success": True,
                "message": "Gemini AI is working correctly!",
                "sample_question": {
                    "id": question.id,
                    "question": question.question,
                    "options": question.options,
                    "scenario": question.scenario,
                    "traits_measured": question.traits_measured
                },
                "generation_time": "< 3 seconds (Gemini Flash)",
                "model_used": os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
            }
        else:
            return {
                "success": False,
                "message": "Gemini generation failed, check API key and configuration"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Gemini test failed"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
