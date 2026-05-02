const express = require('express');
const router = express.Router();
const { getMessages, saveMessage } = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/:conversationId', getMessages);
router.post('/', saveMessage);

module.exports = router;
