interface RecoveryNoticeProps {
  onDiscardRecovery: () => void;
  onDownloadRecovery: () => void;
}

export function RecoveryNotice({ onDiscardRecovery, onDownloadRecovery }: RecoveryNoticeProps) {
  return (
    <section className="notice notice--warning recovery-notice">
      <p>A malformed custom-deck backup was preserved. Download it before discarding it.</p>
      <div className="button-row">
        <button
          className="button button--secondary button--small"
          type="button"
          onClick={onDownloadRecovery}
        >
          Download Recovery Backup
        </button>
        <button className="button button--ghost button--small" type="button" onClick={onDiscardRecovery}>
          Discard Backup
        </button>
      </div>
    </section>
  );
}
