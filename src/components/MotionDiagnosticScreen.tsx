import { useEffect, useState } from "react";
import type { MotionPermission, MotionStatus, OrientationSample, TiltAction } from "../types";
import { ScreenLayout } from "./ScreenLayout";

interface MotionDiagnosticScreenProps {
  permission: MotionPermission;
  status: MotionStatus;
  sample: OrientationSample | null;
  baseline: OrientationSample | null;
  action: TiltAction | null;
  error: string | null;
  onEnable: () => Promise<boolean>;
  onStartCalibration: () => void;
  onFinishCalibration: () => boolean;
  onReset: () => void;
  onBack: () => void;
}

export function MotionDiagnosticScreen({
  permission,
  status,
  sample,
  baseline,
  action,
  error,
  onEnable,
  onStartCalibration,
  onFinishCalibration,
  onReset,
  onBack,
}: MotionDiagnosticScreenProps) {
  const [calibrating, setCalibrating] = useState(false);

  useEffect(() => {
    if (!calibrating) {
      return;
    }
    const timeout = window.setTimeout(() => {
      onFinishCalibration();
      setCalibrating(false);
    }, 1500);
    return () => window.clearTimeout(timeout);
  }, [calibrating, onFinishCalibration]);

  const calibrate = () => {
    onStartCalibration();
    setCalibrating(true);
  };

  return (
    <ScreenLayout title="Test Motion" eyebrow="Device diagnostics" compact actions={<button className="button button--ghost" type="button" onClick={onBack}>Done</button>}>
      <section className="panel stack">
        <p className="muted setup-note">Hold the phone sideways as you would during a round. Enable motion, calibrate at neutral, then tilt deliberately down and up.</p>
        <dl className="diagnostic-grid">
          <div><dt>Permission</dt><dd>{permission}</dd></div>
          <div><dt>Status</dt><dd>{calibrating ? "calibrating" : status}</dd></div>
          <div><dt>Current angle</dt><dd>{sample ? `${sample.axisValue.toFixed(1)}°` : "Waiting for sample"}</dd></div>
          <div><dt>Neutral angle</dt><dd>{baseline ? `${baseline.axisValue.toFixed(1)}°` : "Not calibrated"}</dd></div>
          <div><dt>Last gesture</dt><dd>{action?.outcome ?? "None yet"}</dd></div>
        </dl>
        {error && <p className="notice notice--warning">{error}</p>}
        <div className="button-row">
          {permission !== "granted" && <button className="button button--primary" type="button" onClick={() => void onEnable()}>Enable Motion</button>}
          {permission === "granted" && <button className="button button--primary" type="button" disabled={calibrating} onClick={calibrate}>{calibrating ? "Hold steady..." : "Calibrate Neutral"}</button>}
          <button className="button button--secondary" type="button" onClick={onReset}>Reset</button>
        </div>
      </section>
    </ScreenLayout>
  );
}
