import type { TokenizeAtRule } from '@surimi/parsers';
import { stringifyAtRule, tokenizeAtRule } from '@surimi/parsers';

import { _select } from '#lib/api/select';
import type { BaseRangedContainerDescriptor, ContainerOperator, ContainerRangeOperator } from '#types/css.types';
import type { KebabCaseToCamelCase } from '#types/util.types';

import { AtRuleBuilder } from './at-rule.builder';

type ContainerQueryBuilderBaseRangedFunctions<T extends string> = {
  [K in BaseRangedContainerDescriptor as KebabCaseToCamelCase<K>]: <
    TValue extends string,
    TOperator extends ContainerRangeOperator,
  >(
    operator: TOperator,
    value: TValue,
  ) => ContainerQueryBuilder<`${T} (${K} ${TOperator} ${TValue})`>;
};

type ContainerQueryBuilderMinRangedFunctions<T extends string> = {
  [K in BaseRangedContainerDescriptor as KebabCaseToCamelCase<`min-${K}`>]: <TValue extends string>(
    value: TValue,
  ) => ContainerQueryBuilder<`${T} (min-${K}: ${TValue})`>;
};

type ContainerQueryBuilderMaxRangedFunctions<T extends string> = {
  [K in BaseRangedContainerDescriptor as KebabCaseToCamelCase<`max-${K}`>]: <TValue extends string>(
    value: TValue,
  ) => ContainerQueryBuilder<`${T} (max-${K}: ${TValue})`>;
};

type ContainerQueryBuilderOperatorFunctions<T extends string> = {
  [K in ContainerOperator]: () => ContainerQueryBuilder<`${T} ${K}`>;
};

export type MediaQueryBuilderFunctions<T extends string> = ContainerQueryBuilderBaseRangedFunctions<T> &
  ContainerQueryBuilderMinRangedFunctions<T> &
  ContainerQueryBuilderMaxRangedFunctions<T> &
  ContainerQueryBuilderOperatorFunctions<T>;

/**
 * Builder for container queries that supports selecting elements within the container query
 *
 * @experimental The ContainerQuery API is experimental and may cause faulty code if used incorrectly.
 * It gives you full freedome to write incorrect media queries that Surimi cannot validate for you (yet).
 *
 * Internally, this is an extension to the `AtRule` builder that adds media query specific methods.
 *
 * @link [CSSWG Specification](https://drafts.csswg.org/css-conditional-5)
 */
