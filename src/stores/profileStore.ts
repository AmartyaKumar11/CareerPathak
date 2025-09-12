// This file doesn't need React import - it's just a Zustand store
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useEffect } from 'react';
import { ProfileDB } from '../services/profileDatabase';
// import { SyncService } from '../services/syncService';

export interface UserProfile {
  id: string;
  personalDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    dateOfBirth: string;
    address: {
      street: string;
      city: string;
      state: string;
      pincode: string;
    };
  };
  academicBackground: {
    currentClass: string;
    school: string;
    board: string;
    subjects: string[];
    percentage: number;
    aspirations: string[];
    interestedFields: string[];
  };
  preferences: {
    language: 'en' | 'hi' | 'ur' | 'ks' | 'dg';
    notifications: boolean;
    theme: 'light' | 'dark' | 'system';
  };
  metadata: {
    createdAt: string;
    updatedAt: string;
    syncStatus: 'synced' | 'pending' | 'conflict' | 'offline';
    version: number;
  };
}

interface ProfileStore {
  // State
  currentProfile: UserProfile | null;
  isLoading: boolean;
  isOnline: boolean;
  syncQueue: string[];
  lastSyncTime: string | null;
  
  // Actions
  setProfile: (profile: UserProfile) => void;
  updateProfile: (updates: Partial<UserProfile>) => Promise<void>;
  createProfile: (profileData: Omit<UserProfile, 'id' | 'metadata'>) => Promise<void>;
  deleteProfile: () => Promise<void>;
  
  // Sync actions
  setOnlineStatus: (isOnline: boolean) => void;
  addToSyncQueue: (profileId: string) => void;
  removeFromSyncQueue: (profileId: string) => void;
  syncPendingChanges: () => Promise<void>;
  
  // Utility actions
  setLoading: (loading: boolean) => void;
  loadProfile: (userId: string) => Promise<void>;
  clearProfile: () => void;
}

const generateId = (): string => {
  return `profile_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      // Initial state
      currentProfile: null,
      isLoading: false,
      isOnline: navigator.onLine,
      syncQueue: [],
      lastSyncTime: null,

      // Profile management
      setProfile: (profile) => {
        set({ currentProfile: profile });
      },

      createProfile: async (profileData) => {
        set({ isLoading: true });
        
        try {
          const newProfile: UserProfile = {
            id: generateId(),
            ...profileData,
            metadata: {
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              syncStatus: get().isOnline ? 'pending' : 'offline',
              version: 1,
            },
          };

          // Save to IndexedDB
          await ProfileDB.saveProfile(newProfile);
          
          // Update store
          set({ currentProfile: newProfile });
          
          // Add to sync queue if online
          if (get().isOnline) {
            get().addToSyncQueue(newProfile.id);
            get().syncPendingChanges();
          }
        } catch (error) {
          console.error('Failed to create profile:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      updateProfile: async (updates) => {
        set({ isLoading: true });
        const { currentProfile } = get();
        
        if (!currentProfile) {
          set({ isLoading: false });
          throw new Error('No profile to update');
        }

        try {
          const updatedProfile: UserProfile = {
            ...currentProfile,
            ...updates,
            metadata: {
              ...currentProfile.metadata,
              updatedAt: new Date().toISOString(),
              syncStatus: get().isOnline ? 'pending' : 'offline',
              version: currentProfile.metadata.version + 1,
            },
          };

          // Save to IndexedDB
          await ProfileDB.saveProfile(updatedProfile);
          
          // Update store
          set({ currentProfile: updatedProfile });
          
          // Add to sync queue if online
          if (get().isOnline) {
            get().addToSyncQueue(updatedProfile.id);
            get().syncPendingChanges();
          }
        } catch (error) {
          console.error('Failed to update profile:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      deleteProfile: async () => {
        const { currentProfile } = get();
        if (!currentProfile) return;

        try {
          await ProfileDB.deleteProfile(currentProfile.id);
          set({ currentProfile: null });
        } catch (error) {
          console.error('Failed to delete profile:', error);
          throw error;
        }
      },

      loadProfile: async (userId) => {
        set({ isLoading: true });
        
        try {
          const profile = await ProfileDB.getProfile(userId);
          set({ currentProfile: profile });
        } catch (error) {
          console.error('Failed to load profile:', error);
          throw error;
        } finally {
          set({ isLoading: false });
        }
      },

      // Sync management
      setOnlineStatus: (isOnline) => {
        set({ isOnline });
        
        // Try to sync when coming online
        if (isOnline && get().syncQueue.length > 0) {
          get().syncPendingChanges();
        }
      },

      addToSyncQueue: (profileId) => {
        const { syncQueue } = get();
        if (!syncQueue.includes(profileId)) {
          set({ syncQueue: [...syncQueue, profileId] });
        }
      },

      removeFromSyncQueue: (profileId) => {
        const { syncQueue } = get();
        set({ syncQueue: syncQueue.filter(id => id !== profileId) });
      },

      syncPendingChanges: async () => {
        const { syncQueue, isOnline } = get();
        
        if (!isOnline || syncQueue.length === 0) return;

        try {
          for (const profileId of syncQueue) {
            const profile = await ProfileDB.getProfile(profileId);
            if (profile) {
              // TODO: Implement actual sync with backend
              // await SyncService.syncProfile(profile);
              console.log('Mock sync for profile:', profileId);
              
              // Update sync status
              const syncedProfile: UserProfile = {
                ...profile,
                metadata: {
                  ...profile.metadata,
                  syncStatus: 'synced',
                },
              };
              
              await ProfileDB.saveProfile(syncedProfile);
              
              // Update current profile if it's the one being synced
              if (get().currentProfile?.id === profileId) {
                set({ currentProfile: syncedProfile });
              }
              
              // Remove from sync queue
              get().removeFromSyncQueue(profileId);
            }
          }
          
          set({ lastSyncTime: new Date().toISOString() });
        } catch (error) {
          console.error('Sync failed:', error);
        }
      },

      // Utility actions
      setLoading: (loading) => set({ isLoading: loading }),
      clearProfile: () => set({ currentProfile: null }),
    }),
    {
      name: 'profile-store',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentProfile: state.currentProfile,
        syncQueue: state.syncQueue,
        lastSyncTime: state.lastSyncTime,
      }),
    }
  )
);

// Hook for online status
export const useOnlineStatus = () => {
  const { isOnline, setOnlineStatus } = useProfileStore();
  
  // Set up online/offline listeners
  useEffect(() => {
    const handleOnline = () => setOnlineStatus(true);
    const handleOffline = () => setOnlineStatus(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [setOnlineStatus]);
  
  return isOnline;
};
