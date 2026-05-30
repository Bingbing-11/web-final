const express = require('express');
const router = express.Router();
const { listFriends, listRequests, sendRequest, acceptRequest, rejectRequest, removeFriend } = require('../controllers/friendController');
const { requireAuth } = require('../middleware/auth');

router.get('/', requireAuth, listFriends);
router.get('/requests', requireAuth, listRequests);
router.post('/request', requireAuth, sendRequest);
router.put('/request/:id/accept', requireAuth, acceptRequest);
router.put('/request/:id/reject', requireAuth, rejectRequest);
router.delete('/:id', requireAuth, removeFriend);

module.exports = router;
