import { openDB, IDBPDatabase } from 'idb';

// Types for dashboard data
export interface StreamRecommendation {
  id: string;
  streamName: string;
  matchPercentage: number;
  description: string;
  careerOptions: string[];
  requirements: string[];
  averageSalary: {
    entry: number;
    mid: number;
    senior: number;
  };
  growthRate: number;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  tags: string[];
}

export interface CollegeInfo {
  id: string;
  name: string;
  type: 'Government' | 'Private' | 'Deemed';
  location: {
    city: string;
    state: string;
    coordinates: [number, number]; // [lat, lng]
  };
  distance: number; // in km from user location
  cutoff: {
    general: number;
    obc: number;
    sc: number;
    st: number;
  };
  facilities: {
    hostel: boolean;
    library: boolean;
    lab: boolean;
    sports: boolean;
    wifi: boolean;
    canteen: boolean;
    transport: boolean;
  };
  courses: string[];
  ranking: number;
  fees: {
    annual: number;
    total: number;
  };
  placementStats: {
    percentage: number;
    averagePackage: number;
    topPackage: number;
  };
  website: string;
  contact: {
    phone: string;
    email: string;
  };
}

export interface CareerPath {
  id: string;
  title: string;
  description: string;
  timeline: {
    phase: string;
    duration: string;
    activities: string[];
    skills: string[];
  }[];
  salaryProgression: {
    year: number;
    salary: number;
  }[];
  requiredSkills: {
    technical: string[];
    soft: string[];
  };
  jobMarketTrend: {
    year: number;
    demand: number;
    growth: number;
  }[];
  relatedCareers: string[];
}

export interface NotificationItem {
  id: string;
  type: 'admission' | 'scholarship' | 'exam' | 'result' | 'announcement';
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  date: string;
  deadline?: string;
  isRead: boolean;
  actionUrl?: string;
  tags: string[];
  source: string;
}

// Database service for offline storage
class DashboardDB {
  private db: IDBPDatabase | null = null;

  async init() {
    this.db = await openDB('CareerPathakDashboard', 2, {
      upgrade(db, oldVersion, newVersion, transaction) {
        // Stream recommendations store
        if (!db.objectStoreNames.contains('streamRecommendations')) {
          const streamStore = db.createObjectStore('streamRecommendations', { keyPath: 'id' });
          streamStore.createIndex('matchPercentage', 'matchPercentage');
          streamStore.createIndex('difficulty', 'difficulty');
        }

        // Colleges store
        if (!db.objectStoreNames.contains('colleges')) {
          const collegeStore = db.createObjectStore('colleges', { keyPath: 'id' });
          collegeStore.createIndex('distance', 'distance');
          collegeStore.createIndex('type', 'type');
          collegeStore.createIndex('ranking', 'ranking');
        }

        // Career paths store
        if (!db.objectStoreNames.contains('careerPaths')) {
          db.createObjectStore('careerPaths', { keyPath: 'id' });
        }

        // Notifications store
        if (!db.objectStoreNames.contains('notifications')) {
          const notificationStore = db.createObjectStore('notifications', { keyPath: 'id' });
          notificationStore.createIndex('type', 'type');
          notificationStore.createIndex('priority', 'priority');
          notificationStore.createIndex('date', 'date');
          notificationStore.createIndex('isRead', 'isRead');
        }

        // Cache metadata store
        if (!db.objectStoreNames.contains('cacheMetadata')) {
          db.createObjectStore('cacheMetadata', { keyPath: 'key' });
        }
      }
    });
  }

  // Stream recommendations methods
  async getStreamRecommendations(): Promise<StreamRecommendation[]> {
    if (!this.db) await this.init();
    return this.db!.getAll('streamRecommendations');
  }

  async saveStreamRecommendations(recommendations: StreamRecommendation[]) {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('streamRecommendations', 'readwrite');
    await Promise.all(recommendations.map(rec => tx.store.put(rec)));
  }

  // Colleges methods
  async getColleges(): Promise<CollegeInfo[]> {
    if (!this.db) await this.init();
    return this.db!.getAll('colleges');
  }

  async getNearbyColleges(maxDistance: number): Promise<CollegeInfo[]> {
    if (!this.db) await this.init();
    const colleges = await this.db!.getAll('colleges');
    return colleges.filter(college => college.distance <= maxDistance);
  }

  async saveColleges(colleges: CollegeInfo[]) {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('colleges', 'readwrite');
    await Promise.all(colleges.map(college => tx.store.put(college)));
  }

  // Career paths methods
  async getCareerPaths(): Promise<CareerPath[]> {
    if (!this.db) await this.init();
    return this.db!.getAll('careerPaths');
  }

