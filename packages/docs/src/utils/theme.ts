export const THEME_STORAGE_KEY = 'theme';

export type Theme = 'light' | 'dark';

function isLocalStorageAvailable(): boolean {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- untrue. Depends on the browser/node
  return typeof window !== 'undefined' && 'localStorage' in window && window.localStorage != null;
}

export function getTheme(): Theme {
  if (typeof document === 'undefined') return 'light';
  if (isLocalStorageAvailable()) {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored === 'light' || stored === 'dark') return stored;
  }
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- untrue. Depends on the browser/node
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

export function setTheme(theme: Theme, persist = true): void {
  if (typeof document === 'undefined') return;
  document.documentElement.setAttribute('data-theme', theme);
  if (persist && isLocalStorageAvailable()) {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }
}

export function toggleTheme(): Theme {
  const next: Theme = getTheme() === 'dark' ? 'light' : 'dark';
  setTheme(next);
  return next;
}

export function watchPreferredColorScheme(callback: (theme: Theme) => void): () => void {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition -- untrue. Depends on the browser/node
  if (typeof window === 'undefined' || !window.matchMedia)
    return () => {
      /* noop */
    };
  const mql = window.matchMedia('(prefers-color-scheme: dark)');
  const handler = () => {
    callback(mql.matches ? 'dark' : 'light');
  };
  mql.addEventListener('change', handler);
  return () => {
    mql.removeEventListener('change', handler);
  };
}
