const Conversation = require('../models/Conversation');

// GET /api/conversations — get all conversations of current user
const getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({ members: req.user.id })
      .populate('members', '_id username email')
      .sort({ updatedAt: -1 });

    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.', error: err.message });
  }
};

// POST /api/conversations — create private or group conversation
const createConversation = async (req, res) => {
  const { type, name, members } = req.body;

  if (!type || !members || !Array.isArray(members)) {
    return res.status(400).json({ message: 'Thiếu dữ liệu bắt buộc.' });
  }

  // Always include the creator in members
  const allMembers = [...new Set([req.user.id, ...members])];

  try {
    // For private chat: return existing conversation if already exists
    if (type === 'private') {
      if (allMembers.length !== 2) {
        return res.status(400).json({ message: 'Chat riêng tư cần đúng 2 thành viên.' });
      }

      const existing = await Conversation.findOne({
        type: 'private',
        members: { $all: allMembers, $size: 2 },
      }).populate('members', '_id username email');

      if (existing) return res.json(existing);
    }

    const conversation = await Conversation.create({
      type,
      name: type === 'group' ? name : undefined,
      members: allMembers,
      createdBy: req.user.id,
    });

    const populated = await conversation.populate('members', '_id username email');
    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: 'Lỗi server.', error: err.message });
  }
};

module.exports = { getConversations, createConversation };
