import { StreamRecommendation, College, CareerPath, Notification } from './dashboardDatabase';

// Mock Stream Recommendations
export const mockRecommendations: StreamRecommendation[] = [
  {
    id: 'rec-1',
    streamName: 'Computer Science & Engineering',
    matchPercentage: 95,
    description: 'Perfect match based on your strong performance in Mathematics and Physics, plus your interest in technology.',
    careerOptions: ['Software Developer', 'Data Scientist', 'AI/ML Engineer', 'Cybersecurity Specialist', 'Product Manager'],
    requirements: ['Strong Mathematical Foundation', 'Problem-solving Skills', 'Programming Aptitude'],
    avgSalary: '₹8-25 LPA',
    lastUpdated: new Date()
  },
  {
    id: 'rec-2',
    streamName: 'Electronics & Communication',
    matchPercentage: 88,
    description: 'Great fit given your aptitude in Physics and Mathematics with electronics interest.',
    careerOptions: ['Electronics Engineer', 'Telecommunications Engineer', 'VLSI Designer', 'IoT Developer'],
    requirements: ['Physics & Mathematics', 'Circuit Analysis', 'Communication Systems'],
    avgSalary: '₹6-20 LPA',
    lastUpdated: new Date()
  },
  {
    id: 'rec-3',
    streamName: 'Mechanical Engineering',
    matchPercentage: 75,
    description: 'Good match based on your practical problem-solving approach and physics understanding.',
    careerOptions: ['Design Engineer', 'Manufacturing Engineer', 'Automotive Engineer', 'Robotics Engineer'],
    requirements: ['Physics & Mathematics', 'Design Thinking', 'Manufacturing Processes'],
    avgSalary: '₹5-18 LPA',
    lastUpdated: new Date()
  },
  {
    id: 'rec-4',
    streamName: 'Data Science & Analytics',
    matchPercentage: 92,
    description: 'Excellent match with your mathematical skills and analytical thinking.',
    careerOptions: ['Data Analyst', 'Business Intelligence Analyst', 'Machine Learning Engineer', 'Research Scientist'],
    requirements: ['Statistics & Mathematics', 'Programming', 'Analytical Thinking'],
    avgSalary: '₹7-30 LPA',
    lastUpdated: new Date()
  }
];

// Mock Government Colleges
export const mockColleges: College[] = [
  {
    id: 'col-1',
    name: 'Indian Institute of Technology Delhi',
    location: {
      address: 'Hauz Khas, New Delhi',
      city: 'New Delhi',
      state: 'Delhi',
      coordinates: { lat: 28.5449, lng: 77.1928 }
    },
    type: 'Government',
    cutoffs: [
      { stream: 'Computer Science', category: 'General', cutoff: 63, year: 2024 },
      { stream: 'Electronics', category: 'General', cutoff: 441, year: 2024 },
      { stream: 'Mechanical', category: 'General', cutoff: 1021, year: 2024 }
    ],
    facilities: ['WiFi Campus', 'Library', 'Hostels', 'Sports Complex', 'Research Labs', 'Placement Cell'],
    distance: 15.2,
    fees: { tuition: 200000, hostel: 25000 },
    rating: 4.8,
    lastUpdated: new Date()
  },
  {
    id: 'col-2',
    name: 'Delhi Technological University',
    location: {
      address: 'Shahbad Daulatpur, Bawana Road',
      city: 'New Delhi',
      state: 'Delhi',
      coordinates: { lat: 28.7501, lng: 77.1177 }
    },
    type: 'Government',
    cutoffs: [
      { stream: 'Computer Science', category: 'General', cutoff: 1247, year: 2024 },
      { stream: 'Electronics', category: 'General', cutoff: 2451, year: 2024 },
      { stream: 'Mechanical', category: 'General', cutoff: 4521, year: 2024 }
    ],
    facilities: ['WiFi Campus', 'Library', 'Hostels', 'Sports Complex', 'Innovation Center', 'Industry Partnerships'],
    distance: 22.8,
    fees: { tuition: 150000, hostel: 20000 },
    rating: 4.6,
    lastUpdated: new Date()
  },
  {
    id: 'col-3',
    name: 'Netaji Subhas University of Technology',
    location: {
      address: 'Sector 3, Dwarka',
      city: 'New Delhi',
      state: 'Delhi',
      coordinates: { lat: 28.6097, lng: 77.0376 }
    },
    type: 'Government',
    cutoffs: [
      { stream: 'Computer Science', category: 'General', cutoff: 2841, year: 2024 },
      { stream: 'Electronics', category: 'General', cutoff: 4521, year: 2024 },
      { stream: 'Information Technology', category: 'General', cutoff: 3247, year: 2024 }
    ],
    facilities: ['Modern Labs', 'Library', 'Hostels', 'Cafeteria', 'Sports Facilities', 'Training & Placement'],
    distance: 18.5,
    fees: { tuition: 120000, hostel: 18000 },
    rating: 4.4,
    lastUpdated: new Date()
  },
  {
    id: 'col-4',
    name: 'Indira Gandhi Delhi Technical University for Women',
    location: {
      address: 'Kashmere Gate',
      city: 'New Delhi',
      state: 'Delhi',
      coordinates: { lat: 28.6667, lng: 77.2167 }
    },
    type: 'Government',
    cutoffs: [
      { stream: 'Computer Science', category: 'General', cutoff: 3521, year: 2024 },
      { stream: 'Electronics', category: 'General', cutoff: 5241, year: 2024 },
      { stream: 'Information Technology', category: 'General', cutoff: 4128, year: 2024 }
    ],
    facilities: ['Women-Only Campus', 'Modern Infrastructure', 'Library', 'Hostels', 'Skill Development Center'],
    distance: 12.1,
    fees: { tuition: 100000, hostel: 15000 },
    rating: 4.3,
    lastUpdated: new Date()
  }
];

