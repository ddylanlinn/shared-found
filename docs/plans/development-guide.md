# 開發實作指南

> 更新日期：2026-02-05

本文件說明如何從零開始建立 Next.js 專案並實作所有功能。

## 📋 前置準備

### 環境需求

- **Node.js**：18.x 或更高版本
- **npm** 或 **yarn**
- **Git**
- **程式碼編輯器**：VS Code（推薦）

### VS Code 擴充套件（推薦）

- ESLint
- Prettier
- Tailwind CSS IntelliSense
- TypeScript Vue Plugin (Volar)

---

## 🚀 Phase 1：專案初始化

### 1. 建立 Next.js 專案

```bash
cd /Users/D/Projects/shared-found

# 建立 Next.js 專案（使用 create-next-app）
npx create-next-app@latest web --typescript --tailwind --app --no-src-dir

# 進入專案目錄
cd web
```

安裝過程中的選項：
- ✅ TypeScript
- ✅ ESLint
- ✅ Tailwind CSS
- ✅ App Router
- ❌ `src/` directory
- ✅ Import alias (@/*)

### 2. 安裝依賴套件

```bash
npm install googleapis @line/bot-sdk jsonwebtoken
npm install -D @types/jsonwebtoken
```

### 3. 設定環境變數

建立 `.env.local` 檔案：

```bash
# .env.local

# Google Sheets
GOOGLE_SERVICE_ACCOUNT_EMAIL=your-service-account@xxx.iam.gserviceaccount.com
GOOGLE_SERVICE_ACCOUNT_KEY="-----BEGIN PRIVATE KEY-----\n..."
GOOGLE_SHEET_ID=your-spreadsheet-id

# LINE Bot
LINE_CHANNEL_SECRET=your-channel-secret
LINE_CHANNEL_ACCESS_TOKEN=your-channel-access-token

# Auth
PIN_CODE=8888
JWT_SECRET=your-random-secret-key
```

**重要**：將 `.env.local` 加入 `.gitignore`（應該已經自動加入）

### 4. 建立專案結構

```bash
mkdir -p lib components types
```

---

## 📦 Phase 2：實作 Service Layer

### 1. Google Sheets Service

建立 `lib/google-sheets.ts`：

```typescript
// lib/google-sheets.ts
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export interface Expense {
  id?: string;
  date: string;
  amount: number;
  category: string;
  subcategory: string;
  label: string;
  method: string;
  currency: string;
  note?: string;
}

export class GoogleSheetsService {
  private sheets;
  private spreadsheetId: string;

  constructor() {
    const auth = new JWT({
      email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      key: process.env.GOOGLE_SERVICE_ACCOUNT_KEY?.replace(/\\n/g, '\n'),
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    this.sheets = google.sheets({ version: 'v4', auth });
    this.spreadsheetId = process.env.GOOGLE_SHEET_ID!;
  }

  async addExpense(expense: Expense): Promise<void> {
    await this.sheets.spreadsheets.values.append({
      spreadsheetId: this.spreadsheetId,
      range: 'Data!A:H',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          expense.date,
          expense.amount,
          expense.category,
          expense.subcategory,
          expense.label,
          expense.method,
          expense.currency,
          expense.note || '',
        ]],
      },
    });
  }

  async getExpenses(month?: number, year?: number): Promise<Expense[]> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Data!A2:H',
    });

    const rows = response.data.values || [];
    let expenses = rows.map((row, index) => ({
      id: (index + 2).toString(),
      date: row[0],
      amount: parseFloat(row[1]),
      category: row[2],
      subcategory: row[3],
      label: row[4],
      method: row[5],
      currency: row[6],
      note: row[7],
    }));

    if (month && year) {
      expenses = expenses.filter((e) => {
        const date = new Date(e.date);
        return date.getMonth() + 1 === month && date.getFullYear() === year;
      });
    }

    return expenses;
  }

  async updateExpense(id: string, expense: Expense): Promise<void> {
    await this.sheets.spreadsheets.values.update({
      spreadsheetId: this.spreadsheetId,
      range: `Data!A${id}:H${id}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          expense.date,
          expense.amount,
          expense.category,
          expense.subcategory,
          expense.label,
          expense.method,
          expense.currency,
          expense.note || '',
        ]],
      },
    });
  }

  async deleteExpense(id: string): Promise<void> {
    const rowIndex = parseInt(id) - 1;
    await this.sheets.spreadsheets.batchUpdate({
      spreadsheetId: this.spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: 0,
                dimension: 'ROWS',
                startIndex: rowIndex,
                endIndex: rowIndex + 1,
              },
            },
          },
        ],
      },
    });
  }

  async getConfig(): Promise<Record<string, any>> {
    const response = await this.sheets.spreadsheets.values.get({
      spreadsheetId: this.spreadsheetId,
      range: 'Config!A:B',
    });

    const rows = response.data.values || [];
    const config: Record<string, any> = {};

    for (const row of rows) {
      const [key, value] = row;
      if (key && value) {
        config[key] = value;
      }
    }

    return config;
  }
}
```

### 2. LINE Service

建立 `lib/line.ts`：

```typescript
// lib/line.ts
import { Client } from '@line/bot-sdk';
import crypto from 'crypto';

const client = new Client({
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
});

export function validateSignature(body: string, signature: string): boolean {
  const hash = crypto
    .createHmac('SHA256', process.env.LINE_CHANNEL_SECRET!)
    .update(body)
    .digest('base64');

  return hash === signature;
}

export async function replyMessage(replyToken: string, text: string): Promise<void> {
  await client.replyMessage(replyToken, {
    type: 'text',
    text,
  });
}
```

### 3. JWT Utility

建立 `lib/jwt.ts`：

```typescript
// lib/jwt.ts
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export function signToken(payload: any): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}
```

### 4. OpenClaw Service（Phase 2 預留）

建立 `lib/openclaw.ts`：

```typescript
// lib/openclaw.ts
export interface ParsedExpense {
  amount: number;
  category: string;
  subcategory: string;
  confidence: number;
}

export class OpenClawService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = process.env.OPENCLAW_API_URL || '';
  }

  async parseExpense(text: string): Promise<ParsedExpense> {
    // Phase 2: 實作 HTTP API 呼叫
    throw new Error('OpenClaw integration coming in Phase 2');
  }
}
```

### 5. 型別定義

建立 `types/expense.ts`：

```typescript
// types/expense.ts
export interface Expense {
  
}
```

---

## 🔌 Phase 3：實作 API Routes

### 1. LINE Webhook

建立 `app/api/webhook/route.ts`：

```typescript
// app/api/webhook/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateSignature, replyMessage } from '@/lib/line';
import { GoogleSheetsService } from '@/lib/google-sheets';
import { OpenClawService } from '@/lib/openclaw';

export async function POST(request: NextRequest) {
  const signature = request.headers.get('x-line-signature');
  const body = await request.text();

  if (!signature || !validateSignature(body, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  const { events } = JSON.parse(body);
  const sheets = new GoogleSheetsService();
  const openclaw = new OpenClawService();

  for (const event of events) {
    try {
      if (event.type === 'postback') {
        await handlePostback(event, sheets);
      } else if (event.type === 'message' && event.message.type === 'text') {
        await handleTextMessage(event, sheets, openclaw);
      }
    } catch (error) {
      console.error('Error handling event:', error);
    }
  }

  return NextResponse.json({ success: true });
}

async function handlePostback(event: any, sheets: GoogleSheetsService) {
  const params = new URLSearchParams(event.postback.data);

  if (params.get('action') === 'add') {
    const expense = {
      date: new Date().toISOString().split('T')[0],
      amount: parseInt(params.get('amount') || '0'),
      category: params.get('category') || '',
      subcategory: params.get('subcategory') || '',
      label: params.get('label') || '必要',
      method: params.get('method') || '現金',
      currency: 'TWD',
      note: '',
    };

    await sheets.addExpense(expense);
    await replyMessage(
      event.replyToken,
      `✅ 已記帳：${expense.subcategory} $${expense.amount}`
    );
  }
}

async function handleTextMessage(
  event: any,
  sheets: GoogleSheetsService,
  openclaw: OpenClawService
) {
  try {
    const parsed = await openclaw.parseExpense(event.message.text);
    await sheets.addExpense({
      date: new Date().toISOString().split('T')[0],
      ...parsed,
      label: '必要',
      method: '現金',
      currency: 'TWD',
    });
    await replyMessage(
      event.replyToken,
      `✅ 已記帳：${parsed.subcategory} $${parsed.amount}`
    );
  } catch (error) {
    await replyMessage(
      event.replyToken,
      '🚧 自然語言記帳功能開發中，請使用下方選單記帳'
    );
  }
}
```

### 2. Auth API

建立 `app/api/auth/route.ts`：

```typescript
// app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { signToken } from '@/lib/jwt';

export async function POST(request: NextRequest) {
  const { pin } = await request.json();

  if (pin === process.env.PIN_CODE) {
    const token = signToken({ authenticated: true });
    return NextResponse.json({ success: true, token });
  }

  return NextResponse.json(
    { success: false, error: 'Invalid PIN' },
    { status: 401 }
  );
}
```

### 3. Expenses API

建立 `app/api/expenses/route.ts`：

```typescript
// app/api/expenses/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { GoogleSheetsService } from '@/lib/google-sheets';

function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;

  const token = authHeader.replace('Bearer ', '');
  return verifyToken(token);
}

export async function GET(request: NextRequest) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const year = searchParams.get('year');

  const sheets = new GoogleSheetsService();
  const expenses = await sheets.getExpenses(
    month ? parseInt(month) : undefined,
    year ? parseInt(year) : undefined
  );

  // 計算統計
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  return NextResponse.json({
    expenses,
    summary: { total, byCategory },
  });
}

export async function POST(request: NextRequest) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const expense = await request.json();
  const sheets = new GoogleSheetsService();
  await sheets.addExpense(expense);

  return NextResponse.json({ success: true });
}
```

建立 `app/api/expenses/[id]/route.ts`：

```typescript
// app/api/expenses/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from '@/lib/jwt';
import { GoogleSheetsService } from '@/lib/google-sheets';

function authenticate(request: NextRequest) {
  const authHeader = request.headers.get('authorization');
  if (!authHeader) return false;

  const token = authHeader.replace('Bearer ', '');
  return verifyToken(token);
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const expense = await request.json();
  const sheets = new GoogleSheetsService();
  await sheets.updateExpense(params.id, expense);

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  if (!authenticate(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sheets = new GoogleSheetsService();
  await sheets.deleteExpense(params.id);

  return NextResponse.json({ success: true });
}
```

---

## 🎨 Phase 4：實作前端元件

### 1. PinLogin 元件

建立 `components/PinLogin.tsx`：

```typescript
// components/PinLogin.tsx
'use client';

import { useState } from 'react';

interface PinLoginProps {
  onSuccess: () => void;
}

export function PinLogin({ onSuccess }: PinLoginProps) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.token);
        onSuccess();
      } else {
        setError('PIN 碼錯誤');
      }
    } catch (err) {
      setError('登入失敗，請稍後再試');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-96">
        <h1 className="text-2xl font-bold mb-6 text-center">Expense Tracker </h1>
        <form onSubmit={handleSubmit}>
          <input
            type="password"
            inputMode="numeric"
            placeholder="請輸入 PIN 碼"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg mb-4"
            maxLength={4}
          />
          {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 disabled:bg-gray-400"
          >
            {loading ? '登入中...' : '登入'}
          </button>
        </form>
      </div>
    </div>
  );
}
```

### 2. Summary 元件

建立 `components/Summary.tsx`：

```typescript
// components/Summary.tsx
import { Expense } from '@/types/expense';

interface SummaryProps {
  expenses: Expense[];
}

export function Summary({ expenses }: SummaryProps) {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  const byCategory = expenses.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + e.amount;
    return acc;
  }, {} as Record<string, number>);

  const categories = Object.entries(byCategory)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">本月統計</h2>

      <div className="mb-6">
        <p className="text-gray-600">總支出</p>
        <p className="text-3xl font-bold text-blue-600">${total.toLocaleString()}</p>
      </div>

      <div>
        <p className="text-gray-600 mb-3">分類支出</p>
        {categories.map(([category, amount]) => {
          const percentage = (amount / total) * 100;
          return (
            <div key={category} className="mb-3">
              <div className="flex justify-between text-sm mb-1">
                <span>{category}</span>
                <span className="font-semibold">${amount.toLocaleString()}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${percentage}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

### 3. ExpenseList 元件

建立 `components/ExpenseList.tsx`：

```typescript
// components/ExpenseList.tsx
import { Expense } from '@/types/expense';

interface ExpenseListProps {
  expenses: Expense[];
  onEdit: (expense: Expense) => void;
  onDelete: (id: string) => void;
}

export function ExpenseList({ expenses, onEdit, onDelete }: ExpenseListProps) {
  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-4 border-b">
        <h2 className="text-xl font-bold">記帳記錄</h2>
      </div>
      <div className="divide-y">
        {expenses.map((expense) => (
          <div key={expense.id} className="p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start">
              <div>
                <div className="font-semibold">{expense.subcategory}</div>
                <div className="text-sm text-gray-600">
                  {expense.category} · {expense.method}
                </div>
                <div className="text-xs text-gray-500">{expense.date}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-red-600">
                  ${expense.amount}
                </div>
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => onEdit(expense)}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    編輯
                  </button>
                  <button
                    onClick={() => onDelete(expense.id!)}
                    className="text-xs text-red-600 hover:underline"
                  >
                    刪除
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

### 4. Dashboard 主頁面

建立 `app/dashboard/page.tsx`：

```typescript
// app/dashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { PinLogin } from '@/components/PinLogin';
import { ExpenseList } from '@/components/ExpenseList';
import { Summary } from '@/components/Summary';
import { Expense } from '@/types/expense';

export default function DashboardPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(false);
  const [month, setMonth] = useState(new Date().getMonth() + 1);
  const [year, setYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      fetchExpenses();
    }
  }, [isAuthenticated, month, year]);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/expenses?month=${month}&year=${year}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        setExpenses(data.expenses);
      } else if (response.status === 401) {
        localStorage.removeItem('token');
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Failed to fetch expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('確定要刪除這筆記帳嗎？')) return;

    try {
      const token = localStorage.getItem('token');
      await fetch(`/api/expenses/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchExpenses();
    } catch (error) {
      console.error('Failed to delete expense:', error);
    }
  };

  if (!isAuthenticated) {
    return <PinLogin onSuccess={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Expense Tracker </h1>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              setIsAuthenticated(false);
            }}
            className="text-gray-600 hover:text-gray-800"
          >
            登出
          </button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 flex gap-4">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            <option value={2026}>2026</option>
            <option value={2025}>2025</option>
          </select>
          <select
            value={month}
            onChange={(e) => setMonth(parseInt(e.target.value))}
            className="px-4 py-2 border rounded-lg"
          >
            {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
              <option key={m} value={m}>
                {m} 月
              </option>
            ))}
          </select>
        </div>

        <Summary expenses={expenses} />

        {loading ? (
          <p className="text-center text-gray-500">載入中...</p>
        ) : (
          <ExpenseList
            expenses={expenses}
            onEdit={(expense) => console.log('編輯', expense)}
            onDelete={handleDelete}
          />
        )}
      </main>
    </div>
  );
}
```

---

## 🧪 Phase 5：本地測試

### 1. 啟動開發伺服器

```bash
npm run dev
```

開啟 `http://localhost:3000/dashboard`

### 2. 測試 Google Sheets 連線

建立測試腳本 `scripts/test-sheets.js`：

```javascript
// scripts/test-sheets.js
const { GoogleSheetsService } = require('../lib/google-sheets');

async function test() {
  const service = new GoogleSheetsService();

  // 測試新增
  await service.addExpense({
    date: '2026/2/5',
    amount: 100,
    category: '食物',
    subcategory: '午餐',
    label: '必要',
    method: '現金',
    currency: 'TWD',
    note: '測試',
  });

  console.log('✅ 新增成功');

  // 測試查詢
  const expenses = await service.getExpenses();
  console.log('✅ 查詢成功:', expenses.length, '筆');
}

test().catch(console.error);
```

執行：
```bash
node scripts/test-sheets.js
```

### 3. 測試 LINE Webhook（使用 ngrok）

```bash
# 安裝 ngrok
npm install -g ngrok

# 啟動 ngrok
ngrok http 3000
```

ngrok 會顯示公開網址，例如 `https://abc123.ngrok.io`

將 `https://abc123.ngrok.io/api/webhook` 設定到 LINE Developers Console 的 Webhook URL。

---

## 📝 開發檢查清單

- [ ] 專案初始化
  - [ ] 建立 Next.js 專案
  - [ ] 安裝依賴套件
  - [ ] 設定 `.env.local`
  - [ ] 建立專案結構
- [ ] Service Layer
  - [ ] GoogleSheetsService
  - [ ] LineService
  - [ ] JWT Utility
  - [ ] OpenClawService（預留）
- [ ] API Routes
  - [ ] `/api/webhook`
  - [ ] `/api/auth`
  - [ ] `/api/expenses`
  - [ ] `/api/expenses/[id]`
- [ ] 前端元件
  - [ ] PinLogin
  - [ ] Summary
  - [ ] ExpenseList
  - [ ] Dashboard 主頁面
- [ ] 本地測試
  - [ ] Google Sheets 連線測試
  - [ ] Dashboard 登入測試
  - [ ] LINE Webhook 測試（ngrok）

---

## 下一步

完成開發後，請參閱：
- [部署指南](./deployment-guide.md)
- [測試指南](./testing-guide.md)
