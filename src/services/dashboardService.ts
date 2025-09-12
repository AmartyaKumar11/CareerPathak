import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { dashboardDB, StreamRecommendation, College, CareerPath, Notification } from './dashboardDatabase';
import { 
  mockRecommendations, 
  mockColleges, 
  mockCareerPaths, 
  mockNotifications,
  getRecommendationsByMatch,
  getCollegesByDistance,
  getCareerGrowthProjection
} from './mockData';

// Query keys
export const QUERY_KEYS = {
  RECOMMENDATIONS: 'recommendations',
  COLLEGES: 'colleges',
  CAREER_PATHS: 'careerPaths',
  NOTIFICATIONS: 'notifications',
  UNREAD_COUNT: 'unreadCount'
} as const;

// Simulate network delay for realistic experience
const simulateNetworkDelay = (ms: number = 1000) => 
  new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions (simulating real API calls)
const mockAPI = {
  async fetchRecommendations(): Promise<StreamRecommendation[]> {
    await simulateNetworkDelay();
    if (Math.random() > 0.8) throw new Error('Network error');
    return mockRecommendations;
  },

  async fetchColleges(): Promise<College[]> {
    await simulateNetworkDelay();
    if (Math.random() > 0.8) throw new Error('Network error');
    return mockColleges;
  },

  async fetchCareerPaths(): Promise<CareerPath[]> {
    await simulateNetworkDelay();
    if (Math.random() > 0.8) throw new Error('Network error');
    return mockCareerPaths;
  },

  async fetchNotifications(): Promise<Notification[]> {
    await simulateNetworkDelay();
    if (Math.random() > 0.8) throw new Error('Network error');
    return mockNotifications;
  }
};

// Custom hooks for data fetching with offline support
export const useRecommendations = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.RECOMMENDATIONS],
    queryFn: async () => {
      try {
        // Try to fetch from API
        const recommendations = await mockAPI.fetchRecommendations();
        // Cache in IndexedDB
        await dashboardDB.saveRecommendations(recommendations);
        return recommendations;
      } catch (error) {
        // Fallback to cached data
        console.log('Network error, falling back to cache:', error);
        const cachedRecommendations = await dashboardDB.getRecommendations();
        if (cachedRecommendations.length > 0) {
          return cachedRecommendations;
        }
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (renamed from cacheTime)
    retry: 1,
    refetchOnWindowFocus: false,
  });
};

export const useColleges = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.COLLEGES],
    queryFn: async () => {
      try {
        const colleges = await mockAPI.fetchColleges();
        await dashboardDB.saveColleges(colleges);
        return colleges;
      } catch (error) {
        console.log('Network error, falling back to cache:', error);
        const cachedColleges = await dashboardDB.getColleges();
        if (cachedColleges.length > 0) {
          return cachedColleges;
        }
        throw error;
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 1,
  });
};

export const useCareerPaths = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.CAREER_PATHS],
    queryFn: async () => {
      try {
        const careerPaths = await mockAPI.fetchCareerPaths();
        await dashboardDB.saveCareerPaths(careerPaths);
        return careerPaths;
      } catch (error) {
        console.log('Network error, falling back to cache:', error);
        const cachedPaths = await dashboardDB.getCareerPaths();
        if (cachedPaths.length > 0) {
          return cachedPaths;
        }
        throw error;
      }
    },
    staleTime: 30 * 60 * 1000, // 30 minutes
    gcTime: 2 * 60 * 60 * 1000, // 2 hours
    retry: 1,
  });
};

export const useNotifications = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.NOTIFICATIONS],
    queryFn: async () => {
      try {
        const notifications = await mockAPI.fetchNotifications();
        await dashboardDB.saveNotifications(notifications);
        return notifications;
      } catch (error) {
        console.log('Network error, falling back to cache:', error);
        const cachedNotifications = await dashboardDB.getNotifications();
        if (cachedNotifications.length > 0) {
          return cachedNotifications;
        }
        throw error;
      }
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
};

export const useUnreadNotificationCount = () => {
  return useQuery({
    queryKey: [QUERY_KEYS.UNREAD_COUNT],
    queryFn: async () => {
      return await dashboardDB.getUnreadNotificationCount();
    },
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
};

// Mutations
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (notificationId: string) => {
      await dashboardDB.markNotificationAsRead(notificationId);
      return notificationId;
    },
    onSuccess: () => {
      // Invalidate and refetch related queries
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.NOTIFICATIONS] });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.UNREAD_COUNT] });
    },
  });
};

// Utility hooks for filtered data
export const useTopRecommendations = (count: number = 3) => {
  const { data: recommendations, ...query } = useRecommendations();
  
  return {
    ...query,
    data: recommendations 
      ? getRecommendationsByMatch(70)
          .sort((a, b) => b.matchPercentage - a.matchPercentage)
          .slice(0, count)
      : undefined
  };
};

export const useNearbyColleges = (maxDistance: number = 50) => {
  const { data: colleges, ...query } = useColleges();
  
  return {
    ...query,
    data: colleges 
      ? getCollegesByDistance(maxDistance)
          .sort((a, b) => (a.distance || 0) - (b.distance || 0))
      : undefined
  };
};

export const useCareerGrowthData = (streamId: string) => {
  const { data: careerPaths, ...query } = useCareerPaths();
  
  return {
    ...query,
    data: careerPaths ? getCareerGrowthProjection(streamId) : undefined
  };
};

// Network status detection
export const useNetworkStatus = () => {
  return {
    isOnline: navigator.onLine,
    addEventListener: (callback: (online: boolean) => void) => {
      const handleOnline = () => callback(true);
      const handleOffline = () => callback(false);
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  };
};

// Cache management
export const useClearCache = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await dashboardDB.clearCache();
      queryClient.clear();
    },
  });
};
