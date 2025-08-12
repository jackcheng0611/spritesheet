import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
      // 額外的安全標頭
      'Cross-Origin-Resource-Policy': 'cross-origin'
    },
    // 確保 HTTPS（某些功能需要）
    https: false,
    host: 'localhost',
    port: 5173
  },
  optimizeDeps: {
    exclude: ['@ffmpeg/ffmpeg', '@ffmpeg/util']
  },
  build: {
    target: 'esnext',
    rollupOptions: {
      output: {
        // 確保正確的 MIME 類型
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.wasm')) {
            return 'assets/[name]-[hash].wasm'
          }
          return 'assets/[name]-[hash][extname]'
        }
      }
    }
  },
  // 確保 WebAssembly 檔案正確載入
  assetsInclude: ['**/*.wasm']
})
