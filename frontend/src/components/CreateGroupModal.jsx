import { useState } from 'react';
import axiosInstance from '../api/axiosInstance';
import { createConversationAPI } from '../api/conversationAPI';
import styles from './styles/CreateGroupModal.module.css';

export default function CreateGroupModal({ onClose, onCreated }) {
  const [groupName, setGroupName] = useState('');
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [searching, setSearching] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    const value = e.target.value;
    setQuery(value);
    if (!value.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await axiosInstance.get(`/users/search?q=${encodeURIComponent(value)}`);
      // Filter out already selected members
      setSearchResults(res.data.filter(
        (u) => !selectedMembers.find((m) => m._id === u._id)
      ));
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const addMember = (user) => {
    setSelectedMembers((prev) => [...prev, user]);
    setSearchResults((prev) => prev.filter((u) => u._id !== user._id));
    setQuery('');
  };

  const removeMember = (userId) => {
    setSelectedMembers((prev) => prev.filter((u) => u._id !== userId));
  };

  const handleCreate = async () => {
    if (!groupName.trim()) { setError('Vui lòng nhập tên nhóm.'); return; }
    if (selectedMembers.length < 1) { setError('Nhóm phải có ít nhất 1 thành viên khác.'); return; }
    setError('');
    setCreating(true);
    try {
      const res = await createConversationAPI({
        type: 'group',
        name: groupName.trim(),
        members: selectedMembers.map((m) => m._id),
      });
      onCreated(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Tạo nhóm thất bại.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h3>Tạo nhóm chat</h3>
          <button className={styles.closeBtn} onClick={onClose}>✕</button>
        </div>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.field}>
          <label>Tên nhóm</label>
          <input
            type="text"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            placeholder="VD: Nhóm Đồ Án NT208"
          />
        </div>

        <div className={styles.field}>
          <label>Thêm thành viên</label>
          <input
            type="text"
            value={query}
            onChange={handleSearch}
            placeholder="Tìm theo tên người dùng..."
          />
        </div>

        {searching && <p className={styles.hint}>Đang tìm...</p>}

        {searchResults.length > 0 && (
          <ul className={styles.searchList}>
            {searchResults.map((u) => (
              <li key={u._id} className={styles.searchItem} onClick={() => addMember(u)}>
                <div className={styles.avatar}>{u.username.charAt(0).toUpperCase()}</div>
                <span>{u.username}</span>
                <span className={styles.addIcon}>＋</span>
              </li>
            ))}
          </ul>
        )}

        {selectedMembers.length > 0 && (
          <div className={styles.selectedList}>
            <p className={styles.selectedLabel}>Đã chọn ({selectedMembers.length}):</p>
            <div className={styles.chips}>
              {selectedMembers.map((m) => (
                <span key={m._id} className={styles.chip}>
                  {m.username}
                  <button onClick={() => removeMember(m._id)}>✕</button>
                </span>
              ))}
            </div>
          </div>
        )}

        <div className={styles.footer}>
          <button className={styles.cancelBtn} onClick={onClose}>Hủy</button>
          <button
            className={styles.createBtn}
            onClick={handleCreate}
            disabled={creating}
          >
            {creating ? 'Đang tạo...' : 'Tạo nhóm'}
          </button>
        </div>
      </div>
    </div>
  );
}
