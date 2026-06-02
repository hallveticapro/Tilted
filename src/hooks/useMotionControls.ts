import { useCallback, useEffect, useRef, useState } from "react";
import type {
  MotionPermission,
  MotionStatus,
  OrientationSample,
  TiltAction,
} from "../types";

interface PermissionAwareEventConstructor {
  requestPermission?: () => Promise<PermissionState>;
}

interface UseMotionControlsOptions {
  enabled: boolean;
  reverseTilt: boolean;
  threshold?: number;
  cooldownMs?: number;
  gestureHoldMs?: number;
  gestureSampleCount?: number;
  smoothingFactor?: number;
  foreheadMovementThreshold?: number;
  publishSamples?: boolean;
}

function getOrientationConstructor(): PermissionAwareEventConstructor | undefined {
  return window.DeviceOrientationEvent as
    | (typeof DeviceOrientationEvent & PermissionAwareEventConstructor)
    | undefined;
}

function getMotionConstructor(): PermissionAwareEventConstructor | undefined {
  return window.DeviceMotionEvent as
    | (typeof DeviceMotionEvent & PermissionAwareEventConstructor)
    | undefined;
}

function degreesToRadians(value: number): number {
  return (value * Math.PI) / 180;
}

function radiansToDegrees(value: number): number {
  return (value * 180) / Math.PI;
}

export function normalizeTiltAxis(beta: number, gamma: number): number {
  const screenNormalZ =
    Math.cos(degreesToRadians(beta)) * Math.cos(degreesToRadians(gamma));

  // The screen face's elevation is stable even when the Euler angles flip near
  // the landscape forehead posture. Positive faces upward; negative faces down.
  return radiansToDegrees(Math.asin(Math.max(-1, Math.min(1, screenNormalZ))));
}

function averageSamples(samples: OrientationSample[]): OrientationSample {
  const total = samples.reduce(
    (accumulator, sample) => ({
      beta: accumulator.beta + sample.beta,
      gamma: accumulator.gamma + sample.gamma,
    }),
    { beta: 0, gamma: 0 },
  );
  const beta = total.beta / samples.length;
  const gamma = total.gamma / samples.length;

  return {
    beta,
    gamma,
    axisValue:
      samples.reduce((sum, sample) => sum + sample.axisValue, 0) / samples.length,
  };
}

function smoothTilt(previous: number | null, next: number, factor: number): number {
  return previous === null ? next : previous + (next - previous) * factor;
}

