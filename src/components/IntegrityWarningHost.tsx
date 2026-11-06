"use client";

import { useSyncExternalStore } from "react";
import { integrityWarningStore } from "@/lib/integrityWarningStore";

// Full-screen warning shown when the integrity monitor flags the candidate
// (switching tabs, minimizing, copying or pasting). Mounted once by the
// /test/[attemptId] layout.
export function IntegrityWarningHost() {
  const warning = useSyncExternalStore(
    integrityWarningStore.subscribe,
    integrityWarningStore.getSnapshot,
    integrityWarningStore.getServerSnapshot
  );
  if (!warning) return null;

  const remaining = warning.max - warning.violations;
  const isFinal = remaining <= 0;

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="integrity-warning-title"
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-4"
    >
      <div className="w-full max-w-md rounded-[20px] border-2 border-red-600 bg-white p-6 shadow-2xl anim-pop">
        <p className="text-xs font-bold uppercase tracking-wide text-red-600">
          Warning {warning.violations} of {warning.max}
        </p>
        <h2 id="integrity-warning-title" className="mt-1 text-xl font-bold text-gray-900">
          Use of AI tools is strictly prohibited
        </h2>
        <p className="mt-3 text-sm text-gray-700">
          We detected that you switched tabs, left full screen, minimized or left this window, or copied/pasted text
          during the assessment. Using AI tools, other websites or outside help is strictly prohibited.
        </p>
        <p className="mt-3 rounded-[15px] bg-red-50 p-3 text-sm font-semibold text-red-700">
          {isFinal
            ? "This was your FINAL warning. If it happens again, your test will be closed automatically and you will not be able to continue."
            : `You have ${remaining} warning${remaining === 1 ? "" : "s"} left. After that, your test will be closed automatically.`}
        </p>
        <button
          type="button"
          autoFocus
          onClick={() => {
            integrityWarningStore.dismiss();
            document.documentElement.requestFullscreen?.().catch(() => {});
          }}
          className="btn btn-danger mt-5 w-full"
        >
          I understand — return to the test
        </button>
      </div>
    </div>
  );
}
