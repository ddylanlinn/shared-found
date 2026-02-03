# Web App 開發指南

本指南將帶你使用 Vite + Vue 3 建立記帳系統的 Web Dashboard。

## 📋 目錄

- [技術棧](#技術棧)
- [專案初始化](#專案初始化)
- [專案結構](#專案結構)
- [關鍵檔案程式碼](#關鍵檔案程式碼)
- [本地開發與測試](#本地開發與測試)

---

## 技術棧

- **Vite 5.x**：現代化建置工具
- **Vue 3**：前端框架（Composition API）
- **Vue Router**：路由管理
- **Pinia**：狀態管理
- **Chart.js**：圖表庫
- **Tailwind CSS**：樣式框架

---

## 專案初始化

### 步驟 1：建立 Vite + Vue 專案

```bash
npm create vite@latest family-finance-web -- --template vue
cd family-finance-web
npm install
```

### 步驟 2：安裝依賴

```bash
# 核心依賴
npm install vue-router pinia

# 圖表庫
npm install chart.js vue-chartjs

# 樣式框架
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

# 部署工具
npm install -D gh-pages
```

### 步驟 3：設定 Tailwind CSS

**tailwind.config.js**:

```javascript
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

**src/style.css** (或建立 src/index.css):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

在 **src/main.js** 引入：

```javascript
import './style.css' // 或 './index.css'
```

---

## 專案結構

建立以下目錄結構：

```
family-finance-web/
├── public/
├── src/
│   ├── assets/             # 靜態資源（圖片、icon 等）
│   ├── components/         # Vue 元件
│   │   ├── Dashboard/
│   │   │   ├── StatsCard.vue
│   │   │   ├── CategoryChart.vue
│   │   │   └── RecentTransactions.vue
│   │   ├── Transaction/
│   │   │   ├── TransactionForm.vue
│   │   │   └── TransactionList.vue
│   │   └── Auth/
│   │       └── PinLogin.vue
│   ├── views/              # 頁面元件
│   │   ├── Dashboard.vue
│   │   ├── Transactions.vue
│   │   └── Settings.vue
│   ├── stores/             # Pinia 狀態管理
│   │   ├── auth.js
│   │   ├── transaction.js
│   │   └── config.js
│   ├── services/           # API 服務
│   │   └── api.js
│   ├── router/             # Vue Router 路由
│   │   └── index.js
│   ├── App.vue
│   ├── main.js
│   └── style.css
├── .env                    # 環境變數
├── package.json
├── vite.config.js
└── tailwind.config.js
```

---

## 關鍵檔案程式碼

### 1. 環境變數（.env）

```.env
VITE_GAS_API_URL=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
```

**重要**：將 `YOUR_DEPLOYMENT_ID` 替換成你的 Google Apps Script Web App URL。

### 2. API 服務（src/services/api.js）

```javascript
const GAS_URL = import.meta.env.VITE_GAS_API_URL;

export const api = {
  /**
   * 取得所有交易記錄
   */
  async getTransactions() {
    const url = `${GAS_URL}?action=getTransactions`;
    const res = await fetch(url);
    return res.json();
  },

  /**
   * 取得系統設定
   */
  async getConfig() {
    const url = `${GAS_URL}?action=getConfig`;
    const res = await fetch(url);
    return res.json();
  },

  /**
   * 取得統計資料
   */
  async getStats() {
    const url = `${GAS_URL}?action=getStats`;
    const res = await fetch(url);
    return res.json();
  },

  /**
   * 新增交易
   */
  async addTransaction(data) {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'addTransaction',
        data
      })
    });
    return res.json();
  },

  /**
   * 更新交易
   */
  async updateTransaction(data) {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'updateTransaction',
        data
      })
    });
    return res.json();
  },

  /**
   * 刪除交易
   */
  async deleteTransaction(id) {
    const res = await fetch(GAS_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'deleteTransaction',
        id
      })
    });
    return res.json();
  }
};
```

### 3. 認證狀態管理（src/stores/auth.js）

```javascript
import { defineStore } from 'pinia';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    pinCode: '8888' // 可從 Config API 動態取得
  }),

  actions: {
    /**
     * 檢查是否已登入
     */
    checkAuth() {
      this.isAuthenticated = localStorage.getItem('auth') === 'true';
    },

    /**
     * 登入
     */
    login(pin) {
      if (pin === this.pinCode) {
        this.isAuthenticated = true;
        localStorage.setItem('auth', 'true');
        return true;
      }
      return false;
    },

    /**
     * 登出
     */
    logout() {
      this.isAuthenticated = false;
      localStorage.removeItem('auth');
    }
  }
});
```

### 4. 交易狀態管理（src/stores/transaction.js）

```javascript
import { defineStore } from 'pinia';
import { api } from '@/services/api';

