/**
 * Telegram WebApp Service
 * Handles Telegram Mini App initialization, Haptic Feedback,
 * direct Bot API delivery, Telegram deep-linking, and Telegram.WebApp.sendData() logic.
 */

// Configured Bot Username and Token
export const TG_BOT_USERNAME = "moviex_hd_bot";
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

// Clean parameter specifically for Telegram ?start= URL parameter (alphanumeric and underscores)
export const sanitizeForTelegramStart = (input: string): string => {
  if (!input) return '';
  let clean = input.trim();
  // Remove starting hash or slash
  clean = clean.replace(/^[#/]+/, '');
  // Replace spaces with underscores
  clean = clean.replace(/\s+/g, '_');
  // Remove any chars not allowed in Telegram start param
  clean = clean.replace(/[^a-zA-Z0-9_-]/g, '');
  return clean;
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
  botDeepLink: string;
  sentViaWebApp: boolean;
  sentViaApi?: boolean;
}

/**
 * Sends the configured Message ID or custom text directly to the Telegram bot inbox.
 * 1. Generates Telegram bot deep link (https://t.me/moviex_hd_bot?start=...).
 * 2. Calls direct Telegram Bot API sendMessage if user ID is present.
 * 3. Calls Telegram.WebApp.sendData(payload).
 * 4. Opens the bot deep link via Telegram.WebApp.openTelegramLink.
 * 5. Auto-copies to clipboard.
 */
export const sendTelegramMessageData = async (
  messageIdOrText: string | number | undefined,
  fallbackUrl?: string
): Promise<SendDataResult> => {
  const trimmed = String(messageIdOrText || '').trim();
  const rawPayload = trimmed.startsWith('http') ? extractTelegramMessageId(trimmed) || trimmed : trimmed;
  const cleanStartParam = sanitizeForTelegramStart(rawPayload) || '2';
  const botDeepLink = `https://t.me/${TG_BOT_USERNAME}?start=${encodeURIComponent(cleanStartParam)}`;

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
        await navigator.clipboard.writeText(rawPayload);
      }
    } catch {
      // ignore
    }

    // 3. Direct Telegram Bot API Delivery (Sends the exact configured message text like #post2 directly to user's chat)
    const userId = tg?.initDataUnsafe?.user?.id;
    if (userId && TG_BOT_TOKEN) {
      try {
        const response = await fetch(`https://api.telegram.org/bot${TG_BOT_TOKEN}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: userId,
            text: rawPayload
          })
        });
        const data = await response.json();
        if (data.ok) {
          sentViaApi = true;
        } else {
          console.warn('Bot sendMessage response error:', data);
        }
      } catch (err) {
        console.warn('Bot API delivery error:', err);
      }
    }

    // 4. Send via native Telegram.WebApp.sendData() (if opened via Reply Keyboard button)
    if (tg && typeof tg.sendData === 'function') {
      try {
        tg.sendData(rawPayload);
        sentViaWebApp = true;
      } catch (err) {
        console.warn('Telegram.WebApp.sendData error:', err);
      }
    }

    // 5. Open Telegram Bot Deep Link directly
    if (tg && typeof tg.openTelegramLink === 'function') {
      try {
        tg.openTelegramLink(botDeepLink);
      } catch (e) {
        console.warn('openTelegramLink error:', e);
      }
    } else if (fallbackUrl && fallbackUrl.startsWith('http')) {
      window.open(fallbackUrl, '_blank');
    }
  }

  return {
    success: true,
    messageId: rawPayload,
    botDeepLink,
    sentViaWebApp,
    sentViaApi
  };
};

/**
 * Open the bot chat directly in Telegram
 */
export const openBotChat = (messageIdOrText?: string): void => {
  const cleanStart = messageIdOrText ? sanitizeForTelegramStart(messageIdOrText) : '';
  const url = cleanStart 
    ? `https://t.me/${TG_BOT_USERNAME}?start=${encodeURIComponent(cleanStart)}`
    : `https://t.me/${TG_BOT_USERNAME}`;

  if (typeof window !== 'undefined') {
    const tg = (window as any).Telegram?.WebApp;
    if (tg && typeof tg.openTelegramLink === 'function') {
      tg.openTelegramLink(url);
    } else {
      window.open(url, '_blank');
    }
  }
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




