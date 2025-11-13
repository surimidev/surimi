/**
 * Plugin System Tests - New Simplified API
 * 
 * Tests for the simplified plugin system where plugins are passed as arguments
 * and each plugin defines what it extends.
 */

import { beforeEach, describe, expect, it } from 'vitest';

import { createSurimi, Surimi, WithStyling } from '../src/index';

// Example plugin extending selector builder
abstract class WithTestAnimation<TContext extends string> extends WithStyling<TContext> {
  public testFadeIn() {
    this.style({ opacity: '1', animation: 'fadeIn 0.3s' });
    return this;
  }
}

abstract class WithTestSpacing<TContext extends string> extends WithStyling<TContext> {
  public testPadding(size: string) {
    this.style({ padding: size });
    return this;
  }
}

describe('Plugin System - Simplified API', () => {
  beforeEach(() => {
    Surimi.clear();
  });

  describe('Basic Plugin Usage', () => {
    it('should work without any plugins', () => {
      const { select } = createSurimi();

      select('.button').style({
        backgroundColor: 'blue',
      });

      expect(Surimi.build()).toBe(`\
.button {
    background-color: blue
}`);
    });

    it('should extend builder with single plugin', () => {
      const animationPlugin = {
        name: 'animations',
        selector: [WithTestAnimation],
      };

      const { select } = createSurimi(animationPlugin);

      (select('.modal') as any).testFadeIn();

      expect(Surimi.build()).toBe(`\
.modal {
    opacity: 1;
    animation: fadeIn 0.3s
}`);
    });

    it('should extend builder with multiple plugins', () => {
      const animationPlugin = {
        name: 'animations',
        selector: [WithTestAnimation],
      };

      const spacingPlugin = {
        name: 'spacing',
        selector: [WithTestSpacing],
      };

      const { select } = createSurimi(animationPlugin, spacingPlugin);

      const element = select('.card') as any;
      element.testFadeIn();
      element.testPadding('1rem');

      expect(Surimi.build()).toBe(`\
.card {
    opacity: 1;
    animation: fadeIn 0.3s;
    padding: 1rem
}`);
    });

    it('should support custom APIs', () => {
      const customApiPlugin = {
        name: 'custom',
        apis: {
          customMethod: () => 'custom value',
          anotherMethod: (x: number) => x * 2,
        },
      };

      const result = createSurimi(customApiPlugin) as any;

      expect(result.customMethod()).toBe('custom value');
      expect(result.anotherMethod(5)).toBe(10);
    });

    it('should support plugin as a function', () => {
      const pluginFactory = () => ({
        name: 'dynamic',
        selector: [WithTestAnimation],
      });

      const { select } = createSurimi(pluginFactory);

      (select('.test') as any).testFadeIn();

      expect(Surimi.build()).toBe(`\
.test {
    opacity: 1;
    animation: fadeIn 0.3s
}`);
    });

    it('should merge multiple plugins extending the same builder', () => {
      const plugin1 = {
        selector: [WithTestAnimation],
      };

      const plugin2 = {
        selector: [WithTestSpacing],
      };

      const { select } = createSurimi(plugin1, plugin2);

      const element = select('.element') as any;
      element.testFadeIn();
      element.testPadding('2rem');

      expect(Surimi.build()).toBe(`\
.element {
    opacity: 1;
    animation: fadeIn 0.3s;
    padding: 2rem
}`);
    });

    it('should support a plugin extending multiple builders', () => {
      abstract class WithMediaHelper<TContext extends string> extends WithStyling<TContext> {
        public testMedia() {
          return this;
        }
      }

      const multiBuilderPlugin = {
        name: 'multi',
        selector: [WithTestAnimation],
        media: [WithMediaHelper],
      };

      const { select, media } = createSurimi(multiBuilderPlugin);

      // Test selector extension
      (select('.test') as any).testFadeIn();

      // Test media extension
      const mediaBuilder = media() as any;
      expect(typeof mediaBuilder.testMedia).toBe('function');

      expect(Surimi.build()).toBe(`\
.test {
    opacity: 1;
    animation: fadeIn 0.3s
}`);
    });
  });

  describe('Plugin APIs', () => {
    it('should merge APIs from multiple plugins', () => {
      const plugin1 = {
        apis: {
          method1: () => 'value1',
        },
      };

      const plugin2 = {
        apis: {
          method2: () => 'value2',
        },
      };

      const result = createSurimi(plugin1, plugin2) as any;

      expect(result.method1()).toBe('value1');
      expect(result.method2()).toBe('value2');
    });

    it('should allow later plugins to override APIs', () => {
      const plugin1 = {
        apis: {
          sharedMethod: () => 'first',
        },
      };

      const plugin2 = {
        apis: {
          sharedMethod: () => 'second',
        },
      };

      const result = createSurimi(plugin1, plugin2) as any;

      expect(result.sharedMethod()).toBe('second');
    });
  });
});
