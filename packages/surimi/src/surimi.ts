import postcss from 'postcss';

import { _select } from '#lib/api/index';
import type { SurimiConfig } from '#types/config.types';

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
 * Default configuration for Surimi.
 */
const DEFAULT_CONFIG: Required<SurimiConfig> = {
  strictProperties: false,
  allowCustomProperties: true,
  allowVendorPrefixes: true,
};

/**
 * Provides a pre-file global context for Surimi processing.
 * It's used to collect all generated CSS rules before outputting the final CSS.
 */
// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export abstract class SurimiContext {
  public static root: postcss.Root = postcss.root();
  private static _config: Required<SurimiConfig> = { ...DEFAULT_CONFIG };

  public static clear() {
    SurimiContext.root = postcss.root();
  }

  public static build() {
    return SurimiContext.root.toString();
  }

  /**
   * Configure Surimi behavior.
   *
   * @example
   * ```typescript
   * import { Surimi } from 'surimi';
   *
   * Surimi.configure({
   *   strictProperties: true,
   * });
   * ```
   */
  public static configure(config: SurimiConfig) {
    SurimiContext._config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * Get the current Surimi configuration.
   *
   * @returns The current configuration with all options set.
   */
  public static getConfig(): Required<SurimiConfig> {
    return { ...SurimiContext._config };
  }

  /**
   * Reset the configuration to default values.
   */
  public static resetConfig() {
    SurimiContext._config = { ...DEFAULT_CONFIG };
  }
}
