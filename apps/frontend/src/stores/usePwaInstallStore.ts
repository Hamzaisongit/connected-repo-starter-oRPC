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
    set({
      showPwaInstallationPrompt: true,
      deferredInstallationPrompt: deferredPrompt ?? null,
    });
  },

  dismissInstallationFlow: (permanent?: boolean)=>{

    set({
      showPwaInstallationPrompt: false,
      deferredInstallationPrompt: null,
    });

    if (permanent) {
      const now = Date.now();
      try {
        localStorage.setItem(DISMISS_KEY, now.toString());
      } catch { /* storage errors are non-fatal */ }
    }
  }
  
}));