  async saveCareerPaths(paths: CareerPath[]) {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('careerPaths', 'readwrite');
    await Promise.all(paths.map(path => tx.store.put(path)));
  }

  // Notifications methods
  async getNotifications(): Promise<NotificationItem[]> {
    if (!this.db) await this.init();
    const notifications = await this.db!.getAll('notifications');
    return notifications.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async getUnreadNotifications(): Promise<NotificationItem[]> {
    if (!this.db) await this.init();
    const notifications = await this.db!.getAll('notifications');
    return notifications.filter(n => !n.isRead);
  }

  async saveNotifications(notifications: NotificationItem[]) {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('notifications', 'readwrite');
    await Promise.all(notifications.map(notification => tx.store.put(notification)));
  }

  async markNotificationAsRead(id: string) {
    if (!this.db) await this.init();
    const tx = this.db!.transaction('notifications', 'readwrite');
    const notification = await tx.store.get(id);
    if (notification) {
      notification.isRead = true;
      await tx.store.put(notification);
    }
  }

  // Cache metadata methods
  async getCacheTimestamp(key: string): Promise<number | null> {
    if (!this.db) await this.init();
    const metadata = await this.db!.get('cacheMetadata', key);
    return metadata?.timestamp || null;
  }

  async setCacheTimestamp(key: string, timestamp: number) {
    if (!this.db) await this.init();
    await this.db!.put('cacheMetadata', { key, timestamp });
  }

  async isCacheValid(key: string, maxAge: number): Promise<boolean> {
    const timestamp = await this.getCacheTimestamp(key);
    if (!timestamp) return false;
    return Date.now() - timestamp < maxAge;
  }
}

export const dashboardDB = new DashboardDB();

// Mock data generators for development
export const generateMockStreamRecommendations = (userProfile: any): StreamRecommendation[] => {
  const streams: StreamRecommendation[] = [
    {
      id: 'stream-1',
      streamName: 'Computer Science Engineering',
      matchPercentage: 92,
      description: 'Perfect match based on your strong mathematics and logical reasoning skills',
      careerOptions: ['Software Engineer', 'Data Scientist', 'AI/ML Engineer', 'Cybersecurity Specialist'],
      requirements: ['Strong Math Skills', 'Logical Thinking', 'Programming Aptitude'],
      averageSalary: { entry: 600000, mid: 1200000, senior: 2500000 },
      growthRate: 15.2,
      difficulty: 'Medium',
      tags: ['Technology', 'High Demand', 'Future-Proof']
    },
    {
      id: 'stream-2',
      streamName: 'Data Science & Analytics',
      matchPercentage: 88,
      description: 'Excellent fit given your analytical mindset and statistics background',
      careerOptions: ['Data Analyst', 'Business Intelligence Analyst', 'Research Scientist', 'Consultant'],
      requirements: ['Statistics', 'Analytical Thinking', 'Communication Skills'],
      averageSalary: { entry: 550000, mid: 1100000, senior: 2200000 },
      growthRate: 18.5,
      difficulty: 'Medium',
      tags: ['Analytics', 'Growing Field', 'Interdisciplinary']
    },
    {
      id: 'stream-3',
      streamName: 'Mechanical Engineering',
      matchPercentage: 75,
      description: 'Good match based on your physics scores and practical problem-solving approach',
      careerOptions: ['Design Engineer', 'Manufacturing Engineer', 'Project Manager', 'Consultant'],
      requirements: ['Physics Understanding', 'Design Thinking', 'Technical Drawing'],
      averageSalary: { entry: 450000, mid: 900000, senior: 1800000 },
      growthRate: 8.3,
      difficulty: 'Hard',
      tags: ['Traditional', 'Stable', 'Diverse Opportunities']
    }
  ];

  return streams.sort((a, b) => b.matchPercentage - a.matchPercentage);
};

export const generateMockColleges = (userLocation?: [number, number]): CollegeInfo[] => {
  const baseLocation = userLocation || [28.6139, 77.2090]; // Default to Delhi
  
  return [
    {
      id: 'college-1',
      name: 'Indian Institute of Technology Delhi',
      type: 'Government',
      location: {
        city: 'New Delhi',
        state: 'Delhi',
        coordinates: [28.6139, 77.2090]
      },
      distance: 5.2,
      cutoff: { general: 95.5, obc: 93.2, sc: 87.5, st: 85.0 },
      facilities: {
        hostel: true,
        library: true,
        lab: true,
        sports: true,
        wifi: true,
        canteen: true,
        transport: true
      },
      courses: ['Computer Science', 'Mechanical Engineering', 'Electrical Engineering'],
      ranking: 1,
      fees: { annual: 200000, total: 800000 },
      placementStats: { percentage: 95, averagePackage: 1800000, topPackage: 5000000 },
      website: 'https://iitd.ac.in',
      contact: { phone: '011-26591000', email: 'registrar@iitd.ac.in' }
    },
    {
      id: 'college-2',
      name: 'Delhi Technological University',
      type: 'Government',
      location: {
        city: 'New Delhi',
        state: 'Delhi',
        coordinates: [28.7503, 77.1175]
      },
      distance: 12.8,
      cutoff: { general: 88.5, obc: 85.2, sc: 78.5, st: 75.0 },
      facilities: {
        hostel: true,
        library: true,
        lab: true,
        sports: true,
        wifi: true,
        canteen: true,
        transport: false
      },
      courses: ['Computer Science', 'Information Technology', 'Electronics Engineering'],
      ranking: 15,
      fees: { annual: 150000, total: 600000 },
      placementStats: { percentage: 85, averagePackage: 1200000, topPackage: 3500000 },
      website: 'https://dtu.ac.in',
      contact: { phone: '011-27871023', email: 'registrar@dtu.ac.in' }
    }
  ];
};

export const generateMockCareerPaths = (): CareerPath[] => {
  return [
    {
      id: 'career-1',
      title: 'Software Engineer Career Path',
      description: 'Complete roadmap from beginner to senior software engineer',
      timeline: [
        {
          phase: 'Foundation (Year 1-2)',
          duration: '2 years',
          activities: ['Learn programming fundamentals', 'Build projects', 'Contribute to open source'],
          skills: ['Programming', 'Problem Solving', 'Version Control']
        },
        {
          phase: 'Specialization (Year 3-5)',
          duration: '3 years',
          activities: ['Choose specialization', 'Advanced projects', 'Industry experience'],
          skills: ['Frameworks', 'System Design', 'Team Collaboration']
        },
        {
          phase: 'Leadership (Year 6+)',
          duration: 'Ongoing',
          activities: ['Lead teams', 'Mentor others', 'Technical strategy'],
          skills: ['Leadership', 'Architecture', 'Business Understanding']
        }
      ],
      salaryProgression: [
        { year: 1, salary: 600000 },
        { year: 2, salary: 800000 },
        { year: 3, salary: 1000000 },
        { year: 5, salary: 1500000 },
        { year: 10, salary: 2500000 }
      ],
      requiredSkills: {
        technical: ['Programming Languages', 'Data Structures', 'System Design', 'Databases'],
        soft: ['Communication', 'Problem Solving', 'Team Work', 'Adaptability']
      },
      jobMarketTrend: [
        { year: 2020, demand: 100, growth: 12 },
        { year: 2021, demand: 112, growth: 15 },
        { year: 2022, demand: 128, growth: 18 },
        { year: 2023, demand: 151, growth: 20 },
        { year: 2024, demand: 181, growth: 22 }
      ],
      relatedCareers: ['Data Scientist', 'DevOps Engineer', 'Product Manager', 'Tech Lead']
    }
  ];
};

export const generateMockNotifications = (): NotificationItem[] => {
  return [
    {
      id: 'notif-1',
      type: 'admission',
      title: 'JEE Main 2024 Registration Open',
      description: 'Registration for JEE Main 2024 has started. Last date to apply is March 15, 2024.',
      priority: 'high',
      date: '2024-02-01T09:00:00Z',
      deadline: '2024-03-15T23:59:59Z',
      isRead: false,
      actionUrl: 'https://jeemain.nta.nic.in',
      tags: ['JEE', 'Engineering', 'Admission'],
      source: 'NTA'
    },
    {
      id: 'notif-2',
      type: 'scholarship',
      title: 'Merit Scholarship Available',
      description: 'Apply for merit-based scholarship for engineering students. Up to ₹50,000 per year.',
      priority: 'medium',
      date: '2024-01-28T10:30:00Z',
      deadline: '2024-04-30T23:59:59Z',
      isRead: false,
      actionUrl: 'https://scholarships.gov.in',
      tags: ['Scholarship', 'Merit', 'Engineering'],
      source: 'Government'
    },
    {
      id: 'notif-3',
      type: 'exam',
      title: 'GATE 2024 Results Declared',
      description: 'GATE 2024 results are now available. Check your score and download scorecard.',
      priority: 'urgent',
      date: '2024-01-25T14:00:00Z',
      isRead: true,
      actionUrl: 'https://gate.iisc.ac.in',
      tags: ['GATE', 'Results', 'Postgraduate'],
      source: 'IISc'
    }
  ];
};
