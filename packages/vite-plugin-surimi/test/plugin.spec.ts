import type { ResolvedConfig } from 'vite';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { surimiPlugin } from '../src/plugin.js';

// Mock file system operations
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
}));

// Mock fast-glob
vi.mock('fast-glob', () => ({
  default: vi.fn(),
}));

// Mock path operations
vi.mock('url', () => ({
  pathToFileURL: vi.fn((path: string) => ({ href: `file://${path}` })),
}));

interface TestConfig {
  build?: {
    rollupOptions?: {
      external?: string[];
    };
  };
}

describe('Surimi Vite Plugin', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Plugin Configuration', () => {
    it('should have correct plugin name', () => {
      const plugin = surimiPlugin();
      expect(plugin.name).toBe('vite-plugin-surimi');
    });

    it('should accept custom options', () => {
      const options = {
        include: ['custom/**/*.css.{ts,js}'],
        exclude: ['custom/exclude/**'],
        autoExternal: false,
        mode: 'manual' as const,
        virtualModuleId: 'virtual:custom.css',
      };

      const plugin = surimiPlugin(options);
      expect(plugin.name).toBe('vite-plugin-surimi');
    });

    it('should accept manual mode configuration', () => {
      const optionsInline = {
        mode: 'manual' as const,
        manualMode: { output: 'inline' as const },
      };

      const optionsChunk = {
        mode: 'manual' as const,
        manualMode: { output: 'chunk' as const },
      };

      const pluginInline = surimiPlugin(optionsInline);
      const pluginChunk = surimiPlugin(optionsChunk);

      expect(pluginInline.name).toBe('vite-plugin-surimi');
      expect(pluginChunk.name).toBe('vite-plugin-surimi');
    });

    it('should use default options when none provided', () => {
      const plugin = surimiPlugin();
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('vite-plugin-surimi');
    });
  });

  describe('Config Hook', () => {
    it('should add external dependencies in build mode when autoExternal is true', () => {
      const plugin = surimiPlugin({ autoExternal: true });
      const config: TestConfig = {};

      // @ts-expect-error - accessing internal plugin method for testing
      plugin.config(config, { command: 'build' });

      expect(config.build?.rollupOptions?.external).toEqual(['surimi', 'postcss']);
    });

    it('should preserve existing external dependencies', () => {
      const plugin = surimiPlugin({ autoExternal: true });
      const config: TestConfig = {
        build: {
          rollupOptions: {
            external: ['existing-lib'],
          },
        },
      };

      // @ts-expect-error - accessing internal plugin method for testing
      plugin.config(config, { command: 'build' });

      expect(config.build?.rollupOptions?.external).toEqual(['existing-lib', 'surimi', 'postcss']);
    });

    it('should not add externals when autoExternal is false', () => {
      const plugin = surimiPlugin({ autoExternal: false });
      const config: TestConfig = {};

      // @ts-expect-error - accessing internal plugin method for testing
      plugin.config(config, { command: 'build' });

      expect(config.build?.rollupOptions?.external).toBeUndefined();
    });

    it('should not modify config in serve mode', () => {
      const plugin = surimiPlugin({ autoExternal: true });
      const config: TestConfig = {};

      // @ts-expect-error - accessing internal plugin method for testing
      plugin.config(config, { command: 'serve' });

      expect(config.build?.rollupOptions?.external).toBeUndefined();
    });
  });

  describe('ResolveId Hook', () => {
    it('should resolve virtual surimi CSS module', () => {
      const plugin = surimiPlugin();

      // @ts-expect-error - accessing internal plugin method for testing
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result: string | undefined = plugin.resolveId('virtual:surimi.css');

      expect(result).toBe('\0virtual:surimi.css');
    });

    it('should not resolve non-virtual modules', () => {
      const plugin = surimiPlugin();

      // @ts-expect-error - accessing internal plugin method for testing
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      const result: string | undefined = plugin.resolveId('regular-module');

      expect(result).toBeUndefined();
    });
  });

  describe('ConfigResolved Hook', () => {
    it('should store resolved config root', () => {
      const plugin = surimiPlugin();
      const config = {
        root: '/test/root',
      } as ResolvedConfig;

      // @ts-expect-error - accessing internal plugin method for testing
      plugin.configResolved(config);

      // Since we can't access internal state directly, we just ensure no errors
      expect(plugin).toBeDefined();
    });
  });
});
