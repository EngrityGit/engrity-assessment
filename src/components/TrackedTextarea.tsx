"use client";

import { useRef } from "react";

export interface TypingStats {
  keystrokes: number;
  chars: number;
  pasteBlocked: number;
  activeMs: number;
}

// Textarea that measures *how* text was produced (not what it says):
// real keystrokes vs. final length, and active typing time. Pasted or
// dictated text shows up as characters with no matching keystrokes. The
// ratio is passed to the AI grader and shown to admins as an authenticity
// signal. Telemetry never blocks the candidate.
export default function TrackedTextarea({
  value,
  onChange,
  onStats,
  ...rest
}: {
  value: string;
  onChange: (v: string) => void;
  onStats: (s: TypingStats) => void;
} & Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "onChange">) {
  const stats = useRef({ keystrokes: 0, pasteBlocked: 0, activeMs: 0, last: 0 });

  function emit(chars: number) {
    const s = stats.current;
    onStats({ keystrokes: s.keystrokes, chars, pasteBlocked: s.pasteBlocked, activeMs: s.activeMs });
  }

  return (
    <textarea
      {...rest}
      value={value}
      autoComplete="off"
      autoCorrect="off"
      spellCheck={false}
      data-gramm="false"
      onKeyDown={(e) => {
        if (e.key.length === 1 || e.key === "Backspace" || e.key === "Delete" || e.key === "Enter") {
          const s = stats.current;
          const now = Date.now();
          if (s.last && now - s.last < 5000) s.activeMs += now - s.last;
          s.last = now;
          s.keystrokes += 1;
        }
      }}
      onPaste={() => {
        stats.current.pasteBlocked += 1;
      }}
      onChange={(e) => {
        onChange(e.target.value);
        emit(e.target.value.length);
      }}
    />
  );
}