export class ContainerQueryBuilder<TQuery extends string>
  extends AtRuleBuilder<TQuery>
  implements MediaQueryBuilderFunctions<TQuery>
{
  private createContainerQueryBuilderWithParameter<TNewParam extends string>(
    parameter: TNewParam,
  ): ContainerQueryBuilder<`${TQuery} ${TNewParam}`> {
    const currentContextString = stringifyAtRule(this._context);
    const newContext = tokenizeAtRule(
      `${currentContextString} ${parameter}`,
    ) as TokenizeAtRule<`${TQuery} ${TNewParam}`>;

    return new ContainerQueryBuilder(newContext as never, this._postcssContainer, this._postcssRoot);
  }

  // ------------
  // Media Operators
  // ------------

  public and() {
    return this.createContainerQueryBuilderWithParameter(`and`);
  }
  public not() {
    return this.createContainerQueryBuilderWithParameter(`not`);
  }
  public or() {
    return this.createContainerQueryBuilderWithParameter(`or`);
  }

  // ------------
  // Discrete Media Descriptors
  // ------------

  public name<T extends string>(name: T) {
    return this.createContainerQueryBuilderWithParameter(name);
  }

  public scrollable(
    scrollable:
      | 'none'
      | 'top'
      | 'right'
      | 'bottom'
      | 'left'
      | 'block-start'
      | 'inline-start'
      | 'block-end'
      | 'inline-end'
      | 'x'
      | 'y'
      | 'block'
      | 'inline',
  ) {
    return this.createContainerQueryBuilderWithParameter(`scroll-state(scrollable: ${scrollable})`);
  }

  public scrolled(
    scrolled:
      | 'none'
      | 'top'
      | 'right'
      | 'bottom'
      | 'left'
      | 'block-start'
      | 'inline-start'
      | 'block-end'
      | 'inline-end'
      | 'x'
      | 'y'
      | 'block'
      | 'inline',
  ) {
    return this.createContainerQueryBuilderWithParameter(`scroll-state(scrolled: ${scrolled})`);
  }

  public snapped(snapped: 'none' | 'x' | 'y' | 'block' | 'inline' | 'both') {
    return this.createContainerQueryBuilderWithParameter(`scroll-state(snapped: ${snapped})`);
  }

  public stuck(
    stuck: 'none' | 'top' | 'right' | 'bottom' | 'left' | 'block-start' | 'inline-start' | 'block-end' | 'inline-end',
  ) {
    return this.createContainerQueryBuilderWithParameter(`scroll-state(stuck: ${stuck})`);
  }

  // ------------
  // Style container query
  // ------------

  style(property: string, value?: string | number | boolean) {
    return this.createContainerQueryBuilderWithParameter(`style(--${property}: ${value})`);
  }

  // ------------
  // Ranged Media Descriptors (without min- and max- prefixes)
  // ------------

  public aspectRatio<TOperator extends ContainerRangeOperator, TValue extends string>(
    operator: TOperator,
    value: TValue,
  ) {
    return this.createContainerQueryBuilderWithParameter(`(aspect-ratio ${operator} ${value})`);
  }

  public blockSize<TOperator extends ContainerRangeOperator, TValue extends string>(
    operator: TOperator,
    value: TValue,
  ) {
    return this.createContainerQueryBuilderWithParameter(`(block-size ${operator} ${value})`);
  }

  public height<TOperator extends ContainerRangeOperator, TValue extends string>(operator: TOperator, value: TValue) {
    return this.createContainerQueryBuilderWithParameter(`(height ${operator} ${value})`);
  }

  public inlineSize<TOperator extends ContainerRangeOperator, TValue extends string>(
    operator: TOperator,
    value: TValue,
  ) {
    return this.createContainerQueryBuilderWithParameter(`(inline-size ${operator} ${value})`);
  }

  public width<TOperator extends ContainerRangeOperator, TValue extends string>(operator: TOperator, value: TValue) {
    return this.createContainerQueryBuilderWithParameter(`(width ${operator} ${value})`);
  }

  // ------------
  // Ranged Media Descriptors (with min- prefix)
  // ------------

  public minAspectRatio<TValue extends string>(value: TValue) {
    return this.createContainerQueryBuilderWithParameter(`(min-aspect-ratio: ${value})`);
  }

  public minBlockSize<TValue extends string>(value: TValue) {
    return this.createContainerQueryBuilderWithParameter(`(min-block-size: ${value})`);
  }

  public minHeight<TValue extends string>(value: TValue) {
    return this.createContainerQueryBuilderWithParameter(`(min-height: ${value})`);
  }

  public minInlineSize<TValue extends string>(value: TValue) {
    return this.createContainerQueryBuilderWithParameter(`(min-inline-size: ${value})`);
  }

  public minWidth<TValue extends string>(value: TValue) {
    return this.createContainerQueryBuilderWithParameter(`(min-width: ${value})`);
  }

  // ------------
  // Ranged Media Descriptors (with max- prefix)
  // ------------

  public maxAspectRatio<TValue extends string>(value: TValue) {
    return this.createContainerQueryBuilderWithParameter(`(max-aspect-ratio: ${value})`);
  }

  public maxBlockSize<TValue extends string>(value: TValue) {
    return this.createContainerQueryBuilderWithParameter(`(max-block-size: ${value})`);
  }

  public maxHeight<TValue extends string>(value: TValue) {
    return this.createContainerQueryBuilderWithParameter(`(max-height: ${value})`);
  }

  public maxInlineSize<TValue extends string>(value: TValue) {
    return this.createContainerQueryBuilderWithParameter(`(max-inline-size: ${value})`);
  }

  public maxWidth<TValue extends string>(value: TValue) {
    return this.createContainerQueryBuilderWithParameter(`(max-width: ${value})`);
  }
}
