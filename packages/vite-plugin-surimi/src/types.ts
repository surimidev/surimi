import type { CompileResult } from '@surimi/compiler';
import type { ResolvedConfig } from 'vite';

import type { SurimiEvaluator } from './runner.js';

/** Shared state passed from the core plugin to framework-specific plugins (Vue, etc.) */
export interface SharedPluginContext {
  compilationCache: Map<string, CompileResult>;
  include: string[];
  exclude: string[];
  inlineCss: boolean;
  resolvedConfig: ResolvedConfig | undefined;
  isDev: boolean | undefined;
  evaluator: SurimiEvaluator | undefined;
  /** Normalize dependency paths so collectDependentModules can match changed files. Set by core plugin. */
  normalizeDependencyId?: (dependencyId: string, ownerId: string) => string;
  getCompilationResult?: (id: string, options?: { source?: string }) => Promise<CompileResult>;
}

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
   * When `false` (default), emit virtual CSS modules (separate chunks).
   * When `true`, inject CSS into the JS output (no separate chunk).
   * @default false
   */
  inlineCss?: boolean;
}
