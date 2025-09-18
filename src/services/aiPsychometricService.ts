// AI Psychometric Service
// Handles communication with Python AI backend for psychometric assessments

const AI_BACKEND_URL = 'http://localhost:8000';

export interface PsychometricQuestion {
  id: string;
  question: string;
  question_type: 'multiple_choice' | 'likert_scale' | 'scenario' | 'ranking';
  options: string[];
  traits_measured: string[];
  difficulty_level: number;
  context?: string;
  scenario?: string;
}

export interface UserResponse {
  question_id: string;
  response: string;
  response_time: number;
  confidence_level?: number;
}

export interface PersonalityProfile {
  user_id: string;
  trait_scores: Record<string, number>;
  learning_style: string;
  work_preferences: Record<string, number>;
  interests: string[];
  strengths: string[];
  areas_for_development: string[];
  recommended_streams: StreamRecommendation[];
  confidence_score: number;
}

export interface StreamRecommendation {
  stream: string;
  description: string;
  match_percentage: number;
  trait_match: number;
  academic_match: number;
  career_paths: string[];
  salary_range: string;
  growth_prospects: string;
  required_subjects: string[];
}

class AIPsychometricService {
  private baseUrl: string;

  constructor() {
    this.baseUrl = AI_BACKEND_URL;
  }

  async generateAdaptiveQuestions(
    userId: string,
    academicPerformance: Record<string, number>,
    previousResponses: UserResponse[] = [],
    numQuestions: number = 10
  ): Promise<PsychometricQuestion[]> {
    try {
      const response = await fetch(`${this.baseUrl}/generate-adaptive-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          academic_performance: academicPerformance,
          previous_responses: previousResponses,
          num_questions: numQuestions,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to generate questions: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error generating adaptive questions:', error);
      throw error;
    }
  }

  async submitAssessment(
    userId: string,
    responses: UserResponse[],
    academicPerformance: Record<string, number>
  ): Promise<{ success: boolean; assessment_id: string; profile: PersonalityProfile }> {
    try {
      const response = await fetch(`${this.baseUrl}/analyze-psychometric-responses`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          responses: responses,
          academic_performance: academicPerformance,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to submit assessment: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error submitting assessment:', error);
      throw error;
    }
  }

  async getUserProfile(userId: string): Promise<PersonalityProfile | null> {
    try {
      const response = await fetch(`${this.baseUrl}/get-user-profile/${userId}`);

      if (response.status === 404) {
        return null; // No profile found
      }

      if (!response.ok) {
        throw new Error(`Failed to get user profile: ${response.statusText}`);
      }

      const data = await response.json();
      return data.profile;
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  async getStreamRecommendations(
    userId: string,
    traitScores: Record<string, number>,
    academicPerformance: Record<string, number>
  ): Promise<StreamRecommendation[]> {
    try {
      const response = await fetch(`${this.baseUrl}/get-stream-recommendations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          trait_scores: traitScores,
          academic_performance: academicPerformance,
        }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get recommendations: ${response.statusText}`);
      }

      const data = await response.json();
      return data.recommendations;
    } catch (error) {
      console.error('Error getting stream recommendations:', error);
      throw error;
    }
  }
}

export const aiPsychometricService = new AIPsychometricService();