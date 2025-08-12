# 部署到網路平台指南

## 🚀 推薦的免費部署平台

### 1. **Vercel（推薦）**
- ✅ 自動 HTTPS
- ✅ 完美支援 Vite
- ✅ 自動設定 COOP/COEP 標頭
- ✅ 零設定部署

#### 部署步驟：
```bash
# 1. 安裝 Vercel CLI
npm i -g vercel

# 2. 建置專案
npm run build

# 3. 部署
vercel

# 或直接連結 GitHub 自動部署
```

### 2. **Netlify**
- ✅ 自動 HTTPS
- ✅ 拖拽部署
- ✅ 支援自定義標頭

#### 部署步驟：
```bash
# 1. 建置專案
npm run build

# 2. 上傳 dist 資料夾到 Netlify
# 或連結 GitHub 倉庫
```

### 3. **GitHub Pages**
- ✅ 免費
- ✅ 與 GitHub 整合
- ⚠️ 需要手動設定標頭

#### 部署步驟：
```bash
# 1. 安裝 gh-pages
npm install --save-dev gh-pages

# 2. 建置並部署
npm run build
npx gh-pages -d dist
```

## 🔧 部署配置檔案

### Vercel 配置 (vercel.json)
### Netlify 配置 (_headers)
### GitHub Actions 自動部署

## 📱 部署後的優勢

- **SharedArrayBuffer 問題解決** - HTTPS 環境自動支援
- **更快的載入速度** - CDN 加速
- **更好的相容性** - 標準生產環境
- **分享連結** - 可以分享給其他人使用

## 🎯 建議使用順序

1. **Vercel** - 最簡單，零設定
2. **Netlify** - 功能豐富，易用
3. **GitHub Pages** - 如果已有 GitHub 倉庫
