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

  // Hàm tải danh sách hội thoại
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

  // Lắng nghe sự kiện socket để cập nhật Sidebar theo thời gian thực
  useEffect(() => {
    if (!socket) return;

    const handleNewMessage = (msg) => {
      setConversations((prev) => {
        // Tìm hội thoại chứa tin nhắn này
        const index = prev.findIndex((c) => c._id === msg.conversationId);
        if (index === -1) {
          // Nếu hội thoại chưa có trong list (ví dụ tin nhắn từ người mới), tải lại toàn bộ
          loadConversations();
          return prev;
        }
        // Đưa hội thoại vừa có tin nhắn lên đầu và cập nhật updatedAt
        const updated = [...prev];
        const conv = { ...updated[index], updatedAt: msg.createdAt };
        updated.splice(index, 1);
        return [conv, ...updated];
      });
    };

    socket.on('newMessage', handleNewMessage);
    return () => socket.off('newMessage', handleNewMessage);
  }, [socket, loadConversations]);

  const getConversationName = (conv) => {
    if (conv.type === 'group') return conv.name || 'Nhóm không tên';
    const otherMember = conv.members.find((m) => m._id !== user?._id);
    return otherMember?.username || 'Người dùng';
  };

  const getAvatarLetter = (conv) => {
    if (conv.type === 'group') return '👥';
    return getConversationName(conv).charAt(0).toUpperCase();
  };

  return (
    <aside className={styles.sidebar}>
      {/* User Header */}
      <div className={styles.header}>
        <div className={styles.userInfo}>
          <div className={styles.avatar}>{user?.username?.charAt(0).toUpperCase()}</div>
          <span className={styles.username}>{user?.username}</span>
        </div>
        <button className={styles.logoutBtn} onClick={logout} title="Đăng xuất">⎋</button>
      </div>

      {/* Action Tabs */}
      <div className={styles.actions}>
        <button 
          className={`${styles.actionBtn} ${showSearch ? styles.btnActive : ''}`}
          onClick={() => { setShowSearch(!showSearch); setShowGroupModal(false); }}
        >
          🔍 Tìm kiếm
        </button>
        <button 
          className={`${styles.actionBtn} ${showGroupModal ? styles.btnActive : ''}`}
          onClick={() => { setShowGroupModal(!showGroupModal); setShowSearch(false); }}
        >
          ➕ Tạo nhóm
        </button>
      </div>

      {/* Toggles: Search & Group Modal */}
      {showSearch && (
        <UserSearch 
          onConversationCreated={(conv) => {
            setConversations(prev => {
              const exists = prev.find(c => c._id === conv._id);
              return exists ? prev : [conv, ...prev];
            });
            onSelectConversation(conv);
            setShowSearch(false);
          }} 
        />
      )}

      {showGroupModal && (
        <CreateGroupModal 
          onClose={() => setShowGroupModal(false)}
          onCreated={(conv) => {
            setConversations(prev => [conv, ...prev]);
            onSelectConversation(conv);
            setShowGroupModal(false);
          }}
        />
      )}

      {/* Conversation List */}
      <div className={styles.list}>
        {conversations.length === 0 ? (
          <p className={styles.empty}>Chưa có cuộc hội thoại nào</p>
        ) : (
          conversations.map((conv) => (
            <div
              key={conv._id}
              className={`${styles.item} ${activeConversation?._id === conv._id ? styles.active : ''}`}
              onClick={() => onSelectConversation(conv)}
            >
              <div className={styles.convAvatar}>{getAvatarLetter(conv)}</div>
              <div className={styles.convInfo}>
                <span className={styles.convName}>{getConversationName(conv)}</span>
                <span className={styles.convTime}>
                  {conv.updatedAt ? formatMessageTime(conv.updatedAt) : ''}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}