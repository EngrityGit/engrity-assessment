"use client";

import { useEffect, useState } from "react";

// Wraps every live round: locks text selection / printing, tiles a faint
// watermark with the candidate's identity (discourages screenshots and photos
// of the screen), and refuses to show questions unless the browser is in
// full-screen (where the platform supports it).
export default function ExamGuard({
  watermark,
  children,
  requireFullscreen = true,
}: {
  watermark: string;
  children: React.ReactNode;
  requireFullscreen?: boolean;
}) {
  const supported = typeof document !== "undefined" && Boolean(document.documentElement.requestFullscreen);
  const [full, setFull] = useState(true);

  useEffect(() => {
    if (!requireFullscreen || !document.documentElement.requestFullscreen) return;
    const update = () => setFull(Boolean(document.fullscreenElement));
    update();
    document.addEventListener("fullscreenchange", update);
    return () => document.removeEventListener("fullscreenchange", update);
  }, [requireFullscreen]);

  const needFull = requireFullscreen && supported && !full;
  const tile = encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="180"><text x="20" y="110" transform="rotate(-20 160 90)" font-family="sans-serif" font-size="14" font-weight="700" fill="#0071fe" fill-opacity="0.09">${watermark.replace(/[<&>]/g, "")}</text></svg>`
  );

  return (
    <div className="exam-locked relative" onDragStart={(e) => e.preventDefault()}>
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-30"
        style={{ backgroundImage: `url("data:image/svg+xml,${tile}")` }}
      />
      <div className={needFull ? "pointer-events-none select-none blur-xl" : ""} aria-hidden={needFull}>
        {children}
      </div>
      {needFull && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-ink/70 px-4">
          <div className="card max-w-md p-8 text-center anim-pop">
            <h2 className="text-xl font-extrabold">Full screen required</h2>
            <p className="mt-2 text-sm text-ink/70">
              This assessment must be taken in full-screen mode. Your timer keeps running while you&rsquo;re out of full
              screen, and leaving it is recorded as a warning.
            </p>
            <button
              type="button"
              className="btn btn-primary mt-5 w-full"
              onClick={() => document.documentElement.requestFullscreen().catch(() => {})}
            >
              Return to full screen
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
