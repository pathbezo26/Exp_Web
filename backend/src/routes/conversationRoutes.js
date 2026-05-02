const express = require('express');
const router = express.Router();
const { getConversations, createConversation } = require('../controllers/conversationController');
const authMiddleware = require('../middleware/authMiddleware');

router.use(authMiddleware);

router.get('/', getConversations);
router.post('/', createConversation);

module.exports = router;
