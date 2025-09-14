const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const router = express.Router();
const prisma = new PrismaClient();

// Get user profile
router.get('/profile', async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    
    let user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    // Create demo user if doesn't exist
    if (!user) {
      user = await prisma.user.create({
        data: {
          id: userId,
          email: req.user?.email || 'demo@example.com',
          name: req.user?.name || 'Demo User',
          googleId: 'demo-google-id'
        },
        include: { profile: true }
      });
    }

    res.json(user);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get user profile' });
  }
});

// Create or update user profile
router.post('/profile', async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const {
      currentClass,
      subjects,
      academicPerformance,
      careerInterests,
      skillLevel,
      preferredLocation,
      workStyle,
      personalityType
    } = req.body;

    // Ensure user exists
    await prisma.user.upsert({
      where: { id: userId },
      update: {},
      create: {
        id: userId,
        email: req.user?.email || 'demo@example.com',
        name: req.user?.name || 'Demo User',
        googleId: 'demo-google-id'
      }
    });

    // Create or update profile
    const profile = await prisma.userProfile.upsert({
      where: { userId },
      update: {
        currentClass,
        subjects,
        academicPerformance,
        careerInterests,
        skillLevel,
        preferredLocation,
        workStyle,
        personalityType
      },
      create: {
        userId,
        currentClass,
        subjects,
        academicPerformance,
        careerInterests,
        skillLevel,
        preferredLocation,
        workStyle,
        personalityType
      }
    });

    res.json(profile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Get user's recommendations history
router.get('/recommendations', async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    
    const recommendations = await prisma.recommendation.findMany({
      where: { userId },
      include: {
        careerPath: true,
        college: true,
        scholarship: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(recommendations);
  } catch (error) {
    console.error('Get user recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

module.exports = router;
