const express = require('express');
const Experience = require('../models/Experience');
const router = express.Router();

// GET all experiences
router.get('/', async (req, res) => {
  try {
    const experiences = await Experience.find({})
      .sort({ createdAt: -1 });
    res.json(experiences);
  } catch (error) {
    console.error('Error fetching experiences:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// GET single experience by ID
router.get('/:id', async (req, res) => {
  try {
    const experience = await Experience.findById(req.params.id);
    
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    // Filter available slots (future dates with available spots)
    const currentDate = new Date();
    experience.slots = experience.slots.filter(slot => 
      new Date(slot.date) >= currentDate && slot.availableSpots > 0 && slot.isActive
    );

    res.json(experience);
  } catch (error) {
    console.error('Error fetching experience:', error);
    if (error.name === 'CastError') {
      return res.status(400).json({ error: 'Invalid experience ID' });
    }
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;