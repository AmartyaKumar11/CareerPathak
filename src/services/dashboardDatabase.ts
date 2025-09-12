import { openDB, IDBPDatabase } from 'idb';

export interface StreamRecommendation {
  id: string;
  streamName: string;
  matchPercentage: number;
  description: string;
  careerOptions: string[];
  requirements: string[];
  avgSalary: string;
  lastUpdated: Date;
}

export interface College {
  id: string;
  name: string;
  location: {
    address: string;
    city: string;
    state: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  type: 'Government' | 'Private' | 'Deemed';
  cutoffs: {
    stream: string;
    category: string;
    cutoff: number;
    year: number;
  }[];
  facilities: string[];
  distance?: number;
  fees: {
    tuition: number;
    hostel: number;
  };
  rating: number;
  lastUpdated: Date;
}

export interface CareerPath {
  id: string;
  title: string;
  stream: string;
  steps: {
    phase: string;
    duration: string;
    requirements: string[];
    outcomes: string[];
  }[];
  growthData: {
    year: number;
    opportunities: number;
    avgSalary: number;
  }[];
  lastUpdated: Date;
}

export interface Notification {
  id: string;
  type: 'admission' | 'scholarship' | 'exam' | 'announcement';
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  deadline?: Date;
  actionUrl?: string;
  isRead: boolean;
  createdAt: Date;
}

const DB_NAME = 'DashboardDB';
const DB_VERSION = 1;

export class DashboardDatabase {
  private db: IDBPDatabase | null = null;

  async init(): Promise<void> {
    this.db = await openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Stream recommendations store
        if (!db.objectStoreNames.contains('recommendations')) {
          const recommendationStore = db.createObjectStore('recommendations', { keyPath: 'id' });
          recommendationStore.createIndex('matchPercentage', 'matchPercentage');
          recommendationStore.createIndex('lastUpdated', 'lastUpdated');
        }

        // Colleges store
        if (!db.objectStoreNames.contains('colleges')) {
          const collegeStore = db.createObjectStore('colleges', { keyPath: 'id' });
          collegeStore.createIndex('type', 'type');
          collegeStore.createIndex('city', 'location.city');
          collegeStore.createIndex('state', 'location.state');
          collegeStore.createIndex('rating', 'rating');
        }

        // Career paths store
        if (!db.objectStoreNames.contains('careerPaths')) {
          const careerStore = db.createObjectStore('careerPaths', { keyPath: 'id' });
          careerStore.createIndex('stream', 'stream');
          careerStore.createIndex('lastUpdated', 'lastUpdated');
        }

        // Notifications store
        if (!db.objectStoreNames.contains('notifications')) {
          const notificationStore = db.createObjectStore('notifications', { keyPath: 'id' });
          notificationStore.createIndex('type', 'type');
          notificationStore.createIndex('priority', 'priority');
          notificationStore.createIndex('isRead', 'isRead');
          notificationStore.createIndex('createdAt', 'createdAt');
        }

        // Cache metadata store
        if (!db.objectStoreNames.contains('cacheMetadata')) {
          db.createObjectStore('cacheMetadata', { keyPath: 'key' });
        }
      },
    });
  }

  // Stream Recommendations
  async saveRecommendations(recommendations: StreamRecommendation[]): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('recommendations', 'readwrite');
    await Promise.all(recommendations.map(rec => tx.store.put(rec)));
    await tx.done;
    await this.setCacheTimestamp('recommendations');
  }

  async getRecommendations(): Promise<StreamRecommendation[]> {
    if (!this.db) await this.init();
    return await this.db!.getAll('recommendations');
  }

  // Colleges
  async saveColleges(colleges: College[]): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('colleges', 'readwrite');
    await Promise.all(colleges.map(college => tx.store.put(college)));
    await tx.done;
    await this.setCacheTimestamp('colleges');
  }

  async getColleges(): Promise<College[]> {
    if (!this.db) await this.init();
    return await this.db!.getAll('colleges');
  }

  async getCollegesByType(type: string): Promise<College[]> {
    if (!this.db) await this.init();
    return await this.db!.getAllFromIndex('colleges', 'type', type);
  }

  // Career Paths
  async saveCareerPaths(careerPaths: CareerPath[]): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('careerPaths', 'readwrite');
    await Promise.all(careerPaths.map(path => tx.store.put(path)));
    await tx.done;
    await this.setCacheTimestamp('careerPaths');
  }

  async getCareerPaths(): Promise<CareerPath[]> {
    if (!this.db) await this.init();
    return await this.db!.getAll('careerPaths');
  }

  async getCareerPathsByStream(stream: string): Promise<CareerPath[]> {
    if (!this.db) await this.init();
    return await this.db!.getAllFromIndex('careerPaths', 'stream', stream);
  }

  // Notifications
  async saveNotifications(notifications: Notification[]): Promise<void> {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('notifications', 'readwrite');
    await Promise.all(notifications.map(notif => tx.store.put(notif)));
    await tx.done;
    await this.setCacheTimestamp('notifications');
  }

  async getNotifications(): Promise<Notification[]> {
    if (!this.db) await this.init();
    const notifications = await this.db!.getAll('notifications');
    return notifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async markNotificationAsRead(id: string): Promise<void> {
    if (!this.db) await this.init();
    const notification = await this.db!.get('notifications', id);
    if (notification) {
      notification.isRead = true;
      await this.db!.put('notifications', notification);
    }
  }

  async getUnreadNotificationCount(): Promise<number> {
    if (!this.db) await this.init();
    const allNotifications = await this.db!.getAll('notifications');
    const unreadNotifications = allNotifications.filter(n => !n.isRead);
    return unreadNotifications.length;
  }

  // Cache management
  async setCacheTimestamp(key: string): Promise<void> {
    if (!this.db) await this.init();
    await this.db!.put('cacheMetadata', { key, timestamp: new Date() });
  }

  async getCacheTimestamp(key: string): Promise<Date | null> {
    if (!this.db) await this.init();
    const metadata = await this.db!.get('cacheMetadata', key);
    return metadata ? metadata.timestamp : null;
  }

  async isCacheStale(key: string, maxAge: number = 30 * 60 * 1000): Promise<boolean> {
    const timestamp = await this.getCacheTimestamp(key);
    if (!timestamp) return true;
    return Date.now() - timestamp.getTime() > maxAge;
  }

  async clearCache(): Promise<void> {
    if (!this.db) await this.init();
    const storeNames = ['recommendations', 'colleges', 'careerPaths', 'notifications', 'cacheMetadata'];
    const tx = this.db!.transaction(storeNames, 'readwrite');
    await Promise.all(storeNames.map(store => tx.objectStore(store).clear()));
    await tx.done;
  }
}

export const dashboardDB = new DashboardDatabase();
