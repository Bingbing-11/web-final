const express = require('express');
const router = express.Router();
const { listWorlds, createWorld, updateWorld, deleteWorld, toggleSeal } = require('../controllers/worldController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, listWorlds);
router.post('/', requireAuth, createWorld);
router.put('/:id', requireAuth, updateWorld);
router.delete('/:id', requireAuth, deleteWorld);
router.patch('/:id/seal', requireAuth, toggleSeal);

module.exports = router;
