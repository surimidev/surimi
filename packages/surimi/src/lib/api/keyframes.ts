import type { KeyframeStepConfig } from '#lib/builders/keyframes.builder';
import { SurimiContext } from '#surimi';

import { KeyframesBuilder } from '../builders';

/**
 * Create a keyframes builder to define CSS keyframe animations.
 *
 * Use the returned KeyframesBuilder to define keyframe steps and their associated styles.
 *
 * @example
 * ```ts
 * const fadeIn = keyframes('fade-in')
 *   .at('0%', { opacity: 0 })
 *   .at('50%', { opacity: 0.25 })
 *   .at('100%', { opacity: 1 });
 *
 * // The resulting builder will be `KeyframesBuilder<"fade-in">`
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
  return new KeyframesBuilder(name, steps, SurimiContext.root, SurimiContext.root);
}
