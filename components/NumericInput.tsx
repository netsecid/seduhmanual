"use client";

import { useEffect, useRef, useState } from "react";

interface NumericInputProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  className?: string;
  placeholder?: string;
  ariaLabel?: string;
}

/**
 * Numeric input with a local text buffer, so clearing the field doesn't snap
 * back to "0" (or force the next digit to append to an existing zero).
 * Only parseable values are committed; the buffer resyncs on blur.
 */
export default function NumericInput({
  value,
  onChange,
  min,
  max,
  className,
  placeholder,
  ariaLabel,
}: NumericInputProps) {
  const [text, setText] = useState(String(value));
  const editingRef = useRef(false);

  useEffect(() => {
    if (!editingRef.current) setText(String(value));
  }, [value]);

  const handleChange = (raw: string) => {
    setText(raw);
    if (raw.trim() === "") return;

    const parsed = Number(raw);
    if (Number.isNaN(parsed)) return;

    const clamped = Math.min(
      max ?? Number.POSITIVE_INFINITY,
      Math.max(min ?? Number.NEGATIVE_INFINITY, parsed)
    );
    if (clamped !== value) onChange(clamped);
  };

  return (
    <input
      type="number"
      inputMode="decimal"
      value={text}
      min={min}
      max={max}
      placeholder={placeholder}
      aria-label={ariaLabel}
      onFocus={() => {
        editingRef.current = true;
      }}
      onBlur={() => {
        editingRef.current = false;
        setText(String(value));
      }}
      onChange={(e) => handleChange(e.target.value)}
      className={className}
    />
  );
}
