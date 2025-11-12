/**
 * Comprehensive Plugin System for Surimi
 * 
 * This module provides a flexible plugin system that allows:
 * 1. Extending existing builders (SelectorBuilder, MediaQueryBuilder, etc.)
 * 2. Adding new top-level API methods to createSurimi return value
 * 3. Full TypeScript type inference
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
 * These extend existing builders with new methods.
 */
export type BuilderPluginMixin = abstract new (...args: any[]) => any;

/**
 * Plugin configuration for extending Surimi
 */
export interface SurimiPluginConfig<TApis extends Record<string, any> = Record<string, never>> {
  /**
   * Plugins that extend the SelectorBuilder (returned by select())
   */
  selectorPlugins?: BuilderPluginMixin[];
  
  /**
   * Plugins that extend the MediaQueryBuilder (returned by media())
   */
  mediaPlugins?: BuilderPluginMixin[];
  
  /**
   * Plugins that extend the ContainerQueryBuilder (returned by container())
   */
  containerPlugins?: BuilderPluginMixin[];
  
  /**
   * Plugins that extend the MixinBuilder (returned by mixin())
   */
  mixinPlugins?: BuilderPluginMixin[];
  
  /**
   * Plugins that extend the Style class (returned by style())
   */
  stylePlugins?: BuilderPluginMixin[];
  
  /**
   * Additional API methods to add to the createSurimi return value
   */
  apis?: TApis;
}

/**
 * Infer the extended SelectorBuilder type with plugins
 */
type ExtendedSelectorBuilder<TPlugins extends BuilderPluginMixin[]> = 
  TPlugins extends [] 
    ? typeof SelectorBuilder 
    : {
        new <T extends string>(...args: ConstructorParameters<typeof SelectorBuilder>): 
          SelectorBuilder<T> & UnionToIntersection<InstanceType<TPlugins[number]>>;
      };

/**
 * Infer the extended MediaQueryBuilder type with plugins
 */
type ExtendedMediaQueryBuilder<TPlugins extends BuilderPluginMixin[]> = 
  TPlugins extends [] 
    ? typeof MediaQueryBuilder 
    : {
        new <T extends string>(...args: ConstructorParameters<typeof MediaQueryBuilder>): 
          MediaQueryBuilder<T> & UnionToIntersection<InstanceType<TPlugins[number]>>;
      };

/**
 * Helper type to convert union to intersection
 */
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never;

/**
 * Creates a Surimi instance with optional plugins.
 * 
 * @example
 * ```typescript
 * // Extend SelectorBuilder
 * const { select } = createSurimi({ 
 *   selectorPlugins: [WithAnimations, WithSpacing] 
 * });
 * select('.modal').fadeIn('0.5s').padding('1rem');
 * 
 * // Extend MediaQueryBuilder
 * const { media } = createSurimi({ 
 *   mediaPlugins: [WithMediaHelpers] 
 * });
 * media().mobile().select('.card').style({ padding: '1rem' });
 * 
 * // Add new APIs
 * const { select, customApi } = createSurimi({
 *   apis: {
 *     customApi: () => { ... }
 *   }
 * });
 * ```
 */
export function createSurimi<TApis extends Record<string, any> = Record<string, never>>(
  config?: SurimiPluginConfig<TApis>
) {
  const {
    selectorPlugins = [],
    mediaPlugins = [],
    containerPlugins = [],
    mixinPlugins = [],
    stylePlugins = [],
    apis = {} as TApis,
  } = config ?? {};

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
    ...apis,
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
