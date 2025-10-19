import { _select } from '#lib/api/select';
import { Surimi } from '#surimi';
import type {
  BaseRangedMediaDescriptor,
  DiscreteMediaDescriptor,
  MediaOperator,
  MediaQueryRangeOperator,
  MediaType,
} from '#types/css.types';
import type { ValidSelector } from '#types/selector.types';
import type { ArrayWithAtLeastOneItem, KebabCaseToCamelCase } from '#types/util.types';

type MediaQueryBuilderDiscreteFunctions = {
  // Can have either no params, or a single param with some value.
  [K in DiscreteMediaDescriptor as KebabCaseToCamelCase<K>]: unknown;
};

type MediaQueryBuilderBaseRangedFunctions<T extends string> = {
  [K in BaseRangedMediaDescriptor as KebabCaseToCamelCase<K>]: <
    TValue extends string,
    TOperator extends MediaQueryRangeOperator,
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

type RemoveMediaQueryString<T extends string> = T extends `@media ${infer R}` ? R : never;

/**
 * Builder for media queries that supports selecting elements within the media query
 *
 * @experimental The MediaQueryBuilder API is experimental and may cause faulty code if used incorrectly.
 * It gives you full freedome to write incorrect media queries that Surimi cannot validate for you (yet).
 *
 * @link [CSSWG Specification](https://drafts.csswg.org/mediaqueries/#descdef-media-width)
 */
export class MediaQueryBuilder<TQuery extends string> implements MediaQueryBuilderFunctions<TQuery> {
  private query: TQuery = '' as TQuery;

  constructor(query: TQuery = '@media' as TQuery) {
    this.query = query;
  }

  private createMediaQueryBuilderWithParameter<TNewParam extends string>(
    parameter: TNewParam,
  ): MediaQueryBuilder<`${TQuery} ${TNewParam}`> {
    return new MediaQueryBuilder(`${this.query} ${parameter}`);
  }

  public select<TSelectors extends ArrayWithAtLeastOneItem<ValidSelector>>(...selectors: TSelectors) {
    const params = this.query.replace('@media ', '') as RemoveMediaQueryString<TQuery>;

    return _select([{ atRule: '@media', params }] as const, Surimi.root, selectors);
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

  public grid(value: 0 | 1) {
    return this.createMediaQueryBuilderWithParameter(`(grid: ${value})`);
  }

  public hover(value: 'none' | 'hover') {
    return this.createMediaQueryBuilderWithParameter(`(hover: ${value})`);
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

  public scan(value: 'interlace' | 'progressive') {
    return this.createMediaQueryBuilderWithParameter(`(scan: ${value})`);
  }

  public update(value: 'none' | 'slow' | 'fast') {
    return this.createMediaQueryBuilderWithParameter(`(update: ${value})`);
  }

  // ------------
  // Ranged Media Descriptors (without min- and max- prefixes)
  // ------------

  public aspectRatio<TOperator extends MediaQueryRangeOperator, TValue extends string>(
    operator: TOperator,
    value: TValue,
  ) {
    return this.createMediaQueryBuilderWithParameter(`(aspect-ratio ${operator} ${value})`);
  }

  public color<TOperator extends MediaQueryRangeOperator, TValue extends string>(operator: TOperator, value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(color ${operator} ${value})`);
  }

  public colorIndex<TOperator extends MediaQueryRangeOperator, TValue extends string>(
    operator: TOperator,
    value: TValue,
  ) {
    return this.createMediaQueryBuilderWithParameter(`(color-index ${operator} ${value})`);
  }
  public deviceAspectRatio<TOperator extends MediaQueryRangeOperator, TValue extends string>(
    operator: TOperator,
    value: TValue,
  ) {
    return this.createMediaQueryBuilderWithParameter(`(device-aspect-ratio ${operator} ${value})`);
  }

  public deviceHeight<TOperator extends MediaQueryRangeOperator, TValue extends string>(
    operator: TOperator,
    value: TValue,
  ) {
    return this.createMediaQueryBuilderWithParameter(`(device-height ${operator} ${value})`);
  }

  public deviceWidth<TOperator extends MediaQueryRangeOperator, TValue extends string>(
    operator: TOperator,
    value: TValue,
  ) {
    return this.createMediaQueryBuilderWithParameter(`(device-width ${operator} ${value})`);
  }

  public height<TOperator extends MediaQueryRangeOperator, TValue extends string>(operator: TOperator, value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(height ${operator} ${value})`);
  }

  public monochrome<TOperator extends MediaQueryRangeOperator, TValue extends string>(
    operator: TOperator,
    value: TValue,
  ) {
    return this.createMediaQueryBuilderWithParameter(`(monochrome ${operator} ${value})`);
  }

  public resolution<TOperator extends MediaQueryRangeOperator, TValue extends string>(
    operator: TOperator,
    value: TValue,
  ) {
    return this.createMediaQueryBuilderWithParameter(`(resolution ${operator} ${value})`);
  }

  public width<TOperator extends MediaQueryRangeOperator, TValue extends string>(operator: TOperator, value: TValue) {
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

  public minMonochrome<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(min-monochrome: ${value})`);
  }

  public minResolution<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(min-resolution: ${value})`);
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

  public maxMonochrome<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(max-monochrome: ${value})`);
  }

  public maxResolution<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(max-resolution: ${value})`);
  }

  public maxWidth<TValue extends string>(value: TValue) {
    return this.createMediaQueryBuilderWithParameter(`(max-width: ${value})`);
  }
}
