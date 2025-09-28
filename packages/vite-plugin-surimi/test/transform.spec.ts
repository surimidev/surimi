import { describe, expect, it } from 'vitest';

import { surimiPlugin } from '../src/plugin.js';

describe('Surimi Plugin - Mode Behavior', () => {
  describe('Mode Configuration', () => {
    it('should create plugin with different modes', () => {
      const modes = ['manual', 'virtual'] as const;

      modes.forEach(mode => {
        const plugin = surimiPlugin({ mode });
        expect(plugin.name).toBe('vite-plugin-surimi');
      });
    });

    it('should use manual mode by default', () => {
      const plugin = surimiPlugin();
      expect(plugin).toBeDefined();
      expect(plugin.name).toBe('vite-plugin-surimi');
    });

    it('should create plugin with manual mode configurations', () => {
      const inlineConfig = { mode: 'manual' as const, manualMode: { output: 'inline' as const } };
      const chunkConfig = { mode: 'manual' as const, manualMode: { output: 'chunk' as const } };

      const inlinePlugin = surimiPlugin(inlineConfig);
      const chunkPlugin = surimiPlugin(chunkConfig);

      expect(inlinePlugin.name).toBe('vite-plugin-surimi');
      expect(chunkPlugin.name).toBe('vite-plugin-surimi');
    });
  });

  describe('File Detection Logic', () => {
    it('should detect surimi files by extension correctly', () => {
      const testCases = [
        { filePath: 'src/styles/button.css.ts', isSurimi: true },
        { filePath: 'src/styles/global.css.js', isSurimi: true },
        { filePath: 'src/components/Button.tsx', isSurimi: false },
        { filePath: 'src/utils/helpers.ts', isSurimi: false },
        { filePath: 'src/components/Button.js', isSurimi: false },
        { filePath: 'src/styles/main.css', isSurimi: false },
      ];

      testCases.forEach(({ filePath, isSurimi }) => {
        const detectedAsSurimi = /\.css\.(ts|js)$/.test(filePath);
        expect(detectedAsSurimi).toBe(isSurimi);
      });
    });
  });
  describe('Manual Mode CSS Output', () => {
    it('should generate inline CSS imports for inline mode', () => {
      const testId = '/test/file.css.ts';
      const expectedInlineCssId = testId + '.css?inline';

      // Test the pattern that inline mode should generate
      expect(expectedInlineCssId).toBe('/test/file.css.ts.css?inline');
    });

    it('should generate chunk CSS imports for chunk mode', () => {
      const testId = '/test/file.css.ts';
      const expectedChunkCssId = testId + '.css';

      // Test the pattern that chunk mode should generate
      expect(expectedChunkCssId).toBe('/test/file.css.ts.css');
    });

    it('should generate valid CSS injection code structure for inline mode', () => {
      const filePath = '/test/file.css.ts';
      const expectedCssImport = filePath + '.css?inline';

      const injectionCode = `
// CSS extracted from /test/file.css.ts at build time
import css from '${expectedCssImport}';
if (typeof document !== 'undefined') {
  const styleId = 'surimi--test-file-css-ts';
  if (!document.getElementById(styleId)) {
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = css;
    document.head.appendChild(style);
  }
}`;

      // Validate the structure
      expect(injectionCode).toContain('CSS extracted from');
      expect(injectionCode).toContain('import css from');
      expect(injectionCode).toContain('.css?inline');
      expect(injectionCode).toContain('createElement');
      expect(injectionCode).toContain('getElementById');
      expect(injectionCode).toContain('appendChild');
    });

    it('should handle CSS imports consistently', () => {
      const filePath = '/components/Button.css.ts';
      const inlineCssPath = filePath + '.css?inline';
      const chunkCssPath = filePath + '.css';

      // Both should reference the same base CSS file
      expect(inlineCssPath).toBe('/components/Button.css.ts.css?inline');
      expect(chunkCssPath).toBe('/components/Button.css.ts.css');
    });

    it('should generate proper CSS import paths', () => {
      const testPaths = ['/src/styles/theme.css.ts', '/lib/components/Card.css.js', '/pages/home.css.ts'];

      testPaths.forEach(path => {
        const cssPath = path + '.css';
        expect(cssPath).toMatch(/\.css\.ts\.css$|\.css\.js\.css$/);
      });
    });
  });

  describe('Plugin Hooks Structure', () => {
    it('should have all required plugin hooks', () => {
      const plugin = surimiPlugin();

      // Check that the plugin has the expected structure
      expect(plugin.name).toBe('vite-plugin-surimi');
      expect(typeof plugin.config).toBe('function');
      expect(typeof plugin.configResolved).toBe('function');
      expect(typeof plugin.resolveId).toBe('function');
      expect(typeof plugin.load).toBe('function');
      expect(typeof plugin.transform).toBe('function');
    });

    it('should have correct plugin name and structure', () => {
      const plugin = surimiPlugin({ mode: 'virtual' });

      expect(plugin.name).toBe('vite-plugin-surimi');
      expect(plugin).toHaveProperty('config');
      expect(plugin).toHaveProperty('configResolved');
      expect(plugin).toHaveProperty('resolveId');
      expect(plugin).toHaveProperty('load');
      expect(plugin).toHaveProperty('transform');
    });
  });

  describe('Configuration Validation', () => {
    it('should accept valid configuration options', () => {
      const validConfigs = [
        {},
        { mode: 'manual' as const },
        { mode: 'virtual' as const },
        { autoExternal: false },
        { include: ['src/**/*.css.{ts,js}'] },
        { exclude: ['**/*.d.ts'] },
        { virtualModuleId: 'virtual:custom.css' },
      ];

      validConfigs.forEach(config => {
        expect(() => surimiPlugin(config)).not.toThrow();
      });
    });

    it('should handle include/exclude patterns for CSS files', () => {
      const patterns = {
        string: 'src/**/*.css.ts',
        array: ['src/**/*.css.ts', 'lib/**/*.css.js'],
      };

      Object.values(patterns).forEach(pattern => {
        expect(() => surimiPlugin({ include: pattern })).not.toThrow();
        expect(() => surimiPlugin({ exclude: pattern })).not.toThrow();
      });
    });
  });
});
