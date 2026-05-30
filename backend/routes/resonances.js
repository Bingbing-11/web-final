const express = require('express');
const router = express.Router();
const { listResonances, createResonance, removeResonance, toggleReaction } = require('../controllers/resonanceController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, listResonances);
router.post('/', requireAuth, createResonance);
router.delete('/:id', requireAuth, removeResonance);
router.post('/:id/react', requireAuth, toggleReaction);

module.exports = router;
