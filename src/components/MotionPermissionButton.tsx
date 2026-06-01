import type { MotionStatus } from "../types";

interface MotionPermissionButtonProps {
  status: MotionStatus;
  onEnable: () => void;
}

export function MotionPermissionButton({
  status,
  onEnable,
}: MotionPermissionButtonProps) {
  const label =
    status === "denied" || status === "error" || status === "unavailable"
      ? "Try Motion Again"
      : status === "permission-needed"
        ? "Enable Motion & Calibrate"
        : "Recalibrate Motion";

  return (
    <button className="button button--primary" type="button" onClick={onEnable}>
      {label}
    </button>
  );
}
