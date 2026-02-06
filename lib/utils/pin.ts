import bcrypt from 'bcryptjs';

const PIN_CODE_HASH = process.env.PIN_CODE_HASH || '';

/**
 * 驗證 PIN Code
 */
export async function verifyPin(inputPin: string): Promise<boolean> {
  if (!PIN_CODE_HASH) {
    console.error('PIN_CODE_HASH not set');
    return false;
  }

  try {
    const isValid = await bcrypt.compare(inputPin, PIN_CODE_HASH);
    return isValid;
  } catch (error) {
    console.error('PIN verification failed:', error);
    return false;
  }
}

/**
 * 產生 PIN Code Hash（用於設定環境變數）
 * 這個函數只在初始設定時使用
 */
export async function generatePinHash(pin: string): Promise<string> {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(pin, salt);
  return hash;
}

/**
 * 驗證 PIN 格式（4-6 位數字）
 */
export function isValidPinFormat(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}
