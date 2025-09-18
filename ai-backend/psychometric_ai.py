"""
AI-Powered Psychometric Assessment System
Uses machine learning and NLP to generate personalized questions and analyze responses
"""

import json
import numpy as np
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import openai
import os
from datetime import datetime
import random

# Set up OpenAI (you can also use Google's Gemini or other LLMs)
openai.api_key = os.getenv("OPENAI_API_KEY", "your-api-key-here")

class PersonalityTrait(BaseModel):
    name: str
    description: str
    weight: float
    keywords: List[str]

class CareerStream(BaseModel):
    name: str
    description: str
    required_traits: Dict[str, float]  # trait_name: minimum_score
    subjects: List[str]
    career_paths: List[str]
    salary_range: str
    growth_prospects: str

class PsychometricQuestion(BaseModel):
    id: str
    question: str
    question_type: str  # "multiple_choice", "likert_scale", "scenario", "ranking"
    options: List[str]
    traits_measured: List[str]
    difficulty_level: int  # 1-5
    context: Optional[str] = None
    scenario: Optional[str] = None

class UserResponse(BaseModel):
    question_id: str
    response: str
    response_time: float  # in seconds
    confidence_level: Optional[int] = None

class PersonalityProfile(BaseModel):
    user_id: str
    trait_scores: Dict[str, float]
    learning_style: str
    work_preferences: Dict[str, float]
    interests: List[str]
    strengths: List[str]
    areas_for_development: List[str]
    recommended_streams: List[Dict[str, Any]]
    confidence_score: float

