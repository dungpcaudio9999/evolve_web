/**
 * Định dạng ngày ngắn kiểu "8 thg 11". Cố định múi giờ Việt Nam để server và trình duyệt
 * cho cùng kết quả (tránh lỗi hydration).
 */
const shortDate = new Intl.DateTimeFormat('vi-VN', {
  day: 'numeric',
  month: 'short',
  timeZone: 'Asia/Ho_Chi_Minh',
});

export function formatShortDate(iso: string): string {
  return shortDate.format(new Date(iso));
}
