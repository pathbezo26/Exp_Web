import { useEffect, useState, useCallback } from 'react';
import { getConversationsAPI } from '../api/conversationAPI';
import useAuth from '../hooks/useAuth';
import useSocket from '../hooks/useSocket';
import UserSearch from './UserSearch';
import CreateGroupModal from './CreateGroupModal';
import { formatMessageTime } from '../utils/formatTime';
import styles from './styles/Sidebar.module.css';

export default function Sidebar({ activeConversation, onSelectConversation }) {
  const { user, logout } = useAuth();
  const socket = useSocket();
  const [conversations, setConversations] = useState([]);
  const [showSearch, setShowSearch] = useState(false);
  const [showGroupModal, setShowGroupModal] = useState(false);

  const loadConversations = useCallback(async () => {
    try {
      const res = await getConversationsAPI();
      setConversations(res.data);
    } catch (err) {
      console.error('Failed to load conversations', err);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  // Refresh sidebar order when a new message arrives in any room
  useEffect(() => {
    if (!socket) return;
    const handler = () => loadConversations();
    socket.on('newMessage', handler);
    return () => socket.off('newMessage', handler);
  }, [socket, loadConversations]);

  const getConversationName = (conv) => {
    if (conv.type === 'group') return conv.name || 'Nhóm không tên';
    const other = conv.members.find((m) => m._id !== user._id);
    return other?.username || 'Người dùng';
  };

  const getAvatar = (conv) => {
    if (conv.type === 'group') return '👥';
    const name = getConversationName(conv);
    return name.charAt(0).toUpperCase();
  };

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{user.username.charAt(0).toUpperCase()}</div>
          <span className={styles.username}>{user.username}</span>
        </div>
        <button className={styles.logoutBtn} onClick={logout} title="Đăng xuất">
          ⎋
        </button>
      </div>

      {/* Action buttons */}
      <div className={styles.actions}>
        <button
          className={styles.actionBtn}
          onClick={() => { setShowSearch(!showSearch); setShowGroupModal(false); }}
        >
          🔍 Tìm người dùng
        </button>
        <button
          className={styles.actionBtn}
          onClick={() => { setShowGroupModal(!showGroupModal); setShowSearch(false); }}
        >
          ➕ Tạo nhóm
        </button>
      </div>

      {/* Search panel */}
      {showSearch && (
        <UserSearch
          onConversationCreated={(conv) => {
            setConversations((prev) => {
              const exists = prev.find((c) => c._id === conv._id);
              return exists ? prev : [conv, ...prev];
            });
            onSelectConversation(conv);
            setShowSearch(false);
          }}
        />
      )}

      {/* Create group modal */}
      {showGroupModal && (
        <CreateGroupModal
          onClose={() => setShowGroupModal(false)}
          onCreated={(conv) => {
            setConversations((prev) => [conv, ...prev]);
            onSelectConversation(conv);
            setShowGroupModal(false);
          }}
        />
      )}

      {/* Conversation list */}
      <div className={styles.list}>
        {conversations.length === 0 && (
          <p className={styles.empty}>Chưa có cuộc trò chuyện nào.</p>
        )}
        {conversations.map((conv) => (
          <div
            key={conv._id}
            className={`${styles.item} ${activeConversation?._id === conv._id ? styles.active : ''}`}
            onClick={() => onSelectConversation(conv)}
          >
            <div className={styles.convAvatar}>{getAvatar(conv)}</div>
            <div className={styles.convInfo}>
              <span className={styles.convName}>{getConversationName(conv)}</span>
              <span className={styles.convTime}>
                {conv.updatedAt ? formatMessageTime(conv.updatedAt) : ''}
              </span>
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
