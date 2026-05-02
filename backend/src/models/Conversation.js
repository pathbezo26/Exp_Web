const mongoose = require('mongoose');
const { Types: { ObjectId } } = mongoose;

const ConversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['private', 'group'],
      required: true,
    },
    name: {
      type: String,
      default: null,
    },
    members: [
      {
        type: ObjectId,
        ref: 'User',
        required: true,
      },
    ],
    createdBy: {
      type: ObjectId,
      ref: 'User',
    },
  },
  { timestamps: true }
);

// Compound index: sidebar query — filter by members, sort by latest
ConversationSchema.index({ members: 1, updatedAt: -1 });
// Check for duplicate private conversations
ConversationSchema.index({ type: 1, members: 1 });

module.exports = mongoose.model('Conversation', ConversationSchema);
