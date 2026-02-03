# Google Sheets 設定指南

本指南將帶你一步步建立記帳系統的資料庫（Google Sheets）。

## 📋 目錄

- [建立試算表](#建立試算表)
- [設定 Data Tab（交易記錄）](#設定-data-tab交易記錄)
- [設定 Config Tab（設定檔）](#設定-config-tab設定檔)
- [取得 Sheet ID](#取得-sheet-id)
- [測試資料](#測試資料)

---

## 建立試算表

### 步驟 1：建立新試算表

1. 開啟 [Google Sheets](https://sheets.google.com/)
2. 點擊左上角「**+**」或「**空白試算表**」
3. 重新命名為：`FamilyFinance_DB`

![建立試算表示意圖]

### 步驟 2：了解分頁結構

這個系統會使用**兩個分頁（Tab）**：

- **Data Tab**：存放所有交易記錄
- **Config Tab**：存放系統設定（分類、預算、PIN 碼等）

---

## 設定 Data Tab（交易記錄）

### 步驟 1：重新命名分頁

1. 預設會有一個分頁叫「**工作表1**」
2. 雙擊分頁名稱，重新命名為：`Data`

### 步驟 2：建立欄位標題

在第一列（Row 1）輸入以下欄位名稱：

| A | B | C | D | E | F | G | H |
|---|---|---|---|---|---|---|---|
| Date | Amount | Category | Subcategory | Label | Method | Currency | Note |

**欄位說明：**

- **Date**：交易日期（YYYY/M/D）
- **Amount**：金額（數字）
- **Category**：大分類（例如：食物、交通）
- **Subcategory**：小分類（例如：早餐、捷運）
- **Label**：標籤（例如：必要、想要）
- **Method**：付款方式（例如：現金、信用卡）
- **Currency**：幣別（例如：TWD）
- **Note**：備註

### 步驟 3：美化標題列

1. 選取第一列（A1:H1）
2. 點擊工具列的「**粗體**」按鈕（或按 Ctrl+B / Cmd+B）
3. （可選）設定背景顏色：
   - 點擊「**填滿顏色**」
   - 選擇淺灰色或淺藍色

### 步驟 4：設定欄位格式

#### Date 欄位（A 欄）

1. 選取 **A2:A1000** 範圍
2. 點擊「**格式**」→「**數字**」→「**日期**」
3. 選擇格式：`2026/2/3` 或 `2026-02-03`

#### Amount 欄位（B 欄）

1. 選取 **B2:B1000** 範圍
2. 點擊「**格式**」→「**數字**」→「**數字**」
3. （可選）小數位數設定為 0

### 步驟 5：凍結標題列

1. 選取第一列
2. 點擊「**檢視**」→「**凍結**」→「**1 列**」

這樣滾動時標題列會保持在上方。

---

## 設定 Config Tab（設定檔）

### 步驟 1：建立新分頁

1. 點擊左下角的「**+**」（新增工作表）
2. 重新命名為：`Config`

### 步驟 2：了解 Config Tab 結構

Config Tab 分為 **4 個區塊**：

```
     A           |  B      |  C  |  D        |  E          |  F  |  G      |  H  |  I
1  | Key         | Value   |     | Category  | Subcategory |     | Label   |     | Method
2  | MonthlyBudget| 30000  |     | 食物      | 早餐        |     | 必要    |     | 現金
3  | DefaultCurrency| TWD  |     | 食物      | 午餐        |     | 想要    |     | 信用卡
4  | PinCode     | 8888    |     | 食物      | 晚餐        |     | 共同    |     | 行動支付
5  |             |         |     | 食物      | 飲料        |     |         |     | 悠遊卡
6  |             |         |     | 食物      | 零食        |     |         |     |
...
```

### 步驟 3：區塊 1 - 基本設定（A-B 欄）

在 **A1:B4** 輸入以下內容：

| A (Key) | B (Value) |
|---------|-----------|
| Key | Value |
| MonthlyBudget | 30000 |
| DefaultCurrency | TWD |
| PinCode | 8888 |

**說明：**
- `MonthlyBudget`：每月預算（可自行調整）
- `DefaultCurrency`：預設幣別（TWD = 台幣）
- `PinCode`：Web App 登入密碼（建議改成自己的密碼）

### 步驟 4：區塊 2 - 分類對照表（D-E 欄）

在 **D1:E20** 輸入以下內容（可根據需求調整）：

| D (Category) | E (Subcategory) |
|--------------|-----------------|
| Category | Subcategory |
| 食物 | 早餐 |
| 食物 | 午餐 |
| 食物 | 晚餐 |
| 食物 | 飲料 |
| 食物 | 零食 |
| 交通 | 捷運 |
| 交通 | 公車 |
| 交通 | 油資 |
| 交通 | 停車費 |
| 交通 | 計程車 |
| 娛樂 | 電影 |
| 娛樂 | 遊戲 |
| 娛樂 | KTV |
| 生活 | 日用品 |
| 生活 | 水電 |
| 生活 | 房租 |
| 醫療 | 看診 |
| 醫療 | 藥品 |
| 其他 | 雜項 |

**重要觀念：**

- **D 欄（Category）**：大分類
- **E 欄（Subcategory）**：小分類
- **每一列代表一組對應關係**
- 例如：`食物 → 早餐`、`交通 → 捷運`

**如何新增分類？**

想新增「購物 → 服飾」，只需在 D-E 欄新增一列：

| D (Category) | E (Subcategory) |
|--------------|-----------------|
| 購物 | 服飾 |

程式會自動讀取，不用改程式碼！

### 步驟 5：區塊 3 - Label 選項（G 欄）

在 **G1:G4** 輸入以下內容：

| G (Label) |
|-----------|
| Label |
| 必要 |
| 想要 |
| 共同 |

**說明：**
- 這些是記帳時可以選擇的「標籤」
- 例如：標記哪些是「必要支出」、哪些是「想要」
- 可自行新增，例如：「娛樂」、「投資」

### 步驟 6：區塊 4 - Method 選項（I 欄）

在 **I1:I5** 輸入以下內容：

| I (Method) |
|------------|
| Method |
| 現金 |
| 信用卡 |
| 行動支付 |
| 悠遊卡 |

**說明：**
- 這些是付款方式選項
- 可自行新增，例如：「簽帳卡」、「街口支付」

### 步驟 7：美化 Config Tab

1. 選取 **A1, D1, G1, I1**（四個標題）
2. 設定為粗體
3. （可選）設定背景顏色

---

## 取得 Sheet ID

完成設定後，你需要取得 **Sheet ID**，稍後設定 Google Apps Script 時會用到。

### 步驟

1. 查看瀏覽器網址列，格式如下：
   ```
   https://docs.google.com/spreadsheets/d/{SHEET_ID}/edit
   ```

2. 複製 `{SHEET_ID}` 部分，例如：
   ```
   1a2b3c4d5e6f7g8h9i0jK1L2M3N4O5P6Q7R8S9T
   ```

3. **記下這個 Sheet ID**，稍後會用到！

---

## 測試資料

建議先手動新增幾筆測試資料，確認格式正確：

### 在 Data Tab 新增測試資料

| Date | Amount | Category | Subcategory | Label | Method | Currency | Note |
|------|--------|----------|-------------|-------|--------|----------|------|
| 2026/2/3 | 200 | 食物 | 午餐 | 必要 | 信用卡 | TWD | 便利商店 |
| 2026/2/3 | 80 | 食物 | 飲料 | 想要 | 現金 | TWD | 星巴克 |
| 2026/2/3 | 30 | 交通 | 捷運 | 必要 | 悠遊卡 | TWD | 上班通勤 |

---

## ✅ 完成檢查清單

- [ ] 建立了 `FamilyFinance_DB` 試算表
- [ ] `Data` Tab 有 8 個欄位（Date, Amount, Category, Subcategory, Label, Method, Currency, Note）
- [ ] `Config` Tab 有 4 個區塊：
  - [ ] A-B 欄：基本設定（MonthlyBudget, PinCode, DefaultCurrency）
  - [ ] D-E 欄：分類對照表（至少 5 組分類）
  - [ ] G 欄：Label 選項（至少 3 個）
  - [ ] I 欄：Method 選項（至少 4 個）
- [ ] 已取得並記下 Sheet ID
- [ ] （可選）已新增測試資料

---

## 🎉 下一步

完成 Google Sheets 設定後，前往：

👉 **[02-GOOGLE-APPS-SCRIPT-SETUP.md](02-GOOGLE-APPS-SCRIPT-SETUP.md)** 設定後端 API
