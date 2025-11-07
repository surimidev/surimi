import type { KeyframeStepConfig } from '#lib/builders/keyframe.builder';
import { SurimiContext } from '#surimi';

import { KeyframeBuilder } from '../builders';

/**
 * Create a keyframes builder to define CSS keyframe animations.
 *
 * Use the returned KeyframeBuilder to define keyframe steps and their associated styles.
 *
 * @example
 * ```ts
 * const fadeIn = keyframes('fade-in')
 *   .at('0%', { opacity: 0 })
 *   .at('50%', { opacity: 0.25 })
 *   .at('100%', { opacity: 1 });
 *
 * // The resulting builder will be `KeyframeBuilder<"fade-in">`
 *
 * ```
 *
 * There are built-in short hand functions for `from` and `to` steps:
 *
 * ```ts
 * const slideIn = keyframes('slide-in')
 *   .from({ transform: 'translateX(-100%)' })
 *   .to({ transform: 'translateX(0)' });
 * ```
 */
export function keyframes(name: string, steps: KeyframeStepConfig = {}) {
  return new KeyframeBuilder(name, steps, SurimiContext.root, SurimiContext.root);
}
