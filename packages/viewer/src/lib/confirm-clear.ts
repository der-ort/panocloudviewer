/**
 * Every "clear all measurements" control asks first.
 *
 * A host may save what the measurement manager reports (the SMAAG platform
 * does, to its database), so one click deleted every saved measurement on the
 * scan, with no undo. Not in the core manager: `dispose()` clears through it
 * and must never ask. Nothing to clear → nothing to ask, and nothing happens.
 */
export function confirmClearAll(
  manager: { getAll(): unknown[] } | null | undefined,
  question: (count: number) => string,
): boolean {
  const count = manager?.getAll().length ?? 0;
  if (count === 0) return false;
  return window.confirm(question(count));
}
