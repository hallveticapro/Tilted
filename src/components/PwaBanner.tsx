interface PwaBannerProps {
  online: boolean;
  canInstall: boolean;
  updateReady: boolean;
  showIosInstallHint: boolean;
  onInstall: () => void;
  onUpdate: () => void;
  onDismissIosInstallHint: () => void;
  storageAvailable: boolean;
}

export function PwaBanner({ online, canInstall, updateReady, showIosInstallHint, onInstall, onUpdate, onDismissIosInstallHint, storageAvailable }: PwaBannerProps) {
  if (!storageAvailable) {
    return <aside className="pwa-banner" role="status">Browser storage is unavailable. Custom decks and history will not survive a refresh.</aside>;
  }
  if (!online) {
    return <aside className="pwa-banner" role="status">Offline mode: built-in decks remain available.</aside>;
  }
  if (updateReady) {
    return <aside className="pwa-banner" role="status">A new Tilted version is ready.<button type="button" onClick={onUpdate}>Reload update</button></aside>;
  }
  if (canInstall) {
    return <aside className="pwa-banner" role="status">Install Tilted for quicker classroom access.<button type="button" onClick={onInstall}>Install app</button></aside>;
  }
  if (showIosInstallHint) {
    return <aside className="pwa-banner" role="status">On iPhone or iPad, tap Share, then Add to Home Screen to install Tilted.<button type="button" onClick={onDismissIosInstallHint}>Dismiss</button></aside>;
  }
  return null;
}
