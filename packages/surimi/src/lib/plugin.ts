/**
 * Plugin system for Surimi
 * 
 * This module provides the foundation for creating plugins that extend Surimi builders.
 * Plugins are implemented as mixin classes that extend CoreBuilder.
 */

import { mix } from 'ts-mixer';
import type postcss from 'postcss';

import { SurimiContext } from '#surimi';
import type { JoinSelectors, ValidSelector } from '#types/selector.types';
import type { ArrayWithAtLeastOneItem } from '#types/util.types';

import { _select } from './api/select';
import { CoreBuilder } from './builders/core.builder';
import { SelectorBuilder } from './builders/selector.builder';

/**
 * Base type for plugin mixins.
 * All plugins should extend CoreBuilder with their custom methods.
 * Note: The type uses `any` for flexibility since plugins use generic contexts.
 */
export type PluginMixin = abstract new (...args: any[]) => any;

/**
 * Configuration for creating a Surimi instance with plugins
 */
export interface SurimiConfig {
  /**
   * Array of plugin mixin classes to extend builder functionality.
   * These mixins will be composed with the base builders.
   */
  plugins?: PluginMixin[];
}

/**
 * Creates a Surimi instance with optional plugins.
 * 
 * This function allows you to extend Surimi's builder classes with custom functionality
 * through plugins. Plugins are mixin classes that extend CoreBuilder.
 * 
 * **Note**: Currently, plugin methods are only available on the initial builder returned
 * by `select()`. When using builder methods that create new instances (like `.hover()`,
 * `.child()`, `.before()`), those new instances will not have plugin methods. To use
 * plugin methods, apply them before navigating or using pseudo-selectors.
 * 
 * @example
 * ```typescript
 * // Define a plugin
 * export abstract class WithAnimations<TContext extends string> 
 *   extends CoreBuilder<Tokenize<TContext>> {
 *   public fadeIn(duration = '0.3s') {
 *     this.style({ animation: `fadeIn ${duration}`, opacity: '1' });
 *     return this;
 *   }
 * }
 * 
 * // Use the plugin
 * const { select } = createSurimi({ plugins: [WithAnimations] });
 * select('.modal').fadeIn('0.5s');
 * 
 * // When using with pseudo-selectors, apply plugin methods before:
 * select('.button').padding('1rem').hover().style({ color: 'blue' });
 * // Not supported yet: select('.button').hover().padding('1rem')
 * ```
 * 
 * @param config - Configuration object with optional plugins array
 * @returns Object with Surimi API functions (select, media, etc.)
 */
export function createSurimi(config?: SurimiConfig) {
  const plugins = config?.plugins ?? [];

  // If no plugins, return standard API
  if (plugins.length === 0) {
    return {
      select: standardSelect,
      // Future: media, container, etc.
    };
  }

  // Create extended SelectorBuilder with plugins mixed in
  const ExtendedSelectorBuilder = createExtendedBuilder(SelectorBuilder, plugins);

  /**
   * Select elements with plugin-enhanced builder
   */
  function select<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(
    ...selectors: TSelectors
  ): InstanceType<typeof ExtendedSelectorBuilder> {
    if (selectors.length === 0) {
      throw new Error('At least one selector must be provided');
    }

    return _selectWithBuilder(
      selectors,
      SurimiContext.root,
      SurimiContext.root,
      ExtendedSelectorBuilder,
    ) as InstanceType<typeof ExtendedSelectorBuilder>;
  }

  return {
    select,
    // Future: media, container, etc.
  };
}

/**
 * Helper to create an extended builder class with plugins mixed in
 */
function createExtendedBuilder(BaseBuilder: typeof SelectorBuilder, plugins: PluginMixin[]) {
  // Create a new class that mixes the base builder with all plugins
  @mix(BaseBuilder, ...plugins)
  class ExtendedBuilder extends BaseBuilder<any> {}

  return ExtendedBuilder;
}

/**
 * Internal helper for creating select with a specific builder class
 */
function _selectWithBuilder<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(
  selectors: TSelectors,
  postcssContainer: postcss.Container,
  postcssRoot: postcss.Root,
  BuilderClass: typeof SelectorBuilder,
): SelectorBuilder<JoinSelectors<TSelectors>> {
  const result = _select(selectors, postcssContainer, postcssRoot);

  // Replace the prototype to use the extended builder
  Object.setPrototypeOf(result, BuilderClass.prototype);

  return result as SelectorBuilder<JoinSelectors<TSelectors>>;
}

/**
 * Standard select function (without plugins)
 */
function standardSelect<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(
  ...selectors: TSelectors
) {
  return _select(selectors, SurimiContext.root, SurimiContext.root);
}

/**
 * Re-export CoreBuilder and WithStyling for plugin authors
 */
export { CoreBuilder };
export { WithStyling } from './builders/mixins/styling.mixin';
