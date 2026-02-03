# 家庭記帳系統 (Family Finance)

基於 Google 生態系的免費記帳系統，支援 LINE Bot 快速記帳與 Web Dashboard 視覺化分析。

## 🎯 專案特色

- **零成本**：完全使用 Google 免費服務（Sheets + Apps Script）+ GitHub Pages
- **雙介面**：LINE Bot（快速記帳）+ Web App（視覺化分析）
- **自然語言**：支援「午餐 200」這類自然語言記帳
- **雙層分類**：大分類 + 小分類（例如：食物 > 午餐）
- **動態設定**：分類、標籤、付款方式都存在 Google Sheet，隨時可調整

## 📋 系統架構

```
使用者
  ↓
┌─────────────────┬─────────────────┐
│   LINE Bot      │   Web App       │
│  (快速記帳)      │  (Dashboard)    │
└────────┬────────┴────────┬────────┘
         │                 │
         └────────┬────────┘
                  ↓
        Google Apps Script
         (API Gateway)
                  ↓
         Google Sheets (DB)
         ├── Data Tab (交易記錄)
         └── Config Tab (設定檔)
```

## 🚀 快速開始

### 前置需求

- Google 帳號
- LINE 帳號
- GitHub 帳號
- Node.js 18+ (Web App 開發用)

### 設定步驟

按照以下順序設定系統：

1. **[Google Sheets 設定](docs/01-GOOGLE-SHEETS-SETUP.md)**
   - 建立資料庫試算表
   - 設定 Data Tab（交易記錄）
   - 設定 Config Tab（分類、標籤、預算）

2. **[Google Apps Script 設定](docs/02-GOOGLE-APPS-SCRIPT-SETUP.md)**
   - 開啟 Apps Script 編輯器
   - 設定環境變數
   - 部署 Web App

3. **[Google Apps Script 程式碼](docs/03-GOOGLE-APPS-SCRIPT-CODE.md)**
   - 複製貼上 4 個 .gs 檔案的完整程式碼

4. **[LINE Bot 設定](docs/04-LINE-BOT-SETUP.md)**
   - 建立 LINE Messaging API Channel
   - 取得 Channel Access Token
   - 設定 Webhook
   - 測試記帳功能

5. **[Web App 開發](docs/05-WEB-APP-DEVELOPMENT.md)**
   - 初始化 Vite + Vue 3 專案
   - 建立 Dashboard、交易表單等元件
   - 本地測試

6. **[部署指南](docs/06-DEPLOYMENT.md)**
   - 部署到 GitHub Pages
   - 設定環境變數
   - 測試線上版本

7. **[疑難排解](docs/07-TROUBLESHOOTING.md)**
   - 常見問題與解決方案

## 📱 使用方式

### LINE Bot 記帳

1. 加 Bot 為好友
2. 傳送訊息：
   - `午餐 200` → 自動分類為「食物 > 午餐」
   - `捷運 30 交通` → 指定分類為「交通」
   - `咖啡 80 飲料` → 指定小分類為「飲料」

### Web Dashboard

1. 開啟網頁，輸入 PIN 碼（預設 8888）
2. 查看本月/本週支出統計
3. 查看分類圓餅圖
4. 手動新增/編輯/刪除交易

## 📊 資料結構

### Data Tab（交易記錄）

| 欄位 | 說明 | 範例 |
|------|------|------|
| Date | 日期 | 2026/2/3 |
| Amount | 金額 | 200 |
| Category | 大分類 | 食物 |
| Subcategory | 小分類 | 午餐 |
| Label | 標籤 | 必要 |
| Method | 付款方式 | 信用卡 |
| Currency | 幣別 | TWD |
| Note | 備註 | 便利商店 |

### Config Tab（設定檔）

- **基本設定**：MonthlyBudget, PinCode, DefaultCurrency
- **分類對照表**：大分類 → 小分類（食物 > 早餐、交通 > 捷運）
- **標籤選項**：必要、想要、共同
- **付款方式**：現金、信用卡、行動支付、悠遊卡

## 🛠️ 技術棧

### 後端
- Google Sheets（資料庫）
- Google Apps Script（API Layer）

### LINE Bot
- LINE Messaging API
- Webhook 整合

### 前端
- Vite 5.x
- Vue 3 (Composition API)
- Vue Router
- Pinia (狀態管理)
- Chart.js (圖表)
- Tailwind CSS (樣式)

### 部署
- GitHub Pages（Web App）
- Google Apps Script Web App（API）

## 📝 開發進度

- [x] Phase 1：核心功能
  - [x] Google Sheets 資料庫
  - [x] Google Apps Script API
  - [x] LINE Bot 自然語言記帳
  - [x] Web Dashboard（統計、新增/編輯）
  - [x] PIN 碼保護

- [ ] Phase 2：進階功能
  - [ ] 歷史記錄查詢（日期、分類篩選）
  - [ ] 匯出報表（CSV、月報表）
  - [ ] OpenClaw AI 整合（更智能的自然語言理解）
  - [ ] LINE Rich Menu（快速選單）

## 🤝 貢獻

這是個人/家庭使用的專案，歡迎 Fork 並根據自己的需求修改。

## 📄 授權

MIT License

## 📧 聯絡

如有問題或建議，請開 Issue 討論。
