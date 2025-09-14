const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const router = express.Router();
const prisma = new PrismaClient();

// Get personalized recommendations for user
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    
    // Get user profile for personalization
    const userProfile = await prisma.userProfile.findUnique({
      where: { userId },
      include: { user: true }
    });

    // If no profile exists, return general recommendations
    if (!userProfile) {
      return res.json({
        recommendations: [],
        message: 'Complete your profile to get personalized recommendations'
      });
    }

    // Generate career recommendations based on interests and subjects
    const careerRecommendations = await generateCareerRecommendations(userProfile);
    
    // Generate college recommendations
    const collegeRecommendations = await generateCollegeRecommendations(userProfile);
    
    // Generate scholarship recommendations
    const scholarshipRecommendations = await generateScholarshipRecommendations(userProfile);

    // Combine and sort by score
    const allRecommendations = [
      ...careerRecommendations,
      ...collegeRecommendations, 
      ...scholarshipRecommendations
    ].sort((a, b) => b.score - a.score);

    res.json({
      recommendations: allRecommendations.slice(0, 10), // Top 10
      userProfile: {
        name: userProfile.user.name,
        currentClass: userProfile.currentClass,
        interests: userProfile.careerInterests
      }
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
});

// Mark recommendation as viewed/liked/applied
router.post('/:id/action', async (req, res) => {
  try {
    const { id } = req.params;
    const { action } = req.body; // 'viewed', 'liked', 'applied'
    
    const recommendation = await prisma.recommendation.update({
      where: { id },
      data: { [action]: true }
    });

    res.json({ success: true, recommendation });
  } catch (error) {
    console.error('Recommendation action error:', error);
    res.status(500).json({ error: 'Failed to update recommendation' });
  }
});

// Helper function: Generate career recommendations
async function generateCareerRecommendations(userProfile) {
  // Get all career paths (in real app, this would come from database)
  const careerPaths = [
    {
      id: '1',
      title: 'Software Engineering',
      description: 'Design and develop software applications',
      category: 'Technology',
      requiredSkills: ['Programming', 'Problem Solving', 'Mathematics'],
      averageSalary: '₹8-25 LPA',
      education: 'BTech/BE in Computer Science'
    },
    {
      id: '2', 
      title: 'Data Science',
      description: 'Analyze data to extract insights and build models',
      category: 'Technology',
      requiredSkills: ['Statistics', 'Python', 'Machine Learning'],
      averageSalary: '₹6-20 LPA',
      education: 'BTech/MSc in related field'
    },
    {
      id: '3',
      title: 'Medicine',
      description: 'Healthcare professional treating patients',
      category: 'Healthcare',
      requiredSkills: ['Biology', 'Chemistry', 'Compassion'],
      averageSalary: '₹10-50 LPA',
      education: 'MBBS degree'
    },
    {
      id: '4',
      title: 'Engineering',
      description: 'Design and build solutions to technical problems',
      category: 'Engineering',
      requiredSkills: ['Mathematics', 'Physics', 'Problem Solving'],
      averageSalary: '₹5-15 LPA', 
      education: 'BTech/BE degree'
    }
  ];

  const recommendations = careerPaths.map(career => {
    let score = 0;
    let reasoning = [];

    // Score based on career interests
    if (userProfile.careerInterests) {
      const interestMatch = userProfile.careerInterests.some(interest => 
        career.category.toLowerCase().includes(interest.toLowerCase()) ||
        career.title.toLowerCase().includes(interest.toLowerCase())
      );
      if (interestMatch) {
        score += 40;
        reasoning.push('Matches your career interests');
      }
    }

    // Score based on subjects
    if (userProfile.subjects) {
      const subjectMatch = career.requiredSkills.some(skill =>
        userProfile.subjects.some(subject => 
          skill.toLowerCase().includes(subject.toLowerCase()) ||
          subject.toLowerCase().includes(skill.toLowerCase())
        )
      );
      if (subjectMatch) {
        score += 30;
        reasoning.push('Aligns with your subject interests');
      }
    }

    // Score based on academic performance
    if (userProfile.academicPerformance === 'excellent') {
      score += 20;
      reasoning.push('Your academic performance qualifies you for this field');
    } else if (userProfile.academicPerformance === 'good') {
      score += 15;
    }

    // Base score for general recommendation
    score += 10;

    return {
      id: `career-${career.id}`,
      type: 'career',
      title: career.title,
      description: career.description,
      category: career.category,
      details: {
        requiredSkills: career.requiredSkills,
        averageSalary: career.averageSalary,
        education: career.education
      },
      score,
      reasoning: reasoning.length ? reasoning.join('. ') : 'General recommendation based on your profile',
      viewed: false,
      liked: false,
      applied: false
    };
  });

  return recommendations.filter(rec => rec.score > 20); // Only return decent matches
}

