import { useEffect, useState, useCallback } from 'react';
import { getMessagesAPI } from '../api/messageAPI';
import useSocket from '../hooks/useSocket';
import useAuth from '../hooks/useAuth';
import MessageList from './MessageList';
import ChatInput from './ChatInput';
import styles from './styles/ChatWindow.module.css';

export default function ChatWindow({ conversation }) {
  const socket = useSocket();
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState([]);

  // Load message history when conversation changes
  const loadMessages = useCallback(async () => {
    if (!conversation) return;
    setLoading(true);
    try {
      const res = await getMessagesAPI(conversation._id);
      setMessages(res.data);
    } catch (err) {
      console.error('Failed to load messages', err);
    } finally {
      setLoading(false);
    }
  }, [conversation]);

  useEffect(() => {
    setMessages([]);
    setTypingUsers([]);
    loadMessages();
  }, [loadMessages]);

  // Join/leave socket room when conversation changes
  useEffect(() => {
    if (!socket || !conversation) return;
    socket.emit('joinRoom', conversation._id);
    return () => {
      socket.emit('leaveRoom', conversation._id);
    };
  }, [socket, conversation]);

  // Listen for new messages in this room
  useEffect(() => {
    if (!socket) return;
    const handler = (msg) => {
      setMessages((prev) => {
        // Avoid duplicates (message may already be in list if sender)
        if (prev.find((m) => m._id === msg._id)) return prev;
        return [...prev, msg];
      });
    };
    socket.on('newMessage', handler);
    return () => socket.off('newMessage', handler);
  }, [socket]);

  // Typing indicators
  useEffect(() => {
    if (!socket) return;
    const onTyping = ({ userId, username }) => {
      if (userId === user._id) return;
      setTypingUsers((prev) =>
        prev.find((u) => u.userId === userId) ? prev : [...prev, { userId, username }]
      );
    };
    const onStop = ({ userId }) => {
      setTypingUsers((prev) => prev.filter((u) => u.userId !== userId));
    };
    socket.on('typing', onTyping);
    socket.on('stopTyping', onStop);
    return () => {
      socket.off('typing', onTyping);
      socket.off('stopTyping', onStop);
    };
  }, [socket, user._id]);

  if (!conversation) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>💬</div>
        <p>Chọn một cuộc trò chuyện để bắt đầu</p>
      </div>
    );
  }

  const getTitle = () => {
    if (conversation.type === 'group') return conversation.name || 'Nhóm chat';
    const other = conversation.members.find((m) => m._id !== user._id);
    return other?.username || 'Người dùng';
  };

  return (
    <div className={styles.window}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerAvatar}>
          {conversation.type === 'group' ? '👥' : getTitle().charAt(0).toUpperCase()}
        </div>
        <div className={styles.headerInfo}>
          <span className={styles.headerName}>{getTitle()}</span>
          {conversation.type === 'group' && (
            <span className={styles.memberCount}>
              {conversation.members.length} thành viên
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      {loading ? (
        <div className={styles.loading}>Đang tải tin nhắn...</div>
      ) : (
        <MessageList messages={messages} currentUserId={user._id} />
      )}

      {/* Typing indicator */}
      {typingUsers.length > 0 && (
        <div className={styles.typing}>
          {typingUsers.map((u) => u.username).join(', ')} đang nhập...
        </div>
      )}

      {/* Input */}
      <ChatInput conversationId={conversation._id} />
    </div>
  );
}
