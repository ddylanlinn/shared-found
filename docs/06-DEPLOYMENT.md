# 部署指南

本指南將帶你將 Web App 部署到 GitHub Pages。

## 📋 目錄

- [前置準備](#前置準備)
- [設定 Vite 配置](#設定-vite-配置)
- [建立 GitHub Repository](#建立-github-repository)
- [設定部署腳本](#設定部署腳本)
- [執行部署](#執行部署)
- [啟用 GitHub Pages](#啟用-github-pages)
- [測試線上版本](#測試線上版本)

---

## 前置準備

確認以下項目已完成：

- ✅ Web App 本地開發完成
- ✅ 已測試過所有功能正常
- ✅ 已有 GitHub 帳號
- ✅ 已安裝 Git

---

## 設定 Vite 配置

### 步驟 1：修改 vite.config.js

```javascript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],

  // 重要：設定 base path（替換成你的 GitHub repo 名稱）
  base: '/family-finance-web/',

  // 設定 alias
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  },

  // 建置設定
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false
  }
})
```

**重要**：
- 將 `base` 的值改為你的 **GitHub repository 名稱**
- 格式：`/repo-name/`
- 例如：repo 名稱是 `my-finance-app`，則設定為 `base: '/my-finance-app/'`

---

## 建立 GitHub Repository

### 步驟 1：在 GitHub 建立新 Repository

1. 登入 [GitHub](https://github.com/)
2. 點擊右上角「**+**」→「**New repository**」
3. 填寫 Repository 資訊：
   - **Repository name**：`family-finance-web`（或自訂名稱）
   - **Description**：家庭記帳系統
   - **Public** 或 **Private**：選擇 Public（GitHub Pages 免費版需要 Public repo）
   - ❌ **不要**勾選「Initialize this repository with a README」
4. 點擊「**Create repository**」

### 步驟 2：初始化本地 Git

在專案目錄中執行：

```bash
git init
git add .
git commit -m "Initial commit"
```

### 步驟 3：連接遠端 Repository

將下面的 URL 替換成你的 GitHub repo URL：

```bash
git remote add origin https://github.com/your-username/family-finance-web.git
git branch -M main
git push -u origin main
```

---

## 設定部署腳本

### 步驟 1：修改 package.json

在 `package.json` 的 `scripts` 區塊新增：

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

### 步驟 2：確認 .env 檔案已加入 .gitignore

**重要**：`.env` 檔案包含 Google Apps Script URL，不應該上傳到 GitHub。

確認 `.gitignore` 包含：

```
.env
.env.local
.env.production
```

### 步驟 3：建立 .env.production（可選）

如果要分離開發和正式環境的設定，可建立 `.env.production`：

```.env.production
VITE_GAS_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

---

## 執行部署

### 步驟 1：執行部署指令

```bash
npm run deploy
```

這個指令會：
1. 執行 `npm run build`（建置專案）
2. 將 `dist` 目錄部署到 `gh-pages` 分支

### 步驟 2：等待部署完成

終端機會顯示：
```
Published
```

代表部署成功。

---

## 啟用 GitHub Pages

### 步驟 1：前往 Repository 設定

1. 在 GitHub repo 頁面，點擊「**Settings**」
2. 在左側選單中，找到「**Pages**」

### 步驟 2：設定 Source

在「**Source**」區塊：

| 設定項目 | 值 |
|---------|-----|
| **Branch** | gh-pages |
| **Folder** | / (root) |

點擊「**Save**」。

### 步驟 3：取得 GitHub Pages URL

設定完成後，頁面上方會顯示：

```
Your site is published at https://your-username.github.io/family-finance-web/
```

**複製這個 URL**，這就是你的 Web App 網址！

---

## 測試線上版本

### 步驟 1：開啟網站

開啟剛取得的 GitHub Pages URL：

```
https://your-username.github.io/family-finance-web/
```

### 步驟 2：測試 PIN 登入

1. 輸入 PIN 碼（預設 8888）
2. 登入成功

### 步驟 3：測試 API 連接

1. 查看 Dashboard 是否正確顯示統計資料
2. 測試新增交易功能
3. 確認資料有寫入 Google Sheet

### 測試失敗？

#### 問題 1：頁面空白或 404

**原因**：`vite.config.js` 的 `base` 設定錯誤

**解決**：
1. 確認 `base` 的值與 repo 名稱一致
2. 重新執行 `npm run deploy`

#### 問題 2：API 呼叫失敗（CORS 錯誤）

**原因**：環境變數未正確設定

**解決**：
1. 確認 `.env` 或 `.env.production` 有正確的 `VITE_GAS_API_URL`
2. 確認 Google Apps Script 部署時選擇「所有人」存取

#### 問題 3：靜態資源載入失敗

**原因**：路徑問題

**解決**：
1. 確認 `vite.config.js` 的 `base` 設定
2. 檢查 `index.html` 中的資源路徑

---

## 更新部署

當你修改程式碼後，重新部署：

### 步驟 1：提交變更

```bash
git add .
git commit -m "Update: 描述你的變更"
git push
```

### 步驟 2：重新部署

```bash
npm run deploy
```

### 步驟 3：清除瀏覽器快取

開啟網站時，按 `Ctrl+Shift+R`（Windows）或 `Cmd+Shift+R`（Mac）強制重新載入。

---

## 自訂網域（進階）

如果你有自己的網域，可以設定 Custom Domain：

### 步驟 1：新增 CNAME 檔案

在 `public` 目錄建立 `CNAME` 檔案：

```
your-domain.com
```

### 步驟 2：設定 DNS

在你的網域服務商（例如 GoDaddy、Cloudflare）設定 DNS：

| 類型 | 名稱 | 值 |
|------|------|-----|
| CNAME | www | your-username.github.io |

### 步驟 3：GitHub Pages 設定

1. 在 GitHub repo 的 Settings → Pages
2. 在「Custom domain」欄位輸入你的網域
3. 點擊「Save」

---

## ✅ 完成檢查清單

- [ ] 已修改 `vite.config.js` 的 `base` 設定
- [ ] 已在 GitHub 建立 Repository
- [ ] 已初始化 Git 並推送程式碼
- [ ] 已設定部署腳本（package.json）
- [ ] 已執行 `npm run deploy`
- [ ] 已在 GitHub 啟用 Pages（gh-pages 分支）
- [ ] 已取得 GitHub Pages URL
- [ ] 已測試線上版本（PIN 登入、API 連接、新增交易）

---

## 🎉 恭喜！

你的家庭記帳系統已經完整部署上線！

### 下一步

- 👥 **分享給家人**：將 GitHub Pages URL 和 PIN 碼分享給家人
- 📱 **加入 LINE Bot**：確保家人都有加 Bot 為好友
- 🔐 **修改 PIN 碼**：前往 Google Sheet 的 Config Tab 修改 `PinCode`

### 疑難排解

如遇到問題，請參考：

👉 **[07-TROUBLESHOOTING.md](07-TROUBLESHOOTING.md)** 常見問題與解決方案