// Helper function: Generate college recommendations  
async function generateCollegeRecommendations(userProfile) {
  const colleges = [
    {
      id: '1',
      name: 'IIT Delhi',
      location: 'Delhi',
      type: 'government',
      ranking: 1,
      courses: ['Computer Science', 'Electrical Engineering', 'Mechanical Engineering']
    },
    {
      id: '2',
      name: 'BITS Pilani',
      location: 'Rajasthan',
      type: 'private',
      ranking: 15,
      courses: ['Computer Science', 'Electronics', 'Chemical Engineering']
    },
    {
      id: '3',
      name: 'Delhi University',
      location: 'Delhi', 
      type: 'government',
      ranking: 25,
      courses: ['Arts', 'Science', 'Commerce']
    }
  ];

  const recommendations = colleges.map(college => {
    let score = 0;
    let reasoning = [];

    // Score based on academic performance
    if (userProfile.academicPerformance === 'excellent' && college.ranking <= 10) {
      score += 35;
      reasoning.push('Top-tier college matching your excellent academic performance');
    } else if (userProfile.academicPerformance === 'good' && college.ranking <= 25) {
      score += 25;
      reasoning.push('Good college option for your academic level');
    } else {
      score += 15;
    }

    // Score based on location preference
    if (userProfile.preferredLocation && 
        college.location.toLowerCase().includes(userProfile.preferredLocation.toLowerCase())) {
      score += 20;
      reasoning.push('Located in your preferred area');
    }

    // Score based on course availability matching interests
    if (userProfile.careerInterests) {
      const courseMatch = college.courses.some(course =>
        userProfile.careerInterests.some(interest =>
          course.toLowerCase().includes(interest.toLowerCase()) ||
          interest.toLowerCase().includes(course.toLowerCase())
        )
      );
      if (courseMatch) {
        score += 25;
        reasoning.push('Offers courses aligned with your interests');
      }
    }

    return {
      id: `college-${college.id}`,
      type: 'college',
      title: college.name,
      description: `${college.type.charAt(0).toUpperCase() + college.type.slice(1)} college in ${college.location}`,
      category: 'Education',
      details: {
        location: college.location,
        type: college.type,
        ranking: college.ranking,
        courses: college.courses
      },
      score,
      reasoning: reasoning.length ? reasoning.join('. ') : 'College recommendation based on your profile',
      viewed: false,
      liked: false,
      applied: false
    };
  });

  return recommendations.filter(rec => rec.score > 20);
}

// Helper function: Generate scholarship recommendations
async function generateScholarshipRecommendations(userProfile) {
  const scholarships = [
    {
      id: '1',
      title: 'Merit Scholarship for Engineering',
      provider: 'Government of India',
      amount: '₹50,000/year',
      category: 'Merit-based',
      eligibility: ['Engineering students', 'Minimum 85% marks']
    },
    {
      id: '2',
      title: 'Need-based Education Support',
      provider: 'Private Foundation',
      amount: '₹25,000/year',
      category: 'Need-based',
      eligibility: ['Family income < ₹3 LPA', 'Good academic record']
    },
    {
      id: '3',
      title: 'Women in STEM Scholarship',
      provider: 'Tech Companies',
      amount: '₹75,000',
      category: 'Diversity',
      eligibility: ['Female students', 'STEM fields', 'Minimum 80% marks']
    }
  ];

  const recommendations = scholarships.map(scholarship => {
    let score = 0;
    let reasoning = [];

    // Score based on academic performance for merit scholarships
    if (scholarship.category === 'Merit-based' && userProfile.academicPerformance === 'excellent') {
      score += 40;
      reasoning.push('Your excellent performance qualifies for merit scholarships');
    }

    // Score based on career interests matching scholarship field
    if (userProfile.careerInterests) {
      const fieldMatch = userProfile.careerInterests.some(interest =>
        scholarship.title.toLowerCase().includes(interest.toLowerCase()) ||
        scholarship.category.toLowerCase().includes(interest.toLowerCase())
      );
      if (fieldMatch) {
        score += 30;
        reasoning.push('Scholarship aligned with your field of interest');
      }
    }

    // Base score
    score += 20;

    return {
      id: `scholarship-${scholarship.id}`,
      type: 'scholarship',
      title: scholarship.title,
      description: `${scholarship.amount} scholarship from ${scholarship.provider}`,
      category: 'Financial Aid',
      details: {
        provider: scholarship.provider,
        amount: scholarship.amount,
        category: scholarship.category,
        eligibility: scholarship.eligibility
      },
      score,
      reasoning: reasoning.length ? reasoning.join('. ') : 'Scholarship opportunity for you',
      viewed: false,
      liked: false,
      applied: false
    };
  });

  return recommendations.filter(rec => rec.score > 25);
}

module.exports = router;
