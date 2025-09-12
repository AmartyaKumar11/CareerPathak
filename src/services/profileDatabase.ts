import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { UserProfile } from '../stores/profileStore';

interface CareerPathakDB extends DBSchema {
  profiles: {
    key: string;
    value: UserProfile;
    indexes: {
      'by-email': string;
      'by-sync-status': 'synced' | 'pending' | 'conflict' | 'offline';
      'by-updated': string;
    };
  };
  syncQueue: {
    key: string;
    value: {
      id: string;
      profileId: string;
      action: 'create' | 'update' | 'delete';
      data: UserProfile | null;
      timestamp: string;
      retryCount: number;
    };
    indexes: {
      'by-timestamp': string;
      'by-profile': string;
    };
  };
}

class ProfileDatabase {
  private db: IDBPDatabase<CareerPathakDB> | null = null;
  private readonly dbName = 'CareerPathakDB';
  private readonly dbVersion = 1;

  async init(): Promise<void> {
    if (this.db) return;

    try {
      this.db = await openDB<CareerPathakDB>(this.dbName, this.dbVersion, {
        upgrade(db, oldVersion, newVersion, transaction) {
          console.log(`Upgrading DB from ${oldVersion} to ${newVersion}`);

          // Profiles store
          if (!db.objectStoreNames.contains('profiles')) {
            const profileStore = db.createObjectStore('profiles', {
              keyPath: 'id',
            });

            // Create indexes for efficient querying
            profileStore.createIndex('by-email', 'personalDetails.email', {
              unique: false,
            });
            profileStore.createIndex('by-sync-status', 'metadata.syncStatus', {
              unique: false,
            });
            profileStore.createIndex('by-updated', 'metadata.updatedAt', {
              unique: false,
            });
          }

          // Sync queue store
          if (!db.objectStoreNames.contains('syncQueue')) {
            const syncStore = db.createObjectStore('syncQueue', {
              keyPath: 'id',
            });

            syncStore.createIndex('by-timestamp', 'timestamp', {
              unique: false,
            });
            syncStore.createIndex('by-profile', 'profileId', {
              unique: false,
            });
          }
        },
        blocked() {
          console.warn('DB blocked - another tab might be upgrading');
        },
        blocking() {
          console.warn('DB blocking - close this tab to allow upgrade');
        },
      });

      console.log('ProfileDB initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ProfileDB:', error);
      throw error;
    }
  }

  private async ensureDB(): Promise<IDBPDatabase<CareerPathakDB>> {
    if (!this.db) {
      await this.init();
    }
    
    if (!this.db) {
      throw new Error('Failed to initialize database');
    }
    
    return this.db;
  }

  // Profile operations
  async saveProfile(profile: UserProfile): Promise<void> {
    const db = await this.ensureDB();
    
    try {
      const tx = db.transaction('profiles', 'readwrite');
      await tx.objectStore('profiles').put(profile);
      await tx.done;
      
      console.log('Profile saved:', profile.id);
    } catch (error) {
      console.error('Failed to save profile:', error);
      throw error;
    }
  }

  async getProfile(id: string): Promise<UserProfile | undefined> {
    const db = await this.ensureDB();
    
    try {
      const profile = await db.get('profiles', id);
      return profile;
    } catch (error) {
      console.error('Failed to get profile:', error);
      throw error;
    }
  }

  async getAllProfiles(): Promise<UserProfile[]> {
    const db = await this.ensureDB();
    
    try {
      return await db.getAll('profiles');
    } catch (error) {
      console.error('Failed to get all profiles:', error);
      throw error;
    }
  }

  async getProfileByEmail(email: string): Promise<UserProfile | undefined> {
    const db = await this.ensureDB();
    
    try {
      const index = db.transaction('profiles').objectStore('profiles').index('by-email');
      return await index.get(email);
    } catch (error) {
      console.error('Failed to get profile by email:', error);
      throw error;
    }
  }

  async deleteProfile(id: string): Promise<void> {
    const db = await this.ensureDB();
    
    try {
      const tx = db.transaction('profiles', 'readwrite');
      await tx.objectStore('profiles').delete(id);
      await tx.done;
      
      console.log('Profile deleted:', id);
    } catch (error) {
      console.error('Failed to delete profile:', error);
      throw error;
    }
  }

  // Sync queue operations
  async addToSyncQueue(
    profileId: string,
    action: 'create' | 'update' | 'delete',
    data: UserProfile | null = null
  ): Promise<void> {
    const db = await this.ensureDB();
    
    const queueItem = {
      id: `${profileId}_${action}_${Date.now()}`,
      profileId,
      action,
      data,
      timestamp: new Date().toISOString(),
      retryCount: 0,
    };

    try {
      const tx = db.transaction('syncQueue', 'readwrite');
      await tx.objectStore('syncQueue').add(queueItem);
      await tx.done;
      
      console.log('Added to sync queue:', queueItem.id);
    } catch (error) {
      console.error('Failed to add to sync queue:', error);
      throw error;
    }
  }

  async getSyncQueue(): Promise<CareerPathakDB['syncQueue']['value'][]> {
    const db = await this.ensureDB();
    
    try {
      return await db.getAll('syncQueue');
    } catch (error) {
      console.error('Failed to get sync queue:', error);
      throw error;
    }
  }

  async removeFromSyncQueue(id: string): Promise<void> {
    const db = await this.ensureDB();
    
    try {
      const tx = db.transaction('syncQueue', 'readwrite');
      await tx.objectStore('syncQueue').delete(id);
      await tx.done;
      
      console.log('Removed from sync queue:', id);
    } catch (error) {
      console.error('Failed to remove from sync queue:', error);
      throw error;
    }
  }

  async clearSyncQueue(): Promise<void> {
    const db = await this.ensureDB();
    
    try {
      const tx = db.transaction('syncQueue', 'readwrite');
      await tx.objectStore('syncQueue').clear();
      await tx.done;
      
      console.log('Sync queue cleared');
    } catch (error) {
      console.error('Failed to clear sync queue:', error);
      throw error;
    }
  }

  // Utility methods
  async getProfilesBySyncStatus(status: 'synced' | 'pending' | 'conflict' | 'offline'): Promise<UserProfile[]> {
    const db = await this.ensureDB();
    
    try {
      const index = db.transaction('profiles').objectStore('profiles').index('by-sync-status');
      return await index.getAll(status);
    } catch (error) {
      console.error('Failed to get profiles by sync status:', error);
      throw error;
    }
  }

  async getPendingSyncCount(): Promise<number> {
    const db = await this.ensureDB();
    
    try {
      return await db.count('syncQueue');
    } catch (error) {
      console.error('Failed to get pending sync count:', error);
      return 0;
    }
  }

  async cleanup(): Promise<void> {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
  }
}

// Export singleton instance
export const ProfileDB = new ProfileDatabase();
