import { useEffect, useRef } from 'react';
import { formatMessageTime, formatFullTime } from '../utils/formatTime';
import styles from './styles/MessageList.module.css';

export default function MessageList({ messages, currentUserId }) {
  const bottomRef = useRef(null);

  // Tự động cuộn xuống khi có tin nhắn mới
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!messages || messages.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện! 👋</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {messages.map((msg, idx) => {
        // Kiểm tra xem msg.sender có phải object hay chỉ là ID (tùy vào populate của backend)
        const senderId = typeof msg.sender === 'object' ? msg.sender._id : msg.sender;
        const isOwn = senderId === currentUserId;
        
        // Hiển thị avatar nếu là tin nhắn đầu tiên của người khác hoặc người gửi thay đổi
        const prevMsg = messages[idx - 1];
        const prevSenderId = prevMsg ? (typeof prevMsg.sender === 'object' ? prevMsg.sender._id : prevMsg.sender) : null;
        const showAvatar = !isOwn && (idx === 0 || prevSenderId !== senderId);

        return (
          <div
            key={msg._id || idx}
            className={`${styles.row} ${isOwn ? styles.own : styles.other}`}
          >
            {!isOwn && (
              <div className={styles.avatarSlot}>
                {showAvatar ? (
                  <div className={styles.avatar} title={msg.sender?.username}>
                    {msg.sender?.username?.charAt(0).toUpperCase() || '?'}
                  </div>
                ) : (
                  <div className={styles.avatarBlank} />
                )}
              </div>
            )}

            <div className={styles.bubble} title={formatFullTime(msg.createdAt)}>
              {!isOwn && showAvatar && msg.sender?.username && (
                <span className={styles.senderName}>{msg.sender.username}</span>
              )}
              <p className={styles.content}>{msg.content}</p>
              <span className={styles.time}>{formatMessageTime(msg.createdAt)}</span>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}