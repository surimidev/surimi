// Debounce utility for performance optimization
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function debounce<F extends (...args: any[]) => any>(func: F, delay = 300): (...args: Parameters<F>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;

  return (...args: Parameters<F>) => {
    clearTimeout(timeoutId);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

// Throttle utility for high-frequency events
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throttle<T extends (...args: any[]) => any>(func: T, delay = 100): (...args: Parameters<T>) => void {
  let lastCall = 0;

  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

// Async debounce for database operations
export function debounceAsync<T extends (...args: Parameters<T>) => Promise<unknown>>(
  func: T,
  delay = 300,
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: number;
  let resolvePromise: (value: ReturnType<T>) => void;
  let rejectPromise: (reason: unknown) => void;

  return (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return new Promise((resolve, reject) => {
      window.clearTimeout(timeoutId);
      resolvePromise = resolve;
      rejectPromise = reject;

      timeoutId = window.setTimeout(() => {
        func(...args)
          .then(result => {
            resolvePromise(result as ReturnType<T>);
          })
          .catch((error: unknown) => {
            rejectPromise(error);
          });
      }, delay);
    });
  };
}
