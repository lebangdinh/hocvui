/** Fixed upper simulation rate prevents 120/144 Hz displays speeding up games. */
export function frameGate(hz = 60) {
  const interval = 1000 / hz;
  let previous: number | undefined;
  return (now: number) => {
    if (previous === undefined) { previous = now; return true; }
    const elapsed = now - previous;
    if (elapsed + 0.001 < interval) return false;
    previous += Math.max(1, Math.floor((elapsed + 0.001) / interval)) * interval;
    return true;
  };
}
export function canvasPointerX(clientX: number, left: number, cssWidth: number, width: number): number {
  return cssWidth > 0 ? (clientX - left) * width / cssWidth : width / 2;
}
