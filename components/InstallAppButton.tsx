"use client";

import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

type InstallPromptWindow = Window & {
  __deferredInstallPrompt?: BeforeInstallPromptEvent;
};

/**
 * Renders an "Install" action for the home page. Uses the browser's native
 * install prompt when available, and shows manual instructions on iOS or
 * browsers that don't fire `beforeinstallprompt`.
 * Hidden entirely once the app runs standalone (already installed).
 */
export default function InstallAppButton() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  // Start hidden so SSR and hydration agree; reveal after checking display mode.
  const [installed, setInstalled] = useState(true);
  const [isIOS, setIsIOS] = useState(false);
  const [hint, setHint] = useState<string | null>(null);

  useEffect(() => {
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as Navigator & { standalone?: boolean }).standalone === true;

    setInstalled(standalone);
    setIsIOS(/iphone|ipad|ipod/i.test(window.navigator.userAgent));

    const promptWindow = window as InstallPromptWindow;
    if (promptWindow.__deferredInstallPrompt) {
      setDeferredPrompt(promptWindow.__deferredInstallPrompt);
    }

    const onBeforeInstall = (event: Event) => {
      event.preventDefault();
      setDeferredPrompt(event as BeforeInstallPromptEvent);
    };
    const onPromptReady = () => {
      if (promptWindow.__deferredInstallPrompt) {
        setDeferredPrompt(promptWindow.__deferredInstallPrompt);
      }
    };
    const onInstalled = () => {
      setInstalled(true);
      setDeferredPrompt(null);
      setHint(null);
      promptWindow.__deferredInstallPrompt = undefined;
    };

    window.addEventListener("beforeinstallprompt", onBeforeInstall);
    window.addEventListener("installpromptready", onPromptReady);
    window.addEventListener("appinstalled", onInstalled);
    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      window.removeEventListener("installpromptready", onPromptReady);
      window.removeEventListener("appinstalled", onInstalled);
    };
  }, []);

  useEffect(() => {
    if (!hint) return;
    const timer = setTimeout(() => setHint(null), 6000);
    return () => clearTimeout(timer);
  }, [hint]);

  if (installed) return null;

  const manualHint = isIOS
    ? "Tap Share, then “Add to Home Screen”."
    : "Open the browser menu and choose “Install app” or “Add to Home Screen”.";

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === "accepted") setInstalled(true);
      } catch {
        // Prompt unavailable (already used, or dismissed by the browser).
        setHint(manualHint);
      } finally {
        setDeferredPrompt(null);
        (window as InstallPromptWindow).__deferredInstallPrompt = undefined;
      }
      return;
    }

    setHint(manualHint);
  };

  return (
    <>
      <button
        type="button"
        onClick={handleInstall}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-ink-muted transition-colors duration-150 hover:bg-accent-soft hover:text-accent cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-canvas"
        aria-label="Install seduhmanual on this device"
        title="Install app"
      >
        <InstallIcon />
      </button>
      {hint && (
        <div
          role="status"
          className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-md rounded-2xl bg-ink px-4 py-3 text-center text-sm text-on-ink shadow-lg"
        >
          {hint}
        </div>
      )}
    </>
  );
}

function InstallIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      width="18"
      height="18"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      aria-hidden="true"
    >
      <path d="M12 3v11" strokeLinecap="round" />
      <path
        d="m7.5 9.5 4.5 4.5 4.5-4.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M5 19h14" strokeLinecap="round" />
    </svg>
  );
}
