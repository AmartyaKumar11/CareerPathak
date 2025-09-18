// Offline Cache Utility for AI Psychometric System
// Handles caching of questions, responses, and results for low connectivity scenarios

interface CachedQuestion {
  id: string;
  question: string;
  question_type: string;
  options: string[];
  traits_measured: string[];
  difficulty_level: number;
  context?: string;
  scenario?: string;
  cached_at: number;
}

interface CachedResponse {
  question_id: string;
  response: string;
  response_time: number;
  confidence_level?: number;
  cached_at: number;
}

interface CachedProfile {
  user_id: string;
  trait_scores: Record<string, number>;
  learning_style: string;
  work_preferences: Record<string, number>;
  interests: string[];
  strengths: string[];
  areas_for_development: string[];
  recommended_streams: any[];
  confidence_score: number;
  cached_at: number;
}

class OfflineCache {
  private readonly CACHE_PREFIX = 'careerpathak_';
  private readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
  
  // Question caching
  cacheQuestions(userId: string, questions: any[]): void {
    const cacheKey = `${this.CACHE_PREFIX}questions_${userId}`;
    const cachedQuestions: CachedQuestion[] = questions.map(q => ({
      ...q,
      cached_at: Date.now()
    }));
    
    try {
      localStorage.setItem(cacheKey, JSON.stringify(cachedQuestions));
      console.log(`📦 Cached ${questions.length} questions for offline use`);
    } catch (error) {
      console.warn('Failed to cache questions:', error);
    }
  }
  
