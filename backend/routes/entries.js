const express = require('express');
const router = express.Router();
const { listEntries, createEntry, updateEntry, deleteEntry, burnEntry } = require('../controllers/entryController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, listEntries);
router.post('/', requireAuth, createEntry);
router.put('/:id', requireAuth, updateEntry);
router.delete('/:id', requireAuth, deleteEntry);
router.patch('/:id/burn', requireAuth, burnEntry);

module.exports = router;
