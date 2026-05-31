const express = require('express');
const router = express.Router();
const { searchUser, updateProfile, getStats } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.get('/search', requireAuth, searchUser);
router.get('/stats', requireAuth, getStats);
router.put('/profile', requireAuth, updateProfile);

module.exports = router;
