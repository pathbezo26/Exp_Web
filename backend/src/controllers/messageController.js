const Message = require('../models/Message');
const Conversation = require('../models/Conversation');

// GET /api/messages/:conversationId — get chat history
const getMessages = async (req, res) => {
  const { conversationId } = req.params;

  try {
    const messages = await Message.find({ conversationId })
      .populate('sender', '_id username email')
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.', error: err.message });
  }
};

// POST /api/messages — save a new message
const saveMessage = async (req, res) => {
  const { conversationId, content } = req.body;

  if (!conversationId || !content) {
    return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc.' });
  }

  try {
    const message = await Message.create({
      conversationId,
      sender: req.user.id,
      content,
    });

    // Update conversation updatedAt so sidebar sorts correctly
    await Conversation.findByIdAndUpdate(conversationId, { updatedAt: new Date() });

    const populated = await message.populate('sender', '_id username email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.', error: err.message });
  }
};

module.exports = { getMessages, saveMessage };
