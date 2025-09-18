// AI Psychometric Service
// Handles communication with Python AI backend for psychometric assessments

import { offlineCache } from '../utils/offlineCache';

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
    // Check for cached questions first (for offline/low connectivity)
    if (!offlineCache.isOnline()) {
      console.log('📡 Offline mode - using cached or fallback questions');
      const cachedQuestions = offlineCache.getCachedQuestions(userId);
      if (cachedQuestions && cachedQuestions.length >= numQuestions) {
        return cachedQuestions.slice(0, numQuestions);
      }

      // Use fallback questions if no cache available
      const fallbackQuestions = offlineCache.getFallbackQuestions();
      console.log('📦 Using fallback questions for offline mode');
      return fallbackQuestions.slice(0, numQuestions);
    }

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

      const questions = await response.json();

      // Cache questions for offline use
      offlineCache.cacheQuestions(userId, questions);

      return questions;
    } catch (error) {
      console.error('Error generating adaptive questions:', error);

      // Fallback to cached questions if available
      const cachedQuestions = offlineCache.getCachedQuestions(userId);
      if (cachedQuestions && cachedQuestions.length > 0) {
        console.log('📦 Using cached questions due to network error');
        return cachedQuestions.slice(0, numQuestions);
      }

      // Last resort: use fallback questions
      console.log('📦 Using fallback questions due to network error');
      return offlineCache.getFallbackQuestions().slice(0, numQuestions);
    }
  }

  async submitAssessment(
    userId: string,
    responses: UserResponse[],
    academicPerformance: Record<string, number>
  ): Promise<{ success: boolean; assessment_id: string; profile: PersonalityProfile }> {
    // Cache responses for offline submission
    responses.forEach(response => {
      offlineCache.cacheResponse(userId, response);
    });

    if (!offlineCache.isOnline()) {
      console.log('📡 Offline mode - responses cached for later submission');

      // Generate a basic offline profile
      const offlineProfile: PersonalityProfile = {
        user_id: userId,
        trait_scores: this.generateOfflineTraitScores(responses),
        learning_style: 'Mixed Learning Style',
        work_preferences: { 'teamwork': 0.6, 'independence': 0.5, 'leadership': 0.4 },
        interests: ['Technology', 'Problem Solving', 'Communication'],
        strengths: ['Analytical Thinking', 'Creativity'],
        areas_for_development: ['Leadership Skills', 'Technical Knowledge'],
        recommended_streams: [],
        confidence_score: 0.75
      };

      offlineCache.cacheProfile(offlineProfile);

      return {
        success: true,
        assessment_id: `offline_${Date.now()}`,
        profile: offlineProfile
      };
    }

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

      const result = await response.json();

      // Cache the profile
      if (result.profile) {
        offlineCache.cacheProfile(result.profile);
      }

      // Clear cached responses after successful submission
      offlineCache.clearCachedResponses(userId);

      return result;
    } catch (error) {
      console.error('Error submitting assessment:', error);

      // Try to use cached profile if available
      const cachedProfile = offlineCache.getCachedProfile(userId);
      if (cachedProfile) {
        console.log('📦 Using cached profile due to network error');
        return {
          success: true,
          assessment_id: `cached_${Date.now()}`,
          profile: cachedProfile
        };
      }

      throw error;
    }
  }

  private generateOfflineTraitScores(responses: UserResponse[]): Record<string, number> {
    // Simple offline scoring algorithm
    const traits = [
      'analytical_thinking', 'creativity', 'leadership', 'social_skills',
      'technical_aptitude', 'entrepreneurial_spirit', 'research_orientation', 'helping_others'
    ];

    const scores: Record<string, number> = {};

    traits.forEach(trait => {
      // Generate varied scores based on responses
      const relevantResponses = responses.filter(r =>
        r.question_id.includes(trait.split('_')[0])
      );

      if (relevantResponses.length > 0) {
        const avgResponseTime = relevantResponses.reduce((sum, r) => sum + r.response_time, 0) / relevantResponses.length;
        const avgConfidence = relevantResponses.reduce((sum, r) => sum + (r.confidence_level || 3), 0) / relevantResponses.length;

        // Score based on response patterns
        let score = 0.5; // Base score

        // Faster responses might indicate confidence
        if (avgResponseTime < 15) score += 0.1;
        if (avgResponseTime > 30) score -= 0.05;

        // Higher confidence increases score
        score += (avgConfidence - 3) * 0.1;

        // Add some randomness to avoid identical scores
        score += (Math.random() - 0.5) * 0.2;

        scores[trait] = Math.max(0.2, Math.min(0.9, score));
      } else {
        // Random score between 0.3-0.7 for traits without specific responses
        scores[trait] = 0.3 + Math.random() * 0.4;
      }
    });

    return scores;
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
      
      // Return the profile with proper structure
      if (data.success && data.profile) {
        return {
          user_id: data.profile.user_id,
          trait_scores: data.profile.trait_scores || {},
          learning_style: data.profile.learning_style || 'Mixed',
          work_preferences: data.profile.work_preferences || {},
          interests: data.profile.interests || [],
          strengths: data.profile.strengths || [],
          areas_for_development: data.profile.areas_for_development || [],
          recommended_streams: data.profile.recommended_streams || [],
          confidence_score: data.profile.confidence_score || 0.5
        };
      }
      
      return null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null; // Return null instead of throwing to allow graceful handling
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

  // Sync cached data when connection is restored
  async syncOfflineData(userId: string): Promise<void> {
    if (!offlineCache.isOnline()) {
      console.log('📡 Still offline - cannot sync');
      return;
    }

    try {
      await offlineCache.syncCachedData(userId);
      console.log('✅ Offline data synced successfully');
    } catch (error) {
      console.error('❌ Failed to sync offline data:', error);
    }
  }

  // Get cache statistics
  getCacheStats(): any {
    return offlineCache.getCacheStats();
  }

  // Get user's latest stream recommendations
  async getUserRecommendations(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/get-user-recommendations/${userId}`);
      
      if (response.status === 404) {
        return null; // No recommendations found
      }

      if (!response.ok) {
        throw new Error(`Failed to get recommendations: ${response.statusText}`);
      }

      const data = await response.json();
      return data.success ? data.recommendations : null;
    } catch (error) {
      console.error('Error getting user recommendations:', error);
      return null;
    }
  }

  // Get user's recommendation history
  async getUserRecommendationHistory(userId: string): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/get-user-recommendation-history/${userId}`);
      
      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`Failed to get recommendation history: ${response.statusText}`);
      }

      const data = await response.json();
      return data.success ? data : null;
    } catch (error) {
      console.error('Error getting recommendation history:', error);
      return null;
    }
  }

  // Update user recommendations (for retaking assessments)
  async updateUserRecommendations(
    userId: string,
    traitScores: Record<string, number>,
    academicPerformance: Record<string, number>
  ): Promise<any> {
    try {
      const response = await fetch(`${this.baseUrl}/update-user-recommendations`, {
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
        throw new Error(`Failed to update recommendations: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating recommendations:', error);
      throw error;
    }
  }
}

export const aiPsychometricService = new AIPsychometricService();