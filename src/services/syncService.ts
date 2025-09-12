import { UserProfile } from '../stores/profileStore';
import { ProfileDB } from './profileDatabase';

// Mock API endpoint - replace with your actual backend
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:3001/api';

export class SyncService {
  private static syncInProgress = false;

  // Simulate API call - replace with actual implementation
  static async syncProfile(profile: UserProfile): Promise<UserProfile> {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${profile.id}`, {
        method: profile.metadata.version === 1 ? 'POST' : 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
        body: JSON.stringify(profile),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const syncedProfile = await response.json();
      return syncedProfile;
    } catch (error) {
      console.error('Network sync failed, will retry later:', error);
      
      // For demo purposes, simulate successful sync offline
      if (process.env.NODE_ENV === 'development') {
        console.log('Development mode: simulating successful sync');
        return {
          ...profile,
          metadata: {
            ...profile.metadata,
            syncStatus: 'synced' as const,
          },
        };
      }
      
      throw error;
    }
  }

  static async syncAllPending(): Promise<void> {
    if (this.syncInProgress) {
      console.log('Sync already in progress, skipping');
      return;
    }

    this.syncInProgress = true;

    try {
      await ProfileDB.init();
      const syncQueue = await ProfileDB.getSyncQueue();
      
      console.log(`Starting sync of ${syncQueue.length} items`);

      for (const item of syncQueue) {
        try {
          switch (item.action) {
            case 'create':
            case 'update':
              if (item.data) {
                const syncedProfile = await this.syncProfile(item.data);
                await ProfileDB.saveProfile(syncedProfile);
                await ProfileDB.removeFromSyncQueue(item.id);
                console.log(`Synced ${item.action}:`, item.profileId);
              }
              break;
            
            case 'delete':
              await this.deleteProfileOnServer(item.profileId);
              await ProfileDB.removeFromSyncQueue(item.id);
              console.log(`Synced delete:`, item.profileId);
              break;
          }
        } catch (error) {
          console.error(`Failed to sync item ${item.id}:`, error);
          
          // Increment retry count
          item.retryCount++;
          
          // Remove from queue if too many retries
          if (item.retryCount >= 3) {
            console.log(`Removing item ${item.id} after 3 failed attempts`);
            await ProfileDB.removeFromSyncQueue(item.id);
          }
        }
      }

      console.log('Sync completed successfully');
    } catch (error) {
      console.error('Sync process failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  static async deleteProfileOnServer(profileId: string): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${profileId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
    } catch (error) {
      console.error('Failed to delete profile on server:', error);
      throw error;
    }
  }

  static async fetchProfileFromServer(profileId: string): Promise<UserProfile | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/profiles/${profileId}`, {
        headers: {
          'Authorization': `Bearer ${this.getAuthToken()}`,
        },
      });

      if (response.status === 404) {
        return null;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to fetch profile from server:', error);
      throw error;
    }
  }

  private static getAuthToken(): string {
    // Get auth token from your auth context/store
    // For now, return empty string
    return localStorage.getItem('auth_token') || '';
  }

  // Background sync functionality (using Service Worker)
  static async registerBackgroundSync(): Promise<void> {
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      try {
        const registration = await navigator.serviceWorker.ready;
        // @ts-ignore - Background Sync API might not be in TS definitions
        await registration.sync.register('profile-sync');
        console.log('Background sync registered');
      } catch (error) {
        console.error('Failed to register background sync:', error);
      }
    } else {
      console.log('Background sync not supported');
      
      // Fallback: sync when coming online
      window.addEventListener('online', () => {
        console.log('Online detected, starting sync...');
        this.syncAllPending();
      });
    }
  }

  // Manual conflict resolution
  static async resolveConflict(
    localProfile: UserProfile,
    serverProfile: UserProfile,
    resolution: 'local' | 'server' | 'merge'
  ): Promise<UserProfile> {
    let resolvedProfile: UserProfile;

    switch (resolution) {
      case 'local':
        resolvedProfile = {
          ...localProfile,
          metadata: {
            ...localProfile.metadata,
            syncStatus: 'pending',
            version: serverProfile.metadata.version + 1,
          },
        };
        break;

      case 'server':
        resolvedProfile = {
          ...serverProfile,
          metadata: {
            ...serverProfile.metadata,
            syncStatus: 'synced',
          },
        };
        break;

      case 'merge':
        // Simple merge strategy - in practice, you'd want more sophisticated merging
        resolvedProfile = {
          id: localProfile.id,
          personalDetails: {
            ...serverProfile.personalDetails,
            ...localProfile.personalDetails, // Local takes precedence
          },
          academicBackground: {
            ...serverProfile.academicBackground,
            ...localProfile.academicBackground,
          },
          preferences: {
            ...serverProfile.preferences,
            ...localProfile.preferences,
          },
          metadata: {
            createdAt: serverProfile.metadata.createdAt,
            updatedAt: new Date().toISOString(),
            syncStatus: 'pending',
            version: serverProfile.metadata.version + 1,
          },
        };
        break;
    }

    await ProfileDB.saveProfile(resolvedProfile);
    return resolvedProfile;
  }

  // Check for conflicts
  static async checkForConflicts(profileId: string): Promise<{
    hasConflict: boolean;
    localProfile?: UserProfile;
    serverProfile?: UserProfile;
  }> {
    try {
      const [localProfile, serverProfile] = await Promise.all([
        ProfileDB.getProfile(profileId),
        this.fetchProfileFromServer(profileId),
      ]);

      if (!localProfile || !serverProfile) {
        return { hasConflict: false };
      }

      // Simple conflict detection based on version and update time
      const hasConflict = 
        localProfile.metadata.syncStatus === 'pending' &&
        serverProfile.metadata.updatedAt > localProfile.metadata.updatedAt &&
        serverProfile.metadata.version !== localProfile.metadata.version;

      return {
        hasConflict,
        localProfile,
        serverProfile,
      };
    } catch (error) {
      console.error('Failed to check for conflicts:', error);
      return { hasConflict: false };
    }
  }
}

// Initialize background sync when the module loads
SyncService.registerBackgroundSync();
