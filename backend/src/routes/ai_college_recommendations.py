from fastapi import APIRouter, Query
import json
from groq_ai import get_recommended_courses_for_stream

router = APIRouter()

# Load college data once
with open("d:/CareerPathak/colleges_with_cleaned_fees.json", "r", encoding="utf-8") as f:
    colleges = json.load(f)

@router.get("/api/ai-recommended-colleges")
def get_ai_recommended_colleges(stream: str = Query(...)):
    # Use Groq AI to get recommended courses for the stream
    recommended_courses = get_recommended_courses_for_stream(stream)  # Your Groq AI logic here

    # Filter colleges that offer these courses
    matched_colleges = []
    for college in colleges:
        if any(course in recommended_courses for course in college["courses"]):
            matched_colleges.append(college)
    return {"colleges": matched_colleges}
