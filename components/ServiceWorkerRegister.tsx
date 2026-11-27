"use client";

import { useEffect } from "react";

/**
 * Registers the installability service worker in production only.
 * Dev is skipped so a stale worker can't interfere with hot reload.
 */
export default function ServiceWorkerRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Registration is optional; the app works without it.
    });
  }, []);

  return null;
}
