// src/stores/useInstallStore.ts
import { create } from 'zustand';

type Platform = 'chromium' | 'ios' | 'other';

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
	preventDefault: () => void;
}

interface InstallState {
  deferredPrompt: BeforeInstallPromptEvent | null;
  userPlatform: Platform;
  isDisplayStandalone: boolean;
  showPwaInstallationPrompt: boolean;
  installationHasBeenDismissed: boolean;

  setDeferredPrompt: (event: BeforeInstallPromptEvent | null) => void;
  triggerInstall: () => Promise<void>;
  dismissPrompt: (permanent?: boolean) => void;
  resetDismissal: () => void;
  setShowPrompt: (show: boolean) => void;
}

const DISMISS_KEY = 'pwa_install_dismissed';
const DISMISS_DURATION_DAYS = 90;

export const usePwaInstallStore = create<InstallState>((set, get) => ({
  deferredPrompt: null,
  userPlatform: 'other',
  isDisplayStandalone: false,
  showPwaInstallationPrompt: false,
  installationHasBeenDismissed: false,

  setDeferredPrompt: (event) => {
    if (event) {
      event.preventDefault();
    }

    const isUserPlatformIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (navigator as any).standalone === true;

    const userPlatform: Platform = event ? 'chromium' : isUserPlatformIOS ? 'ios' : 'other';

    const dismissedTimestamp = localStorage.getItem(DISMISS_KEY);
    const installationHasBeenDismissed = dismissedTimestamp
      ? Date.now() - Number(dismissedTimestamp) < DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000
      : false;

    set({
      deferredPrompt: event,
      userPlatform,
      isDisplayStandalone,
      installationHasBeenDismissed,
      showPwaInstallationPrompt: !isDisplayStandalone && !installationHasBeenDismissed && !!event,
    });
  },

  triggerInstall: async () => {
    const { deferredPrompt } = get();
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    // if (window.analytics || (window as any).gtag) {
    //   (window as any).gtag?.('event', outcome === 'accepted' ? 'pwa_install_accepted' : 'pwa_install_declined', {
    //     event_category: 'pwa',
    //   });
    // }

    if (outcome === 'accepted') {
      get().resetDismissal();
    } else {
      get().dismissPrompt(true);
    }

    set({ deferredPrompt: null, showPwaInstallationPrompt: false });
  },

  dismissPrompt: (permanent = false) => {
    if (permanent) {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
      set({ installationHasBeenDismissed: true });
    }
    set({ showPwaInstallationPrompt: false });

    // Analytics
    // (window as any).gtag?.('event', 'pwa_prompt_dismissed', { event_category: 'pwa' });
  },

  resetDismissal: () => {
    localStorage.removeItem(DISMISS_KEY);
    set({ installationHasBeenDismissed: false });
  },

  setShowPrompt: (show) => set({ showPwaInstallationPrompt: show }),
}));