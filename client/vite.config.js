import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // В development заявките към /api се препращат към Express сървъра (server/, порт 3000).
    // Така за браузъра клиентът и API-то са на един адрес и бисквитката с токена работи без CORS.
    proxy: {
      '/api': 'http://localhost:3000',
    },
  },
})
