import { NextRequest, NextResponse } from 'next/server';
import { lineService } from '@/lib/services/line';
import { googleSheetsService } from '@/lib/services/googleSheets';
import { openClawService } from '@/lib/services/openclaw';
import { getCurrentMonthISORange } from '@/lib/utils/date';
import type { LineWebhookEvent, Expense } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-line-signature');

    // 驗證 LINE 簽章
    if (!signature || !lineService.validateSignature(body, signature)) {
      return NextResponse.json(
        { error: 'Signature verification failed' },
        { status: 401 }
      );
    }

    const data = JSON.parse(body);
    const events: LineWebhookEvent[] = data.events || [];

    // 處理每個事件
    for (const event of events) {
      await handleEvent(event);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Webhook 處理失敗:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * 處理 LINE 事件
 */
async function handleEvent(event: LineWebhookEvent) {
  // 只處理訊息事件
  if (event.type !== 'message') {
    return;
  }

  const { message, replyToken } = event;

  if (!message) {
    return;
  }

  try {
    // 處理文字訊息
    if (message.type === 'text' && message.text) {
      await handleTextMessage(message.text, replyToken);
    }
    // 處理圖片訊息（發票 OCR）
    else if (message.type === 'image' && message.id) {
      await handleImageMessage(message.id, replyToken);
    }
  } catch (error) {
    console.error('處理訊息失敗:', error);
    await lineService.replyText(replyToken, 'Processing failed, please try again later');
  }
}

/**
 * 處理文字訊息
 */
async function handleTextMessage(text: string, replyToken: string) {
  const lowerText = text.toLowerCase().trim();

  // 指令：統計
  if (lowerText === '統計' || lowerText === 'summary') {
    await handleSummaryCommand(replyToken);
    return;
  }

  // 指令：列表
  if (lowerText === '列表' || lowerText === 'list') {
    await handleListCommand(replyToken);
    return;
  }

  // 指令：幫助
  if (lowerText === '幫助' || lowerText === 'help' || lowerText === '說明') {
    const flexMessage = lineService.createHelpFlexMessage();
    await lineService.replyFlex(replyToken, 'User Guide', flexMessage);
    return;
  }

  // 解析支出記錄格式：日期|類別|金額|描述|付款人|付款方式
  const parts = text.split('|').map((p) => p.trim());

  if (parts.length === 6) {
    await handleAddExpense(parts, replyToken);
    return;
  }

  // 無法識別的訊息
  await lineService.replyText(
    replyToken,
    'Unrecognized command.\n\n' +
      'Please use the following format to add an expense:\n' +
      'Date|Category|Amount|Description|Payer|Payment Method\n\n' +
      'Or type "Help" for more information'
  );
}

/**
 * 新增支出記錄
 */
async function handleAddExpense(parts: string[], replyToken: string) {
  const [date, category, amountStr, description, payer, paymentMethod] = parts;

  // 驗證金額
  const amount = parseFloat(amountStr);
  if (isNaN(amount) || amount <= 0) {
    await lineService.replyText(replyToken, 'Invalid amount format');
    return;
  }

  // 驗證日期格式
  if (!/^\d{4}\/\d{1,2}\/\d{1,2}$/.test(date)) {
    await lineService.replyText(replyToken, 'Invalid date format (please use YYYY/MM/DD)');
    return;
  }

  try {
    // 新增到 Google Sheets - 正確對應欄位
    const expense = await googleSheetsService.addExpense({
      date,
      category,
      subcategory: '', // LINE Bot 格式沒有子類別
      amount,
      label: description, // description 對應到 label
      method: paymentMethod, // paymentMethod 對應到 method
      currency: 'TWD',
      note: `Payer: ${payer}`, // payer 資訊放在 note
    });

    // 回覆 Flex Message
    const flexMessage = lineService.createExpenseFlexMessage(expense);
    await lineService.replyFlex(replyToken, 'Expense record added', flexMessage);
  } catch (error) {
    console.error('新增支出失敗:', error);
    await lineService.replyText(replyToken, 'Failed to add expense, please try again later');
  }
}

/**
 * 處理統計指令
 */
async function handleSummaryCommand(replyToken: string) {
  try {
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;

    const { startDate, endDate } = getCurrentMonthISORange();

    const expenses = await googleSheetsService.getExpensesByDateRange(
      startDate,
      endDate
    );

    const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    // 計算類別統計
    const categoryMap = new Map<string, { total: number; count: number }>();

    expenses.forEach((expense) => {
      const current = categoryMap.get(expense.category) || { total: 0, count: 0 };
      categoryMap.set(expense.category, {
        total: current.total + expense.amount,
        count: current.count + 1,
      });
    });

    const categories = Array.from(categoryMap.entries())
      .map(([category, data]) => ({
        category,
        total: data.total,
        count: data.count,
        percentage: total > 0 ? (data.total / total) * 100 : 0,
      }))
      .sort((a, b) => b.total - a.total);

    const topExpenses = [...expenses]
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 5);

    const summary = {
      month: `${year}/${month}`,
      total,
      budget: 0, // LINE Bot 沒有預算功能，設為 0
      categories,
      topExpenses,
    };

    const flexMessage = lineService.createMonthlySummaryFlexMessage(summary);
    await lineService.replyFlex(replyToken, 'Monthly Statistics', flexMessage);
  } catch (error) {
    console.error('取得統計失敗:', error);
    await lineService.replyText(replyToken, 'Failed to get statistics, please try again later');
  }
}

/**
 * 處理列表指令
 */
async function handleListCommand(replyToken: string) {
  try {
    const expenses = await googleSheetsService.getExpenses(10);

    if (expenses.length === 0) {
      await lineService.replyText(replyToken, 'No expense records found');
      return;
    }

    const flexMessage = lineService.createExpenseListFlexMessage(expenses);
    await lineService.replyFlex(replyToken, 'Recent Expenses', flexMessage);
  } catch (error) {
    console.error('取得列表失敗:', error);
    await lineService.replyText(replyToken, 'Failed to get list, please try again later');
  }
}

/**
 * 處理圖片訊息（發票 OCR）
 */
async function handleImageMessage(messageId: string, replyToken: string) {
  try {
    // 檢查是否已設定 OpenClaw API
    if (!openClawService.isConfigured()) {
      await lineService.replyText(
        replyToken,
        'OCR feature not enabled\nPlease enter expense manually'
      );
      return;
    }

    // 處理圖片並辨識（移除「正在處理」提示以避免 replyToken 重複使用）
    const result = await openClawService.processReceiptImage(messageId);

    if (!result.success || !result.data) {
      await lineService.replyText(
        replyToken,
        `Receipt recognition failed: ${result.error}\nPlease enter expense manually`
      );
      return;
    }

    // 將辨識結果轉換為支出記錄（這裡需要使用者確認）
    const { merchant, date, amount } = result.data;

    const confirmMessage =
      `Receipt recognition results:\n` +
      `Merchant: ${merchant}\n` +
      `Date: ${date}\n` +
      `Amount: $${amount}\n\n` +
      `Please confirm and add in the following format:\n` +
      `${date}|Category|${amount}|${merchant}|Payer|Payment Method`;

    await lineService.replyText(replyToken, confirmMessage);
  } catch (error) {
    console.error('處理圖片失敗:', error);
    await lineService.replyText(replyToken, 'Failed to process image, please try again later');
  }
}
