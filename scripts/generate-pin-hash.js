/**
 * 產生 PIN Code Hash
 * 用於設定 .env.local 中的 PIN_CODE_HASH
 *
 * 使用方式：
 * node scripts/generate-pin-hash.js <PIN碼>
 *
 * 範例：
 * node scripts/generate-pin-hash.js 1234
 */

const bcrypt = require('bcryptjs');

async function generatePinHash() {
  const pin = process.argv[2];

  if (!pin) {
    console.error('錯誤：請提供 PIN 碼');
    console.log('使用方式：node scripts/generate-pin-hash.js <PIN碼>');
    console.log('範例：node scripts/generate-pin-hash.js 1234');
    process.exit(1);
  }

  // 驗證 PIN 格式（4-6 位數字）
  if (!/^\d{4,6}$/.test(pin)) {
    console.error('錯誤：PIN 碼必須是 4-6 位數字');
    process.exit(1);
  }

  try {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(pin, salt);

    console.log('\n✅ PIN Code Hash 產生成功！\n');
    console.log('請將以下內容加入到 .env.local 檔案：');
    console.log('─'.repeat(60));
    console.log(`PIN_CODE_HASH=${hash}`);
    console.log('─'.repeat(60));
    console.log('\n⚠️  請妥善保管此 Hash 值，並確保 .env.local 不會被上傳到版控系統\n');
  } catch (error) {
    console.error('產生 Hash 失敗:', error);
    process.exit(1);
  }
}

generatePinHash();
