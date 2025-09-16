const express = require('express');

const router = express.Router();

const User = require('../models/User');


// Register or get user on Google Auth
router.post('/register', async (req, res) => {
  try {
    console.log('Register request body:', req.body);
    const { googleId, email, name } = req.body;
    if (!googleId || !email) {
      return res.status(400).json({ error: 'Missing googleId or email' });
    }
    let user = await User.findOne({ googleId });
    if (!user) {
      user = await User.create({ googleId, email, name });
      console.log('New user created:', user);
    } else {
      console.log('User already exists:', user);
    }
    res.json(user);
  } catch (error) {
    console.error('Register user error:', error);
    res.status(500).json({ error: 'Failed to register user' });
  }
});


// ...existing code for profile and recommendations (to be refactored for MongoDB)

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
