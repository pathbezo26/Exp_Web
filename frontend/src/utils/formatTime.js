/**
 * Format a date/timestamp for display in chat messages.
 * - Same day  → "14:35"
 * - Yesterday → "Hôm qua"
 * - This year → "15 tháng 4"
 * - Older     → "15/04/2024"
 */
export function formatMessageTime(dateInput) {
  const date = new Date(dateInput);
  const now = new Date();

  const isToday =
    date.getDate() === now.getDate() &&
    date.getMonth() === now.getMonth() &&
    date.getFullYear() === now.getFullYear();

  if (isToday) {
    return date.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
  }

  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const isYesterday =
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear();

  if (isYesterday) return 'Hôm qua';

  if (date.getFullYear() === now.getFullYear()) {
    return date.toLocaleDateString('vi-VN', { day: 'numeric', month: 'long' });
  }

  return date.toLocaleDateString('vi-VN');
}

/**
 * Format full datetime for message tooltips.
 */
export function formatFullTime(dateInput) {
  const date = new Date(dateInput);
  return date.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
