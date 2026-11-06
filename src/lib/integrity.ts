// Warnings a candidate gets before the test is terminated: violations 1..3
// each show a warning; the next one (the 4th) ends the attempt.
export const MAX_WARNINGS = 3;

// Leaving a tab fires several browser events at once (visibilitychange +
// blur). Events closer together than this count as one incident.
export const VIOLATION_CLUSTER_MS = 5000;

// Signals that count toward the 3-warning limit. The rest are logged for the
// admin report (and feed the integrity risk score) but never terminate a test
// by themselves, because browsers can raise them by accident (a right-click,
// a docked sidebar that looks like dev-tools, a password manager's autofill).
export const COUNTS_TOWARD_WARNINGS = new Set([
  "TAB_HIDDEN",
  "WINDOW_BLUR",
  "COPY",
  "CUT",
  "PASTE",
  "FULLSCREEN_EXIT",
]);

// Weight of each signal in the admin-facing integrity risk score.
export const INTEGRITY_WEIGHTS: Record<string, number> = {
  TAB_HIDDEN: 12,
  WINDOW_BLUR: 8,
  COPY: 15,
  CUT: 10,
  PASTE: 20,
  FULLSCREEN_EXIT: 12,
  CONTEXT_MENU: 2,
  BLOCKED_SHORTCUT: 4,
  DEVTOOLS: 10,
  BULK_INPUT: 15,
};

export type IntegrityResult =
  | { status: "ignored" }
  | { status: "logged"; violations: number } // logged only / same incident as the previous warning
  | { status: "warned"; violations: number; max: number }
  | { status: "terminated" };
