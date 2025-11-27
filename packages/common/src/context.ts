import postcss from 'postcss';

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
