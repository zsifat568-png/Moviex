/**
 * Telegram WebApp Service
 * Handles Telegram Mini App initialization, Haptic Feedback,
 * and Telegram.WebApp.sendData() logic.
 */

// Helper to sanitize / get Telegram Message ID or payload text
export const extractTelegramMessageId = (input: string | undefined | null): string => {
  if (!input) return '';
  const trimmed = String(input).trim();
  if (!trimmed) return '';

  // If it's a telegram link (e.g. "https://t.me/c/1234567890/2" or "t.me/channel/2")
  const linkMatch = trimmed.match(/\/(\d+)\/?(?:\?.*)?$/);
  if (linkMatch && linkMatch[1]) {
    return linkMatch[1];
  }

  // If it's deep-link start query (e.g. "https://t.me/bot?start=2" or "start=movie_2")
  const startMatch = trimmed.match(/[?&]start=([^&]+)/);
  if (startMatch && startMatch[1]) {
    return startMatch[1];
  }

  return trimmed;
};

// Check if currently running inside Telegram WebApp
export const isInsideTelegramWebApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  const tg = (window as any).Telegram?.WebApp;
  return Boolean(tg && typeof tg.sendData === 'function' && tg.initData);
};

export interface SendDataResult {
  success: boolean;
  messageId: string;
  sentViaWebApp: boolean;
}

/**
 * Sends the configured Message ID or custom text directly to the Telegram bot inbox using Telegram.WebApp.sendData()
 */
export const sendTelegramMessageData = (
  messageIdOrText: string | number | undefined,
  fallbackUrl?: string
): SendDataResult => {
  const trimmed = String(messageIdOrText || '').trim();
  // If it's a full URL, extract the ID; otherwise send the exact text/ID entered by admin
  const payload = trimmed.startsWith('http') ? extractTelegramMessageId(trimmed) || trimmed : trimmed;

  if (typeof window !== 'undefined') {
    const tg = (window as any).Telegram?.WebApp;

    // Trigger haptic feedback if available
    try {
      if (tg?.HapticFeedback?.notificationOccurred) {
        tg.HapticFeedback.notificationOccurred('success');
      } else if (tg?.HapticFeedback?.impactOccurred) {
        tg.HapticFeedback.impactOccurred('medium');
      }
    } catch {
      // ignore
    }

    // 1. Primary: If inside Telegram WebApp, send data directly to bot inbox
    if (tg && typeof tg.sendData === 'function') {
      try {
        tg.sendData(payload);
        return {
          success: true,
          messageId: payload,
          sentViaWebApp: true
        };
      } catch (err) {
        console.warn('Telegram.WebApp.sendData error:', err);
      }
    }

    // 2. Fallback when opened in normal browser outside Telegram
    if (fallbackUrl && fallbackUrl.startsWith('http')) {
      if (tg && typeof tg.openTelegramLink === 'function' && fallbackUrl.startsWith('https://t.me/')) {
        tg.openTelegramLink(fallbackUrl);
      } else {
        window.open(fallbackUrl, '_blank');
      }
    }
  }

  return {
    success: true,
    messageId: payload,
    sentViaWebApp: false
  };
};

/**
 * Closes the Telegram Mini App
 */
export const closeTelegramWebApp = (): void => {
  if (typeof window !== 'undefined') {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && typeof tg.close === 'function') {
      try {
        tg.close();
      } catch (e) {
        console.warn('Error closing Telegram WebApp:', e);
      }
    }
  }
};

