"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { BrewStep } from "@/lib/types";

interface BrewTimerProps {
  steps: BrewStep[];
  totalSeconds: number;
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

  const progress = elapsed / totalSeconds;
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - progress);

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-5">
      {/* Final alert */}
      {done && (
        <div className="bg-[#C4622D] text-white text-center py-3.5 rounded-2xl font-display font-bold text-lg tracking-wide">
          STOP — Angkat V60!
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
              stroke="#EDD9C8"
              strokeWidth="8"
              fill="none"
            />
            <circle
              cx="80"
              cy="80"
              r={radius}
              stroke="#C4622D"
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              style={{ transition: "stroke-dashoffset 0.8s ease-out" }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="font-display text-3xl font-bold text-[#1E0E08] tabular-nums">
              {formatTime(elapsed)}
            </span>
            <span className="text-xs text-[#A07060]">/ 2:30</span>
          </div>
        </div>
      </div>

      {/* Current step callout */}
      {currentStep && !done && (
        <div className="bg-[#FBF0E9] border border-[#EDD9C8] rounded-2xl px-4 py-3 text-center">
          <p className="text-xs text-[#A07060] uppercase tracking-wider mb-0.5">
            Now
          </p>
          <p className="font-display font-semibold text-[#1E0E08] text-lg">
            {currentStep.name}
          </p>
          <p className="text-[#C4622D] font-bold text-2xl tabular-nums">
            {currentStep.waterAmount}ml
          </p>
          <p className="text-xs text-[#A07060] mt-0.5">
            {currentStep.endSeconds - elapsed}s remaining
          </p>
        </div>
      )}

      {/* Steps list */}
      <div className="space-y-2">
        {steps.map((step, i) => {
          const isComplete = elapsed >= step.endSeconds;
          const isActive =
            elapsed >= step.startSeconds && elapsed < step.endSeconds;
          return (
            <div
              key={step.name}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl border transition-colors duration-200 ${
                isActive
                  ? "border-[#C4622D] bg-[#FBF0E9]"
                  : "border-[#D9CBC0] bg-white/60"
              } ${isComplete ? "opacity-50" : ""}`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                  isComplete || isActive
                    ? "bg-[#C4622D] text-white"
                    : "bg-[#EDD9C8] text-[#A07060]"
                }`}
              >
                {isComplete ? "✓" : i + 1}
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-sm font-semibold text-[#1E0E08]">
                  {step.name}
                </span>
                <span className="text-xs text-[#A07060] ml-2 tabular-nums">
                  {step.waterAmount}ml
                </span>
              </div>
              <span className="text-xs text-[#A07060] tabular-nums flex-shrink-0">
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
              ? "bg-[#EDD9C8] text-[#A07060] cursor-not-allowed"
              : running
                ? "bg-[#1E0E08] text-[#F8F3EC]"
                : "bg-[#C4622D] text-white hover:bg-[#B05525]"
          }`}
          aria-label={running ? "Pause timer" : "Start timer"}
        >
          {running ? "Pause" : elapsed === 0 ? "Start" : "Resume"}
        </button>
        <button
          onClick={reset}
          className="px-5 py-3.5 rounded-xl border border-[#D9CBC0] text-[#6B4B3E] text-sm font-semibold hover:bg-[#EDD9C8] transition-colors duration-150 cursor-pointer"
          aria-label="Reset timer"
        >
          Reset
        </button>
      </div>
    </div>
  );
}
