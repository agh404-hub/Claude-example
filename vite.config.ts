import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
// import basicSsl from '@vitejs/plugin-basic-ssl'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Temporarily disable HTTPS to test if Advanced Protection blocks localhost HTTP
  // server: {
  //   https: true,
  // },
})