// Mock Career Paths
export const mockCareerPaths: CareerPath[] = [
  {
    id: 'career-1',
    title: 'Software Development Career Path',
    stream: 'Computer Science',
    steps: [
      {
        phase: 'Foundation (Year 1-2)',
        duration: '2 years',
        requirements: ['Programming Fundamentals', 'Data Structures', 'Algorithms', 'Database Concepts'],
        outcomes: ['Basic Programming Skills', 'Problem Solving', 'Code Quality Understanding']
      },
      {
        phase: 'Specialization (Year 3-4)',
        duration: '2 years',
        requirements: ['Web/Mobile Development', 'System Design', 'Software Engineering', 'Internships'],
        outcomes: ['Full-stack Development', 'Project Management', 'Industry Experience']
      },
      {
        phase: 'Professional Growth (0-3 years)',
        duration: '3 years',
        requirements: ['Industry Experience', 'Advanced Technologies', 'Team Leadership', 'Continuous Learning'],
        outcomes: ['Senior Developer Role', 'Technical Leadership', 'Specialized Expertise']
      },
      {
        phase: 'Leadership (3+ years)',
        duration: 'Ongoing',
        requirements: ['Management Skills', 'Strategic Thinking', 'Mentoring', 'Business Understanding'],
        outcomes: ['Technical Lead/Manager', 'Solution Architect', 'CTO/VP Engineering']
      }
    ],
    growthData: [
      { year: 2020, opportunities: 850000, avgSalary: 600000 },
      { year: 2021, opportunities: 920000, avgSalary: 680000 },
      { year: 2022, opportunities: 1100000, avgSalary: 750000 },
      { year: 2023, opportunities: 1280000, avgSalary: 820000 },
      { year: 2024, opportunities: 1450000, avgSalary: 950000 },
      { year: 2025, opportunities: 1620000, avgSalary: 1100000 }
    ],
    lastUpdated: new Date()
  },
  {
    id: 'career-2',
    title: 'Data Science & AI Career Path',
    stream: 'Data Science',
    steps: [
      {
        phase: 'Mathematical Foundation (Year 1-2)',
        duration: '2 years',
        requirements: ['Statistics & Probability', 'Linear Algebra', 'Python/R Programming', 'Data Visualization'],
        outcomes: ['Statistical Analysis', 'Data Manipulation', 'Basic ML Understanding']
      },
      {
        phase: 'Machine Learning (Year 3-4)',
        duration: '2 years',
        requirements: ['ML Algorithms', 'Deep Learning', 'Big Data Tools', 'Research Projects'],
        outcomes: ['ML Model Development', 'Data Pipeline Creation', 'Research Skills']
      },
      {
        phase: 'Specialization (0-2 years)',
        duration: '2 years',
        requirements: ['Domain Expertise', 'Advanced AI', 'MLOps', 'Business Intelligence'],
        outcomes: ['AI Solutions', 'Production Systems', 'Business Impact']
      },
      {
        phase: 'Strategic Leadership (2+ years)',
        duration: 'Ongoing',
        requirements: ['Data Strategy', 'Team Management', 'Cross-functional Collaboration', 'Innovation'],
        outcomes: ['Chief Data Officer', 'AI Research Director', 'Data Science Consultant']
      }
    ],
    growthData: [
      { year: 2020, opportunities: 120000, avgSalary: 800000 },
      { year: 2021, opportunities: 165000, avgSalary: 950000 },
      { year: 2022, opportunities: 220000, avgSalary: 1200000 },
      { year: 2023, opportunities: 285000, avgSalary: 1450000 },
      { year: 2024, opportunities: 380000, avgSalary: 1700000 },
      { year: 2025, opportunities: 480000, avgSalary: 2000000 }
    ],
    lastUpdated: new Date()
  }
];

