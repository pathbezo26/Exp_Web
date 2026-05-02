import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { createConversationAPI } from '../api/conversationAPI';
import styles from './styles/UserSearch.module.css';

export default function UserSearch({ onConversationCreated }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(null);

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (!value.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    try {
      const res = await axiosInstance.get(`/users/search?q=${encodeURIComponent(value)}`);
      setResults(res.data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleStartChat = async (targetUser) => {
    setCreating(targetUser._id);
    try {
      const res = await createConversationAPI({
        type: 'private',
        members: [targetUser._id],
      });
      onConversationCreated(res.data);
    } catch (err) {
      console.error('Failed to create conversation', err);
    } finally {
      setCreating(null);
    }
  };

  return (
    <div className={styles.panel}>
      <input
        className={styles.input}
        type="text"
        value={query}
        onChange={handleSearch}
        placeholder="Tìm theo tên..."
        autoFocus
      />

      {loading && <p className={styles.status}>Đang tìm kiếm...</p>}

      {!loading && query && results.length === 0 && (
        <p className={styles.status}>Không tìm thấy người dùng.</p>
      )}

      <ul className={styles.list}>
        {results.map((u) => (
          <li key={u._id} className={styles.item}>
            <div className={styles.avatar}>{u.username.charAt(0).toUpperCase()}</div>
            <div className={styles.info}>
              <span className={styles.name}>{u.username}</span>
              <span className={styles.email}>{u.email}</span>
            </div>
            <button
              className={styles.chatBtn}
              onClick={() => handleStartChat(u)}
              disabled={creating === u._id}
            >
              {creating === u._id ? '...' : 'Chat'}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
