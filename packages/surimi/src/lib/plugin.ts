/**
 * Simplified Plugin System for Surimi
 * 
 * Plugins are passed directly as arguments to createSurimi() and each plugin
 * defines which builders it extends via its exported structure.
 */

import { mix } from 'ts-mixer';
import type postcss from 'postcss';

import { SurimiContext } from '#surimi';
import type { JoinSelectors, ValidSelector } from '#types/selector.types';
import type { ArrayWithAtLeastOneItem } from '#types/util.types';
import type { CssProperties } from '#types/css.types';

import { _select } from './api/select';
import { CoreBuilder } from './builders/core.builder';
import { SelectorBuilder } from './builders/selector.builder';
import { MediaQueryBuilder } from './builders/media-query.builder';
import { ContainerQueryBuilder } from './builders/container-query.builder';
import { MixinBuilder } from './builders/mixin.builder';
import { Style } from './api/style';

/**
 * Base type for builder plugin mixins.
 */
export type BuilderPluginMixin = abstract new (...args: any[]) => any;

/**
 * Plugin definition that specifies which builders to extend and custom APIs
 */
export interface SurimiPlugin {
  /**
   * Name of the plugin (optional, for debugging)
   */
  name?: string;
  
  /**
   * Mixins to extend SelectorBuilder (returned by select())
   */
  selector?: BuilderPluginMixin[];
  
  /**
   * Mixins to extend MediaQueryBuilder (returned by media())
   */
  media?: BuilderPluginMixin[];
  
  /**
   * Mixins to extend ContainerQueryBuilder (returned by container())
   */
  container?: BuilderPluginMixin[];
  
  /**
   * Mixins to extend MixinBuilder (returned by mixin())
   */
  mixin?: BuilderPluginMixin[];
  
  /**
   * Mixins to extend Style class (returned by style())
   */
  style?: BuilderPluginMixin[];
  
  /**
   * Additional API methods to add to the createSurimi return value
   */
  apis?: Record<string, any>;
}

/**
 * Plugin can be an object or a function that returns an object
 */
export type SurimiPluginInput = SurimiPlugin | (() => SurimiPlugin);

/**
 * Helper to normalize plugin input to plugin object
 */
function normalizePlugin(plugin: SurimiPluginInput): SurimiPlugin {
  return typeof plugin === 'function' ? plugin() : plugin;
}

/**
 * Creates a Surimi instance with optional plugins.
 * 
 * @example
 * ```typescript
 * // Define a plugin
 * const animationPlugin = {
 *   name: 'animations',
 *   selector: [WithAnimations],
 *   apis: {
 *     customMethod: () => 'value'
 *   }
 * };
 * 
 * // Use the plugin
 * const { select, customMethod } = createSurimi(animationPlugin);
 * select('.modal').fadeIn('0.5s');
 * ```
 */