export const useTransactionStore = defineStore('transaction', {
  state: () => ({
    transactions: [],
    stats: {},
    loading: false
  }),

  actions: {
    /**
     * 載入交易記錄
     */
    async loadTransactions() {
      this.loading = true;
      try {
        this.transactions = await api.getTransactions();
      } catch (error) {
        console.error('Load transactions error:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 載入統計資料
     */
    async loadStats() {
      this.loading = true;
      try {
        this.stats = await api.getStats();
      } catch (error) {
        console.error('Load stats error:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 新增交易
     */
    async addTransaction(data) {
      const result = await api.addTransaction(data);
      if (result.success) {
        await this.loadTransactions();
        await this.loadStats();
      }
      return result;
    },

    /**
     * 刪除交易
     */
    async deleteTransaction(id) {
      const result = await api.deleteTransaction(id);
      if (result.success) {
        await this.loadTransactions();
        await this.loadStats();
      }
      return result;
    }
  }
});
```

### 5. 設定狀態管理（src/stores/config.js）

```javascript
import { defineStore } from 'pinia';
import { api } from '@/services/api';

export const useConfigStore = defineStore('config', {
  state: () => ({
    config: {},
    loading: false
  }),

  getters: {
    categories: (state) => state.config.categories || {},
    labels: (state) => state.config.labels || [],
    methods: (state) => state.config.methods || [],
    monthlyBudget: (state) => state.config.MonthlyBudget || 0
  },

  actions: {
    /**
     * 載入系統設定
     */
    async loadConfig() {
      this.loading = true;
      try {
        this.config = await api.getConfig();
      } catch (error) {
        console.error('Load config error:', error);
      } finally {
        this.loading = false;
      }
    }
  }
});
```

### 6. 路由設定（src/router/index.js）

```javascript
import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import Dashboard from '@/views/Dashboard.vue';
import Transactions from '@/views/Transactions.vue';
import Settings from '@/views/Settings.vue';

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: Dashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: Transactions,
    meta: { requiresAuth: true }
  },
  {
    path: '/settings',
    name: 'Settings',
    component: Settings,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守衛：檢查登入狀態
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  authStore.checkAuth();

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 未登入，顯示 PIN 登入畫面（在 App.vue 處理）
    next();
  } else {
    next();
  }
});

export default router;
```

### 7. 主應用程式（src/main.js）

```javascript
import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import './style.css';

const app = createApp(App);

app.use(createPinia());
app.use(router);
app.mount('#app');
```

### 8. App.vue

```vue
<template>
  <div id="app" class="min-h-screen bg-gray-100">
    <!-- PIN 登入畫面 -->
    <PinLogin v-if="!authStore.isAuthenticated" />

    <!-- 主應用 -->
    <div v-else>
      <!-- 導覽列 -->
      <nav class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4">
          <div class="flex justify-between h-16">
            <div class="flex space-x-8">
              <router-link
                to="/"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="$route.name === 'Dashboard' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                Dashboard
              </router-link>
              <router-link
                to="/transactions"
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
                :class="$route.name === 'Transactions' ? 'border-indigo-500 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'"
              >
                交易記錄
              </router-link>
            </div>
            <div class="flex items-center">
              <button
                @click="authStore.logout"
                class="text-gray-500 hover:text-gray-700"
              >
                登出
              </button>
            </div>
          </div>
        </div>
      </nav>

      <!-- 頁面內容 -->
      <main class="max-w-7xl mx-auto py-6 px-4">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { onMounted } from 'vue';
import { useAuthStore } from '@/stores/auth';
import PinLogin from '@/components/Auth/PinLogin.vue';

const authStore = useAuthStore();

onMounted(() => {
  authStore.checkAuth();
});
</script>
```

### 9. PIN 登入元件（src/components/Auth/PinLogin.vue）

```vue
<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900">
          家庭記帳系統
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          請輸入 PIN 碼
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="handleLogin">
        <div>
          <input
            v-model="pin"
            type="password"
            inputmode="numeric"
            maxlength="4"
            class="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-center text-2xl tracking-widest"
            placeholder="••••"
          />
        </div>

        <div v-if="error" class="text-red-500 text-sm text-center">
          PIN 碼錯誤，請重試
        </div>

        <button
          type="submit"
          class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          登入
        </button>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/stores/auth';

const authStore = useAuthStore();
const pin = ref('');
const error = ref(false);

const handleLogin = () => {
  const success = authStore.login(pin.value);

  if (!success) {
    error.value = true;
    pin.value = '';
  }
};
</script>
```

### 10. Dashboard 頁面（src/views/Dashboard.vue）

```vue
<template>
  <div class="space-y-6">
    <h1 class="text-2xl font-bold text-gray-900">記帳總覽</h1>

    <!-- 統計卡片 -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-3">
      <StatsCard
        title="本月支出"
        :value="stats.monthlyTotal || 0"
        unit="TWD"
        color="blue"
      />
      <StatsCard
        title="本週支出"
        :value="stats.weeklyTotal || 0"
        unit="TWD"
        color="green"
      />
      <StatsCard
        title="預算剩餘"
        :value="budget - (stats.monthlyTotal || 0)"
        unit="TWD"
        :color="budget - (stats.monthlyTotal || 0) >= 0 ? 'green' : 'red'"
      />
    </div>

    <!-- 分類圖表 -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <h3 class="text-lg font-medium text-gray-900 mb-4">本月分類支出</h3>
        <CategoryChart :data="stats.categoryStats || {}" />
      </div>
    </div>

    <!-- 最近交易 -->
    <div class="bg-white overflow-hidden shadow rounded-lg">
      <div class="p-5">
        <h3 class="text-lg font-medium text-gray-900 mb-4">最近交易</h3>
        <RecentTransactions :transactions="stats.recentTransactions || []" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useTransactionStore } from '@/stores/transaction';
import { useConfigStore } from '@/stores/config';
import StatsCard from '@/components/Dashboard/StatsCard.vue';
import CategoryChart from '@/components/Dashboard/CategoryChart.vue';
import RecentTransactions from '@/components/Dashboard/RecentTransactions.vue';

const transactionStore = useTransactionStore();
const configStore = useConfigStore();
const stats = ref({});
const budget = ref(0);

onMounted(async () => {
  await transactionStore.loadStats();
  await configStore.loadConfig();

  stats.value = transactionStore.stats;
  budget.value = configStore.monthlyBudget;
});
</script>
```

**注意**：完整的元件程式碼（StatsCard, CategoryChart, RecentTransactions, TransactionForm 等）較長，建議根據需求自行實作，或參考 Vue 3 + Chart.js 的官方範例。

---

## 本地開發與測試

### 步驟 1：啟動開發伺服器

```bash
npm run dev
```

會自動開啟瀏覽器：`http://localhost:5173`

### 步驟 2：測試 PIN 登入

1. 輸入 PIN 碼：`8888`（或你在 Config 中設定的值）
2. 登入成功後，應該會看到 Dashboard

### 步驟 3：測試 API 連接

1. 開啟瀏覽器開發者工具（F12）
2. 切換到「Network」分頁
3. 查看是否有成功呼叫 Google Apps Script API
4. 查看 Dashboard 是否正確顯示統計資料

### 步驟 4：測試新增交易

1. 前往「交易記錄」頁面
2. 點擊「新增交易」
3. 填寫表單並送出
4. 檢查 Google Sheet 的 Data Tab 是否有新增記錄

---

## ✅ 完成檢查清單

- [ ] 已安裝所有依賴
- [ ] 已設定 Tailwind CSS
- [ ] 已建立專案目錄結構
- [ ] 已設定環境變數（.env 檔案）
- [ ] 已建立 API 服務（api.js）
- [ ] 已建立 Pinia Stores（auth, transaction, config）
- [ ] 已設定 Vue Router
- [ ] 已建立 PIN 登入元件
- [ ] 已建立 Dashboard 頁面
- [ ] 本地開發伺服器可正常運行
- [ ] PIN 登入功能正常
- [ ] API 連接成功，可取得資料

---

## 🎉 下一步

完成 Web App 開發後，前往：

👉 **[06-DEPLOYMENT.md](06-DEPLOYMENT.md)** 部署到 GitHub Pages
