# 網路部署檢查清單

## ✅ 部署兼容性檢查

這個版本可以部署到網路上，以下是檢查結果：

### 1. 外部依賴
- ✅ FFmpeg WASM 從 unpkg.com CDN 載入 (支援 CORS)
- ✅ 使用 HTTPS CDN，支援現代瀏覽器
- ✅ 無需額外的 npm 依賴安裝

### 2. CORS 支援
- ✅ unpkg.com 提供 `access-control-allow-origin: *`
- ✅ 支援跨域資源共享
- ✅ 無需特殊伺服器配置

### 3. 瀏覽器安全要求
- ✅ 使用 ES6 模組（現代瀏覽器支援）
- ✅ HTTPS 要求已滿足（CDN 使用 HTTPS）
- ⚠️ 需要 HTTPS 或 localhost 才能使用 WebAssembly

### 4. 部署方式

#### 🚀 靜態網站托管 (推薦)
- **GitHub Pages**: ✅ 支援
- **Netlify**: ✅ 支援  
- **Vercel**: ✅ 支援
- **Firebase Hosting**: ✅ 支援

#### 🌐 共享主機
- **一般 HTTP 主機**: ⚠️ 需要 HTTPS
- **支援 HTTPS 的主機**: ✅ 支援

### 5. 部署步驟

1. **上傳檔案**: 只需上傳 `sprite-generator.html`
2. **設定 HTTPS**: 確保網站使用 HTTPS
3. **測試**: 在瀏覽器中開啟檔案

### 6. 注意事項

- ⚠️ **必須使用 HTTPS**: WebAssembly 需要安全上下文
- ⚠️ **現代瀏覽器**: 需要支援 ES6 模組和 WebAssembly
- ⚠️ **檔案大小**: 首次載入需下載約 25MB 的 FFmpeg 檔案

## 🎯 快速部署指令

### Netlify
```bash
# 拖拽 sprite-generator.html 到 Netlify Drop
```

### Vercel
```bash
npx vercel --prod
```

### GitHub Pages
```bash
git add sprite-generator.html
git commit -m "Add sprite generator"
git push origin main
```

## 🔧 測試部署

部署後請測試：
1. 頁面載入正常
2. FFmpeg 初始化成功
3. 影片上傳功能正常
4. 雪碧圖生成功能正常
5. WebP 轉換功能正常