export function useMotionControls({
  enabled,
  reverseTilt,
  threshold = 40,
  cooldownMs = 1100,
  gestureHoldMs = 220,
  gestureSampleCount = 4,
  smoothingFactor = 0.2,
  foreheadMovementThreshold = 35,
  publishSamples = false,
}: UseMotionControlsOptions) {
  const supportsOrientation =
    typeof window !== "undefined" && "DeviceOrientationEvent" in window;
  const [permission, setPermission] = useState<MotionPermission>(
    supportsOrientation ? "idle" : "unavailable",
  );
  const [status, setStatus] = useState<MotionStatus>(
    enabled
      ? supportsOrientation
        ? "permission-needed"
        : "unavailable"
      : "off",
  );
  const [currentSample, setCurrentSample] = useState<OrientationSample | null>(null);
  const [baseline, setBaseline] = useState<OrientationSample | null>(null);
  const [foreheadMovementDetected, setForeheadMovementDetected] = useState(false);
  const [lastAction, setLastAction] = useState<TiltAction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const currentSampleRef = useRef<OrientationSample | null>(null);
  const baselineRef = useRef<OrientationSample | null>(null);
  const foreheadAnchorRef = useRef<OrientationSample | null>(null);
  const foreheadDetectionActiveRef = useRef(false);
  const calibratingRef = useRef(false);
  const calibrationSamplesRef = useRef<OrientationSample[]>([]);
  const filteredAxisRef = useRef<number | null>(null);
  const pendingGestureRef = useRef<{
    outcome: TiltAction["outcome"];
    startedAt: number;
    sampleCount: number;
  } | null>(null);
  const reverseTiltRef = useRef(reverseTilt);
  const actionIdRef = useRef(0);
  const lastTriggeredAtRef = useRef(Number.NEGATIVE_INFINITY);
  const armedRef = useRef(true);
  const lastPublishedSampleAtRef = useRef(Number.NEGATIVE_INFINITY);

  useEffect(() => {
    reverseTiltRef.current = reverseTilt;
  }, [reverseTilt]);

  useEffect(() => {
    if (!enabled) {
      setStatus("off");
      return;
    }

    if (!supportsOrientation) {
      setPermission("unavailable");
      setStatus("unavailable");
      setError("This browser does not expose device orientation data.");
      return;
    }

    if (permission === "idle") {
      setStatus("permission-needed");
    }
  }, [enabled, permission, supportsOrientation]);

  const resetCalibration = useCallback(() => {
    baselineRef.current = null;
    setBaseline(null);
    foreheadAnchorRef.current = null;
    foreheadDetectionActiveRef.current = false;
    setForeheadMovementDetected(false);
    calibratingRef.current = false;
    calibrationSamplesRef.current = [];
    filteredAxisRef.current = null;
    pendingGestureRef.current = null;
    armedRef.current = true;
  }, []);

  const resetActions = useCallback(() => {
    setLastAction(null);
    actionIdRef.current = 0;
    lastTriggeredAtRef.current = Number.NEGATIVE_INFINITY;
    pendingGestureRef.current = null;
    armedRef.current = true;
  }, []);

  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!enabled) {
      setStatus("off");
      return false;
    }

    const orientationConstructor = getOrientationConstructor();
    if (!orientationConstructor) {
      setPermission("unavailable");
      setStatus("unavailable");
      setError("Motion controls are unavailable in this browser.");
      return false;
    }

    setPermission("requesting");
    setError(null);

    try {
      // iOS exposes requestPermission only after a user gesture. Start every
      // available permission request synchronously from the setup button's tap;
      // awaiting one before starting the other can lose the browser activation.
      const motionConstructor = getMotionConstructor();
      const permissionRequests: Promise<PermissionState>[] = [];
      if (typeof orientationConstructor.requestPermission === "function") {
        permissionRequests.push(orientationConstructor.requestPermission());
      }
      if (typeof motionConstructor?.requestPermission === "function") {
        permissionRequests.push(motionConstructor.requestPermission());
      }

      const results = await Promise.all(permissionRequests);
      if (results.some((result) => result !== "granted")) {
        setPermission("denied");
        setStatus("denied");
        setError("Motion permission was denied. Touch controls still work.");
        return false;
      }

      setPermission("granted");
      setStatus("waiting-for-sample");
      return true;
    } catch {
      setPermission("error");
      setStatus("error");
      setError("Motion permission could not be requested. Touch controls still work.");
      return false;
    }
  }, [enabled]);

  const beginForeheadSetup = useCallback(() => {
    resetCalibration();
    foreheadAnchorRef.current = currentSampleRef.current;
    foreheadDetectionActiveRef.current = true;
    setStatus("waiting-for-forehead");
    setError(null);
  }, [resetCalibration]);

  const startCalibration = useCallback(() => {
    baselineRef.current = null;
    setBaseline(null);
    calibrationSamplesRef.current = [];
    calibratingRef.current = true;
    filteredAxisRef.current = null;
    pendingGestureRef.current = null;
    armedRef.current = true;
    setStatus("calibrating");
    setError(null);
  }, []);

  const finishCalibration = useCallback((): boolean => {
    calibratingRef.current = false;
    const samples = calibrationSamplesRef.current;
    const fallbackSample = currentSampleRef.current;
    if (samples.length === 0 && !fallbackSample) {
      setStatus("waiting-for-sample");
      setError("No tilt sample arrived. Continue with touch controls or try motion again.");
      return false;
    }

    const calibratedBaseline =
      samples.length > 0 ? averageSamples(samples) : (fallbackSample as OrientationSample);
    baselineRef.current = calibratedBaseline;
    setBaseline(calibratedBaseline);
    calibrationSamplesRef.current = [];
    filteredAxisRef.current = calibratedBaseline.axisValue;
    pendingGestureRef.current = null;
    armedRef.current = true;
    setStatus("calibrated");
    setError(null);
    return true;
  }, []);

  useEffect(() => {
    if (!enabled || permission !== "granted") {
      return;
    }

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.beta === null || event.gamma === null) {
        return;
      }

      const rawSample: OrientationSample = {
        beta: event.beta,
        gamma: event.gamma,
        axisValue: normalizeTiltAxis(event.beta, event.gamma),
      };
      const sample: OrientationSample = {
        ...rawSample,
        axisValue: smoothTilt(
          filteredAxisRef.current,
          rawSample.axisValue,
          smoothingFactor,
        ),
      };
      filteredAxisRef.current = sample.axisValue;
      currentSampleRef.current = sample;
      const now = Date.now();
      if (publishSamples && now - lastPublishedSampleAtRef.current >= 120) {
        lastPublishedSampleAtRef.current = now;
        setCurrentSample(sample);
      }

      if (foreheadDetectionActiveRef.current) {
        const anchor = foreheadAnchorRef.current;
        if (!anchor) {
          foreheadAnchorRef.current = sample;
          return;
        }

        const movement = Math.max(
          Math.abs(sample.beta - anchor.beta),
          Math.abs(sample.gamma - anchor.gamma),
          Math.abs(sample.axisValue - anchor.axisValue),
        );
        if (movement >= foreheadMovementThreshold) {
          foreheadDetectionActiveRef.current = false;
          setForeheadMovementDetected(true);
          setStatus("ready");
        }
        return;
      }

      if (calibratingRef.current) {
        calibrationSamplesRef.current.push(rawSample);
        if (calibrationSamplesRef.current.length > 180) {
          calibrationSamplesRef.current.shift();
        }
        return;
      }

      const calibratedBaseline = baselineRef.current;
      if (!calibratedBaseline) {
        setStatus("ready");
        return;
      }

      const delta = sample.axisValue - calibratedBaseline.axisValue;
      if (Math.abs(delta) <= Math.max(10, threshold * 0.3)) {
        armedRef.current = true;
        pendingGestureRef.current = null;
        return;
      }

      if (
        !armedRef.current ||
        now - lastTriggeredAtRef.current < cooldownMs ||
        Math.abs(delta) < threshold
      ) {
        pendingGestureRef.current = null;
        return;
      }

      const isDownTilt = delta < 0;
      const outcome: TiltAction["outcome"] = reverseTiltRef.current
        ? isDownTilt
          ? "pass"
          : "correct"
        : isDownTilt
          ? "correct"
          : "pass";
      const pendingGesture = pendingGestureRef.current;
      if (!pendingGesture || pendingGesture.outcome !== outcome) {
        pendingGestureRef.current = { outcome, startedAt: now, sampleCount: 1 };
        return;
      }
      pendingGesture.sampleCount += 1;

      if (
        now - pendingGesture.startedAt < gestureHoldMs ||
        pendingGesture.sampleCount < gestureSampleCount
      ) {
        return;
      }

      actionIdRef.current += 1;
      lastTriggeredAtRef.current = now;
      armedRef.current = false;
      pendingGestureRef.current = null;
      setLastAction({
        id: actionIdRef.current,
        outcome,
      });
    };

    window.addEventListener("deviceorientation", handleOrientation);
    return () => window.removeEventListener("deviceorientation", handleOrientation);
  }, [
    cooldownMs,
    enabled,
    foreheadMovementThreshold,
    gestureHoldMs,
    gestureSampleCount,
    permission,
    publishSamples,
    smoothingFactor,
    threshold,
  ]);

  return {
    permission,
    status,
    currentSample,
    baseline,
    foreheadMovementDetected,
    lastAction,
    error,
    requestPermission,
    beginForeheadSetup,
    startCalibration,
    finishCalibration,
    resetCalibration,
    resetActions,
  };
}
