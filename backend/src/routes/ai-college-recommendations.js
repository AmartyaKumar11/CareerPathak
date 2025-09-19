const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

// Load college data once when the module loads
let collegesData = [];
try {
  const collegesPath = path.resolve(__dirname, '../../../colleges_with_cleaned_fees.json');
  const rawData = fs.readFileSync(collegesPath, 'utf8');
  collegesData = JSON.parse(rawData);
  console.log(`✅ Loaded ${collegesData.length} colleges from JSON`);
} catch (error) {
  console.error('❌ Error loading colleges data:', error.message);
}

// AI-based course matching function
function getRecommendedCoursesForStream(streamName) {
  const streamToCourses = {
    'Journalism & Mass Communication': [
      'Mass Communication', 'Media Studies', 'Journalism', 'Public Relations', 'Advertising',
      'Bachelor of Arts (B.A.)', 'Bachelor of Journalism'
    ],
    'Computer Science & Engineering': [
      'Computer Science', 'Information Technology', 'Software Engineering',
      'Bachelor of Computer Applications (BCA)', 'Bachelor of Technology (B.Tech)',
      'Bachelor of Science (B.Sc.)', 'Computer Applications'
    ],
    'Business Administration': [
      'Business Administration', 'Management', 'Finance', 'Marketing',
      'Bachelor of Business Administration (BBA)', 'Bachelor of Commerce (B.Com)',
      'Bachelor of Arts (B.A.)'
    ],
    'Medicine': [
      'MBBS', 'Bachelor of Medicine', 'Medical Science', 'Bachelor of Science (B.Sc.)',
      'Nursing', 'Pharmacy'
    ],
    'Engineering': [
      'Bachelor of Technology (B.Tech)', 'Engineering', 'Bachelor of Science (B.Sc.)',
      'Computer Science', 'Mechanical Engineering', 'Civil Engineering'
    ],
    'Arts & Humanities': [
      'Bachelor of Arts (B.A.)', 'English Literature', 'History', 'Political Science',
      'Philosophy', 'Psychology'
    ],
    'Science': [
      'Bachelor of Science (B.Sc.)', 'Physics', 'Chemistry', 'Mathematics',
      'Biology', 'Environmental Science'
    ]
  };

  // Return matched courses or fallback to common courses
  return streamToCourses[streamName] || [
    'Bachelor of Arts (B.A.)', 
    'Bachelor of Science (B.Sc.)', 
    'Bachelor of Commerce (B.Com)'
  ];
}

// Transform college data to match frontend expectations
function transformCollegeData(colleges) {
  const collegeMap = new Map();
  
  colleges.forEach((college, index) => {
    const collegeName = college['College Name'];
    const course = college['Course'];
    const fees = college['Fees (Annual)'];
    const eligibility = college['Eligibility'];
    
    if (!collegeMap.has(collegeName)) {
      collegeMap.set(collegeName, {
        id: `college-${index}`,
        name: collegeName,
        location: 'J&K, India', // Default location
        type: collegeName.toLowerCase().includes('government') ? 'Government' : 'Private',
        fees: fees,
        rating: Math.round((Math.random() * 2 + 3) * 10) / 10, // Random rating 3.0-5.0
        courses: [course],
        admissionDeadline: '2024-07-31',
        cutoff: eligibility,
        placement: {
          average: '₹3-8L',
          highest: '₹15-25L',
          percentage: Math.floor(Math.random() * 30) + 70 // 70-100%
        }
      });
    } else {
      // Add course to existing college
      const existingCollege = collegeMap.get(collegeName);
      if (!existingCollege.courses.includes(course)) {
        existingCollege.courses.push(course);
      }
    }
  });
  
  return Array.from(collegeMap.values());
}

// API endpoint for AI-recommended colleges
router.get('/', (req, res) => {
  try {
    const { stream } = req.query;
    
    if (!stream) {
      return res.status(400).json({
        error: 'Stream parameter is required'
      });
    }

    console.log(`🔍 Getting recommendations for stream: ${stream}`);
    
    // Get recommended courses using AI logic
    const recommendedCourses = getRecommendedCoursesForStream(stream);
    console.log(`📚 Recommended courses: ${recommendedCourses.join(', ')}`);
    
    // Filter colleges that offer these courses
    const matchedColleges = collegesData.filter(college => {
      const collegeCourse = college['Course'];
      return recommendedCourses.some(recCourse => 
        collegeCourse.toLowerCase().includes(recCourse.toLowerCase()) ||
        recCourse.toLowerCase().includes(collegeCourse.toLowerCase())
      );
    });
    
    console.log(`🏫 Found ${matchedColleges.length} matching colleges`);
    
    // Transform the data for frontend
    const transformedColleges = transformCollegeData(matchedColleges);
    
    // Limit to top 12 colleges to avoid overwhelming the UI
    const limitedColleges = transformedColleges.slice(0, 12);
    
    res.json({
      colleges: limitedColleges,
      totalCount: transformedColleges.length,
      stream: stream,
      recommendedCourses: recommendedCourses
    });
    
  } catch (error) {
    console.error('❌ Error in AI college recommendations:', error);
    res.status(500).json({
      error: 'Failed to get college recommendations',
      message: error.message
    });
  }
});

module.exports = router;