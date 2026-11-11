# Luyện Từ - Nền tảng Học Từ Vựng Tiếng Anh Thông Minh (SRS & 6 Game)

Ứng dụng web học từ vựng tiếng Anh lấy cảm hứng từ **Luyentu.com**, được xây dựng bằng **React + Vite + Tailwind CSS** với dữ liệu lưu trữ tự động trên trình duyệt (`LocalStorage`).

## 🌟 Tính năng nổi bật

1. **Trang Giới Thiệu (`/`, `/landing`)**:
   - Giao diện Hero Gradient đặc trưng, trải nghiệm thử **Flashcard 3D lật thẻ trực tiếp** ngay trên trang chủ.
   - Giải thích trực quan 5 cấp độ ghi nhớ **Spaced Repetition (SRS)**, đánh giá học viên (Marquee) và FAQ.

2. **Bảng Điều Khiển Trung Tâm (`/home`)**:
   - Thống kê **Từ đến hạn cần ôn hôm nay (🔥 Due)**, **Đang ghi nhớ**, **Đã thuộc lòng (Level 5)** và **Tổng từ vựng**.
   - **Tháp trí nhớ SRS** (Level 0 → Level 5) và **Biểu đồ Streak 7 ngày**.

3. **Kho Bộ Từ Vựng & Tạo Bộ Từ Bằng AI (`/category-list`)**:
   - Tích hợp sẵn các bộ từ: **TOEIC 650+**, **IELTS Academic 6.5 - 8.0+**, **THPT Quốc Gia**, **Oxford 3000** và **Tiếng Anh IT/AI**.
   - **🤖 AI Tạo bộ từ vựng thông minh**: Tự động tạo bộ từ vựng kèm phiên âm IPA, loại từ, nghĩa và câu ví dụ song ngữ theo chủ đề bất kỳ.
   - Hỗ trợ Tạo bộ từ cá nhân, Sao chép bộ từ, Chia sẻ link và Xem chi tiết/thêm nhanh từ vựng.

4. **Quản Lý Từ Vựng & Lịch Ôn SRS (`/words`)**:
   - Lọc từ theo Bộ từ, theo Cấp độ nhớ SRS (`Cần ôn ngay`, `Level 1-4`, `Đã thuộc lòng`).
   - Nghe phát âm chuẩn giọng Mỹ (`Volume`) và chế độ **🐢 Nghe chậm**.
   - Thêm từ mới với nút **✨ Tự điền AI** và đổi nhanh cấp độ SRS trực tiếp.

5. **Trung Tâm Học Từ Vựng & 6 Chế Độ Game (`/practice`)**:
   - 🃏 **Flashcard SRS**: Lật thẻ 3D (hỗ trợ phím `Space` và phím `1-4`), tự động tính lịch ôn lặp lại ngắt quãng.
   - 🎯 **Trắc nghiệm (Quiz)**: Chọn nhanh nghĩa đúng, tích lũy chuỗi Combo.
   - 🧩 **Ghép thẻ (Memory Match)**: Nối cặp Từ tiếng Anh ↔ Nghĩa tiếng Việt.
   - 🔤 **Sắp xếp chữ cái (Word Scramble)**: Ghép các chữ cái bị xáo trộn thành từ hoàn chỉnh.
   - ⌨️ **Gõ từ ngữ cảnh (Spelling)**: Điền từ tiếng Anh còn thiếu vào câu ví dụ.
   - 🎧 **Nghe & Viết (Listening)**: Nghe phát âm và gõ lại chính tả.

6. **Lộ Trình Học (`/roadmap`), Cửa Hàng Xu (`/store`) & Bảng Xếp Hạng (`/leaderboard`)**:
   - Lộ trình theo chặng cho TOEIC, IELTS và THPT Quốc Gia.
   - Đổi Xu mua **❄️ Đá Hồi Streak**, **⚡ Bình Nhân Đôi XP**, **⌨️ Âm thanh Bàn phím cơ**, Avatar và **Giao diện Tuyết rơi / Hoa anh đào rơi** trực tiếp trên màn hình.
   - Tính năng **Cặp học chung (Study Buddy Streak)** giữ chuỗi đôi và Góc động lực cộng đồng.

## 🚀 Cách chạy dự án

```bash
npm install
npm run dev
```
