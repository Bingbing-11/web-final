const express = require('express');
const router = express.Router();
const { searchUser, updateProfile } = require('../controllers/userController');
const { requireAuth } = require('../middleware/auth');

router.get('/search', requireAuth, searchUser);
router.put('/profile', requireAuth, updateProfile);

module.exports = router;
