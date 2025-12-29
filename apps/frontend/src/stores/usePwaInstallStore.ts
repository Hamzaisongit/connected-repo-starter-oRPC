import { create } from 'zustand';

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
	preventDefault: () => void;
}

interface InstallState {
  showPwaInstallationPrompt: boolean;
  deferredInstallationPrompt: BeforeInstallPromptEvent | null;
  triggerInstallationFlow: (deferredPrompt?: BeforeInstallPromptEvent)=> void;
  dismissInstallationFlow: (permanant?: boolean)=> void;
}

const DISMISS_KEY = 'pwa_install_dismissed';

export const usePwaInstallStore = create<InstallState>((set) => ({

  showPwaInstallationPrompt: false,
  deferredInstallationPrompt: null,

  triggerInstallationFlow: (deferredPrompt?: BeforeInstallPromptEvent)=>{

    // Check if installation has been dismissed in the last 2 days
    const DISMISS_DURATION_DAYS = 2;
    const dismissedTimestamp = localStorage.getItem("pwa_install_dismissed");

    if (dismissedTimestamp) {
        const now = Date.now();
        const dismissedAt = Number(dismissedTimestamp);
        const durationMs = DISMISS_DURATION_DAYS * 24 * 60 * 60 * 1000;
        if (now - dismissedAt < durationMs) {
            return;
        }
    }

    set({
      showPwaInstallationPrompt: true,
      deferredInstallationPrompt: deferredPrompt ?? null,
    });

  },

  dismissInstallationFlow: ()=>{

    set({
      showPwaInstallationPrompt: false,
      deferredInstallationPrompt: null,
    });

    try {
      localStorage.setItem(DISMISS_KEY, Date.now().toString());
    } catch { /* storage errors are non-fatal */ }
    
  }
  
}));