import type { TokenizeAtRule } from '@surimi/parsers';
import { stringifyAtRule, tokenizeAtRule } from '@surimi/parsers';

import { _select } from '#lib/api/select';
import type {
  BaseRangedMediaDescriptor,
  DiscreteMediaDescriptor,
  MediaOperator,
  MediaRangeOperator,
  MediaType,
} from '#types/css.types';
import type { KebabCaseToCamelCase } from '#types/util.types';

import { AtRuleBuilder } from './at-rule.builder';

type MediaQueryBuilderDiscreteFunctions = {
  // Can have either no params, or a single param with some value.
  [K in DiscreteMediaDescriptor as KebabCaseToCamelCase<K>]: unknown;
};

type MediaQueryBuilderBaseRangedFunctions<T extends string> = {
  [K in BaseRangedMediaDescriptor as KebabCaseToCamelCase<K>]: <
    TValue extends string,
    TOperator extends MediaRangeOperator,
  >(
    operator: TOperator,
    value: TValue,
  ) => MediaQueryBuilder<`${T} (${K} ${TOperator} ${TValue})`>;
};

type MediaQueryBuilderMinRangedFunctions<T extends string> = {
  [K in BaseRangedMediaDescriptor as KebabCaseToCamelCase<`min-${K}`>]: <TValue extends string>(
    value: TValue,
  ) => MediaQueryBuilder<`${T} (min-${K}: ${TValue})`>;
};

type MediaQueryBuilderMaxRangedFunctions<T extends string> = {
  [K in BaseRangedMediaDescriptor as KebabCaseToCamelCase<`max-${K}`>]: <TValue extends string>(
    value: TValue,
  ) => MediaQueryBuilder<`${T} (max-${K}: ${TValue})`>;
};

type MediaQueryBuilderTypeFunctions<T extends string> = {
  [K in MediaType]: () => MediaQueryBuilder<`${T} ${K}`>;
};

type MediaQueryBuilderOperatorFunctions<T extends string> = {
  [K in MediaOperator]: () => MediaQueryBuilder<`${T} ${K}`>;
};

export type MediaQueryBuilderFunctions<T extends string> = MediaQueryBuilderDiscreteFunctions &
  MediaQueryBuilderBaseRangedFunctions<T> &
  MediaQueryBuilderMinRangedFunctions<T> &
  MediaQueryBuilderMaxRangedFunctions<T> &
  MediaQueryBuilderTypeFunctions<T> &
  MediaQueryBuilderOperatorFunctions<T>;

/**
 * Builder for media queries that supports selecting elements within the media query
 *
 * @experimental The MediaQueryBuilder API is experimental and may cause faulty code if used incorrectly.
 * It gives you full freedome to write incorrect media queries that Surimi cannot validate for you (yet).
 *
 * Internally, this is an extension to the `AtRule` builder that adds media query specific methods.
 *
 * @link [CSSWG Specification](https://drafts.csswg.org/mediaqueries/#descdef-media-width)
 */
