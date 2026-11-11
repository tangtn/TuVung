import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Cho phép truy cập từ điện thoại/máy tính bảng cùng mạng Wi-Fi (0.0.0.0)
    port: 5173,
    strictPort: true,
    open: false,
  },
});