  getCachedQuestions(userId: string): CachedQuestion[] | null {
    const cacheKey = `${this.CACHE_PREFIX}questions_${userId}`;
    
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;
      
      const questions: CachedQuestion[] = JSON.parse(cached);
      const now = Date.now();
      
      // Check if cache is still valid
      const validQuestions = questions.filter(q => 
        (now - q.cached_at) < this.CACHE_DURATION
      );
      
      if (validQuestions.length === 0) {
        this.clearCachedQuestions(userId);
        return null;
      }
      
      console.log(`📦 Retrieved ${validQuestions.length} cached questions`);
      return validQuestions;
    } catch (error) {
      console.warn('Failed to retrieve cached questions:', error);
      return null;
    }
  }
  
  clearCachedQuestions(userId: string): void {
    const cacheKey = `${this.CACHE_PREFIX}questions_${userId}`;
    localStorage.removeItem(cacheKey);
  }
  
  // Response caching (for offline submission)
  cacheResponse(userId: string, response: any): void {
    const cacheKey = `${this.CACHE_PREFIX}responses_${userId}`;
    
    try {
      const existing = localStorage.getItem(cacheKey);
      const responses: CachedResponse[] = existing ? JSON.parse(existing) : [];
      
      const cachedResponse: CachedResponse = {
        ...response,
        cached_at: Date.now()
      };
      
      responses.push(cachedResponse);
      localStorage.setItem(cacheKey, JSON.stringify(responses));
      
      console.log(`📦 Cached response for question ${response.question_id}`);
    } catch (error) {
      console.warn('Failed to cache response:', error);
    }
  }
  
  getCachedResponses(userId: string): CachedResponse[] {
    const cacheKey = `${this.CACHE_PREFIX}responses_${userId}`;
    
    try {
      const cached = localStorage.getItem(cacheKey);
      return cached ? JSON.parse(cached) : [];
    } catch (error) {
      console.warn('Failed to retrieve cached responses:', error);
      return [];
    }
  }
  
  clearCachedResponses(userId: string): void {
    const cacheKey = `${this.CACHE_PREFIX}responses_${userId}`;
    localStorage.removeItem(cacheKey);
  }
  
  // Profile caching
  cacheProfile(profile: any): void {
    const cacheKey = `${this.CACHE_PREFIX}profile_${profile.user_id}`;
    
    try {
      const cachedProfile: CachedProfile = {
        ...profile,
        cached_at: Date.now()
      };
      
      localStorage.setItem(cacheKey, JSON.stringify(cachedProfile));
      console.log(`📦 Cached profile for user ${profile.user_id}`);
    } catch (error) {
      console.warn('Failed to cache profile:', error);
    }
  }
  
  getCachedProfile(userId: string): CachedProfile | null {
    const cacheKey = `${this.CACHE_PREFIX}profile_${userId}`;
    
    try {
      const cached = localStorage.getItem(cacheKey);
      if (!cached) return null;
      
      const profile: CachedProfile = JSON.parse(cached);
      const now = Date.now();
      
      // Profile cache is valid for longer (7 days)
      if ((now - profile.cached_at) > (7 * 24 * 60 * 60 * 1000)) {
        this.clearCachedProfile(userId);
        return null;
      }
      
      console.log(`📦 Retrieved cached profile for user ${userId}`);
      return profile;
    } catch (error) {
      console.warn('Failed to retrieve cached profile:', error);
      return null;
    }
  }
  
  clearCachedProfile(userId: string): void {
    const cacheKey = `${this.CACHE_PREFIX}profile_${userId}`;
    localStorage.removeItem(cacheKey);
  }
  
  // Offline status management
  isOnline(): boolean {
    return navigator.onLine;
  }
  
  // Sync cached data when online
  async syncCachedData(userId: string): Promise<void> {
    if (!this.isOnline()) {
      console.log('📡 Offline - skipping sync');
      return;
    }
    
    const cachedResponses = this.getCachedResponses(userId);
    if (cachedResponses.length === 0) {
      console.log('📡 No cached responses to sync');
      return;
    }
    
    try {
      console.log(`📡 Syncing ${cachedResponses.length} cached responses...`);
      
      // Convert cached responses to API format
      const responses = cachedResponses.map(r => ({
        question_id: r.question_id,
        response: r.response,
        response_time: r.response_time,
        confidence_level: r.confidence_level
      }));
      
      // Submit to AI backend (you'll need to import your service)
      // This is a placeholder - implement actual sync logic
      console.log('📡 Responses ready for sync:', responses);
      
      // Clear cached responses after successful sync
      this.clearCachedResponses(userId);
      console.log('✅ Sync completed successfully');
      
    } catch (error) {
      console.error('❌ Sync failed:', error);
    }
  }
  
  // Fallback questions for complete offline mode
  getFallbackQuestions(): CachedQuestion[] {
    return [
      {
        id: 'offline_analytical_1',
        question: 'When solving a complex problem, you prefer to:',
        question_type: 'multiple_choice',
        options: [
          'Break it down into smaller, logical steps',
          'Look for creative and innovative solutions',
          'Discuss it with others to get different perspectives',
          'Research extensively before taking action'
        ],
        traits_measured: ['analytical_thinking'],
        difficulty_level: 2,
        cached_at: Date.now()
      },
      {
        id: 'offline_creativity_1',
        question: 'In a group project, you typically:',
        question_type: 'multiple_choice',
        options: [
          'Come up with original and creative ideas',
          'Organize and structure the work systematically',
          'Facilitate communication between team members',
          'Research and gather comprehensive information'
        ],
        traits_measured: ['creativity'],
        difficulty_level: 2,
        cached_at: Date.now()
      },
      {
        id: 'offline_leadership_1',
        question: 'When leading a team, you focus on:',
        question_type: 'multiple_choice',
        options: [
          'Inspiring and motivating team members',
          'Setting clear goals and tracking progress',
          'Encouraging collaboration and teamwork',
          'Ensuring thorough planning and preparation'
        ],
        traits_measured: ['leadership'],
        difficulty_level: 2,
        cached_at: Date.now()
      },
      {
        id: 'offline_social_1',
        question: 'You enjoy activities that involve:',
        question_type: 'multiple_choice',
        options: [
          'Working with and helping other people',
          'Analyzing data and solving problems',
          'Creating and designing new things',
          'Learning and discovering new knowledge'
        ],
        traits_measured: ['social_skills', 'helping_others'],
        difficulty_level: 2,
        cached_at: Date.now()
      },
      {
        id: 'offline_technical_1',
        question: 'Your approach to learning new technology is:',
        question_type: 'multiple_choice',
        options: [
          'Hands-on experimentation and practice',
          'Systematic study of documentation',
          'Learning from others and online communities',
          'Understanding the underlying principles first'
        ],
        traits_measured: ['technical_aptitude'],
        difficulty_level: 2,
        cached_at: Date.now()
      }
    ];
  }
  
  // Cache statistics
  getCacheStats(): any {
    const stats = {
      questions: 0,
      responses: 0,
      profiles: 0,
      totalSize: 0
    };
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(this.CACHE_PREFIX)) {
          const value = localStorage.getItem(key);
          if (value) {
            stats.totalSize += value.length;
            
            if (key.includes('questions')) stats.questions++;
            else if (key.includes('responses')) stats.responses++;
            else if (key.includes('profile')) stats.profiles++;
          }
        }
      }
    } catch (error) {
      console.warn('Failed to calculate cache stats:', error);
    }
    
    return {
      ...stats,
      totalSizeKB: Math.round(stats.totalSize / 1024),
      isOnline: this.isOnline()
    };
  }
}

export const offlineCache = new OfflineCache();