export class MediaQueryBuilder<TQuery extends string>
  extends AtRuleBuilder<TQuery>
  implements MediaQueryBuilderFunctions<TQuery>
{
  private createMediaQueryBuilderWithParameter<TNewParam extends string>(
    parameter: TNewParam,
  ): MediaQueryBuilder<`${TQuery} ${TNewParam}`> {
    const currentContextString = stringifyAtRule(this._context);
    const newContext = tokenizeAtRule(
      `${currentContextString} ${parameter}`,
    ) as TokenizeAtRule<`${TQuery} ${TNewParam}`>;

    return new MediaQueryBuilder(newContext as never, this._postcssContainer, this._postcssRoot);
  }

  // ------------
  // Media Types
  // ------------

  public all() {
    return this.createMediaQueryBuilderWithParameter(`all`);
  }
  public print() {
    return this.createMediaQueryBuilderWithParameter(`print`);
  }
  public screen() {
    return this.createMediaQueryBuilderWithParameter(`screen`);
  }

  // ------------
  // Media Operators
  // ------------

  public and() {
    return this.createMediaQueryBuilderWithParameter(`and`);
  }
  public not() {
    return this.createMediaQueryBuilderWithParameter(`not`);
  }
  public only() {
    return this.createMediaQueryBuilderWithParameter(`only`);
  }
  public or() {
    return this.createMediaQueryBuilderWithParameter(`or`);
  }

  // ------------
  // Discrete Media Descriptors
  // ------------

  public anyHover(value: 'none' | 'hover') {
    return this.createMediaQueryBuilderWithParameter(`(any-hover: ${value})`);
  }

  public anyPointer(value: 'none' | 'coarse' | 'fine') {
    return this.createMediaQueryBuilderWithParameter(`(any-pointer: ${value})`);
  }

  public colorGamut(value: 'srgb' | 'p3' | 'rec2020') {
    return this.createMediaQueryBuilderWithParameter(`(color-gamut: ${value})`);
  }

  public displayMode(value: 'fullscreen' | 'standalone' | 'minimal-ui' | 'browser' | 'picture-in-picture') {
    return this.createMediaQueryBuilderWithParameter(`(display-mode: ${value})`);
  }

  public dynamicRange(value: 'standard' | 'high') {
    return this.createMediaQueryBuilderWithParameter(`(dynamic-range: ${value})`);
  }

  public environmentBlending(value: 'opaque' | 'additive' | 'subtractive') {
    return this.createMediaQueryBuilderWithParameter(`(environment-blending: ${value})`);
  }

  public forcedColors(value: 'none' | 'active') {
    return this.createMediaQueryBuilderWithParameter(`(forced-colors: ${value})`);
  }

  public grid(value: 0 | 1) {
    return this.createMediaQueryBuilderWithParameter(`(grid: ${value})`);
  }

  public hover(value: 'none' | 'hover') {
    return this.createMediaQueryBuilderWithParameter(`(hover: ${value})`);
  }

  public invertedColors(value: 'none' | 'inverted') {
    return this.createMediaQueryBuilderWithParameter(`(inverted-colors: ${value})`);
  }

  public navControls(value: 'none' | 'back') {
    return this.createMediaQueryBuilderWithParameter(`(nav-controls: ${value})`);
  }

  public orientation(value: 'portrait' | 'landscape') {
    return this.createMediaQueryBuilderWithParameter(`(orientation: ${value})`);
  }

  public overflowBlock(value: 'none' | 'scroll' | 'optional-paged' | 'paged') {
    return this.createMediaQueryBuilderWithParameter(`(overflow-block: ${value})`);
  }

  public overflowInline(value: 'none' | 'scroll') {
    return this.createMediaQueryBuilderWithParameter(`(overflow-inline: ${value})`);
  }

  public pointer(value: 'none' | 'coarse' | 'fine') {
    return this.createMediaQueryBuilderWithParameter(`(pointer: ${value})`);
  }

  public prefersColorScheme(value: 'light' | 'dark') {
    return this.createMediaQueryBuilderWithParameter(`(prefers-color-scheme: ${value})`);
  }

  public prefersContrast(value: 'no-preference' | 'more' | 'less' | 'custom') {
    return this.createMediaQueryBuilderWithParameter(`(prefers-contrast: ${value})`);
  }

  public prefersReducedData(value: 'no-preference' | 'reduce') {
    return this.createMediaQueryBuilderWithParameter(`(prefers-reduced-data: ${value})`);
  }

  public prefersReducedMotion(value: 'no-preference' | 'reduce') {
    return this.createMediaQueryBuilderWithParameter(`(prefers-reduced-motion: ${value})`);
  }

  public prefersReducedTransparency(value: 'no-preference' | 'reduce') {
    return this.createMediaQueryBuilderWithParameter(`(prefers-reduced-transparency: ${value})`);
  }

  public scan(value: 'interlace' | 'progressive') {
    return this.createMediaQueryBuilderWithParameter(`(scan: ${value})`);
  }

  public scripting(value: 'none' | 'initial-only' | 'enabled') {
    return this.createMediaQueryBuilderWithParameter(`(scripting: ${value})`);
  }

  public update(value: 'none' | 'slow' | 'fast') {
    return this.createMediaQueryBuilderWithParameter(`(update: ${value})`);
  }

  public videoColorGamut(value: 'srgb' | 'p3' | 'rec2020') {
    return this.createMediaQueryBuilderWithParameter(`(video-color-gamut: ${value})`);
  }

  public videoDynamicRange(value: 'standard' | 'high') {
    return this.createMediaQueryBuilderWithParameter(`(video-dynamic-range: ${value})`);
  }

  // ------------
  // Ranged Media Descriptors (without min- and max- prefixes)
  // ------------

  public aspectRatio<TOperator extends MediaRangeOperator, TValue extends string>(operator: TOperator, value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(aspect-ratio ${operator} ${value})`);
  }

  public color<TOperator extends MediaRangeOperator, TValue extends string>(operator: TOperator, value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(color ${operator} ${value})`);
  }

  public colorIndex<TOperator extends MediaRangeOperator, TValue extends string>(operator: TOperator, value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(color-index ${operator} ${value})`);
  }
  public deviceAspectRatio<TOperator extends MediaRangeOperator, TValue extends string>(
    operator: TOperator,
    value: TValue,
  ) {
    return this.createMediaQueryBuilderWithParameter(`(device-aspect-ratio ${operator} ${value})`);
  }

  public deviceHeight<TOperator extends MediaRangeOperator, TValue extends string>(operator: TOperator, value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(device-height ${operator} ${value})`);
  }

  public deviceWidth<TOperator extends MediaRangeOperator, TValue extends string>(operator: TOperator, value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(device-width ${operator} ${value})`);
  }

  public height<TOperator extends MediaRangeOperator, TValue extends string>(operator: TOperator, value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(height ${operator} ${value})`);
  }

  public horizontalViewportSegments<TOperator extends MediaRangeOperator, TValue extends string>(
    operator: TOperator,
    value: TValue,
  ) {
    return this.createMediaQueryBuilderWithParameter(`(horizontal-viewport-segments ${operator} ${value})`);
  }

  public monochrome<TOperator extends MediaRangeOperator, TValue extends string>(operator: TOperator, value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(monochrome ${operator} ${value})`);
  }

  public resolution<TOperator extends MediaRangeOperator, TValue extends string>(operator: TOperator, value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(resolution ${operator} ${value})`);
  }

  public verticalViewportSegments<TOperator extends MediaRangeOperator, TValue extends string>(
    operator: TOperator,
    value: TValue,
  ) {
    return this.createMediaQueryBuilderWithParameter(`(vertical-viewport-segments ${operator} ${value})`);
  }

  public width<TOperator extends MediaRangeOperator, TValue extends string>(operator: TOperator, value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(width ${operator} ${value})`);
  }

  // ------------
  // Ranged Media Descriptors (with min- prefix)
  // ------------

  public minAspectRatio<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(min-aspect-ratio: ${value})`);
  }

  public minColor<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(min-color: ${value})`);
  }

  public minColorIndex<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(min-color-index: ${value})`);
  }

  public minDeviceAspectRatio<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(min-device-aspect-ratio: ${value})`);
  }

  public minDeviceHeight<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(min-device-height: ${value})`);
  }

  public minDeviceWidth<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(min-device-width: ${value})`);
  }

  public minHeight<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(min-height: ${value})`);
  }

  public minHorizontalViewportSegments<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(min-horizontal-viewport-segments: ${value})`);
  }

  public minMonochrome<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(min-monochrome: ${value})`);
  }

  public minResolution<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(min-resolution: ${value})`);
  }

  public minVerticalViewportSegments<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(min-vertical-viewport-segments: ${value})`);
  }

  public minWidth<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(min-width: ${value})`);
  }

  // ------------
  // Ranged Media Descriptors (with max- prefix)
  // ------------

  public maxAspectRatio<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(max-aspect-ratio: ${value})`);
  }

  public maxColor<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(max-color: ${value})`);
  }

  public maxColorIndex<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(max-color-index: ${value})`);
  }

  public maxDeviceAspectRatio<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(max-device-aspect-ratio: ${value})`);
  }

  public maxDeviceHeight<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(max-device-height: ${value})`);
  }

  public maxDeviceWidth<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(max-device-width: ${value})`);
  }

  public maxHeight<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(max-height: ${value})`);
  }

  public maxHorizontalViewportSegments<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(max-horizontal-viewport-segments: ${value})`);
  }

  public maxMonochrome<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(max-monochrome: ${value})`);
  }

  public maxResolution<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(max-resolution: ${value})`);
  }

  public maxVerticalViewportSegments<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(max-vertical-viewport-segments: ${value})`);
  }

  public maxWidth<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(max-width: ${value})`);
  }
}
