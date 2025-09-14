const express = require('express');
const { PrismaClient } = require('../../generated/prisma');
const router = express.Router();
const prisma = new PrismaClient();

// Get user's applications
router.get('/', async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    
    const applications = await prisma.application.findMany({
      where: { userId },
      include: {
        careerPath: true,
        college: true
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(applications);
  } catch (error) {
    console.error('Get applications error:', error);
    res.status(500).json({ error: 'Failed to get applications' });
  }
});

// Create new application
router.post('/', async (req, res) => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const {
      type,
      title,
      organization,
      careerPathId,
      collegeId,
      status,
      deadline,
      notes
    } = req.body;

    const application = await prisma.application.create({
      data: {
        userId,
        type,
        title,
        organization,
        careerPathId,
        collegeId,
        status: status || 'draft',
        deadline: deadline ? new Date(deadline) : null,
        notes
      },
      include: {
        careerPath: true,
        college: true
      }
    });

    res.status(201).json(application);
  } catch (error) {
    console.error('Create application error:', error);
    res.status(500).json({ error: 'Failed to create application' });
  }
});

// Update application
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      status,
      appliedAt,
      notes
    } = req.body;

    const application = await prisma.application.update({
      where: { id },
      data: {
        status,
        appliedAt: appliedAt ? new Date(appliedAt) : undefined,
        notes
      },
      include: {
        careerPath: true,
        college: true
      }
    });

    res.json(application);
  } catch (error) {
    console.error('Update application error:', error);
    res.status(500).json({ error: 'Failed to update application' });
  }
});

// Delete application
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    await prisma.application.delete({
      where: { id }
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Delete application error:', error);
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

module.exports = router;
