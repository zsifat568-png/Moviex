/**
 * Ad Service for Mondiad Ads
 * Handles Interstitial ads (on movie poster click) with instant zero-delay execution
 * and Popunder ads (ONLY on download click) without attaching document listeners.
 */

// Mondiad Interstitial Ad Constants
const INTERSTITIAL_STORAGE_KEY = 'fe9eecd0-89fe-4e4b-87a3-2269d0962ae8';
const INTERSTITIAL_WINDOW_KEY = 'f97bc113-9566-41d8-a6c9-2ddd9a30576c';
const INTERSTITIAL_ZONE_ID = '8569a8e8-0ab4-4d5c-83b0-afcef995b113';

// Mondiad Popunder Ad Constants
const POPUNDER_STORAGE_KEY = 'a7d7c144-70cd-4078-a72a-b977b7ec50d8';
const POPUNDER_WINDOW_KEY = '4f90abbe-558e-4c02-bbf0-e1d9609b9a11';
const POPUNDER_DIRECT_URL = 'https://rxmnd.com/502c2f6b-36d8-4c8c-a372-482d8b6dda4e?v=7';

// In-memory cache for ultra-fast zero-delay interstitial execution
let cachedInterstitialCode: string | null = null;
let isPreloading = false;

/**
 * Removes any rogue or lingering popunder scripts that might intercept poster clicks
 */
export const cleanupLingeringPopunderScripts = (): void => {
  if (typeof document === 'undefined') return;
  try {
    const popunderScripts = document.querySelectorAll(
      'script[src*="502c2f6b"], script[src*="ds.mrmnd.com"]'
    );
    popunderScripts.forEach((s) => {
      try {
        s.remove();
      } catch {}
    });
  } catch {}
};

/**
 * Pre-fetches interstitial.js in background into RAM and strips the artificial 2-3 second delay.
 * This enables nanosecond instant display on poster click!
 */
export const preloadInterstitialCode = async (): Promise<void> => {
  if (typeof window === 'undefined' || cachedInterstitialCode || isPreloading) return;

  isPreloading = true;
  try {
    const response = await fetch('https://ss.mrmnd.com/interstitial.js');
    if (response.ok) {
      const code = await response.text();
      // Remove Mondiad's internal artificial 2-3 second delay: ka=0x3e8*(kt||0x0) -> ka=0
      cachedInterstitialCode = code.replace('ka=0x3e8*(kt||0x0)', 'ka=0');
    }
  } catch {
    // If background pre-fetch fails, fallback handles it on demand
  } finally {
    isPreloading = false;
  }
};

// Immediately kick off background prefetch and clean up popunder scripts on load
if (typeof window !== 'undefined') {
  cleanupLingeringPopunderScripts();
  preloadInterstitialCode();
}

/**
 * Triggers Mondiad Interstitial ad on movie poster click.
 * Executes instantly in nanoseconds from RAM (Blob URL) with zero artificial delay.
 * Never triggers popunder ads.
 */
export const triggerMondiadInterstitial = (): void => {
  if (typeof window === 'undefined') return;

  try {
    // 1. Clean up any rogue popunder scripts so popunder NEVER interferes with poster click
    cleanupLingeringPopunderScripts();

    // 2. Wipe internal 24-hour frequency capping and window guard flags
    delete (window as any)[INTERSTITIAL_WINDOW_KEY];
    try {
      localStorage.removeItem(INTERSTITIAL_STORAGE_KEY);
      sessionStorage.removeItem(INTERSTITIAL_STORAGE_KEY);
    } catch {}

    // 3. Remove any previously injected interstitial scripts
    const oldScripts = document.querySelectorAll(`script[data-mndintid="${INTERSTITIAL_ZONE_ID}"]`);
    oldScripts.forEach((s) => {
      try {
        s.remove();
      } catch {}
    });

    // 4. Ultra-fast execution: If preloaded in memory, run via Blob URL (0ms network delay + 0ms timer delay)
    if (cachedInterstitialCode) {
      const blob = new Blob([cachedInterstitialCode], { type: 'application/javascript' });
      const blobUrl = URL.createObjectURL(blob);
      const script = document.createElement('script');
      script.src = blobUrl;
      script.setAttribute('data-mndintid', INTERSTITIAL_ZONE_ID);
      script.async = true;
      script.onload = () => {
        try {
          URL.revokeObjectURL(blobUrl);
          script.remove();
        } catch {}
      };
      document.body.appendChild(script);
    } else {
      // Fallback: regular script injection and trigger background prefetch
      const script = document.createElement('script');
      script.src = 'https://ss.mrmnd.com/interstitial.js';
      script.setAttribute('data-mndintid', INTERSTITIAL_ZONE_ID);
      script.async = true;
      document.body.appendChild(script);
      preloadInterstitialCode();
    }

    // 5. Ensure frequency capping is wiped again after impression so every click triggers instantly
    setTimeout(() => {
      try {
        delete (window as any)[INTERSTITIAL_WINDOW_KEY];
        localStorage.removeItem(INTERSTITIAL_STORAGE_KEY);
      } catch {}
    }, 1500);
  } catch (err) {
    console.warn('Mondiad Interstitial trigger error:', err);
  }
};

/**
 * Triggers Mondiad Popunder ad ONLY on download click.
 * Opens popunder directly via window.open during the user click event.
 * NEVER injects popunder script tags into document, guaranteeing posters are never affected.
 */
export const triggerMondiadPopunder = (): void => {
  if (typeof window === 'undefined') return;

  try {
    // 1. Wipe popunder frequency cap and internal guard flag
    delete (window as any)[POPUNDER_WINDOW_KEY];
    try {
      localStorage.removeItem(POPUNDER_STORAGE_KEY);
      sessionStorage.removeItem(POPUNDER_STORAGE_KEY);
    } catch {}

    // 2. Open popunder directly via window.open (allowed inside trusted user click event)
    try {
      const popWin = window.open(POPUNDER_DIRECT_URL, '_blank');
      if (popWin) {
        try {
          window.focus();
        } catch {}
      }
    } catch (e) {
      console.warn('Popunder window open error:', e);
    }

    // 3. Ensure frequency cap stays wiped for subsequent clicks
    setTimeout(() => {
      try {
        delete (window as any)[POPUNDER_WINDOW_KEY];
        localStorage.removeItem(POPUNDER_STORAGE_KEY);
      } catch {}
    }, 1000);
  } catch (err) {
    console.warn('Mondiad Popunder trigger error:', err);
  }
};
