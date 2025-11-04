import postcss from 'postcss';

import { _select } from '#lib/api/index';

/**
 * The base class for all surimi constructs.
 * It's used to provide common functionality, just so the compiler can use them properly
 */
export abstract class SurimiBase {
  protected _postcssRoot: postcss.Root;

  public constructor(root: postcss.Root) {
    this._postcssRoot = root;
  }

  /**
   * Transform the current Surimi construct into a simple string, so
   * there is no runtime dependency on any Surimi code.
   *
   * For example, calling this on a `property` will return the CSS variable string (e.g. `var(--my-custom-prop)`).
   */
  public abstract build(): string | Record<string, unknown>;
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
