export interface SurimiPluginOptions {
  /**
   * Automatically externalize surimi and postcss in build mode (default: true)
   * This makes sure to not include any useless code in the final bundle.
   * If using surimi in runtime node (to generate CSS on the client), needs to be disabled
   */
  autoExternal?: boolean;

  /**
   * CSS processing mode:
   * - 'manual': Only transform surimi CSS files that are explicitly imported (default)
   * - 'virtual': Generate virtual CSS module from auto-discovered surimi CSS files
   */
  mode?: 'manual' | 'virtual';

  /**
   * Files to include for processing as surimi files.
   * Used in both manual and virtual modes.
   * @default ['**\/*.css.{ts,js}']
   */
  include?: string | string[];

  /**
   * Files to exclude from processing as surimi files.
   * Used in both manual and virtual modes.
   * @default ['node_modules/**', '**\/*.d.ts']
   */
  exclude?: string | string[];

  /**
   * Manual mode configuration. Only used when mode is 'manual'.
   */
  manualMode?: {
    /**
     * How to handle CSS output in manual mode:
     * - 'inline': Inject CSS directly into JS as style tags (default)
     * - 'chunk': Generate separate CSS files that are imported by JS
     */
    output?: 'inline' | 'chunk';
  };

  virtualMode?: {
    /**
     * Virtual module name that needs to be imported to include all discovered CSS.
     * Only used in 'virtual' mode.
     * @default 'virtual:surimi.css'
     */
    moduleId?: string;
  };
}

export interface ScanResult {
  files: string[];
  css: string;
  dependencies: Set<string>;
}
