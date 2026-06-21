import { existsSync } from 'node:fs';
import path from 'node:path';
import type { CompileResult } from '@surimi/compiler';
import { createSurimiTransformPlugin, extractSurimiResult, type SurimiModule } from '@surimi/compiler';
import type { InlineConfig, Plugin, ResolvedConfig, ViteDevServer } from 'vite';
import { createServer, createServerModuleRunner, normalizePath } from 'vite';
import type { ModuleRunner } from 'vite/module-runner';

import { normalizeModuleId } from './normalize-module-id.js';

const DEV_SURIMI_PACKAGES = [
  '/packages/surimi',
  '/packages/common',
  '/packages/parsers',
  '/packages/core',
  '/packages/conditional',
  '/packages/theme',
];

const VUE_BLOCK_INCLUDE = '**/*.__surimi_*.css.ts';

export interface EvaluateSurimiFileOptions extends SurimiEvaluatorOptions {
  source?: string;
}

export interface SurimiEvaluatorOptions {
  root: string;
  include: string[];
  exclude: string[];
  resolvedConfig?: ResolvedConfig;
  userPlugins?: Plugin[];
  resolve?: InlineConfig['resolve'];
  /** Additional prefix aliases resolved relative to root (used by tests and host config seeding). */
  prefixAliases?: Record<string, string>;
  /** Which host plugins to seed into the owned server. Default drops this plugin only. */
  pluginFilter?: (plugin: Plugin) => boolean;
}

function defaultPluginFilter(plugin: Plugin): boolean {
  if (!plugin || typeof plugin !== 'object') return false;
  if (!('name' in plugin) || typeof plugin.name !== 'string') return true;
  if (plugin.name === 'vite-plugin-surimi') return false;
  if (plugin.name === 'vite-plugin-surimi:vue') return false;
  return true;
}

function isDevelopmentSurimiFile(id: string): boolean {
  return DEV_SURIMI_PACKAGES.some(pkgPath => id.includes(pkgPath));
}

function filterUserPlugins(plugins: Plugin[], pluginFilter: (plugin: Plugin) => boolean): Plugin[] {
  return plugins.flat().filter((plugin): plugin is Plugin => pluginFilter(plugin));
}

function createPrefixAliasPlugin(prefixAliases: Record<string, string>): Plugin {
  return {
    name: 'surimi:prefix-alias',
    enforce: 'pre',
    resolveId(source) {
      for (const [prefix, targetDir] of Object.entries(prefixAliases)) {
        if (source === prefix || source.startsWith(`${prefix}/`)) {
          const remainder = source === prefix ? '' : source.slice(prefix.length + 1);
          return remainder ? path.join(targetDir, remainder) : targetDir;
        }
      }
    },
  };
}

function createSurimiCssTsResolvePlugin(): Plugin {
  return {
    name: 'surimi:css-ts-resolve',
    enforce: 'pre',
    resolveId: {
      filter: { id: /\.css$/ },
      handler(source, importer) {
        if (!importer || source.includes('?')) return null;

        const [cleanSource] = source.split('?');
        if (!cleanSource?.endsWith('.css')) return null;

        const absoluteCss = normalizePath(path.resolve(path.dirname(importer), cleanSource));
        if (existsSync(absoluteCss)) return null;

        const cssTsCandidate = `${absoluteCss.slice(0, -4)}.ts`;
        if (existsSync(cssTsCandidate)) return cssTsCandidate;

        return null;
      },
    },
  };
}

function createVirtualSourcesPlugin(virtualSources: Map<string, string>): Plugin {
  return {
    name: 'surimi:virtual-sources',
    resolveId(id) {
      if (virtualSources.has(id)) return id;
    },
    load(id) {
      return virtualSources.get(id) ?? null;
    },
  };
}

function collectDependencies(server: ViteDevServer, entryId: string, root: string): string[] {
  const deps = new Set<string>();
  const moduleGraph = server.environments.ssr.moduleGraph;
  const visited = new Set<string>();

  const visit = (moduleId: string) => {
    const normalized = normalizeModuleId(moduleId.split('?')[0] ?? moduleId, root);
    if (visited.has(normalized)) return;
    visited.add(normalized);

    const mod = moduleGraph.getModuleById(normalized) ?? moduleGraph.getModuleById(moduleId);
    if (!mod) return;

    for (const imported of mod.importedModules) {
      const importedId = imported.id ?? imported.url;
      if (!importedId) continue;

      const cleanId = importedId.split('?')[0] ?? importedId;
      if (cleanId.includes('node_modules')) continue;
      if (isDevelopmentSurimiFile(cleanId)) continue;
      if (cleanId.startsWith('\0')) continue;

      const normalizedImport = normalizeModuleId(cleanId, root);
      deps.add(normalizedImport);
      visit(normalizedImport);
    }
  };

  visit(entryId);
  deps.add(normalizeModuleId(entryId.split('?')[0] ?? entryId, root));
  return [...deps];
}

