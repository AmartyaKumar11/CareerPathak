from fastapi import FastAPI, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import pytesseract
from PIL import Image
import io

import os
from db import users_collection, marksheets_collection, answers_collection

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

class PsychometricQuestion(BaseModel):
    id: str
    question: str
    options: List[str]
    context: Optional[str]
    traits: List[str]

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

# Psychometric question generation (Langchain placeholder)
@app.post("/generate-psychometric", response_model=List[PsychometricQuestion])
def generate_psychometric(marks: List[SubjectMark]):
    # TODO: Use Langchain/OpenAI/Gemini for real questions
    # For now, return static questions
    questions = [
        PsychometricQuestion(
            id="q1",
            question="How much do you enjoy solving analytical problems?",
            options=["Not at all", "Slightly", "Moderately", "Very much", "Extremely"],
            context="Assessing analytical thinking",
            traits=["analytical"]
        ),
        PsychometricQuestion(
            id="q2",
            question="Do you prefer working in teams or alone?",
            options=["Always alone", "Mostly alone", "Neutral", "Mostly in teams", "Always in teams"],
            context="Teamwork preference",
            traits=["teamwork"]
        )
    ]
    return questions

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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
