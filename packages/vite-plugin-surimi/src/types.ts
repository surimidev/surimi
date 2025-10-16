export interface SurimiOptions {
  /**
   * Files to include for processing as surimi files.
   * Used in both manual and virtual modes.
   * @default ['**\/*.css.{ts,js}']
   */
  include?: string[];

  /**
   * Files to exclude from processing as surimi files.
   * Used in both manual and virtual modes.
   * @default ['node_modules/**', '**\/*.d.ts']
   */
  exclude?: string[];

  /**
   * Whether to inline the generated CSS into the JavaScript module.
   * If `true`, will not emit separate CSS files, but instead inject CSS via JavaScript.
   * If `false`, will emit separate CSS files and import them as virtual modules.
   *
   * Only used in 'manual' mode.
   * @default false
   */
  inlineCss?: boolean;
}
