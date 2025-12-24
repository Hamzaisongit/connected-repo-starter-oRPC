// src/hooks/usePWAInstall.ts
import { useEffect } from 'react';
import { usePwaInstallStore } from '@frontend/stores/usePwaInstallStore';

interface BeforeInstallPromptEvent extends Event {
	prompt: () => Promise<void>;
	userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
	preventDefault: () => void;
}

export function usePWAInstall() {
  const { setDeferredPrompt, setShowPrompt } = usePwaInstallStore();

  useEffect(() => {

    window.addEventListener('beforeinstallprompt', (e: Event) => {
        setDeferredPrompt(e as BeforeInstallPromptEvent)
    });

    window.addEventListener('appinstalled', ()=>{
        // Analytics
        //(window as any).gtag?.('event', 'pwa_installed', { event_category: 'pwa' });
        usePwaInstallStore.getState().resetDismissal();
    });

    // check is display is open in standalone
    const isDisplayStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                         (navigator as any).standalone === true;
    if (isDisplayStandalone) {
      setShowPrompt(false);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', (e: Event) => {
        setDeferredPrompt(e as BeforeInstallPromptEvent)
        });
      window.removeEventListener('appinstalled', ()=>{
        // Analytics
        //(window as any).gtag?.('event', 'pwa_installed', { event_category: 'pwa' });
        usePwaInstallStore.getState().resetDismissal();
    });
    };
  }, [setDeferredPrompt, setShowPrompt]);
}