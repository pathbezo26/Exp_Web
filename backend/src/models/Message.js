const mongoose = require('mongoose');
const { Types: { ObjectId } } = mongoose;

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: ObjectId,
      ref: 'Conversation',
      required: true,
    },
    sender: {
      type: ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

// Compound index: optimise history query — filter by conversation, sort by time
MessageSchema.index({ conversationId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', MessageSchema);
