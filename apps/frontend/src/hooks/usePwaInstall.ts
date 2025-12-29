import { usePwaInstallStore } from '@frontend/stores/usePwaInstallStore';
import { useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
	preventDefault: () => void;
}

export function usePWAInstall() {
  const { triggerInstallationFlow, dismissInstallationFlow } = usePwaInstallStore();

  useEffect(() => {

    // check if display is open in standalone mode, return early if so
    const isDisplayStandalone = window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as Navigator & {standalone: boolean}).standalone === true;
    
      if (isDisplayStandalone) {
      return;
    }

    // Detect platform and trigger installation flow if not Chromium
    const userAgent = window.navigator.userAgent || "";
    const isIOS = /iPad|iPhone|iPod|Macintosh|Safari/.test(userAgent);
    const isChromium = (window as Window & {chrome?: object} ).chrome !== undefined && !isIOS;

    if (!isChromium) {
      triggerInstallationFlow();
      return;
    }
    
    const handleBeforeInstallPrompt = (e: Event) => {
        triggerInstallationFlow(e as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
        dismissInstallationFlow();
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [triggerInstallationFlow, dismissInstallationFlow]);
}