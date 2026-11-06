// Tiny shared store so the monitor hook (mounted inside each round runner)
// can raise a warning that is rendered once, by the layout, above every
// round page.
export type IntegrityWarning = { violations: number; max: number };

let current: IntegrityWarning | null = null;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

export const integrityWarningStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot: () => current,
  getServerSnapshot: () => null as IntegrityWarning | null,
  show(warning: IntegrityWarning) {
    current = warning;
    emit();
  },
  dismiss() {
    current = null;
    emit();
  },
};
