"use client";

import { useEffect, useRef } from "react";
import { recordIntegrityEvent } from "@/app/actions/integrity";
import { integrityWarningStore } from "@/lib/integrityWarningStore";
import type { IntegrityEventType } from "@/generated/prisma/client";

const THROTTLE_MS = 3000;
const BULK_INPUT_CHARS = 14; // more than this appearing in one input event = paste/dictation/auto-fill

// Attaches for the lifetime of a round page. A browser can only observe a
// subset of cheating signals — tab visibility, window focus, clipboard,
// full-screen state, shortcuts, right-click, a docked dev-tools panel and
// text that appears faster than anyone can type. It cannot see other
// devices or other applications; no web page can. These controls raise the
// effort and risk of cheating and give admins evidence, not a guarantee.
export function useIntegrityMonitor(attemptId: string, active: boolean) {
  const lastFired = useRef<Partial<Record<IntegrityEventType, number>>>({});

  useEffect(() => {
    if (!active) return;

    function fire(type: IntegrityEventType) {
      const now = Date.now();
      const last = lastFired.current[type] ?? 0;
      if (now - last < THROTTLE_MS) return;
      lastFired.current[type] = now;
      recordIntegrityEvent(attemptId, type)
        .then((result) => {
          if (result.status === "terminated") {
            if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
            window.location.assign(`/test/${attemptId}/disqualified`);
          } else if (result.status === "warned") {
            integrityWarningStore.show({ violations: result.violations, max: result.max });
          }
        })
        .catch(() => {});
    }

    const onVisibility = () => document.hidden && fire("TAB_HIDDEN");
    const onBlur = () => fire("WINDOW_BLUR");
    const onCopy = (e: Event) => { e.preventDefault(); fire("COPY"); };
    const onCut = (e: Event) => { e.preventDefault(); fire("CUT"); };
    const onPaste = (e: Event) => { e.preventDefault(); fire("PASTE"); };
    const onContext = (e: Event) => { e.preventDefault(); fire("CONTEXT_MENU"); };
    const onDrag = (e: Event) => e.preventDefault();

    let wasFullscreen = Boolean(document.fullscreenElement);
    const onFullscreen = () => {
      const now = Boolean(document.fullscreenElement);
      if (wasFullscreen && !now) fire("FULLSCREEN_EXIT");
      wasFullscreen = now;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.ctrlKey || e.metaKey;
      const k = e.key.toLowerCase();
      const blocked =
        e.key === "F12" ||
        e.key === "PrintScreen" ||
        (mod && ["c", "v", "x", "a", "p", "s", "u", "f", "g", "o"].includes(k)) ||
        (mod && e.shiftKey && ["i", "j", "c", "k", "s"].includes(k)) ||
        (e.metaKey && e.shiftKey && ["3", "4", "5"].includes(k)) ||
        (e.altKey && k === "tab");
      if (!blocked) return;
      // Plain Ctrl/Cmd+C/X/V are already covered by the clipboard handlers.
      e.preventDefault();
      if (e.key === "PrintScreen") {
        try { navigator.clipboard.writeText(""); } catch {}
      }
      if (!(mod && ["c", "x", "v"].includes(k))) fire("BLOCKED_SHORTCUT");
    };

    // Text arriving in one chunk (paste via menu, drag-drop, dictation,
    // expanders, phone-keyboard clipboard) rather than being typed.
    const onBeforeInput = (e: InputEvent) => {
      const t = e.inputType;
      if (t === "insertFromPaste" || t === "insertFromDrop" || t === "insertFromYank" || t === "insertFromPasteAsQuotation") {
        e.preventDefault();
        fire("PASTE");
      } else if (t === "insertReplacementText" && (e.data?.length ?? 0) > BULK_INPUT_CHARS) {
        e.preventDefault();
        fire("BULK_INPUT");
      } else if (t === "insertText" && (e.data?.length ?? 0) > BULK_INPUT_CHARS) {
        e.preventDefault();
        fire("BULK_INPUT");
      }
    };

    // Heuristic: a docked dev-tools panel shrinks the viewport relative to the window.
    const devtoolsTimer = window.setInterval(() => {
      const wide = window.outerWidth - window.innerWidth > 200;
      const tall = window.outerHeight - window.innerHeight > 260;
      if ((wide || tall) && !document.fullscreenElement) fire("DEVTOOLS");
    }, 2500);

    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", onBlur);
    document.addEventListener("copy", onCopy);
    document.addEventListener("cut", onCut);
    document.addEventListener("paste", onPaste);
    document.addEventListener("contextmenu", onContext);
    document.addEventListener("dragstart", onDrag);
    document.addEventListener("drop", onDrag);
    document.addEventListener("fullscreenchange", onFullscreen);
    document.addEventListener("keydown", onKeyDown, true);
    document.addEventListener("beforeinput", onBeforeInput as EventListener, true);

    return () => {
      clearInterval(devtoolsTimer);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", onBlur);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("cut", onCut);
      document.removeEventListener("paste", onPaste);
      document.removeEventListener("contextmenu", onContext);
      document.removeEventListener("dragstart", onDrag);
      document.removeEventListener("drop", onDrag);
      document.removeEventListener("fullscreenchange", onFullscreen);
      document.removeEventListener("keydown", onKeyDown, true);
      document.removeEventListener("beforeinput", onBeforeInput as EventListener, true);
    };
  }, [attemptId, active]);
}