export function createSurimi(...plugins: SurimiPluginInput[]) {
  // Normalize all plugins
  const normalizedPlugins = plugins.map(normalizePlugin);
  
  // Collect all plugin mixins by builder type
  const selectorPlugins: BuilderPluginMixin[] = [];
  const mediaPlugins: BuilderPluginMixin[] = [];
  const containerPlugins: BuilderPluginMixin[] = [];
  const mixinPlugins: BuilderPluginMixin[] = [];
  const stylePlugins: BuilderPluginMixin[] = [];
  const customApis: Record<string, any> = {};
  
  for (const plugin of normalizedPlugins) {
    if (plugin.selector) selectorPlugins.push(...plugin.selector);
    if (plugin.media) mediaPlugins.push(...plugin.media);
    if (plugin.container) containerPlugins.push(...plugin.container);
    if (plugin.mixin) mixinPlugins.push(...plugin.mixin);
    if (plugin.style) stylePlugins.push(...plugin.style);
    if (plugin.apis) Object.assign(customApis, plugin.apis);
  }

  // Create extended builders
  const ExtendedSelectorBuilder = selectorPlugins.length > 0
    ? createExtendedBuilder(SelectorBuilder, selectorPlugins)
    : SelectorBuilder;
    
  const ExtendedMediaQueryBuilder = mediaPlugins.length > 0
    ? createExtendedBuilder(MediaQueryBuilder, mediaPlugins)
    : MediaQueryBuilder;
    
  const ExtendedContainerQueryBuilder = containerPlugins.length > 0
    ? createExtendedBuilder(ContainerQueryBuilder, containerPlugins)
    : ContainerQueryBuilder;
    
  const ExtendedMixinBuilder = mixinPlugins.length > 0
    ? createExtendedBuilder(MixinBuilder, mixinPlugins)
    : MixinBuilder;
    
  const ExtendedStyle = stylePlugins.length > 0
    ? createExtendedBuilder(Style, stylePlugins)
    : Style;

  /**
   * Select elements with plugin-enhanced builder
   */
  function select<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(
    ...selectors: TSelectors
  ) {
    if (selectors.length === 0) {
      throw new Error('At least one selector must be provided');
    }

    return _selectWithBuilder(
      selectors,
      SurimiContext.root,
      SurimiContext.root,
      ExtendedSelectorBuilder,
    );
  }

  /**
   * Create media query with plugin-enhanced builder
   */
  function media() {
    return new ExtendedMediaQueryBuilder<'@media'>(
      [{ type: 'at-rule-name', name: 'media', content: '@media' }] as any,
      SurimiContext.root,
      SurimiContext.root,
    );
  }

  /**
   * Create container query with plugin-enhanced builder
   */
  function container() {
    return new ExtendedContainerQueryBuilder<'@container'>(
      [{ type: 'at-rule-name', name: 'container', content: '@container' }] as any,
      SurimiContext.root,
      SurimiContext.root,
    );
  }

  /**
   * Create mixin with plugin-enhanced builder
   */
  function mixin<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(...selectors: TSelectors) {
    if (selectors.length === 0) {
      throw new Error('At least one selector must be provided');
    }
    if (typeof selectors[0] !== 'string') {
      throw new Error('Selector must be a string');
    }

    const { tokenize } = require('@surimi/parsers');
    const { joinSelectors } = require('#utils/selector.utils');
    
    const joinedSelectors = joinSelectors(selectors);
    const selectorTokens = tokenize(joinedSelectors);

    return new ExtendedMixinBuilder(selectorTokens, SurimiContext.root, SurimiContext.root);
  }

  /**
   * Create style with plugin-enhanced builder
   */
  function style(styles: CssProperties) {
    if (styles == null) {
      throw new Error('Styles object cannot be null or undefined.');
    }

    return new ExtendedStyle(SurimiContext.root, styles);
  }

  return {
    select,
    media,
    container,
    mixin,
    style,
    ...customApis,
  };
}

/**
 * Helper to create an extended builder class with plugins mixed in
 */
function createExtendedBuilder<TBuilder extends new (...args: any[]) => any>(
  BaseBuilder: TBuilder,
  plugins: BuilderPluginMixin[],
): TBuilder {
  @mix(BaseBuilder, ...plugins)
  class ExtendedBuilder extends (BaseBuilder as any) {}

  return ExtendedBuilder as TBuilder;
}

/**
 * Internal helper for creating select with a specific builder class
 */
function _selectWithBuilder<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(
  selectors: TSelectors,
  postcssContainer: postcss.Container,
  postcssRoot: postcss.Root,
  BuilderClass: typeof SelectorBuilder,
) {
  const result = _select(selectors, postcssContainer, postcssRoot);

  // Replace the prototype to use the extended builder
  Object.setPrototypeOf(result, BuilderClass.prototype);

  return result;
}

/**
 * Re-export base classes for plugin authors
 */
export { CoreBuilder };
export { WithStyling } from './builders/mixins/styling.mixin';