export class SurimiEvaluator {
  private server: ViteDevServer | null = null;
  private runner: ModuleRunner | null = null;
  private readonly virtualSources = new Map<string, string>();
  private readonly normalizedRoot: string;
  private readonly harnessInclude: string[];
  private readonly pluginFilter: (plugin: Plugin) => boolean;

  constructor(private readonly options: SurimiEvaluatorOptions) {
    this.normalizedRoot = normalizeModuleId(options.root);
    this.harnessInclude = [...options.include, VUE_BLOCK_INCLUDE];
    this.pluginFilter = options.pluginFilter ?? defaultPluginFilter;
  }

  private async ensureServer(): Promise<{ server: ViteDevServer; runner: ModuleRunner }> {
    if (this.server && this.runner) {
      return { server: this.server, runner: this.runner };
    }

    const hostConfig = this.options.resolvedConfig;
    const prefixAliases = this.options.prefixAliases;
    const plugins: Plugin[] = [
      ...filterUserPlugins(this.options.userPlugins ?? hostConfig?.plugins.flat() ?? [], this.pluginFilter),
      ...(prefixAliases && Object.keys(prefixAliases).length > 0 ? [createPrefixAliasPlugin(prefixAliases)] : []),
      createSurimiCssTsResolvePlugin(),
      createVirtualSourcesPlugin(this.virtualSources),
      createSurimiTransformPlugin(this.harnessInclude, this.options.exclude),
    ];

    const baseResolve = this.options.resolve ?? hostConfig?.resolve;

    this.server = await createServer({
      configFile: false,
      root: this.normalizedRoot,
      logLevel: 'silent',
      ...(baseResolve ? { resolve: baseResolve } : {}),
      plugins,
      server: { middlewareMode: true, ws: false },
    });

    this.runner = createServerModuleRunner(this.server.environments.ssr, { hmr: false });

    return { server: this.server, runner: this.runner };
  }

  async evaluate(id: string, options: { source?: string } = {}): Promise<CompileResult> {
    const start = Date.now();
    const normalizedId = normalizeModuleId(id, this.normalizedRoot);

    if (options.source != null) {
      this.virtualSources.set(normalizedId, options.source);
    }

    const { server, runner } = await this.ensureServer();

    try {
      const mod = (await runner.import(normalizedId)) as SurimiModule;
      const { css, js } = extractSurimiResult(mod);
      const dependencies = collectDependencies(server, normalizedId, this.normalizedRoot);

      return {
        css,
        js,
        dependencies,
        duration: Date.now() - start,
      };
    } catch (error) {
      if (error instanceof Error) throw error;
      throw new Error(String(error));
    }
  }

  invalidate(id: string): void {
    if (!this.runner) return;
    const normalizedId = normalizeModuleId(id, this.normalizedRoot);
    const { evaluatedModules } = this.runner;
    const node = evaluatedModules.getModuleById(normalizedId);
    const nodes = node ? [node] : [...(evaluatedModules.getModulesByFile(normalizedId) ?? [])];
    for (const evaluated of nodes) {
      evaluatedModules.invalidateModule(evaluated);
    }
    this.virtualSources.delete(normalizedId);
  }

  async close(): Promise<void> {
    if (this.server) {
      await this.server.close();
    }
    this.server = null;
    this.runner = null;
    this.virtualSources.clear();
  }
}

export async function evaluateSurimiFile(id: string, options: EvaluateSurimiFileOptions): Promise<CompileResult> {
  const { source, ...evaluatorOptions } = options;
  const evaluator = new SurimiEvaluator(evaluatorOptions);

  try {
    return await evaluator.evaluate(id, source != null ? { source } : {});
  } finally {
    await evaluator.close();
  }
}

export function isSideEffectAssetDependency(
  dependencyId: string,
  ownerId: string,
  isSurimiStyleFile: (id: string) => boolean,
): boolean {
  const cleanId = dependencyId.split('?')[0] ?? dependencyId;
  if (cleanId === ownerId) return false;
  if (isSurimiStyleFile(cleanId)) return false;
  if (cleanId.endsWith('.surimi.css')) return false;
  if (cleanId.includes('node_modules')) return false;

  return (
    /\.(css|scss|sass|less)$/i.test(cleanId) ||
    dependencyId.includes('?raw') ||
    dependencyId.includes('?url') ||
    dependencyId.includes('?inline')
  );
}