// Mock Notifications
export const mockNotifications: Notification[] = [
  {
    id: 'notif-1',
    type: 'admission',
    title: 'JEE Advanced 2025 Registration Opens',
    description: 'Registration for JEE Advanced 2025 is now open. Last date to register is March 15, 2025.',
    priority: 'high',
    deadline: new Date('2025-03-15'),
    actionUrl: 'https://jeeadv.ac.in',
    isRead: false,
    createdAt: new Date('2025-02-20')
  },
  {
    id: 'notif-2',
    type: 'scholarship',
    title: 'National Talent Search Examination',
    description: 'NTSE 2025 applications are open for Class X students. Scholarship amount: ₹1,250/month.',
    priority: 'medium',
    deadline: new Date('2025-01-31'),
    actionUrl: 'https://ncert.nic.in/ntse',
    isRead: false,
    createdAt: new Date('2025-01-10')
  },
  {
    id: 'notif-3',
    type: 'exam',
    title: 'BITSAT 2025 Exam Dates Announced',
    description: 'BITSAT 2025 will be conducted from May 15-25, 2025. Registration starts March 1.',
    priority: 'medium',
    deadline: new Date('2025-05-25'),
    isRead: true,
    createdAt: new Date('2025-02-01')
  },
  {
    id: 'notif-4',
    type: 'announcement',
    title: 'New Career Assessment Tool',
    description: 'Try our updated career assessment tool with AI-powered recommendations based on your profile.',
    priority: 'low',
    isRead: false,
    createdAt: new Date('2025-02-15')
  },
  {
    id: 'notif-5',
    type: 'admission',
    title: 'Delhi University Admissions 2025',
    description: 'DU admissions based on CUET scores. Registration portal opens April 1, 2025.',
    priority: 'high',
    deadline: new Date('2025-06-30'),
    actionUrl: 'https://du.ac.in',
    isRead: false,
    createdAt: new Date('2025-03-20')
  }
];

// Utility functions for mock data
export const getRecommendationsByMatch = (minMatch: number = 70): StreamRecommendation[] => {
  return mockRecommendations.filter(rec => rec.matchPercentage >= minMatch);
};

export const getCollegesByDistance = (maxDistance: number = 50): College[] => {
  return mockColleges.filter(college => (college.distance || 0) <= maxDistance);
};

export const getCollegesByCutoff = (userScore: number, stream: string): College[] => {
  return mockColleges.filter(college => 
    college.cutoffs.some(cutoff => 
      cutoff.stream.toLowerCase().includes(stream.toLowerCase()) && 
      userScore <= cutoff.cutoff
    )
  );
};

export const getUnreadNotifications = (): Notification[] => {
  return mockNotifications.filter(notif => !notif.isRead);
};

export const getNotificationsByType = (type: Notification['type']): Notification[] => {
  return mockNotifications.filter(notif => notif.type === type);
};

export const getCareerGrowthProjection = (streamId: string): CareerPath | null => {
  return mockCareerPaths.find(path => path.id === streamId) || null;
};
