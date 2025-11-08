import postcss from 'postcss';

import { _select } from '#lib/api/index';

/**
 * The base class for all surimi constructs.
 * It's used to provide common functionality, just so the compiler can use them properly
 *
 * The `build()` method is used to transform the Surimi construct into a primitive or object, so it can be consumed by CSS.
 *
 * For example, everything that can be used as a CSS property value (like custom properties, keyframe builders, etc.) should implement SurimiBase<string>,
 */
export abstract class SurimiBase<TBuild extends string | Record<string, unknown> = string> {
  protected _postcssRoot: postcss.Root;

  public constructor(root: postcss.Root) {
    this._postcssRoot = root;
  }

  /**
   * Transform the current Surimi construct into a primitive or object, so it can be consumed by CSS.
   *
   * it is called on Surimi classes when used in string contexts (e.g. template literals, string concatenation, etc.).
   * And when generating PostCSS properties from Surimi constructs.
   *
   * For example, calling this on a `property` will return the CSS variable string (e.g. `var(--my-custom-prop)`).
   * Calling it on a KeyframesBuilder will return the name of the keyframes animation.
   */
  public abstract build(): TBuild;

  public readonly [Symbol.toStringTag] = 'SurimiBase';

  public [Symbol.toPrimitive](hint: string) {
    if (hint === 'string' || hint === 'default') {
      return this.build();
    }
    return null;
  }
}

/**
 * Provides a pre-file global context for Surimi processing.
 * It's used to collect all generated CSS rules before outputting the final CSS.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class SurimiContext {
  public static root: postcss.Root = postcss.root();

  public static clear() {
    SurimiContext.root = postcss.root();
  }

  public static build() {
    return SurimiContext.root.toString();
  }
}
