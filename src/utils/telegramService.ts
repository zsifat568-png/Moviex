/**
 * Telegram WebApp Service
 * Handles Telegram Mini App initialization, Haptic Feedback,
 * direct Bot API copyMessage delivery, clipboard auto-copy, and Telegram.WebApp.sendData() logic.
 */

export const TG_BOT_TOKEN = "8804626300:AAFiVAk5xrGsy9eeKexxkDSdy4QxBqnAG3U";
export const TG_CHANNEL_ID = -1003911010893;

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
  return Boolean(tg && (tg.initData || tg.initDataUnsafe?.user));
};

// Get current Telegram User ID if running in Telegram
export const getTelegramUserId = (): number | string | null => {
  if (typeof window === 'undefined') return null;
  const tg = (window as any).Telegram?.WebApp;
  return tg?.initDataUnsafe?.user?.id || null;
};

export interface SendDataResult {
  success: boolean;
  messageId: string;
  sentViaWebApp: boolean;
  sentViaApi?: boolean;
}

/**
 * Sends the configured Message ID or custom text directly to the Telegram bot inbox.
 * 1. Calls Telegram Bot API copyMessage directly if user ID is present in WebApp.
 * 2. Calls Telegram.WebApp.sendData(payload).
 * 3. Auto-copies to clipboard.
 */
export const sendTelegramMessageData = async (
  messageIdOrText: string | number | undefined,
  fallbackUrl?: string
): Promise<SendDataResult> => {
  const trimmed = String(messageIdOrText || '').trim();
  const payload = trimmed.startsWith('http') ? extractTelegramMessageId(trimmed) || trimmed : trimmed;

  let sentViaApi = false;
  let sentViaWebApp = false;

  if (typeof window !== 'undefined') {
    const tg = (window as any).Telegram?.WebApp;

    // 1. Trigger haptic feedback if available
    try {
      if (tg?.HapticFeedback?.notificationOccurred) {
        tg.HapticFeedback.notificationOccurred('success');
      } else if (tg?.HapticFeedback?.impactOccurred) {
        tg.HapticFeedback.impactOccurred('heavy');
      }
    } catch {
      // ignore
    }

    // 2. Auto-copy payload to clipboard
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(payload);
      }
    } catch {
      // ignore
    }

    // 3. Direct Telegram Bot API Delivery (Sends the exact configured message text like #post2 directly to the chat)
    const userId = tg?.initDataUnsafe?.user?.id;
    if (userId && TG_BOT_TOKEN) {
      try {
        fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: userId,
            text: payload
          })
        }).catch(err => console.warn('sendMessage API call warning:', err));
        sentViaApi = true;
      } catch (err) {
        console.warn('Bot API delivery error:', err);
      }
    }

    // 4. Send via native Telegram.WebApp.sendData() (for Keyboard button launches)
    if (tg && typeof tg.sendData === 'function') {
      try {
        tg.sendData(payload);
        sentViaWebApp = true;
      } catch (err) {
        console.warn('Telegram.WebApp.sendData error:', err);
      }
    }

    // 5. Fallback when opened in normal browser outside Telegram
    if (!sentViaApi && !sentViaWebApp && fallbackUrl && fallbackUrl.startsWith('http')) {
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
    sentViaWebApp,
    sentViaApi
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


