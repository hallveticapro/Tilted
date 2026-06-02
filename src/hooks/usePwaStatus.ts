import { useEffect, useState } from "react";

interface InstallPromptEvent extends Event {
  prompt: () => Promise<void>;
}

export function usePwaStatus() {
  const [online, setOnline] = useState(() => navigator.onLine);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [updateWorker, setUpdateWorker] = useState<ServiceWorker | null>(null);
  const [showIosInstallHint, setShowIosInstallHint] = useState(
    () =>
      /iPad|iPhone|iPod/.test(navigator.userAgent) &&
      (typeof window.matchMedia !== "function" ||
        !window.matchMedia("(display-mode: standalone)").matches),
  );

  useEffect(() => {
    const onOnline = () => setOnline(true);
    const onOffline = () => setOnline(false);
    const onInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    };
    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);
    window.addEventListener("beforeinstallprompt", onInstallPrompt);
    return () => {
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
      window.removeEventListener("beforeinstallprompt", onInstallPrompt);
    };
  }, []);

  useEffect(() => {
    if (!("serviceWorker" in navigator) || !import.meta.env.PROD) {
      return;
    }
    let reloading = false;
    const reloadOnControllerChange = () => {
      if (!reloading) {
        reloading = true;
        window.location.reload();
      }
    };
    navigator.serviceWorker.addEventListener("controllerchange", reloadOnControllerChange);
    void navigator.serviceWorker.register("./sw.js").then((registration) => {
      const watch = (worker: ServiceWorker | null) => {
        if (!worker) {
          return;
        }
        worker.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) {
            setUpdateWorker(registration.waiting ?? worker);
          }
        });
      };
      if (registration.waiting) {
        setUpdateWorker(registration.waiting);
      }
      watch(registration.installing);
      registration.addEventListener("updatefound", () => watch(registration.installing));
    }).catch(() => undefined);
    return () =>
      navigator.serviceWorker.removeEventListener("controllerchange", reloadOnControllerChange);
  }, []);

  const install = async () => {
    await installPrompt?.prompt();
    setInstallPrompt(null);
  };
  const update = () => updateWorker?.postMessage({ type: "SKIP_WAITING" });

  return {
    online,
    canInstall: installPrompt !== null,
    updateReady: updateWorker !== null,
    showIosInstallHint,
    install,
    update,
    dismissIosInstallHint: () => setShowIosInstallHint(false),
  };
}