class PsychometricAI:
    def __init__(self):
        self.personality_traits = self._load_personality_traits()
        self.career_streams = self._load_career_streams()
        self.question_bank = self._load_question_bank()
        
    def _load_personality_traits(self) -> List[PersonalityTrait]:
        """Load personality traits for assessment"""
        return [
            PersonalityTrait(
                name="analytical_thinking",
                description="Ability to break down complex problems and think logically",
                weight=1.0,
                keywords=["logic", "analysis", "problem-solving", "systematic", "rational"]
            ),
            PersonalityTrait(
                name="creativity",
                description="Ability to think outside the box and generate innovative ideas",
                weight=1.0,
                keywords=["creative", "innovative", "artistic", "imaginative", "original"]
            ),
            PersonalityTrait(
                name="leadership",
                description="Ability to guide and influence others effectively",
                weight=1.0,
                keywords=["leadership", "management", "influence", "guidance", "direction"]
            ),
            PersonalityTrait(
                name="social_skills",
                description="Ability to interact and communicate effectively with others",
                weight=1.0,
                keywords=["communication", "social", "interpersonal", "teamwork", "collaboration"]
            ),
            PersonalityTrait(
                name="technical_aptitude",
                description="Affinity for technology and technical concepts",
                weight=1.0,
                keywords=["technology", "technical", "programming", "engineering", "digital"]
            ),
            PersonalityTrait(
                name="entrepreneurial_spirit",
                description="Drive to create and manage business ventures",
                weight=1.0,
                keywords=["business", "entrepreneurship", "innovation", "risk-taking", "venture"]
            ),
            PersonalityTrait(
                name="research_orientation",
                description="Interest in investigation and knowledge discovery",
                weight=1.0,
                keywords=["research", "investigation", "discovery", "knowledge", "exploration"]
            ),
            PersonalityTrait(
                name="helping_others",
                description="Motivation to assist and support other people",
                weight=1.0,
                keywords=["helping", "service", "support", "care", "assistance"]
            )
        ]
    
    def _load_career_streams(self) -> List[CareerStream]:
        """Load career streams with their requirements"""
        return [
            CareerStream(
                name="Computer Science & Engineering",
                description="Focus on software development, algorithms, and computer systems",
                required_traits={
                    "analytical_thinking": 0.7,
                    "technical_aptitude": 0.8,
                    "creativity": 0.6
                },
                subjects=["Mathematics", "Physics", "Computer Science"],
                career_paths=["Software Engineer", "Data Scientist", "AI Researcher", "Cybersecurity Analyst"],
                salary_range="₹6-25 LPA",
                growth_prospects="Excellent"
            ),
            CareerStream(
                name="Business Administration",
                description="Focus on management, finance, and business operations",
                required_traits={
                    "leadership": 0.7,
                    "social_skills": 0.6,
                    "entrepreneurial_spirit": 0.7
                },
                subjects=["Economics", "Business Studies", "Mathematics"],
                career_paths=["Business Manager", "Consultant", "Entrepreneur", "Financial Analyst"],
                salary_range="₹5-20 LPA",
                growth_prospects="Very Good"
            ),
            CareerStream(
                name="Medical Sciences",
                description="Focus on healthcare, medicine, and biological sciences",
                required_traits={
                    "analytical_thinking": 0.8,
                    "helping_others": 0.8,
                    "research_orientation": 0.6
                },
                subjects=["Biology", "Chemistry", "Physics"],
                career_paths=["Doctor", "Medical Researcher", "Pharmacist", "Healthcare Administrator"],
                salary_range="₹8-30 LPA",
                growth_prospects="Excellent"
            ),
            CareerStream(
                name="Liberal Arts & Humanities",
                description="Focus on literature, social sciences, and human culture",
                required_traits={
                    "creativity": 0.7,
                    "social_skills": 0.6,
                    "helping_others": 0.6
                },
                subjects=["English", "History", "Political Science", "Psychology"],
                career_paths=["Teacher", "Journalist", "Social Worker", "Content Creator"],
                salary_range="₹3-15 LPA",
                growth_prospects="Good"
            ),
            CareerStream(
                name="Pure Sciences",
                description="Focus on fundamental scientific research and discovery",
                required_traits={
                    "analytical_thinking": 0.8,
                    "research_orientation": 0.8,
                    "technical_aptitude": 0.6
                },
                subjects=["Physics", "Chemistry", "Mathematics", "Biology"],
                career_paths=["Research Scientist", "Lab Technician", "Science Teacher", "R&D Specialist"],
                salary_range="₹4-18 LPA",
                growth_prospects="Good"
            )
        ]
    
    def _load_question_bank(self) -> List[PsychometricQuestion]:
        """Load comprehensive question bank with J&K context"""
        return [
            # Analytical Thinking Questions
            PsychometricQuestion(
                id="analytical_1",
                question="When faced with a complex problem, what is your first approach?",
                question_type="multiple_choice",
                options=[
                    "Break it down into smaller, manageable parts",
                    "Look for creative and unconventional solutions",
                    "Seek advice from others who have faced similar problems",
                    "Research extensively before taking any action"
                ],
                traits_measured=["analytical_thinking"],
                difficulty_level=2
            ),
            PsychometricQuestion(
                id="analytical_2",
                question="You're helping your family plan a budget for the month. How do you approach this task?",
                question_type="scenario",
                scenario="Family budget planning in J&K context",
                options=[
                    "Create detailed categories and track every expense systematically",
                    "Focus on the big expenses and estimate the rest",
                    "Ask family members for their input and preferences first",
                    "Look at previous months' patterns and adjust accordingly"
                ],
                traits_measured=["analytical_thinking", "helping_others"],
                difficulty_level=2
            ),
            
            # Creativity Questions
            PsychometricQuestion(
                id="creativity_1",
                question="Your school is organizing a cultural festival. How would you contribute?",
                question_type="scenario",
                scenario="School cultural festival in J&K",
                options=[
                    "Organize traditional Kashmiri/Dogri performances with modern twists",
                    "Create a systematic schedule and manage logistics efficiently",
                    "Lead a team to coordinate between different cultural groups",
                    "Research and document the cultural significance of each performance"
                ],
                traits_measured=["creativity", "leadership", "research_orientation"],
                difficulty_level=2
            ),
            PsychometricQuestion(
                id="creativity_2",
                question="If you had to explain a complex concept to younger students, you would:",
                question_type="multiple_choice",
                options=[
                    "Create visual aids, stories, or games to make it interesting",
                    "Break it down into logical steps with clear examples",
                    "Encourage group discussions and peer learning",
                    "Provide detailed reading materials and references"
                ],
                traits_measured=["creativity", "helping_others", "social_skills"],
                difficulty_level=2
            ),
            
            # Leadership Questions
            PsychometricQuestion(
                id="leadership_1",
                question="In a group project, you typically:",
                question_type="multiple_choice",
                options=[
                    "Take charge and organize the team's efforts",
                    "Contribute your expertise while supporting the leader",
                    "Focus on your individual tasks and deliverables",
                    "Help mediate conflicts and keep everyone motivated"
                ],
                traits_measured=["leadership", "social_skills"],
                difficulty_level=2
            ),
            PsychometricQuestion(
                id="leadership_2",
                question="Your class is planning a trip to Gulmarg. As a student representative, how do you handle disagreements about the itinerary?",
                question_type="scenario",
                scenario="Class trip planning to Gulmarg",
                options=[
                    "Facilitate a discussion to find a solution that works for everyone",
                    "Research the best options and present a well-planned proposal",
                    "Create innovative alternatives that satisfy different preferences",
                    "Survey everyone's preferences and go with the majority"
                ],
                traits_measured=["leadership", "social_skills", "analytical_thinking"],
                difficulty_level=3
            ),
            
            # Social Skills Questions
            PsychometricQuestion(
                id="social_1",
                question="A new student from a different region joins your class and seems shy. How do you help them feel welcome?",
                question_type="scenario",
                scenario="New student integration",
                options=[
                    "Introduce them to different friend groups and include them in activities",
                    "Share information about local customs and help them understand the culture",
                    "Organize creative ice-breaker activities for the whole class",
                    "Give them space initially and let them approach others when ready"
                ],
                traits_measured=["social_skills", "helping_others", "creativity"],
                difficulty_level=2
            ),
            
            # Technical Aptitude Questions
            PsychometricQuestion(
                id="technical_1",
                question="Your school wants to create a website to showcase student achievements. How would you contribute?",
                question_type="scenario",
                scenario="School website development",
                options=[
                    "Learn web development and build the technical features",
                    "Plan the structure and organize content systematically",
                    "Coordinate between students, teachers, and technical team",
                    "Research best practices and gather requirements from users"
                ],
                traits_measured=["technical_aptitude", "analytical_thinking", "leadership"],
                difficulty_level=3
            ),
            PsychometricQuestion(
                id="technical_2",
                question="When learning a new software or app, you prefer to:",
                question_type="multiple_choice",
                options=[
                    "Experiment with different features and learn by doing",
                    "Follow tutorials step-by-step to understand the basics first",
                    "Ask friends or join online communities for tips and tricks",
                    "Read documentation and understand the underlying concepts"
                ],
                traits_measured=["technical_aptitude", "research_orientation"],
                difficulty_level=2
            ),
            
            # Entrepreneurial Spirit Questions
            PsychometricQuestion(
                id="entrepreneurial_1",
                question="You notice that students in your area need better access to study materials. What would you do?",
                question_type="scenario",
                scenario="Educational resource gap in J&K",
                options=[
                    "Start a small business to provide affordable study materials",
                    "Organize a systematic resource-sharing system among students",
                    "Build a team to create and distribute digital study resources",
                    "Research and document the problem to propose solutions to authorities"
                ],
                traits_measured=["entrepreneurial_spirit", "helping_others", "leadership"],
                difficulty_level=3
            ),
            
            # Research Orientation Questions
            PsychometricQuestion(
                id="research_1",
                question="For a school project on 'Climate Change Impact on Kashmir Valley', your approach would be:",
                question_type="scenario",
                scenario="Climate change research project",
                options=[
                    "Conduct surveys and interviews with local farmers and residents",
                    "Analyze weather data and create systematic comparisons over time",
                    "Organize community discussions and collaborative research sessions",
                    "Study scientific papers and government reports extensively"
                ],
                traits_measured=["research_orientation", "analytical_thinking", "social_skills"],
                difficulty_level=3
            ),
            
            # Helping Others Questions
            PsychometricQuestion(
                id="helping_1",
                question="Your younger sibling is struggling with mathematics. How do you help them?",
                question_type="scenario",
                scenario="Helping family member with studies",
                options=[
                    "Spend time regularly tutoring and encouraging them",
                    "Create a structured study plan and track their progress",
                    "Form a study group with other students facing similar challenges",
                    "Find the best resources and teaching methods for their learning style"
                ],
                traits_measured=["helping_others", "analytical_thinking", "social_skills"],
                difficulty_level=2
            ),
            
            # Mixed Trait Questions
            PsychometricQuestion(
                id="mixed_1",
                question="Your community is facing frequent power cuts affecting students' studies. How would you address this issue?",
                question_type="scenario",
                scenario="Power shortage affecting education in J&K",
                options=[
                    "Organize community meetings to find collective solutions",
                    "Research alternative energy solutions and create a proposal",
                    "Start a student initiative to create mobile study groups",
                    "Document the problem and advocate with local authorities"
                ],
                traits_measured=["leadership", "research_orientation", "helping_others", "entrepreneurial_spirit"],
                difficulty_level=4
            ),
            PsychometricQuestion(
                id="mixed_2",
                question="You want to preserve and promote traditional Kashmiri/Dogri arts among young people. Your strategy would be:",
                question_type="scenario",
                scenario="Cultural preservation initiative",
                options=[
                    "Create modern, engaging content that showcases traditional arts",
                    "Develop a systematic documentation and teaching program",
                    "Build a community of young artists and cultural enthusiasts",
                    "Research the historical significance and create educational materials"
                ],
                traits_measured=["creativity", "leadership", "research_orientation", "helping_others"],
                difficulty_level=4
            ),
            
            # Career-Specific Scenarios
            PsychometricQuestion(
                id="career_tech",
                question="Kashmir is developing its IT sector. How would you contribute to making it a tech hub?",
                question_type="scenario",
                scenario="IT sector development in Kashmir",
                options=[
                    "Develop innovative tech solutions for local problems",
                    "Create systematic training programs for technical skills",
                    "Build networks between local talent and global opportunities",
                    "Research successful tech hub models and adapt them for Kashmir"
                ],
                traits_measured=["technical_aptitude", "entrepreneurial_spirit", "analytical_thinking"],
                difficulty_level=4
            ),
            PsychometricQuestion(
                id="career_business",
                question="Tourism is a major industry in J&K. How would you improve the tourist experience?",
                question_type="scenario",
                scenario="Tourism industry improvement",
                options=[
                    "Start innovative tourism services that showcase local culture",
                    "Develop systematic quality standards and training programs",
                    "Create collaborative networks between local businesses and tourists",
                    "Research tourist preferences and market trends to guide improvements"
                ],
                traits_measured=["entrepreneurial_spirit", "creativity", "analytical_thinking"],
                difficulty_level=4
            )
        ]
    
    def generate_adaptive_questions(self, user_responses: List[UserResponse], 
                                  academic_performance: Dict[str, float],
                                  num_questions: int = 5) -> List[PsychometricQuestion]:
        """
        Generate adaptive questions based on user's previous responses and academic performance
        """
        # Analyze previous responses to identify areas needing more assessment
        trait_confidence = self._calculate_trait_confidence(user_responses)
        response_patterns = self._analyze_response_patterns(user_responses)
        
        # Use AI to generate personalized questions
        generated_questions = []
        
        for i in range(num_questions):
            # Find trait with lowest confidence that needs more assessment
            target_trait = min(trait_confidence.keys(), key=lambda x: trait_confidence[x])
            
            # Generate question using AI with context from previous responses
            question = self._generate_adaptive_ai_question(
                target_trait, 
                academic_performance, 
                response_patterns,
                i+1
            )
            generated_questions.append(question)
            
            # Update confidence (simulate that we'll get more data)
            trait_confidence[target_trait] += 0.2
        
        return generated_questions
    
    def _analyze_response_patterns(self, user_responses: List[UserResponse]) -> Dict[str, Any]:
        """Analyze patterns in user responses for better question generation"""
        if not user_responses:
            return {"response_style": "unknown", "confidence_trend": "neutral", "speed_pattern": "normal"}
        
        # Analyze response timing
        response_times = [r.response_time for r in user_responses if r.response_time]
        avg_response_time = sum(response_times) / len(response_times) if response_times else 15
        
        # Analyze confidence levels
        confidence_levels = [r.confidence_level for r in user_responses if r.confidence_level]
        avg_confidence = sum(confidence_levels) / len(confidence_levels) if confidence_levels else 3
        
        # Determine response style
        response_style = "thoughtful" if avg_response_time > 20 else "quick" if avg_response_time < 10 else "balanced"
        confidence_trend = "high" if avg_confidence > 3.5 else "low" if avg_confidence < 2.5 else "moderate"
        
        # Analyze answer patterns (look for consistent choices)
        answer_positions = []
        for response in user_responses:
            # Find which option position was selected (0-3)
            for question in self.question_bank:
                if question.id == response.question_id and response.response in question.options:
                    answer_positions.append(question.options.index(response.response))
                    break
        
        # Check for response bias (always picking first/last option)
        position_bias = "none"
        if answer_positions:
            first_option_count = answer_positions.count(0)
            last_option_count = answer_positions.count(len(answer_positions) - 1)
            if first_option_count > len(answer_positions) * 0.6:
                position_bias = "first_option"
            elif last_option_count > len(answer_positions) * 0.6:
                position_bias = "last_option"
        
        return {
            "response_style": response_style,
            "confidence_trend": confidence_trend,
            "avg_response_time": avg_response_time,
            "avg_confidence": avg_confidence,
            "position_bias": position_bias,
            "total_responses": len(user_responses)
        }
    
    def _generate_adaptive_ai_question(self, target_trait: str, academic_performance: Dict[str, float], 
                                     response_patterns: Dict[str, Any], question_num: int) -> PsychometricQuestion:
        """Generate AI question with adaptive context based on response patterns"""
        
        # Try Gemini first (primary provider)
        question = self._try_adaptive_gemini_generation(target_trait, academic_performance, response_patterns, question_num)
        if question:
            return question
        
        # Fallback to regular AI generation
        return self._generate_ai_question(target_trait, academic_performance, question_num)
    
    def _try_adaptive_gemini_generation(self, target_trait: str, academic_performance: Dict[str, float], 
                                      response_patterns: Dict[str, Any], question_num: int) -> Optional[PsychometricQuestion]:
        """Generate adaptive question using Gemini with response pattern analysis"""
        if not os.getenv("GOOGLE_API_KEY"):
            return None
            
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
            model = genai.GenerativeModel(os.getenv("GEMINI_MODEL", "gemini-1.5-flash"))
            
            # Build adaptive context
            strong_subjects = [subj for subj, score in academic_performance.items() if score > 75]
            avg_score = sum(academic_performance.values()) / len(academic_performance) if academic_performance else 70
            
            # Adapt question style based on response patterns
            style_adaptations = {
                "thoughtful": "Create a deeper, more analytical scenario that rewards careful consideration",
                "quick": "Create a clear, straightforward scenario with distinct options",
                "balanced": "Create a moderate complexity scenario"
            }
            
            confidence_adaptations = {
                "high": "Create a more challenging scenario to better differentiate abilities",
                "low": "Create a supportive, confidence-building scenario with clear distinctions",
                "moderate": "Create a balanced scenario"
            }
            
            style_instruction = style_adaptations.get(response_patterns.get("response_style", "balanced"))
            confidence_instruction = confidence_adaptations.get(response_patterns.get("confidence_trend", "moderate"))
            
            # Handle position bias
            bias_instruction = ""
            if response_patterns.get("position_bias") == "first_option":
                bias_instruction = "Make sure the best answer is NOT the first option to avoid selection bias."
            elif response_patterns.get("position_bias") == "last_option":
                bias_instruction = "Make sure the best answer is NOT the last option to avoid selection bias."
            
            prompt = f"""You are creating an adaptive psychometric question for a J&K student.

Student Analysis:
- Academic Level: {avg_score:.0f}% average
- Strong subjects: {', '.join(strong_subjects) if strong_subjects else 'General'}
- Response Style: {response_patterns.get('response_style', 'balanced')} (avg {response_patterns.get('avg_response_time', 15):.1f}s per question)
- Confidence Level: {response_patterns.get('confidence_trend', 'moderate')} (avg {response_patterns.get('avg_confidence', 3):.1f}/5)
- Previous Responses: {response_patterns.get('total_responses', 0)}

Target Trait: {target_trait.replace('_', ' ')}

Instructions:
1. {style_instruction}
2. {confidence_instruction}
3. Use J&K context (Kashmir Valley, Jammu region, local culture, education system)
4. {bias_instruction}
5. Make it relevant to their academic strengths

Create a practical scenario with 4 distinct options that clearly measure {target_trait.replace('_', ' ')}.

Return ONLY this JSON:
{{
  "question": "Your adaptive question here",
  "options": ["Option A", "Option B", "Option C", "Option D"],
  "scenario": "Brief context if needed"
}}"""
            
            generation_config = genai.types.GenerationConfig(
                temperature=0.8,  # Slightly higher for more creative adaptive questions
                max_output_tokens=350,
                top_p=0.9,
                top_k=40
            )
            
            response = model.generate_content(prompt, generation_config=generation_config)
            
            # Parse response
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:-3]
            elif response_text.startswith("```"):
                response_text = response_text[3:-3]
            
            ai_response = json.loads(response_text)
            
            # Validate response
            if not all(key in ai_response for key in ["question", "options"]):
                raise ValueError("Invalid response structure")
            
            if len(ai_response["options"]) != 4:
                raise ValueError("Must have exactly 4 options")
            
            return PsychometricQuestion(
                id=f"adaptive_gemini_{target_trait}_{question_num}",
                question=ai_response["question"],
                question_type="scenario" if ai_response.get("scenario") else "multiple_choice",
                options=ai_response["options"],
                traits_measured=[target_trait],
                difficulty_level=4,  # Adaptive questions are more sophisticated
                scenario=ai_response.get("scenario"),
                context=f"Adaptive for {response_patterns.get('response_style')} responder with {response_patterns.get('confidence_trend')} confidence"
            )
            
        except Exception as e:
            print(f"Adaptive Gemini generation failed: {e}")
            return None
    
    def _generate_ai_question(self, target_trait: str, academic_performance: Dict[str, float], 
                            question_num: int) -> PsychometricQuestion:
        """Generate a question using AI based on target trait and academic performance"""
        
        # Try multiple AI providers in order of preference
        ai_providers = [
            self._try_openai_generation,
            self._try_gemini_generation,
            self._try_local_generation
        ]
        
        for provider in ai_providers:
            try:
                question = provider(target_trait, academic_performance, question_num)
                if question:
                    return question
            except Exception as e:
                print(f"AI provider failed: {e}")
                continue
        
        # If all AI providers fail, use fallback
        return self._get_fallback_question(target_trait, question_num)
    
    def _try_openai_generation(self, target_trait: str, academic_performance: Dict[str, float], 
                              question_num: int) -> Optional[PsychometricQuestion]:
        """Try generating question using OpenAI GPT"""
        if not os.getenv("OPENAI_API_KEY"):
            return None
            
        strong_subjects = [subj for subj, score in academic_performance.items() if score > 80]
        weak_subjects = [subj for subj, score in academic_performance.items() if score < 60]
        
        prompt = f"""
        Generate a psychometric question to assess {target_trait} for a student from Jammu & Kashmir with:
        - Strong subjects: {', '.join(strong_subjects) if strong_subjects else 'None specified'}
        - Weak subjects: {', '.join(weak_subjects) if weak_subjects else 'None specified'}
        
        The question should:
        1. Be relevant to Indian students (especially J&K region)
        2. Have 4 multiple choice options
        3. Be scenario-based and practical
        4. Help assess {target_trait}
        5. Use simple, clear language
        
        Return ONLY a JSON object with: {{"question": "...", "options": ["...", "...", "...", "..."], "scenario": "..." (optional)}}
        """
        
        try:
            import openai
            openai.api_key = os.getenv("OPENAI_API_KEY")
            
            response = openai.ChatCompletion.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=400,
                temperature=0.7
            )
            
            ai_response = json.loads(response.choices[0].message.content)
            
            return PsychometricQuestion(
                id=f"openai_{target_trait}_{question_num}",
                question=ai_response["question"],
                question_type="scenario" if "scenario" in ai_response else "multiple_choice",
                options=ai_response["options"],
                traits_measured=[target_trait],
                difficulty_level=3,
                scenario=ai_response.get("scenario")
            )
            
        except Exception as e:
            print(f"OpenAI generation failed: {e}")
            return None
    
    def _try_gemini_generation(self, target_trait: str, academic_performance: Dict[str, float], 
                              question_num: int) -> Optional[PsychometricQuestion]:
        """Try generating question using Google Gemini Flash (optimized for speed)"""
        if not os.getenv("GOOGLE_API_KEY"):
            return None
            
        try:
            import google.generativeai as genai
            
            genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
            
            # Use Gemini 1.5 Flash for faster responses
            model_name = os.getenv("GEMINI_MODEL", "gemini-1.5-flash")
            model = genai.GenerativeModel(model_name)
            
            # Analyze academic performance for better context
            strong_subjects = [subj for subj, score in academic_performance.items() if score > 75]
            average_subjects = [subj for subj, score in academic_performance.items() if 60 <= score <= 75]
            weak_subjects = [subj for subj, score in academic_performance.items() if score < 60]
            
            # Calculate overall academic trend
            avg_score = sum(academic_performance.values()) / len(academic_performance) if academic_performance else 70
            academic_level = "high" if avg_score > 80 else "average" if avg_score > 60 else "developing"
            
            # Create contextual prompt based on trait and academic profile
            context_prompts = {
                "analytical_thinking": f"Create a logical problem-solving scenario relevant to a {academic_level}-performing student",
                "creativity": f"Design a creative challenge that connects to their interests in {', '.join(strong_subjects[:2]) if strong_subjects else 'general studies'}",
                "leadership": "Create a leadership scenario in an Indian school/college context",
                "social_skills": "Design a social interaction scenario relevant to J&K students",
                "technical_aptitude": f"Create a technology-related scenario, considering their {'strong' if 'Computer Science' in strong_subjects or 'Mathematics' in strong_subjects else 'developing'} technical background",
                "entrepreneurial_spirit": "Design a business/innovation scenario relevant to J&K's economy (tourism, agriculture, handicrafts)",
                "research_orientation": f"Create a research/investigation scenario using their strength in {strong_subjects[0] if strong_subjects else 'general studies'}",
                "helping_others": "Design a community service scenario relevant to J&K social context"
            }
            
            specific_context = context_prompts.get(target_trait, "Create a relevant scenario")
            
            prompt = f"""You are creating a psychometric question for a student from Jammu & Kashmir.

Student Profile:
- Academic Level: {academic_level} (average: {avg_score:.0f}%)
- Strong subjects: {', '.join(strong_subjects) if strong_subjects else 'None identified'}
- Areas for improvement: {', '.join(weak_subjects) if weak_subjects else 'None identified'}

Task: {specific_context} to assess {target_trait.replace('_', ' ')}.

Requirements:
1. Make it relatable to J&K students (use local context like Srinagar, Kashmir Valley, local culture)
2. Create 4 realistic options that clearly differentiate the trait
3. Keep language simple and clear
4. Make it practical, not theoretical

Return ONLY this JSON format:
{{
  "question": "Your question here",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "scenario": "Brief context if needed"
}}"""
            
            # Configure generation for speed
            generation_config = genai.types.GenerationConfig(
                temperature=float(os.getenv("GEMINI_TEMPERATURE", "0.7")),
                max_output_tokens=int(os.getenv("GEMINI_MAX_TOKENS", "300")),
                top_p=0.8,
                top_k=40
            )
            
            response = model.generate_content(
                prompt,
                generation_config=generation_config
            )
            
            # Clean and parse response
            response_text = response.text.strip()
            if response_text.startswith("```json"):
                response_text = response_text[7:-3]
            elif response_text.startswith("```"):
                response_text = response_text[3:-3]
            
            ai_response = json.loads(response_text)
            
            # Validate response structure
            if not all(key in ai_response for key in ["question", "options"]):
                raise ValueError("Invalid response structure")
            
            if len(ai_response["options"]) != 4:
                raise ValueError("Must have exactly 4 options")
            
            return PsychometricQuestion(
                id=f"gemini_flash_{target_trait}_{question_num}",
                question=ai_response["question"],
                question_type="scenario" if ai_response.get("scenario") else "multiple_choice",
                options=ai_response["options"],
                traits_measured=[target_trait],
                difficulty_level=3,
                scenario=ai_response.get("scenario"),
                context=f"Generated for {academic_level} student with strengths in {', '.join(strong_subjects[:2]) if strong_subjects else 'general areas'}"
            )
            
        except json.JSONDecodeError as e:
            print(f"Gemini JSON parsing failed: {e}")
            print(f"Raw response: {response.text if 'response' in locals() else 'No response'}")
            return None
        except Exception as e:
            print(f"Gemini generation failed: {e}")
            return None
    
    def _try_local_generation(self, target_trait: str, academic_performance: Dict[str, float], 
                             question_num: int) -> Optional[PsychometricQuestion]:
        """Try generating question using local LLM (placeholder for future implementation)"""
        # This could be implemented with Ollama, Llama.cpp, or similar
        # For now, return None to fall back to predefined questions
        return None
    
    def _get_fallback_question(self, target_trait: str, question_num: int) -> PsychometricQuestion:
        """Fallback questions when AI generation fails"""
        fallback_questions = {
            "analytical_thinking": PsychometricQuestion(
                id=f"fallback_analytical_{question_num}",
                question="How do you approach learning a new concept?",
                question_type="multiple_choice",
                options=[
                    "Break it into logical steps and practice systematically",
                    "Find creative ways to connect it to things I already know",
                    "Discuss it with others to get different perspectives",
                    "Research extensively and gather multiple sources"
                ],
                traits_measured=["analytical_thinking"],
                difficulty_level=2
            ),
            "creativity": PsychometricQuestion(
                id=f"fallback_creativity_{question_num}",
                question="When working on a project, you prefer to:",
                question_type="multiple_choice",
                options=[
                    "Follow established methods and best practices",
                    "Experiment with new and innovative approaches",
                    "Collaborate with others to combine different ideas",
                    "Research thoroughly before starting"
                ],
                traits_measured=["creativity"],
                difficulty_level=2
            )
        }
        
        return fallback_questions.get(target_trait, self.question_bank[0])
    
    def _calculate_trait_confidence(self, responses: List[UserResponse]) -> Dict[str, float]:
        """Calculate confidence level for each trait based on responses"""
        trait_confidence = {trait.name: 0.1 for trait in self.personality_traits}
        
        for response in responses:
            # Find question and update confidence for measured traits
            question = next((q for q in self.question_bank if q.id == response.question_id), None)
            if question:
                confidence_boost = 0.3 if response.confidence_level and response.confidence_level > 3 else 0.2
                for trait in question.traits_measured:
                    trait_confidence[trait] = min(1.0, trait_confidence[trait] + confidence_boost)
        
        return trait_confidence
    
    def analyze_responses(self, responses: List[UserResponse], 
                         academic_performance: Dict[str, float]) -> PersonalityProfile:
        """
        Analyze user responses to create personality profile and recommendations
        """
        # Calculate trait scores
        trait_scores = self._calculate_trait_scores(responses)
        
        # Determine learning style
        learning_style = self._determine_learning_style(trait_scores, academic_performance)
        
        # Calculate work preferences
        work_preferences = self._calculate_work_preferences(trait_scores)
        
        # Extract interests and strengths
        interests = self._extract_interests(trait_scores, academic_performance)
        strengths = self._identify_strengths(trait_scores)
        areas_for_development = self._identify_development_areas(trait_scores)
        
        # Generate stream recommendations
        recommended_streams = self._recommend_streams(trait_scores, academic_performance)
        
        # Calculate overall confidence
        confidence_score = self._calculate_confidence_score(responses, trait_scores)
        
        return PersonalityProfile(
            user_id="",  # Will be set by caller
            trait_scores=trait_scores,
            learning_style=learning_style,
            work_preferences=work_preferences,
            interests=interests,
            strengths=strengths,
            areas_for_development=areas_for_development,
            recommended_streams=recommended_streams,
            confidence_score=confidence_score
        )
    
    def _calculate_trait_scores(self, responses: List[UserResponse]) -> Dict[str, float]:
        """Calculate scores for each personality trait"""
        trait_scores = {trait.name: 0.0 for trait in self.personality_traits}
        trait_counts = {trait.name: 0 for trait in self.personality_traits}
        
        for response in responses:
            question = next((q for q in self.question_bank if q.id == response.question_id), None)
            if not question:
                continue
                
            # Simple scoring based on option selection
            option_index = question.options.index(response.response) if response.response in question.options else 0
            base_score = (option_index + 1) / len(question.options)  # Normalize to 0-1
            
            # Adjust score based on response time and confidence
            time_factor = min(1.0, 30.0 / max(response.response_time, 5.0))  # Faster responses get slight boost
            confidence_factor = (response.confidence_level or 3) / 5.0
            
            adjusted_score = base_score * 0.7 + time_factor * 0.1 + confidence_factor * 0.2
            
            for trait in question.traits_measured:
                trait_scores[trait] += adjusted_score
                trait_counts[trait] += 1
        
        # Average the scores
        for trait in trait_scores:
            if trait_counts[trait] > 0:
                trait_scores[trait] /= trait_counts[trait]
            else:
                trait_scores[trait] = 0.5  # Default neutral score
        
        return trait_scores
    
    def _determine_learning_style(self, trait_scores: Dict[str, float], 
                                academic_performance: Dict[str, float]) -> str:
        """Determine learning style based on traits and academic performance"""
        if trait_scores["analytical_thinking"] > 0.7:
            return "Logical/Mathematical"
        elif trait_scores["creativity"] > 0.7:
            return "Visual/Creative"
        elif trait_scores["social_skills"] > 0.7:
            return "Social/Interpersonal"
        elif trait_scores["technical_aptitude"] > 0.7:
            return "Kinesthetic/Hands-on"
        else:
            return "Multimodal"
    
    def _calculate_work_preferences(self, trait_scores: Dict[str, float]) -> Dict[str, float]:
        """Calculate work environment and style preferences"""
        return {
            "team_work": (trait_scores["social_skills"] + trait_scores["leadership"]) / 2,
            "independent_work": trait_scores["analytical_thinking"],
            "creative_work": trait_scores["creativity"],
            "structured_work": trait_scores["analytical_thinking"],
            "helping_others": trait_scores["helping_others"],
            "leadership_roles": trait_scores["leadership"],
            "technical_work": trait_scores["technical_aptitude"],
            "research_work": trait_scores["research_orientation"]
        }
    
    def _extract_interests(self, trait_scores: Dict[str, float], 
                          academic_performance: Dict[str, float]) -> List[str]:
        """Extract interests based on traits and academic performance"""
        interests = []
        
        # Based on high trait scores
        if trait_scores["technical_aptitude"] > 0.6:
            interests.append("Technology and Innovation")
        if trait_scores["creativity"] > 0.6:
            interests.append("Arts and Design")
        if trait_scores["helping_others"] > 0.6:
            interests.append("Social Service and Healthcare")
        if trait_scores["entrepreneurial_spirit"] > 0.6:
            interests.append("Business and Entrepreneurship")
        if trait_scores["research_orientation"] > 0.6:
            interests.append("Research and Discovery")
        
        # Based on academic performance
        strong_subjects = [subj for subj, score in academic_performance.items() if score > 75]
        if "Mathematics" in strong_subjects or "Physics" in strong_subjects:
            interests.append("STEM Fields")
        if "English" in strong_subjects or "Literature" in strong_subjects:
            interests.append("Language and Communication")
        
        return interests[:5]  # Limit to top 5
    
    def _identify_strengths(self, trait_scores: Dict[str, float]) -> List[str]:
        """Identify top strengths based on trait scores"""
        sorted_traits = sorted(trait_scores.items(), key=lambda x: x[1], reverse=True)
        
        strength_mapping = {
            "analytical_thinking": "Problem-solving and logical reasoning",
            "creativity": "Creative thinking and innovation",
            "leadership": "Leadership and team management",
            "social_skills": "Communication and interpersonal skills",
            "technical_aptitude": "Technical and digital skills",
            "entrepreneurial_spirit": "Business acumen and risk-taking",
            "research_orientation": "Research and analytical skills",
            "helping_others": "Empathy and service orientation"
        }
        
        return [strength_mapping[trait] for trait, score in sorted_traits[:3] if score > 0.6]
    
    def _identify_development_areas(self, trait_scores: Dict[str, float]) -> List[str]:
        """Identify areas for development based on lower trait scores"""
        sorted_traits = sorted(trait_scores.items(), key=lambda x: x[1])
        
        development_mapping = {
            "analytical_thinking": "Logical reasoning and problem-solving",
            "creativity": "Creative thinking and innovation",
            "leadership": "Leadership and management skills",
            "social_skills": "Communication and teamwork",
            "technical_aptitude": "Technical and digital literacy",
            "entrepreneurial_spirit": "Business and entrepreneurial skills",
            "research_orientation": "Research and investigation skills",
            "helping_others": "Empathy and service orientation"
        }
        
        return [development_mapping[trait] for trait, score in sorted_traits[:2] if score < 0.4]
    
    def _recommend_streams(self, trait_scores: Dict[str, float], 
                          academic_performance: Dict[str, float]) -> List[Dict[str, Any]]:
        """Recommend career streams based on trait scores and academic performance"""
        recommendations = []
        
        for stream in self.career_streams:
            # Calculate match score
            trait_match = 0.0
            trait_count = 0
            
            for trait, required_score in stream.required_traits.items():
                if trait in trait_scores:
                    # Score based on how well user meets requirement
                    user_score = trait_scores[trait]
                    if user_score >= required_score:
                        trait_match += min(1.0, user_score / required_score)
                    else:
                        trait_match += user_score / required_score * 0.7  # Penalty for not meeting requirement
                    trait_count += 1
            
            if trait_count > 0:
                trait_match /= trait_count
            
            # Calculate academic match
            academic_match = 0.0
            academic_count = 0
            
            for subject in stream.subjects:
                if subject in academic_performance:
                    academic_match += academic_performance[subject] / 100.0
                    academic_count += 1
            
            if academic_count > 0:
                academic_match /= academic_count
            else:
                academic_match = 0.5  # Neutral if no academic data
            
            # Combined match score (70% traits, 30% academics)
            overall_match = trait_match * 0.7 + academic_match * 0.3
            
            recommendations.append({
                "stream": stream.name,
                "description": stream.description,
                "match_percentage": round(overall_match * 100, 1),
                "trait_match": round(trait_match * 100, 1),
                "academic_match": round(academic_match * 100, 1),
                "career_paths": stream.career_paths,
                "salary_range": stream.salary_range,
                "growth_prospects": stream.growth_prospects,
                "required_subjects": stream.subjects
            })
        
        # Sort by match percentage and return top recommendations
        recommendations.sort(key=lambda x: x["match_percentage"], reverse=True)
        return recommendations[:5]
    
    def _calculate_confidence_score(self, responses: List[UserResponse], 
                                  trait_scores: Dict[str, float]) -> float:
        """Calculate overall confidence in the assessment"""
        if not responses:
            return 0.0
        
        # Factors affecting confidence
        response_count_factor = min(1.0, len(responses) / 15.0)  # More responses = higher confidence
        
        # Consistency in responses (lower variance = higher confidence)
        avg_confidence = sum(r.confidence_level or 3 for r in responses) / len(responses) / 5.0
        
        # Response time consistency (not too fast, not too slow)
        avg_time = sum(r.response_time for r in responses) / len(responses)
        time_factor = 1.0 - abs(avg_time - 15.0) / 30.0  # Optimal around 15 seconds
        time_factor = max(0.3, min(1.0, time_factor))
        
        # Trait score distribution (balanced scores indicate thoughtful responses)
        trait_variance = np.var(list(trait_scores.values()))
        distribution_factor = 1.0 - min(0.5, trait_variance * 2)
        
        overall_confidence = (
            response_count_factor * 0.3 +
            avg_confidence * 0.3 +
            time_factor * 0.2 +
            distribution_factor * 0.2
        )
        
        return round(overall_confidence, 2)

# Initialize the AI system
psychometric_ai = PsychometricAI()