import { useState, useRef, useCallback } from 'react';
import useSocket from '../hooks/useSocket';
import styles from './styles/ChatInput.module.css';

export default function ChatInput({ conversationId }) {
  const socket = useSocket();
  const [text, setText] = useState('');
  const typingTimerRef = useRef(null);
  const isTypingRef = useRef(false);

  const emitTyping = useCallback(() => {
    if (!socket) return;
    if (!isTypingRef.current) {
      isTypingRef.current = true;
      socket.emit('typing', { conversationId });
    }
    clearTimeout(typingTimerRef.current);
    typingTimerRef.current = setTimeout(() => {
      isTypingRef.current = false;
      socket.emit('stopTyping', { conversationId });
    }, 1500);
  }, [socket, conversationId]);

  const handleChange = (e) => {
    setText(e.target.value);
    emitTyping();
  };

  const handleSend = () => {
    const content = text.trim();
    if (!content || !socket) return;

    socket.emit('sendMessage', { conversationId, content });
    setText('');

    // Stop typing indicator immediately on send
    clearTimeout(typingTimerRef.current);
    isTypingRef.current = false;
    socket.emit('stopTyping', { conversationId });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.inputBar}>
      <textarea
        className={styles.textarea}
        value={text}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="Nhập tin nhắn... (Enter để gửi, Shift+Enter xuống dòng)"
        rows={1}
      />
      <button
        className={styles.sendBtn}
        onClick={handleSend}
        disabled={!text.trim()}
        title="Gửi"
      >
        ➤
      </button>
    </div>
  );
}
