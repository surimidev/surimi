/**
 * View Transitions API + wavy circle reveal (from profile.garden).
 * Pure JS, no framework.
 */

const LOBES = 12;
const WOBBLE = 0.18;
const POINTS_PER_LOBE = 4;
const KEYFRAME_COUNT = 20;

function wavyCirclePath(cx: number, cy: number, radius: number): string {
  const total = LOBES * POINTS_PER_LOBE;
  const pts: [number, number][] = [];
  for (let i = 0; i < total; i++) {
    const angle = (i / total) * Math.PI * 2;
    const lobe = Math.sin(LOBES * angle);
    const r = radius * (1 + WOBBLE * lobe);
    pts.push([cx + r * Math.cos(angle), cy + r * Math.sin(angle)]);
  }
  const first = pts[0];
  if (!first) return 'M 0 0 Z';
  let d = `M ${first[0]} ${first[1]}`;
  for (let i = 0; i < pts.length; i++) {
    const p0 = pts[i];
    const p1 = pts[(i + 1) % pts.length];
    if (!p0 || !p1) continue;
    const cpx = (p0[0] + p1[0]) / 2;
    const cpy = (p0[1] + p1[1]) / 2;
    d += ` Q ${p0[0]} ${p0[1]} ${cpx} ${cpy}`;
  }
  d += ' Z';
  return d;
}

export function supportsViewTransition(): boolean {
  return 'startViewTransition' in document && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function animateWavyReveal(cx: number, cy: number, pseudoElement: string, duration: number): void {
  const maxRadius = Math.hypot(Math.max(cx, window.innerWidth - cx), Math.max(cy, window.innerHeight - cy));
  const fadeIn = 50 / duration;
  const keyframes: Keyframe[] = [];
  for (let i = 0; i <= KEYFRAME_COUNT; i++) {
    const t = i / KEYFRAME_COUNT;
    const r = t * maxRadius * 1.25;
    const path = wavyCirclePath(cx, cy, Math.max(r, 0.5));
    const opacity = t < fadeIn ? t / fadeIn : 1;
    keyframes.push({ clipPath: `path("${path}")`, opacity, offset: t });
  }
  document.documentElement.animate(keyframes, {
    duration,
    easing: 'ease-out',
    pseudoElement,
  });
}

type DocWithVT = Document & {
  startViewTransition: (cb: () => void) => { ready: Promise<void>; finished: Promise<void> };
};

/**
 * Run a callback (e.g. theme change) with a wavy reveal from the trigger element's center.
 * Falls back to immediate callback if View Transitions aren't supported.
 */
export function withViewTransition(triggerEl: HTMLElement | null, apply: () => void): void {
  if (!supportsViewTransition()) {
    apply();
    return;
  }
  const rect = triggerEl?.getBoundingClientRect();
  const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2;
  const cy = rect ? rect.top + rect.height / 2 : 0;
  const doc = document as DocWithVT;
  const transition = doc.startViewTransition(() => {
    apply();
  });
  transition.ready
    .then(() => {
      animateWavyReveal(cx, cy, '::view-transition-new(root)', 500);
    })
    .catch(() => {});
}
