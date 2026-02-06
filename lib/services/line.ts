import { Client, TextMessage, FlexMessage } from '@line/bot-sdk';
import type { Expense, MonthlySummary, CategorySummary, LineMessage } from '@/types';
import { DATA } from '@/lib/constants';

export class LineService {
  private client: Client;

  constructor() {
    this.client = new Client({
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN!,
      channelSecret: process.env.LINE_CHANNEL_SECRET!,
    });
  }

  /**
   * 回覆文字訊息
   */
  async replyText(replyToken: string, text: string): Promise<void> {
    const message: TextMessage = {
      type: 'text',
      text,
    };

    await this.client.replyMessage(replyToken, message);
  }

  /**
   * 回覆 Flex Message
   */
  async replyFlex(
    replyToken: string,
    altText: string,
    contents: any
  ): Promise<void> {
    const message: FlexMessage = {
      type: 'flex',
      altText,
      contents,
    };

    await this.client.replyMessage(replyToken, message);
  }

  /**
   * 產生支出記錄 Flex Message
   */
  createExpenseFlexMessage(expense: Expense): any {
    return {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'Expense record added',
            weight: 'bold',
            size: 'lg',
            color: '#ffffff',
          },
        ],
        backgroundColor: '#27AE60',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              {
                type: 'text',
                text: 'Date',
                size: 'sm',
                color: '#999999',
                flex: 2,
              },
              {
                type: 'text',
                text: expense.date,
                size: 'sm',
                color: '#333333',
                flex: 5,
                wrap: true,
              },
            ],
            margin: 'md',
          },
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              {
                type: 'text',
                text: 'Category',
                size: 'sm',
                color: '#999999',
                flex: 2,
              },
              {
                type: 'text',
                text: expense.category,
                size: 'sm',
                color: '#333333',
                flex: 5,
                wrap: true,
              },
            ],
            margin: 'md',
          },
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              {
                type: 'text',
                text: 'Amount',
                size: 'sm',
                color: '#999999',
                flex: 2,
              },
              {
                type: 'text',
                text: `$${expense.amount}`,
                size: 'xl',
                color: '#E74C3C',
                flex: 5,
                weight: 'bold',
              },
            ],
            margin: 'md',
          },
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              {
                type: 'text',
                text: 'Label',
                size: 'sm',
                color: '#999999',
                flex: 2,
              },
              {
                type: 'text',
                text: expense.label || '-',
                size: 'sm',
                color: '#333333',
                flex: 5,
                wrap: true,
              },
            ],
            margin: 'md',
          },
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              {
                type: 'text',
                text: 'Note',
                size: 'sm',
                color: '#999999',
                flex: 2,
              },
              {
                type: 'text',
                text: expense.note || '-',
                size: 'sm',
                color: '#333333',
                flex: 5,
              },
            ],
            margin: 'md',
          },
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              {
                type: 'text',
                text: 'Payment Method',
                size: 'sm',
                color: '#999999',
                flex: 2,
              },
              {
                type: 'text',
                text: expense.method || '-',
                size: 'sm',
                color: '#333333',
                flex: 5,
              },
            ],
            margin: 'md',
          },
        ],
      },
    };
  }

  /**
   * 產生月度統計 Flex Message
   */
  createMonthlySummaryFlexMessage(summary: MonthlySummary): any {
    const categoryBubbles = summary.categories.map((cat: CategorySummary) => ({
      type: 'box',
      layout: 'baseline',
      contents: [
        {
          type: 'text',
          text: cat.category,
          size: 'sm',
          color: '#333333',
          flex: 3,
        },
        {
          type: 'text',
          text: `$${cat.total}`,
          size: 'sm',
          color: '#E74C3C',
          flex: 2,
          align: 'end',
        },
        {
          type: 'text',
          text: `${cat.percentage.toFixed(1)}%`,
          size: 'xs',
          color: '#999999',
          flex: 2,
          align: 'end',
        },
      ],
      margin: 'md',
    }));

    return {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: `${summary.month} Expense Statistics`,
            weight: 'bold',
            size: 'lg',
            color: '#ffffff',
          },
        ],
        backgroundColor: '#3498DB',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'box',
            layout: 'baseline',
            contents: [
              {
                type: 'text',
                text: 'Total Expenses',
                size: 'md',
                color: '#999999',
              },
              {
                type: 'text',
                text: `$${summary.total}`,
                size: 'xxl',
                color: '#E74C3C',
                weight: 'bold',
                align: 'end',
              },
            ],
            margin: 'md',
          },
          {
            type: 'separator',
            margin: 'xl',
          },
          {
            type: 'text',
            text: 'Category Statistics',
            size: 'sm',
            color: '#999999',
            margin: 'xl',
          },
          ...categoryBubbles,
        ],
      },
    };
  }

  /**
   * 產生支出列表 Flex Message
   */
  createExpenseListFlexMessage(expenses: Expense[]): any {
    const expenseItems = expenses.slice(0, DATA.MAX_LIST_ITEMS).map((expense) => ({
      type: 'box',
      layout: 'horizontal',
      contents: [
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: expense.category,
              size: 'sm',
              color: '#333333',
              weight: 'bold',
            },
            {
              type: 'text',
              text: expense.label || expense.category,
              size: 'xs',
              color: '#999999',
              wrap: true,
            },
          ],
          flex: 3,
        },
        {
          type: 'box',
          layout: 'vertical',
          contents: [
            {
              type: 'text',
              text: `$${expense.amount}`,
              size: 'sm',
              color: '#E74C3C',
              align: 'end',
            },
            {
              type: 'text',
              text: expense.date,
              size: 'xs',
              color: '#999999',
              align: 'end',
            },
          ],
          flex: 2,
        },
      ],
      margin: 'md',
    }));

    return {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'Recent Expenses',
            weight: 'bold',
            size: 'lg',
            color: '#ffffff',
          },
        ],
        backgroundColor: '#9B59B6',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: expenseItems,
      },
    };
  }

  /**
   * 產生幫助訊息 Flex Message
   */
  createHelpFlexMessage(): any {
    return {
      type: 'bubble',
      header: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'User Guide',
            weight: 'bold',
            size: 'lg',
            color: '#ffffff',
          },
        ],
        backgroundColor: '#34495E',
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: [
          {
            type: 'text',
            text: 'Add Expense',
            weight: 'bold',
            size: 'md',
            margin: 'md',
          },
          {
            type: 'text',
            text: 'Format: Date|Category|Amount|Description|Payer|Payment Method',
            size: 'xs',
            color: '#999999',
            wrap: true,
          },
          {
            type: 'text',
            text: 'Example: 2024/01/15|Food|250|Lunch|Husband|Cash',
            size: 'xs',
            color: '#3498DB',
            wrap: true,
            margin: 'sm',
          },
          {
            type: 'separator',
            margin: 'xl',
          },
          {
            type: 'text',
            text: 'Commands',
            weight: 'bold',
            size: 'md',
            margin: 'xl',
          },
          {
            type: 'text',
            text: '• Summary - View monthly statistics\n• List - View recent records\n• Help - Show this guide',
            size: 'xs',
            color: '#999999',
            wrap: true,
            margin: 'sm',
          },
          {
            type: 'separator',
            margin: 'xl',
          },
          {
            type: 'text',
            text: 'OCR Recognition',
            weight: 'bold',
            size: 'md',
            margin: 'xl',
          },
          {
            type: 'text',
            text: 'Send a photo of a receipt to automatically recognize and add an expense record',
            size: 'xs',
            color: '#999999',
            wrap: true,
            margin: 'sm',
          },
        ],
      },
    };
  }

  /**
   * 驗證 LINE Webhook 簽章
   */
  validateSignature(body: string, signature: string): boolean {
    const crypto = require('crypto');
    const channelSecret = process.env.LINE_CHANNEL_SECRET!;

    const hash = crypto
      .createHmac('SHA256', channelSecret)
      .update(body)
      .digest('base64');

    // 使用 timingSafeEqual 防止 timing attack
    try {
      return crypto.timingSafeEqual(
        Buffer.from(hash),
        Buffer.from(signature)
      );
    } catch {
      // 如果長度不同會拋出錯誤，直接返回 false
      return false;
    }
  }
}

// 匯出單例實例
export const lineService = new LineService();
