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
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

from db import users_collection, marksheets_collection, answers_collection, db
from psychometric_ai import (
    psychometric_ai, 
    UserResponse, 
    PersonalityProfile,
    PsychometricQuestion
)
from streams_database import (
    COMPREHENSIVE_STREAMS_DATABASE,
    get_all_streams,
    search_streams_by_requirements
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
    """Analyze psychometric responses and generate AI-powered personality profile with stream recommendations"""
    try:
        # Analyze responses using AI-enhanced system
        profile = psychometric_ai.analyze_responses(
            responses=submission.responses,
            academic_performance=submission.academic_performance
        )
        
        # Set user ID
        profile.user_id = submission.user_id
        
        # Determine recommendation method and quality
        has_ai_insights = any(stream.get("ai_insights") for stream in profile.recommended_streams)
        recommendation_method = "ai_enhanced" if has_ai_insights else "algorithmic_smart"
        
        # Comprehensive profile data for MongoDB storage
        profile_data = {
            "user_id": submission.user_id,
            "assessment_date": datetime.utcnow(),
            "assessment_type": "comprehensive_psychometric",
            
            # Academic Performance Data
            "academic_performance": submission.academic_performance,
            "academic_average": sum(submission.academic_performance.values()) / len(submission.academic_performance),
            "strong_subjects": [subj for subj, score in submission.academic_performance.items() if score > 75],
            "weak_subjects": [subj for subj, score in submission.academic_performance.items() if score < 60],
            
            # Personality Profile Data
            "trait_scores": profile.trait_scores,
            "learning_style": profile.learning_style,
            "work_preferences": profile.work_preferences,
            "interests": profile.interests,
            "strengths": profile.strengths,
            "areas_for_development": profile.areas_for_development,
            "confidence_score": profile.confidence_score,
            
            # Stream Recommendations (Always Available)
            "recommended_streams": profile.recommended_streams,
            "recommendation_method": recommendation_method,
            "recommendation_quality": "high" if has_ai_insights else "good",
            "total_streams_analyzed": len(profile.recommended_streams),
            
            # Raw Response Data
            "responses": [
                {
                    "question_id": r.question_id,
                    "response": r.response,
                    "response_time": r.response_time,
                    "confidence_level": r.confidence_level
                }
                for r in submission.responses
            ],
            "total_questions": len(submission.responses),
            "avg_response_time": sum(r.response_time for r in submission.responses) / len(submission.responses),
            
            # Metadata
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow(),
            "version": "2.0_ai_enhanced"
        }
        
        # Store in MongoDB (replace existing profile for same user)
        answers_collection.replace_one(
            {"user_id": submission.user_id},
            profile_data,
            upsert=True
        )
        
        # Store academic performance separately for quick access
        academic_data = {
            "user_id": submission.user_id,
            "academic_performance": submission.academic_performance,
            "academic_average": profile_data["academic_average"],
            "strong_subjects": profile_data["strong_subjects"],
            "weak_subjects": profile_data["weak_subjects"],
            "updated_at": datetime.utcnow()
        }
        
        marksheets_collection.replace_one(
            {"user_id": submission.user_id},
            academic_data,
            upsert=True
        )
        
        # Store stream recommendations separately with versioning
        recommendations_data = {
            "user_id": submission.user_id,
            "assessment_id": submission.user_id + "_" + datetime.utcnow().strftime("%Y%m%d_%H%M%S"),
            "recommended_streams": profile.recommended_streams,
            "recommendation_method": recommendation_method,
            "recommendation_quality": "high" if has_ai_insights else "good",
            "trait_scores_snapshot": profile.trait_scores,
            "academic_performance_snapshot": submission.academic_performance,
            "generated_at": datetime.utcnow(),
            "is_latest": True,
            "version": 1
        }
        
        # Mark previous recommendations as not latest
        db["stream_recommendations"].update_many(
            {"user_id": submission.user_id, "is_latest": True},
            {"$set": {"is_latest": False}}
        )
        
        # Insert new recommendations
        db["stream_recommendations"].insert_one(recommendations_data)
        
        return {
            "success": True,
            "assessment_id": submission.user_id,
            "profile": {
                "user_id": profile.user_id,
                "trait_scores": profile.trait_scores,
                "learning_style": profile.learning_style,
                "work_preferences": profile.work_preferences,
                "interests": profile.interests,
                "strengths": profile.strengths,
                "areas_for_development": profile.areas_for_development,
                "recommended_streams": profile.recommended_streams,
                "confidence_score": profile.confidence_score,
                "academic_performance": submission.academic_performance,
                "recommendation_method": profile_data["recommendation_method"]
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
    """Get AI-enhanced personalized stream recommendations"""
    try:
        user_id = request.get("user_id")
        trait_scores = request.get("trait_scores", {})
        academic_performance = request.get("academic_performance", {})
        
        if not trait_scores:
            raise HTTPException(status_code=400, detail="Trait scores required")
        
        # Generate AI-enhanced recommendations
        recommendations = psychometric_ai._recommend_streams(trait_scores, academic_performance)
        
        # Store the recommendation request for analytics
        recommendation_log = {
            "user_id": user_id,
            "request_type": "stream_recommendations",
            "trait_scores": trait_scores,
            "academic_performance": academic_performance,
            "recommendations": recommendations,
            "ai_enhanced": any(rec.get("ai_insights") for rec in recommendations),
            "generated_at": datetime.utcnow()
        }
        
        # Store in a separate collection for analytics
        db["recommendation_logs"].insert_one(recommendation_log)
        
        return {
            "success": True,
            "recommendations": recommendations,
            "ai_enhanced": recommendation_log["ai_enhanced"],
            "generated_at": datetime.utcnow().isoformat(),
            "user_id": user_id
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate recommendations: {str(e)}")

@app.get("/get-user-complete-profile/{user_id}", response_model=Dict[str, Any])
def get_user_complete_profile(user_id: str):
    """Get user's complete profile including academic performance and psychometric results"""
    try:
        # Get psychometric profile
        psychometric_profile = answers_collection.find_one(
            {"user_id": user_id},
            sort=[("assessment_date", -1)]
        )
        
        # Get academic performance
        academic_profile = marksheets_collection.find_one(
            {"user_id": user_id},
            sort=[("updated_at", -1)]
        )
        
        if not psychometric_profile and not academic_profile:
            raise HTTPException(status_code=404, detail="No profile found for user")
        
        # Combine profiles
        complete_profile = {
            "user_id": user_id,
            "has_psychometric_data": bool(psychometric_profile),
            "has_academic_data": bool(academic_profile),
            "psychometric_profile": psychometric_profile,
            "academic_profile": academic_profile,
            "last_updated": max(
                psychometric_profile.get("updated_at", datetime.min) if psychometric_profile else datetime.min,
                academic_profile.get("updated_at", datetime.min) if academic_profile else datetime.min
            )
        }
        
        # Remove MongoDB ObjectIds for JSON serialization
        if complete_profile["psychometric_profile"]:
            complete_profile["psychometric_profile"].pop("_id", None)
        if complete_profile["academic_profile"]:
            complete_profile["academic_profile"].pop("_id", None)
        
        return {
            "success": True,
            "profile": complete_profile
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve complete profile: {str(e)}")

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
    providers_available = 0
    primary_provider = "mock"
    
    # Check Grok availability
    if os.getenv("GROK_API_KEY"):
        providers_available += 1
        primary_provider = "grok"
    
    # Check Gemini availability
    if os.getenv("GOOGLE_API_KEY"):
        providers_available += 1
        if primary_provider == "mock":
            primary_provider = "gemini"
    
    return {
        "status": "healthy",
        "ai_providers_available": providers_available,
        "primary_provider": primary_provider,
        "fallback_questions": len(psychometric_ai.question_bank),
        "grok_available": bool(os.getenv("GROK_API_KEY")),
        "gemini_available": bool(os.getenv("GOOGLE_API_KEY"))
    }

@app.post("/test-grok")
def test_grok_generation():
    """Test Grok AI recommendation generation"""
    try:
        # Test with sample data
        sample_trait_scores = {
            "analytical_thinking": 0.75,
            "creativity": 0.80,
            "leadership": 0.70,
            "social_skills": 0.65,
            "technical_aptitude": 0.85,
            "entrepreneurial_spirit": 0.60,
            "research_orientation": 0.75,
            "helping_others": 0.70
        }
        
        sample_academic = {
            "Mathematics": 85,
            "Physics": 78,
            "Computer Science": 90,
            "English": 75,
            "Chemistry": 70
        }
        
        # Get basic recommendations first
        basic_recs = psychometric_ai._get_basic_recommendations(sample_trait_scores, sample_academic)
        
        # Test Grok enhancement
        enhanced_recs = psychometric_ai._try_grok_recommendations(
            sample_trait_scores, 
            sample_academic, 
            basic_recs
        )
        
        if enhanced_recs and any(rec.get("ai_insights") for rec in enhanced_recs):
            return {
                "success": True,
                "message": "Grok AI is working correctly!",
                "sample_recommendation": {
                    "stream": enhanced_recs[0]["stream"],
                    "match_percentage": enhanced_recs[0]["match_percentage"],
                    "ai_insights": enhanced_recs[0].get("ai_insights", {}),
                    "has_ai_insights": bool(enhanced_recs[0].get("ai_insights"))
                },
                "generation_time": "< 5 seconds (Grok Beta)",
                "model_used": "grok-beta",
                "framework": "Grok API via X.AI"
            }
        else:
            return {
                "success": False,
                "message": "Grok generation failed, check API key and configuration"
            }
            
    except Exception as e:
        return {
            "success": False,
            "error": str(e),
            "message": "Grok test failed"
        }

@app.get("/explore-streams", response_model=Dict[str, Any])
def explore_comprehensive_streams():
    """Explore the comprehensive streams database"""
    try:
        all_streams = get_all_streams()
        
        # Organize by categories
        categories = {}
        for stream in all_streams:
            category = stream["category"]
            if category not in categories:
                categories[category] = []
            
            categories[category].append({
                "name": stream["name"],
                "description": stream["description"],
                "career_paths": stream["career_paths"][:3],
                "salary_range": stream["salary_range"],
                "growth_prospects": stream["growth_prospects"],
                "duration": stream["duration"],
                "entrance_exams": stream["entrance_exams"][:2]
            })
        
        return {
            "success": True,
            "total_streams": len(all_streams),
            "categories": categories,
            "category_count": len(categories)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to explore streams: {str(e)}")

@app.post("/search-streams", response_model=Dict[str, Any])
def search_streams_by_profile(request: Dict[str, Any]):
    """Search streams based on user profile using comprehensive database"""
    try:
        trait_scores = request.get("trait_scores", {})
        academic_performance = request.get("academic_performance", {})
        threshold = request.get("threshold", 0.6)
        
        if not trait_scores or not academic_performance:
            raise HTTPException(status_code=400, detail="Both trait scores and academic performance required")
        
        # Search using comprehensive database
        matching_streams = search_streams_by_requirements(trait_scores, academic_performance, threshold)
        
        # Format results
        results = []
        for match in matching_streams[:10]:  # Top 10 matches
            stream_data = match["stream_data"]
            results.append({
                "name": stream_data["name"],
                "category": stream_data["category"],
                "description": stream_data["description"],
                "match_score": round(match["match_score"] * 100, 1),
                "personality_match": round(match["personality_match"] * 100, 1),
                "academic_match": round(match["academic_match"] * 100, 1),
                "career_paths": stream_data["career_paths"][:5],
                "salary_range": stream_data["salary_range"],
                "jk_opportunities": stream_data.get("jk_opportunities", [])[:3],
                "top_colleges": stream_data.get("top_colleges", [])[:3],
                "entrance_exams": stream_data.get("entrance_exams", [])[:3],
                "skills_required": stream_data["skills_required"][:4],
                "future_trends": stream_data["future_trends"][:2]
            })
        
        return {
            "success": True,
            "matches_found": len(results),
            "threshold_used": threshold,
            "streams": results
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to search streams: {str(e)}")

@app.get("/get-user-recommendations/{user_id}", response_model=Dict[str, Any])
def get_user_stream_recommendations(user_id: str):
    """Get user's latest stream recommendations"""
    try:
        # Get latest recommendations
        latest_recommendations = db["stream_recommendations"].find_one(
            {"user_id": user_id, "is_latest": True},
            sort=[("generated_at", -1)]
        )
        
        if not latest_recommendations:
            raise HTTPException(status_code=404, detail="No recommendations found for user")
        
        # Remove MongoDB ObjectId for JSON serialization
        latest_recommendations.pop("_id", None)
        
        return {
            "success": True,
            "recommendations": latest_recommendations,
            "has_recommendations": True,
            "recommendation_method": latest_recommendations.get("recommendation_method", "unknown"),
            "generated_at": latest_recommendations.get("generated_at")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve recommendations: {str(e)}")

@app.get("/get-user-recommendation-history/{user_id}", response_model=Dict[str, Any])
def get_user_recommendation_history(user_id: str):
    """Get user's recommendation history"""
    try:
        # Get all recommendations for user, sorted by date
        recommendations_history = list(db["stream_recommendations"].find(
            {"user_id": user_id},
            sort=[("generated_at", -1)]
        ))
        
        if not recommendations_history:
            raise HTTPException(status_code=404, detail="No recommendation history found for user")
        
        # Remove MongoDB ObjectIds for JSON serialization
        for rec in recommendations_history:
            rec.pop("_id", None)
        
        return {
            "success": True,
            "total_assessments": len(recommendations_history),
            "history": recommendations_history,
            "latest_assessment": recommendations_history[0] if recommendations_history else None
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to retrieve recommendation history: {str(e)}")

@app.post("/update-user-recommendations", response_model=Dict[str, Any])
def update_user_recommendations(request: Dict[str, Any]):
    """Update user's stream recommendations (for retaking assessments)"""
    try:
        user_id = request.get("user_id")
        trait_scores = request.get("trait_scores", {})
        academic_performance = request.get("academic_performance", {})
        
        if not all([user_id, trait_scores, academic_performance]):
            raise HTTPException(status_code=400, detail="User ID, trait scores, and academic performance required")
        
        # Generate new recommendations
        new_recommendations = psychometric_ai._recommend_streams(trait_scores, academic_performance)
        
        # Determine recommendation method
        has_ai_insights = any(stream.get("ai_insights") for stream in new_recommendations)
        recommendation_method = "ai_enhanced" if has_ai_insights else "algorithmic_smart"
        
        # Create new recommendations record
        recommendations_data = {
            "user_id": user_id,
            "assessment_id": user_id + "_" + datetime.utcnow().strftime("%Y%m%d_%H%M%S"),
            "recommended_streams": new_recommendations,
            "recommendation_method": recommendation_method,
            "recommendation_quality": "high" if has_ai_insights else "good",
            "trait_scores_snapshot": trait_scores,
            "academic_performance_snapshot": academic_performance,
            "generated_at": datetime.utcnow(),
            "is_latest": True,
            "version": 1
        }
        
        # Mark previous recommendations as not latest
        db["stream_recommendations"].update_many(
            {"user_id": user_id, "is_latest": True},
            {"$set": {"is_latest": False}}
        )
        
        # Insert new recommendations
        result = db["stream_recommendations"].insert_one(recommendations_data)
        
        return {
            "success": True,
            "message": "Recommendations updated successfully",
            "assessment_id": recommendations_data["assessment_id"],
            "recommendation_method": recommendation_method,
            "total_streams": len(new_recommendations),
            "has_ai_insights": has_ai_insights,
            "updated_at": recommendations_data["generated_at"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to update recommendations: {str(e)}")

@app.post("/test-gemini")
def test_gemini_generation():
    """Test Gemini AI question generation (backup)"""
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
                "model_used": os.getenv("GEMINI_MODEL", "gemini-1.5-flash"),
                "framework": "Direct Gemini API"
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
