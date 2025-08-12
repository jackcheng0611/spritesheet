# 雪碧圖生成器

使用 ffmpeg.wasm 將影片轉換成雪碧圖並轉換為 WebP 格式的網頁應用程式。

## 功能特色

- 🎬 支援多種影片格式 (MP4, AVI, MOV, MKV 等)
- 🖼️ 自動生成雪碧圖（縮圖網格）
- 🌐 轉換為 WebP 格式以優化檔案大小
- 📱 響應式設計，支援手機和平板
- 🎨 美觀的現代化界面
- ⚡ 純前端處理，無需伺服器

## 如何使用

1. 選擇或拖拽影片檔案到上傳區域
2. 設定雪碧圖的列數和行數
3. 點擊「生成雪碧圖」按鈕
4. 等待處理完成後下載 WebP 格式的雪碧圖

## 安裝和運行

### 安裝依賴

```bash
npm install
```

### 開發模式

```bash
npm run dev
```

### 建置生產版本

```bash
npm run build
```

### 預覽生產版本

```bash
npm run preview
```

## 技術說明

- **FFmpeg.wasm**: 用於影片處理和格式轉換
- **Vite**: 現代化的前端建置工具
- **Pure JavaScript**: 無框架依賴，純 JavaScript 實現
- **WebP**: 高效的圖片壓縮格式

## 瀏覽器支援

需要支援 WebAssembly 的現代瀏覽器：
- Chrome 57+
- Firefox 52+
- Safari 11+
- Edge 16+

## 注意事項

- 處理大型影片檔案時可能需要較長時間
- 建議使用現代瀏覽器以獲得最佳效能
- 由於使用 WebAssembly，首次載入可能需要一些時間

## 授權

MIT License
