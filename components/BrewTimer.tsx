"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { BrewStep } from "@/lib/types";

interface BrewTimerProps {
  steps: BrewStep[];
  totalSeconds: number;
}

// One color per brew phase, defined per theme in globals.css.
const PHASE_COUNT = 8;

function phaseColor(index: number): string {
  return `var(--phase-${(index % PHASE_COUNT) + 1})`;
}

function playBeep(ctx: AudioContext, freq = 880, duration = 0.15) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sine";
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.3, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + duration);
}

export default function BrewTimer({ steps, totalSeconds }: BrewTimerProps) {
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const lastStepRef = useRef<number>(-1);
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);
  const [wakeLockActive, setWakeLockActive] = useState(false);

  const tryBeep = useCallback((freq = 880, dur = 0.15) => {
    if (!audioCtxRef.current) return;
    try {
      playBeep(audioCtxRef.current, freq, dur);
    } catch {
      // audio errors are non-fatal
    }
  }, []);

  // Tick
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= totalSeconds) {
          setRunning(false);
          setDone(true);
          return totalSeconds;
        }
        return next;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [running, totalSeconds]);

  // Step-change beeps
  useEffect(() => {
    const stepIdx = steps.findIndex(
      (s) => elapsed >= s.startSeconds && elapsed < s.endSeconds
    );

    if (stepIdx !== -1 && stepIdx !== lastStepRef.current && elapsed > 0) {
      lastStepRef.current = stepIdx;
      tryBeep(880, 0.15);
    }

    if (elapsed >= totalSeconds && lastStepRef.current !== steps.length) {
      lastStepRef.current = steps.length;
      // Triple ascending beep for "done"
      tryBeep(660, 0.2);
      setTimeout(() => tryBeep(780, 0.2), 320);
      setTimeout(() => tryBeep(1040, 0.35), 640);
    }
  }, [elapsed, steps, totalSeconds, tryBeep]);

  // Keep the screen awake while the timer is running (Screen Wake Lock API).
  useEffect(() => {
    if (typeof navigator === "undefined" || !("wakeLock" in navigator)) return;

    let cancelled = false;

    const acquire = async () => {
      if (wakeLockRef.current && !wakeLockRef.current.released) return;
      try {
        const sentinel = await navigator.wakeLock.request("screen");
        if (cancelled) {
          sentinel.release().catch(() => {});
          return;
        }
        wakeLockRef.current = sentinel;
        setWakeLockActive(true);
        sentinel.addEventListener("release", () => {
          if (wakeLockRef.current === sentinel) {
            wakeLockRef.current = null;
            setWakeLockActive(false);
          }
        });
      } catch {
        // Unsupported or denied — the timer still works normally.
      }
    };

    const release = () => {
      const sentinel = wakeLockRef.current;
      wakeLockRef.current = null;
      setWakeLockActive(false);
      sentinel?.release().catch(() => {});
    };

    const onVisibilityChange = () => {
      // Browsers release wake locks when the tab is hidden; re-acquire on return.
      if (document.visibilityState === "visible" && running) acquire();
    };

    if (running) {
      acquire();
    } else {
      release();
    }

    document.addEventListener("visibilitychange", onVisibilityChange);
    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibilityChange);
      const sentinel = wakeLockRef.current;
      wakeLockRef.current = null;
      sentinel?.release().catch(() => {});
    };
  }, [running]);

  const toggle = () => {
    if (done) return;
    if (!audioCtxRef.current) {
      try {
        audioCtxRef.current = new AudioContext();
      } catch {
        // proceed silently without audio
      }
    }
    if (audioCtxRef.current?.state === "suspended") {
      audioCtxRef.current.resume().catch(() => {});
    }
    setRunning((r) => !r);
  };

  const reset = () => {
    setRunning(false);
    setDone(false);
    setElapsed(0);
    lastStepRef.current = -1;
  };

  const currentStepIdx = steps.findIndex(
    (s) => elapsed >= s.startSeconds && elapsed < s.endSeconds
  );
  const currentStep = steps[currentStepIdx];

  // Cumulative target after each step, so the UI can say "pour until X ml total".
  const waterBefore: number[] = [];
  let runningWater = 0;
  for (const step of steps) {
    waterBefore.push(runningWater);
    runningWater += step.waterAmount;
  }

  const currentStartTotal = currentStep ? waterBefore[currentStepIdx] : 0;
  const currentEndTotal = currentStep
    ? currentStartTotal + currentStep.waterAmount
    : 0;
  const nextStep = currentStepIdx >= 0 ? steps[currentStepIdx + 1] : undefined;
  const nextEndTotal = nextStep ? currentEndTotal + nextStep.waterAmount : 0;

  const radius = 68;
  const circumference = 2 * Math.PI * radius;

  // Split the ring into one arc per brew phase, sized by that phase's duration.
  const ringTotal =
    steps.reduce(
      (acc, step) => acc + (step.endSeconds - step.startSeconds),
      0
    ) ||
    totalSeconds ||
    1;
  const RING_GAP = 3;
  let ringCursor = 0;
  const ringSegments = steps.map((step, index) => {
    const duration = step.endSeconds - step.startSeconds;
    const length = (duration / ringTotal) * circumference;
    const start = ringCursor;
    ringCursor += length;

    const elapsedInStep = Math.min(
      Math.max(elapsed - step.startSeconds, 0),
      duration
    );
    const filled = duration > 0 ? (elapsedInStep / duration) * length : 0;

    return {
      index,
      start,
      length,
      filled,
      color: phaseColor(index),
    };
  });

  const currentPhaseColor =
    currentStepIdx >= 0
      ? phaseColor(currentStepIdx)
      : steps.length > 0
        ? phaseColor(steps.length - 1)
        : "var(--accent)";

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-5">
      {/* Final alert */}
      {done && (
        <div className="bg-accent text-on-accent text-center py-3.5 rounded-2xl font-display font-bold text-lg tracking-wide">
          STOP — Remove the V60!
        </div>
      )}

      {/* Circular progress */}
      <div className="flex justify-center">
        <div className="relative w-44 h-44">
          <svg
            viewBox="0 0 160 160"
            className="w-full h-full -rotate-90"
            aria-hidden="true"
          >
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="var(--line-soft)"
              strokeWidth="8"
              fill="none"
            />
            {ringSegments.map(({ index, start, length, filled, color }) => {
              const segmentDash = Math.max(1, length - RING_GAP);
              const fillDash = Math.min(filled, segmentDash);
              return (
                <g key={`phase-${index}`}>
                  <circle
                    cx="80"
                    cy="80"
                    r={radius}
                    stroke={color}
                    strokeWidth="8"
                    fill="none"
                    strokeLinecap="butt"
                    strokeDasharray={`${segmentDash} ${circumference - segmentDash}`}
                    strokeDashoffset={-start}
                    opacity="0.25"
                  />
                  {fillDash > 0 && (
                    <circle
                      cx="80"
                      cy="80"
                      r={radius}
                      stroke={color}
                      strokeWidth="8"
                      fill="none"
                      strokeLinecap="butt"
                      strokeDasharray={`${fillDash} ${circumference - fillDash}`}
                      strokeDashoffset={-start}
                    />
                  )}
                </g>
              );
            })}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-bold text-ink tabular-nums">
              {formatTime(elapsed)}
            </span>
            <span className="text-xs text-ink-subtle">/ {formatTime(totalSeconds)}</span>
          </div>
        </div>
      </div>

      {/* Current step callout */}
      {currentStep && !done && (
        <div className="bg-accent-soft border border-line-soft rounded-2xl px-4 py-3 text-center">
          <p className="text-xs text-ink-subtle uppercase tracking-wider mb-0.5">
            Now
          </p>
          <p className="font-display font-semibold text-ink text-lg">
            {currentStep.name}
          </p>
          <p
            className="font-bold text-2xl tabular-nums"
            style={{ color: currentPhaseColor }}
          >
            {currentStep.waterAmount}ml
          </p>
          {currentStep.waterAmount > 0 ? (
            <p className="text-xs text-ink-muted mt-0.5 tabular-nums">
              Pour until <span className="font-semibold">{currentEndTotal}ml</span> total
              <span className="text-ink-subtle">
                {" "}
                ({currentStartTotal}ml → {currentEndTotal}ml)
              </span>
            </p>
          ) : (
            currentStep.description && (
              <p className="text-xs text-ink-muted mt-0.5">{currentStep.description}</p>
            )
          )}
          <p className="text-xs text-ink-subtle mt-0.5">
            {currentStep.endSeconds - elapsed}s remaining
          </p>
          {nextStep && (
            <p className="text-xs text-ink-subtle mt-2 pt-2 border-t border-line-soft">
              Next:{" "}
              <span className="font-medium text-ink-muted">{nextStep.name}</span> in{" "}
              {nextStep.startSeconds - elapsed}s
              {nextStep.waterAmount > 0 && (
                <>
                  {" "}
                  — pour to{" "}
                  <span className="font-medium text-ink-muted">{nextEndTotal}ml</span> total
                </>
              )}
            </p>
          )}
        </div>
      )}

      {/* Steps list */}
      <div className="space-y-2">
        {steps.map((step, i) => {
          const isComplete = elapsed >= step.endSeconds;
          const isActive =
            elapsed >= step.startSeconds && elapsed < step.endSeconds;
          const cumulative = waterBefore[i] + step.waterAmount;
          const color = ringSegments[i]?.color ?? phaseColor(i);
          return (
            <div
              key={`${step.name}-${i}`}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors duration-200 ${
                isActive ? "bg-accent-soft" : "border-line bg-surface/60"
              } ${isComplete ? "opacity-50" : ""}`}
              style={isActive ? { borderColor: color } : undefined}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isComplete || isActive ? "text-on-accent" : "text-ink-muted"
                }`}
                style={{
                  backgroundColor:
                    isComplete || isActive
                      ? color
                      : `color-mix(in srgb, ${color} 20%, transparent)`,
                }}
              >
                {isComplete ? "✓" : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-ink">
                  {step.name}
                </span>
                <span className="text-xs text-ink-subtle ml-2 tabular-nums">
                  {step.waterAmount}ml
                  {step.waterAmount > 0 && (
                    <span className="text-ink-muted"> → {cumulative}ml</span>
                  )}
                </span>
              </div>
              <span className="text-xs text-ink-subtle tabular-nums flex-shrink-0">
                {step.startSeconds}–{step.endSeconds}s
              </span>
            </div>
          );
        })}
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={toggle}
          disabled={done}
          className={`flex-1 py-3.5 rounded-xl font-semibold text-sm transition-colors duration-150 cursor-pointer ${
            done
              ? "bg-line-soft text-ink-subtle cursor-not-allowed"
              : running
                ? "bg-ink text-on-ink"
                : "bg-accent text-on-accent hover:bg-accent-strong"
          }`}
          aria-label={running ? "Pause timer" : "Start timer"}
        >
          {running ? "Pause" : elapsed === 0 ? "Start" : "Resume"}
        </button>
        <button
          onClick={reset}
          className="px-5 py-3.5 rounded-xl border border-line text-ink-muted text-sm font-semibold hover:bg-line-soft transition-colors duration-150 cursor-pointer"
          aria-label="Reset timer"
        >
          Reset
        </button>
      </div>

      {running && wakeLockActive && (
        <p className="text-center text-[10px] text-ink-subtle">
          Screen stays awake while brewing.
        </p>
      )}
    </div>
  );
}
