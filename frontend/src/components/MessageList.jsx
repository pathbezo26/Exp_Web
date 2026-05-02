import { useEffect, useRef } from 'react';
import { formatMessageTime, formatFullTime } from '../utils/formatTime';
import styles from './styles/MessageList.module.css';

export default function MessageList({ messages, currentUserId }) {
  const bottomRef = useRef(null);

  // Auto-scroll to latest message
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (messages.length === 0) {
    return (
      <div className={styles.empty}>
        <p>Chưa có tin nhắn nào. Hãy bắt đầu cuộc trò chuyện! 👋</p>
      </div>
    );
  }

  return (
    <div className={styles.list}>
      {messages.map((msg, idx) => {
        const isOwn = msg.sender._id === currentUserId;
        const showAvatar =
          !isOwn &&
          (idx === 0 || messages[idx - 1].sender._id !== msg.sender._id);

        return (
          <div
            key={msg._id}
            className={`${styles.row} ${isOwn ? styles.own : styles.other}`}
          >
            {/* Avatar placeholder for alignment */}
            {!isOwn && (
              <div className={styles.avatarSlot}>
                {showAvatar ? (
                  <div className={styles.avatar}>
                    {msg.sender.username.charAt(0).toUpperCase()}
                  </div>
                ) : (
                  <div className={styles.avatarBlank} />
                )}
              </div>
            )}

            <div className={styles.bubble} title={formatFullTime(msg.createdAt)}>
              {/* Show sender name in group chats for other people's messages */}
              {!isOwn && showAvatar && (
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
