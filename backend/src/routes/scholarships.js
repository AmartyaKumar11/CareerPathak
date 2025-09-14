const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const router = express.Router();
const prisma = new PrismaClient();

// Get all scholarships
router.get('/', async (req, res) => {
  try {
    const { category, search } = req.query;
    
    let whereClause = {};
    
    if (category && category !== 'all') {
      whereClause.category = category;
    }
    
    if (search) {
      whereClause.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { provider: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ];
    }

    const scholarships = await prisma.scholarship.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }
    });

    res.json(scholarships);
  } catch (error) {
    console.error('Get scholarships error:', error);
    res.status(500).json({ error: 'Failed to get scholarships' });
  }
});

// Get user's scholarship applications
router.get('/my-applications', async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    
    const applications = await prisma.userScholarship.findMany({
      where: { userId },
      include: { scholarship: true },
      orderBy: { createdAt: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    console.error('Get user scholarships error:', error);
    res.status(500).json({ error: 'Failed to get user scholarships' });
  }
});

// Apply for scholarship
router.post('/:id/apply', async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const { id: scholarshipId } = req.params;
    const { notes } = req.body;

    const application = await prisma.userScholarship.upsert({
      where: {
        userId_scholarshipId: {
          userId,
          scholarshipId
        }
      },
      update: {
        status: 'applied',
        appliedAt: new Date(),
        notes
      },
      create: {
        userId,
        scholarshipId,
        status: 'applied',
        appliedAt: new Date(),
        notes
      },
      include: { scholarship: true }
    });

    res.json(application);
  } catch (error) {
    console.error('Apply for scholarship error:', error);
    res.status(500).json({ error: 'Failed to apply for scholarship' });
  }
});

// Update scholarship application status
router.put('/applications/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes } = req.body;

    const application = await prisma.userScholarship.update({
      where: { id },
      data: { status, notes },
      include: { scholarship: true }
    });

    res.json(application);
  } catch (error) {
    console.error('Update scholarship application error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

module.exports = router;
