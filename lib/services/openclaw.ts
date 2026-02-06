import type { OcrResult } from '@/types';

export class OpenClawService {
  private apiKey: string;
  private apiUrl = 'https://api.openclaw.com/v1/ocr'; // 假設的 API endpoint

  constructor() {
    this.apiKey = process.env.OPENCLAW_API_KEY || '';
  }

  /**
   * 檢查是否已設定 API Key
   */
  isConfigured(): boolean {
    return this.apiKey.length > 0;
  }

  /**
   * 辨識發票圖片
   */
  async recognizeReceipt(imageUrl: string): Promise<OcrResult> {
    if (!this.isConfigured()) {
      return {
        success: false,
        error: 'OpenClaw API Key not set',
      };
    }

    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          image_url: imageUrl,
          type: 'receipt',
        }),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.statusText}`);
      }

      const data = await response.json();

      return {
        success: true,
        data: {
          merchant: data.merchant || 'Unknown Merchant',
          date: data.date || new Date().toISOString().split('T')[0],
          amount: data.total || 0,
          items: data.items || [],
        },
      };
    } catch (error) {
      console.error('OCR recognition failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Error',
      };
    }
  }

  /**
   * 從 LINE 取得圖片內容
   */
  async getImageFromLine(messageId: string): Promise<Buffer | null> {
    try {
      const response = await fetch(
        `https://api-data.line.me/v2/bot/message/${messageId}/content`,
        {
          headers: {
            Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Unable to get image');
      }

      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Failed to get LINE image:', error);
      return null;
    }
  }

  /**
   * 上傳圖片到臨時儲存空間（這裡可以使用 Cloudinary 或其他服務）
   */
  async uploadImage(imageBuffer: Buffer): Promise<string | null> {
    // TODO: 實作圖片上傳到雲端儲存
    // 這裡假設我們有一個圖片上傳服務
    // 實際使用時需要實作或使用第三方服務如 Cloudinary

    // 暫時回傳一個假的 URL
    return 'https://example.com/temp-image.jpg';
  }

  /**
   * 處理發票圖片並回傳辨識結果
   */
  async processReceiptImage(messageId: string): Promise<OcrResult> {
    try {
      // 1. 從 LINE 取得圖片
      const imageBuffer = await this.getImageFromLine(messageId);
      if (!imageBuffer) {
        return {
          success: false,
          error: 'Unable to get image',
        };
      }

      // 2. 上傳圖片到臨時儲存空間
      const imageUrl = await this.uploadImage(imageBuffer);
      if (!imageUrl) {
        return {
          success: false,
          error: 'Image upload failed',
        };
      }

      // 3. 使用 OCR 辨識
      const result = await this.recognizeReceipt(imageUrl);

      return result;
    } catch (error) {
      console.error('Failed to process receipt image:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown Error',
      };
    }
  }
}

// 匯出單例實例
export const openClawService = new OpenClawService();
